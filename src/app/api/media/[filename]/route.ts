import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { mimeFromFilename, resolveMediaPath } from '@/lib/upload';

export const runtime = 'nodejs';

/**
 * Serve mídia (imagem/vídeo) com suporte a HTTP Range requests.
 *
 * - Streaming por pedaços: nunca carrega o arquivo inteiro na RAM.
 * - Range → 206 Partial Content: o vídeo começa a tocar quase instantâneo.
 *
 * IMPORTANTE (correção de crash em produção): a versão anterior usava
 * Readable.toWeb(), que lança um uncaughtException fatal
 * ("Controller is already closed") quando o navegador ABORTA a requisição
 * no meio — coisa que players de vídeo fazem o tempo todo (seek, troca de
 * card, saída da página). Isso derrubava o processo Node inteiro em loop.
 * Agora convertemos o stream manualmente com TODAS as chamadas do controller
 * protegidas: abort do cliente só encerra a leitura daquele arquivo, nunca
 * derruba o servidor.
 */

/** Converte um read-stream do Node em ReadableStream web à prova de abort. */
function fileToWebStream(filePath: string, opts?: { start: number; end: number }): ReadableStream<Uint8Array> {
  const nodeStream = createReadStream(filePath, opts);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        const buf = chunk as Buffer;
        try {
          controller.enqueue(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
          // Backpressure: se a fila encheu (cliente lento), pausa a leitura do disco
          if (controller.desiredSize !== null && controller.desiredSize <= 0) {
            nodeStream.pause();
          }
        } catch {
          // Cliente abortou — encerra a leitura deste arquivo e segue a vida
          nodeStream.destroy();
        }
      });
      nodeStream.on('end', () => {
        try {
          controller.close();
        } catch {
          /* controller já fechado pelo abort — ok */
        }
      });
      nodeStream.on('error', (err) => {
        try {
          controller.error(err);
        } catch {
          /* controller já fechado — ok */
        }
        nodeStream.destroy();
      });
    },
    pull() {
      // Cliente voltou a consumir — retoma a leitura
      nodeStream.resume();
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await ctx.params;
    const filePath = resolveMediaPath(filename);
    if (!filePath) return new NextResponse('not found', { status: 404 });

    let fileSize: number;
    try {
      const s = await stat(filePath);
      if (!s.isFile()) return new NextResponse('not found', { status: 404 });
      fileSize = s.size;
    } catch {
      return new NextResponse('not found', { status: 404 });
    }

    const contentType = mimeFromFilename(filename);
    const commonHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    const range = req.headers.get('range');

    // Sem Range: arquivo inteiro via stream
    if (!range) {
      return new NextResponse(fileToWebStream(filePath), {
        status: 200,
        headers: { ...commonHeaders, 'Content-Length': String(fileSize) },
      });
    }

    // Com Range: 206 Partial Content
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match) {
      return new NextResponse('invalid range', {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }

    const start = match[1] ? parseInt(match[1], 10) : 0;
    let end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
      return new NextResponse('range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }

    end = Math.min(end, fileSize - 1);
    const chunkSize = end - start + 1;

    return new NextResponse(fileToWebStream(filePath, { start, end }), {
      status: 206,
      headers: {
        ...commonHeaders,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(chunkSize),
      },
    });
  } catch {
    // Nunca deixa uma exceção desta rota virar crash de processo
    return new NextResponse('internal error', { status: 500 });
  }
}
