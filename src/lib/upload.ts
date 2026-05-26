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

/** Comprime e converte imagem para webp (60-70% menor que jpg, qualidade alta). */
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

  const stat = await fs.stat(fullPath);
  return { url: `/api/media/${filename}`, size: stat.size, filename };
}

/** Salva vídeo direto (sem transcodificar). */
export async function saveVideo(buffer: Buffer, originalName: string): Promise<{ url: string; size: number; filename: string }> {
  await ensureUploadDir();
  const filename = newFileName(originalName);
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);
  const stat = await fs.stat(fullPath);
  return { url: `/api/media/${filename}`, size: stat.size, filename };
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
