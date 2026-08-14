import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { mutateDB } from '@/lib/db';
import { UPLOAD_DIR, generateImageThumb, generatePoster, transcodeVideo } from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Otimização retroativa do acervo de mídia (roda SÓ quando o admin aciona).
 *
 * Por chamada POST:
 *  - comprime 1 VÍDEO pendente (vídeo sem `<arquivo>.poster.webp`)
 *  - gera até 20 MINIATURAS de imagem pendentes (imagem sem `<arquivo>.thumb.webp`)
 *
 * O painel chama em loop até zerar. Se a extensão do vídeo muda
 * (.mov → .mp4), as referências no banco são atualizadas.
 */

const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.m4v'];
const IMAGE_EXT = ['.webp', '.jpg', '.jpeg', '.png'];
const IMAGE_BATCH = 20;

const g = globalThis as unknown as { __COMPRESS_SKIP__?: Set<string>; __COMPRESS_RUNNING__?: boolean };
if (!g.__COMPRESS_SKIP__) g.__COMPRESS_SKIP__ = new Set();
const skipSet = g.__COMPRESS_SKIP__!;

async function requireAdmin() {
  const s = await getCurrentSession();
  return s && s.role === 'admin' ? s : null;
}

function isDerived(f: string): boolean {
  return f.endsWith('.poster.webp') || f.endsWith('.thumb.webp') || f.startsWith('tmp-');
}

async function scanPending(): Promise<{
  pendingVideos: string[];
  pendingImages: string[];
  totalVideos: number;
  totalImages: number;
}> {
  let files: string[] = [];
  try {
    files = await fs.readdir(UPLOAD_DIR);
  } catch {
    return { pendingVideos: [], pendingImages: [], totalVideos: 0, totalImages: 0 };
  }
  const fileSet = new Set(files);
  const videos = files.filter((f) => !isDerived(f) && VIDEO_EXT.includes(path.extname(f).toLowerCase()));
  const images = files.filter((f) => !isDerived(f) && IMAGE_EXT.includes(path.extname(f).toLowerCase()));
  return {
    pendingVideos: videos.filter((f) => !fileSet.has(`${f}.poster.webp`) && !skipSet.has(f)),
    pendingImages: images.filter((f) => !fileSet.has(`${f}.thumb.webp`) && !skipSet.has(f)),
    totalVideos: videos.length,
    totalImages: images.length,
  };
}

async function updateDbReferences(oldUrl: string, newUrl: string) {
  await mutateDB((db) => {
    for (const v of db.videoPrompts ?? []) if (v.videoUrl === oldUrl) v.videoUrl = newUrl;
    for (const v of db.virals ?? []) if (v.videoUrl === oldUrl) v.videoUrl = newUrl;
    for (const h of db.heroGallery ?? []) if (h.videoUrl === oldUrl) h.videoUrl = newUrl;
    if (db.siteSettings?.tutorialVideoUrl === oldUrl) db.siteSettings.tutorialVideoUrl = newUrl;
  });
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const s = await scanPending();
  return NextResponse.json({
    totalVideos: s.totalVideos,
    totalImages: s.totalImages,
    pendingVideos: s.pendingVideos.length,
    pendingImages: s.pendingImages.length,
    pendingCount: s.pendingVideos.length + s.pendingImages.length,
  });
}

export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });

  if (g.__COMPRESS_RUNNING__) {
    return NextResponse.json({ error: 'já existe uma otimização em andamento' }, { status: 429 });
  }
  g.__COMPRESS_RUNNING__ = true;

  try {
    const { pendingVideos, pendingImages } = await scanPending();
    if (pendingVideos.length === 0 && pendingImages.length === 0) {
      return NextResponse.json({ done: true, remaining: 0, processed: [] });
    }

    const processed: Array<Record<string, unknown>> = [];

    // ---- 1 vídeo por chamada ----
    if (pendingVideos.length > 0) {
      const file = pendingVideos[0];
      const inputPath = path.join(UPLOAD_DIR, file);
      try {
        const beforeSize = (await fs.stat(inputPath)).size;
        const ext = path.extname(file).toLowerCase();
        const base = file.slice(0, -ext.length);
        let outName = `${base}.mp4`;
        if (outName !== file) {
          try {
            await fs.access(path.join(UPLOAD_DIR, outName));
            outName = `${base}-c.mp4`;
          } catch { /* nome livre */ }
        }
        const tmpOut = path.join(UPLOAD_DIR, `tmp-compress-${outName}`);
        const finalOut = path.join(UPLOAD_DIR, outName);

        const ok = await transcodeVideo(inputPath, tmpOut);
        if (!ok) {
          skipSet.add(file);
          await fs.unlink(tmpOut).catch(() => {});
          processed.push({ file, kind: 'video', ok: false, error: 'ffmpeg falhou ou não está instalado' });
        } else {
          const afterSize = (await fs.stat(tmpOut)).size;
          if (afterSize < beforeSize) {
            await fs.rename(tmpOut, finalOut);
            if (finalOut !== inputPath) {
              await updateDbReferences(`/api/media/${file}`, `/api/media/${outName}`);
              await fs.unlink(inputPath).catch(() => {});
            }
            await generatePoster(finalOut, `${finalOut}.poster.webp`).catch(() => {});
          } else {
            await fs.unlink(tmpOut).catch(() => {});
            await generatePoster(inputPath, `${inputPath}.poster.webp`).catch(() => {});
            try {
              await fs.access(`${inputPath}.poster.webp`);
            } catch {
              skipSet.add(file);
            }
          }
          processed.push({
            file,
            kind: 'video',
            ok: true,
            beforeMB: +(beforeSize / 1024 / 1024).toFixed(1),
            afterMB: +((afterSize < beforeSize ? afterSize : beforeSize) / 1024 / 1024).toFixed(1),
          });
        }
      } catch (err) {
        skipSet.add(file);
        processed.push({ file, kind: 'video', ok: false, error: (err as Error)?.message });
      }
    }

    // ---- até 20 thumbs de imagem por chamada (rápido, é sharp) ----
    const imageSlice = pendingImages.slice(0, IMAGE_BATCH);
    let thumbsOk = 0;
    for (const file of imageSlice) {
      const inputPath = path.join(UPLOAD_DIR, file);
      try {
        await generateImageThumb(inputPath, `${inputPath}.thumb.webp`);
        thumbsOk++;
      } catch {
        skipSet.add(file);
      }
    }
    if (imageSlice.length > 0) {
      processed.push({ kind: 'thumbs', ok: true, count: thumbsOk, of: imageSlice.length });
    }

    const rest = await scanPending();
    const remaining = rest.pendingVideos.length + rest.pendingImages.length;
    return NextResponse.json({ done: remaining === 0, remaining, processed });
  } finally {
    g.__COMPRESS_RUNNING__ = false;
  }
}
