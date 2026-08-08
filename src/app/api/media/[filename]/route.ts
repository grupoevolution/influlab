import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import { mimeFromFilename, resolveMediaPath } from '@/lib/upload';

export const runtime = 'nodejs';

/**
 * Serve mídia (imagem/vídeo) com suporte a HTTP Range requests.
 *
 * Por que isso importa (escala):
 * - Antes: lia o arquivo INTEIRO na RAM (fs.readFile) e devolvia tudo. Com muitos
 *   acessos simultâneos a vídeos pesados, a memória do servidor estourava e o
 *   cliente esperava o arquivo completo antes de tocar.
 * - Agora: usa stream de leitura por pedaços. Quando o navegador manda o header
 *   Range (padrão em <video>), respondemos 206 com só o trecho pedido. O vídeo
 *   começa a tocar quase instantâneo e a RAM do servidor fica estável.
 */
export async function GET(req: Request, ctx: { params: Promise<{ filename: string }> }) {
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

  // Sem Range: envia o arquivo inteiro, mas via STREAM (não carrega tudo na RAM).
  if (!range) {
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
    return new NextResponse(webStream, {
      status: 200,
      headers: { ...commonHeaders, 'Content-Length': String(fileSize) },
    });
  }

  // Com Range: 206 Partial Content — manda só o trecho pedido.
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

  const nodeStream = createReadStream(filePath, { start, end });
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    status: 206,
    headers: {
      ...commonHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': String(chunkSize),
    },
  });
}
