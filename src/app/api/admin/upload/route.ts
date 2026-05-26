import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { detectKind, saveImage, saveVideo } from '@/lib/upload';
import { logAccess, newId } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12MB antes da compressão
const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60MB

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'no auth' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'arquivo ausente' }, { status: 400 });
  }

  const kind = detectKind(file.name);
  if (!kind) {
    return NextResponse.json({ error: 'tipo de arquivo não suportado' }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (kind === 'image' && buf.byteLength > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'imagem maior que 12MB' }, { status: 413 });
  }
  if (kind === 'video' && buf.byteLength > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: 'vídeo maior que 60MB' }, { status: 413 });
  }

  try {
    const result = kind === 'image' ? await saveImage(buf, file.name) : await saveVideo(buf, file.name);

    await logAccess({
      id: newId('al-'),
      type: 'upload',
      email: session.email,
      role: session.role,
      meta: { kind, filename: result.filename, size: result.size },
      at: new Date().toISOString(),
    });

    return NextResponse.json({ data: { url: result.url, kind, size: result.size } }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error)?.message ?? 'falha no upload' },
      { status: 500 },
    );
  }
}
