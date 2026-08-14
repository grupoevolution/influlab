/**
 * Detecta o tipo de URL de vídeo e devolve a configuração de renderização.
 * Aceita:
 *  - MP4/WebM direto (qualquer URL terminada em .mp4/.webm/.mov/.m4v)
 *  - YouTube (youtube.com/watch?v=..., youtu.be/..., shorts/...)
 *  - Vimeo (vimeo.com/...)
 *
 * Retorna `null` se a URL não for um vídeo válido — quem chama decide
 * mostrar fallback (placeholder, texto, etc).
 */

export type VideoEmbed =
  | { kind: 'native'; src: string }
  | { kind: 'youtube'; src: string }
  | { kind: 'vimeo'; src: string }
  | { kind: 'iframe'; src: string };

const NATIVE_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/**
 * URL de PLAYER EMBUTIDO (iframe) — não é arquivo de vídeo.
 * Cobre VTurb/ConverteAI (scripts.converteai.net/.../embed.html), YouTube,
 * Vimeo e qualquer URL terminada em /embed ou embed.html.
 * Um <video> não toca essas URLs; precisam de <iframe>.
 */
export function isEmbedUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const u = url.trim();
  if (!u || NATIVE_EXT.test(u)) return false;
  return /converteai\.net|vturb|youtube\.com|youtu\.be|vimeo\.com|\/embed(\.html)?([?#]|$)/i.test(u);
}

export function parseVideoUrl(url: string | undefined | null): VideoEmbed | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;

  // 1) Arquivo direto
  if (NATIVE_EXT.test(u)) {
    return { kind: 'native', src: u };
  }

  // 2) YouTube
  const ytId = extractYouTubeId(u);
  if (ytId) {
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // 3) Vimeo
  const vimeoId = extractVimeoId(u);
  if (vimeoId) {
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`,
    };
  }

  // 4) Player embutido genérico (VTurb/ConverteAI etc.)
  if (isEmbedUrl(u)) {
    return { kind: 'iframe', src: u };
  }

  // 5) Outro? Tenta nativo mesmo assim (pode ser stream proxied)
  try {
    new URL(u); // valida URL
    return { kind: 'native', src: u };
  } catch {
    return null;
  }
}

function extractYouTubeId(url: string): string | null {
  // youtu.be/<id>
  const m1 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,15})/);
  if (m1) return m1[1];
  // youtube.com/watch?v=<id>
  const m2 = url.match(/[?&]v=([a-zA-Z0-9_-]{6,15})/);
  if (m2) return m2[1];
  // youtube.com/embed/<id>
  const m3 = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,15})/);
  if (m3) return m3[1];
  // youtube.com/shorts/<id>
  const m4 = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,15})/);
  if (m4) return m4[1];
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d{6,12})/);
  return m ? m[1] : null;
}
