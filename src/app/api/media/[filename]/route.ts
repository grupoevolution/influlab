import { NextResponse } from 'next/server';
import { mimeFromFilename, readMedia } from '@/lib/upload';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ filename: string }> }) {
  const { filename } = await ctx.params;
  const data = await readMedia(filename);
  if (!data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const body = new Uint8Array(data);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': mimeFromFilename(filename),
      'Content-Length': String(data.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
