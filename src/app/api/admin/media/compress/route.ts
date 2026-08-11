import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { mutateDB } from '@/lib/db';
import { UPLOAD_DIR, generatePoster, transcodeVideo } from '@/lib/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Compressão retroativa dos vídeos já existentes em data/uploads.
 *
 * Como identifica o que falta comprimir: todo vídeo processado (no upload novo
 * ou por aqui) ganha um poster `<arquivo>.poster.webp`. Vídeo SEM poster =
 * ainda não passou pela compressão.
 *
 * Processa 1 vídeo por chamada (evita timeout do proxy em vídeos grandes) —
 * o painel chama em loop até zerar, mostrando progresso.
 *
 * Se o nome do arquivo muda (ex: .mov → .mp4), as referências no banco
 * (prompts de vídeo, virais, galeria do hero, vídeo tutorial) são atualizadas
 * automaticamente pra URL nova.
 */

const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.m4v'];

// Falhas da sessão atual (ex: ffmpeg indisponível) — não re-tenta em loop
const g = globalThis as unknown as { __COMPRESS_SKIP__?: Set<string>; __COMPRESS_RUNNING__?: boolean };
if (!g.__COMPRESS_SKIP__) g.__COMPRESS_SKIP__ = new Set();
const skipSet = g.__COMPRESS_SKIP__!;

async function requireAdmin() {
  const s = await getCurrentSession();
  return s && s.role === 'admin' ? s : null;
}

async function listPendingVideos(): Promise<{ pending: string[]; totalVideos: number }> {
  let files: string[] = [];
  try {
    files = await fs.readdir(UPLOAD_DIR);
  } catch {
    return { pending: [], totalVideos: 0 };
  }
  const fileSet = new Set(files);
  const videos = files.filter(
    (f) => VIDEO_EXT.includes(path.extname(f).toLowerCase()) && !f.startsWith('tmp-'),
  );
  const pending = videos.filter(
    (f) => !fileSet.has(`${f}.poster.webp`) && !skipSet.has(f),
  );
  return { pending, totalVideos: videos.length };
}

/** Troca a URL antiga pela nova em todos os campos do banco que apontam vídeo. */
async function updateDbReferences(oldUrl: string, newUrl: string) {
  await mutateDB((db) => {
    for (const v of db.videoPrompts ?? []) {
      if (v.videoUrl === oldUrl) v.videoUrl = newUrl;
    }
    for (const v of db.virals ?? []) {
      if (v.videoUrl === oldUrl) v.videoUrl = newUrl;
    }
    for (const h of db.heroGallery ?? []) {
      if (h.videoUrl === oldUrl) h.videoUrl = newUrl;
    }
    if (db.siteSettings?.tutorialVideoUrl === oldUrl) {
      db.siteSettings.tutorialVideoUrl = newUrl;
    }
  });
}

/** GET: quantos vídeos ainda faltam comprimir. */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const { pending, totalVideos } = await listPendingVideos();
  return NextResponse.json({
    totalVideos,
    pendingCount: pending.length,
    sample: pending.slice(0, 5),
  });
}

/** POST: comprime o PRÓXIMO vídeo pendente e devolve o progresso. */
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });

  if (g.__COMPRESS_RUNNING__) {
    return NextResponse.json({ error: 'já existe uma compressão em andamento' }, { status: 429 });
  }
  g.__COMPRESS_RUNNING__ = true;

  try {
    const { pending } = await listPendingVideos();
    if (pending.length === 0) {
      return NextResponse.json({ done: true, remaining: 0, processed: null });
    }

    const file = pending[0];
    const inputPath = path.join(UPLOAD_DIR, file);
    const beforeSize = (await fs.stat(inputPath)).size;

    const ext = path.extname(file).toLowerCase();
    const base = file.slice(0, -ext.length);
    // Nome final sempre .mp4; se colidir com arquivo existente, sufixa -c
    let outName = `${base}.mp4`;
    if (outName !== file) {
      try {
        await fs.access(path.join(UPLOAD_DIR, outName));
        outName = `${base}-c.mp4`;
      } catch {
        /* livre */
      }
    }
    const tmpOut = path.join(UPLOAD_DIR, `tmp-compress-${outName}`);
    const finalOut = path.join(UPLOAD_DIR, outName);

    const ok = await transcodeVideo(inputPath, tmpOut);

    if (!ok) {
      // ffmpeg ausente/falhou nesse arquivo — pula nesta sessão pra não travar o loop
      skipSet.add(file);
      await fs.unlink(tmpOut).catch(() => {});
      const { pending: rest } = await listPendingVideos();
      return NextResponse.json({
        done: rest.length === 0,
        remaining: rest.length,
        processed: { file, ok: false, error: 'ffmpeg falhou ou não está instalado' },
      });
    }

    const afterSize = (await fs.stat(tmpOut)).size;

    if (afterSize < beforeSize) {
      // Compressão valeu a pena: substitui
      await fs.rename(tmpOut, finalOut);
      if (finalOut !== inputPath) {
        // Extensão mudou → atualiza referências no banco e apaga o antigo
        await updateDbReferences(`/api/media/${file}`, `/api/media/${outName}`);
        await fs.unlink(inputPath).catch(() => {});
      }
      await generatePoster(finalOut, `${finalOut}.poster.webp`).catch(() => {});
    } else {
      // Original já era menor (raro): mantém original, só gera o poster (marca como processado)
      await fs.unlink(tmpOut).catch(() => {});
      await generatePoster(inputPath, `${inputPath}.poster.webp`).catch(() => {});
      // Se nem o poster saiu, evita loop infinito
      try {
        await fs.access(`${inputPath}.poster.webp`);
      } catch {
        skipSet.add(file);
      }
    }

    const { pending: rest } = await listPendingVideos();
    return NextResponse.json({
      done: rest.length === 0,
      remaining: rest.length,
      processed: {
        file,
        ok: true,
        beforeMB: +(beforeSize / 1024 / 1024).toFixed(1),
        afterMB: +((afterSize < beforeSize ? afterSize : beforeSize) / 1024 / 1024).toFixed(1),
      },
    });
  } finally {
    g.__COMPRESS_RUNNING__ = false;
  }
}
