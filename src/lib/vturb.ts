/**
 * VTurb/ConverteAI no client: resolve o embed pro HLS do CDN deles e
 * toca com o NOSSO <video> (mudo, loop, sem barra de progresso).
 *
 * - iOS/Safari toca HLS nativo (zero JS extra).
 * - Android/Chrome usa hls.js, carregado sob demanda (chunk separado —
 *   só baixa quando um vídeo VTurb realmente aparece na tela).
 * - Qualquer falha → quem chama cai pro iframe do player oficial.
 */

export type VturbInfo = { hls: string; poster?: string };

export function isVturbUrl(url: string | undefined | null): boolean {
  return /converteai\.net|vturb/i.test(url ?? '');
}

// Cache por URL: 40 cards do mesmo vídeo = 1 fetch.
const resolveCache = new Map<string, Promise<VturbInfo | null>>();

export function resolveVturb(url: string): Promise<VturbInfo | null> {
  let p = resolveCache.get(url);
  if (!p) {
    p = fetch(`/api/public/vturb-resolve?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j?.data?.hls ? (j.data as VturbInfo) : null))
      .catch(() => null);
    resolveCache.set(url, p);
    // Falha de rede não pode ficar cacheada pra sempre
    p.then((v) => {
      if (!v) resolveCache.delete(url);
    });
  }
  return p;
}

/**
 * Liga a reprodução HLS no elemento. Retorna a função de limpeza
 * (destrói o hls.js e libera a mídia). Lança se o navegador não suportar.
 */
export async function attachHls(
  el: HTMLVideoElement,
  hlsUrl: string,
): Promise<() => void> {
  // Safari/iOS: nativo
  if (el.canPlayType('application/vnd.apple.mpegurl')) {
    el.src = hlsUrl;
    return () => {
      el.removeAttribute('src');
      try {
        el.load();
      } catch {
        /* ignore */
      }
    };
  }

  const { default: Hls } = await import('hls.js');
  if (!Hls.isSupported()) throw new Error('HLS não suportado neste navegador');

  const hls = new Hls({
    // Dieta pra celular fraco: buffer curto, nada de guardar o que já passou,
    // qualidade limitada ao tamanho real do player (card pequeno → bitrate baixo).
    maxBufferLength: 10,
    backBufferLength: 0,
    capLevelToPlayerSize: true,
  });
  hls.on(Hls.Events.ERROR, (_evt, data) => {
    // Erros de rede transitórios: tenta recuperar; fatal irrecuperável: para
    // quieto (o card fica no poster — nunca derruba a página).
    if (!data.fatal) return;
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
    else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
    else hls.destroy();
  });
  hls.loadSource(hlsUrl);
  hls.attachMedia(el);
  return () => hls.destroy();
}
