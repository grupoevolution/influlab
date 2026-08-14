import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

export type UploadKind = 'image' | 'video';

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function newFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.bin';
  const safeExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : '.bin';
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  return `${id}${safeExt}`;
}

/**
 * Comprime e converte imagem para webp + gera MINIATURA.
 *
 * - Master: máx 1600px, qualidade 82 (usada em modais/zoom).
 * - Thumb:  `<arquivo>.thumb.webp`, máx 480px, qualidade 72 — usada nos GRIDS.
 *   Num grid com 20 cards, servir a master (200-500KB cada) custa vários MB;
 *   a thumb custa ~15-40KB cada. Em 4G fraco é a diferença entre "carrega na
 *   hora" e "demora séculos".
 */
export async function saveImage(buffer: Buffer, originalName: string): Promise<{ url: string; size: number; filename: string }> {
  await ensureUploadDir();
  // Lazy import para não pesar em rotas que não usam
  const sharp = (await import('sharp')).default;

  const base = path.basename(originalName, path.extname(originalName)).slice(0, 32);
  const filename = `${Date.now().toString(36)}-${base.replace(/[^a-z0-9-]/gi, '').toLowerCase()}.webp`;
  const fullPath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer, { failOn: 'none' })
    .rotate() // respeita EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(fullPath);

  // Miniatura pros grids (best-effort — se falhar, o grid usa a master)
  await generateImageThumb(fullPath, `${fullPath}.thumb.webp`).catch(() => {});

  const stat = await fs.stat(fullPath);
  return { url: `/api/media/${filename}`, size: stat.size, filename };
}

/** Gera a miniatura 480px de uma imagem já salva. */
export async function generateImageThumb(inputPath: string, outputPath: string): Promise<void> {
  const sharp = (await import('sharp')).default;
  await sharp(inputPath, { failOn: 'none' })
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(outputPath);
}

/**
 * Salva vídeo COM compressão automática via ffmpeg.
 *
 * A causa nº 1 da lentidão em live: vídeos crus de 20-60MB saindo todos de
 * uma única VPS. Comprimir 10-20x é o que desafoga o link:
 *  - H.264 CRF 28 preset veryfast, máx 720px de largura (9:16 → 720x1280)
 *  - +faststart (começa a tocar antes de baixar tudo)
 *  - áudio AAC 64k mono
 *  Típico: 40MB → 3-6MB.
 * Também gera poster `<arquivo>.poster.webp` (o LazyVideo usa sozinho).
 *
 * IMPORTANTE: isto roda APENAS no upload do admin — nada no boot do servidor.
 * Sem ffmpeg no ambiente (ex: dev local), salva o original e segue (fallback).
 */
export async function saveVideo(buffer: Buffer, originalName: string): Promise<{ url: string; size: number; filename: string }> {
  await ensureUploadDir();
  const rawName = newFileName(originalName);
  const rawPath = path.join(UPLOAD_DIR, `tmp-${rawName}`);
  await fs.writeFile(rawPath, buffer);

  const outName = rawName.replace(/\.[a-z0-9]+$/i, '') + '.mp4';
  const outPath = path.join(UPLOAD_DIR, outName);

  const ok = await transcodeVideo(rawPath, outPath);

  if (ok) {
    await generatePoster(outPath, `${outPath}.poster.webp`).catch(() => {});
    await fs.unlink(rawPath).catch(() => {});
    const stat = await fs.stat(outPath);
    return { url: `/api/media/${outName}`, size: stat.size, filename: outName };
  }

  // Fallback: ffmpeg indisponível/falhou → mantém o arquivo original
  const finalPath = path.join(UPLOAD_DIR, rawName);
  await fs.rename(rawPath, finalPath);
  const stat = await fs.stat(finalPath);
  return { url: `/api/media/${rawName}`, size: stat.size, filename: rawName };
}

/** Roda ffmpeg pra comprimir. Retorna false se o binário não existir ou falhar. */
export async function transcodeVideo(input: string, output: string): Promise<boolean> {
  const { spawn } = await import('node:child_process');
  return new Promise((resolve) => {
    const args = [
      '-y',
      '-i', input,
      '-vf', "scale='min(720,iw)':-2",
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'veryfast',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '64k',
      '-ac', '1',
      '-max_muxing_queue_size', '1024',
      output,
    ];
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* ignore */ }
      resolve(false);
    }, 4 * 60 * 1000);
  });
}

/** Extrai um frame (t=0.5s) como poster webp. */
export async function generatePoster(input: string, output: string): Promise<boolean> {
  const { spawn } = await import('node:child_process');
  return new Promise((resolve) => {
    const args = ['-y', '-ss', '0.5', '-i', input, '-frames:v', '1', '-vf', "scale='min(480,iw)':-2", output];
    const proc = spawn('ffmpeg', args, { stdio: 'ignore' });
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* ignore */ }
      resolve(false);
    }, 30 * 1000);
  });
}

const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.m4v'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];

export function detectKind(filename: string): UploadKind | null {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXT.includes(ext)) return 'image';
  if (VIDEO_EXT.includes(ext)) return 'video';
  return null;
}

export const MIME_BY_EXT: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
};

export function mimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

export async function readMedia(filename: string): Promise<Buffer | null> {
  // sanitize: só nome do arquivo, sem path traversal
  const safe = path.basename(filename);
  if (safe !== filename) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, safe));
  } catch {
    return null;
  }
}

/**
 * Resolve o caminho seguro de um arquivo de mídia (sem path traversal).
 * Retorna null se o nome tentar sair da pasta. Usado pelo streaming de vídeo,
 * que lê o arquivo em pedaços (Range) em vez de carregar tudo na RAM.
 */
export function resolveMediaPath(filename: string): string | null {
  const safe = path.basename(filename);
  if (safe !== filename) return null;
  return path.join(UPLOAD_DIR, safe);
}
