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

/**
 * Salva vídeo COM compressão automática via ffmpeg.
 *
 * Por que: a equipe subia vídeos de até 60MB sem nenhum tratamento — cada
 * aluno baixava esse peso todo, e Androids fracos travavam pra decodificar.
 * Agora todo vídeo passa por transcodificação:
 *  - H.264 (compatível com tudo), CRF 28, preset veryfast
 *  - Redimensiona pra no máx. 720px de largura (vertical 9:16 → 720x1280)
 *  - +faststart: o vídeo começa a tocar antes de baixar tudo
 *  - Áudio AAC 64k mono (os players do app são todos mudos, mas mantém pra download)
 *  Resultado típico: 40MB → 3-6MB.
 *
 * Também gera um POSTER (thumbnail webp do 1º segundo) com a convenção
 * `<arquivo>.poster.webp` — o LazyVideo usa automaticamente.
 *
 * Se o ffmpeg não estiver instalado (ex: dev local), salva o original sem
 * comprimir — nada quebra.
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
    // Poster do 1º segundo (best-effort — se falhar, segue sem)
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
async function transcodeVideo(input: string, output: string): Promise<boolean> {
  const { spawn } = await import('node:child_process');
  return new Promise((resolve) => {
    const args = [
      '-y',
      '-i', input,
      // largura máx 720 mantendo proporção (altura par exigida pelo H.264)
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
    proc.on('error', () => resolve(false)); // binário não existe
    proc.on('close', (code) => resolve(code === 0));
    // Timeout de segurança: 4 min (vídeo curto comprime em segundos)
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* ignore */ }
      resolve(false);
    }, 4 * 60 * 1000);
  });
}

/** Extrai um frame (t=0.5s) como poster webp. */
async function generatePoster(input: string, output: string): Promise<boolean> {
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
