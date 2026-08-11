import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { mimeFromFilename, resolveMediaPath } from '@/lib/upload';

export const runtime = 'nodejs';

/**
 * Serve mídia (imagem/vídeo) com suporte a HTTP Range requests.
 *
 * ATENÇÃO — não trocar por Readable.toWeb(): essa API lança uncaughtException
 * fatal ("Controller is already closed") quando o navegador aborta a requisição
 * no meio (seek/troca de página — players fazem isso o tempo todo), derrubando
 * o processo inteiro. Erro observado nos logs de produção. Aqui a conversão é
 * manual com todas as chamadas do controller protegidas.
 */

function fileToWebStream(filePath: string, opts?: { start: number; end: number }): ReadableStream<Uint8Array> {
  const nodeStream = createReadStream(filePath, opts);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        const buf = chunk as Buffer;
        try {
          controller.enqueue(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
          if (controller.desiredSize !== null && controller.desiredSize <= 0) {
            nodeStream.pause();
          }
        } catch {
          nodeStream.destroy();
        }
      });
      nodeStream.on('end', () => {
        try {
          controller.close();
        } catch {
          /* já fechado pelo abort */
        }
      });
      nodeStream.on('error', (err) => {
        try {
          controller.error(err);
        } catch {
          /* já fechado */
        }
        nodeStream.destroy();
      });
    },
    pull() {
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

    if (!range) {
      return new NextResponse(fileToWebStream(filePath), {
        status: 200,
        headers: { ...commonHeaders, 'Content-Length': String(fileSize) },
      });
    }

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
    return new NextResponse('internal error', { status: 500 });
  }
}
