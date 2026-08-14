'use client';

import { Play } from 'lucide-react';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isEmbedUrl } from '@/lib/video-embed';
import { attachHls, isVturbUrl, resolveVturb } from '@/lib/vturb';

/**
 * ===== Gerenciador global de "slots" de vídeo =====
 *
 * Problema real em produção: com dezenas de cards de vídeo, mesmo carregando
 * sob demanda, os vídeos iam se ACUMULANDO na memória conforme o aluno rolava
 * (decoder + buffer nunca eram liberados). Em celular isso estoura a memória e
 * congela o app inteiro — nenhum clique funciona mais (nem o botão de copiar).
 *
 * Solução: no máximo MAX_ACTIVE vídeos possuem mídia carregada ao mesmo tempo.
 * Quem sai da tela DEVOLVE o slot e é descarregado de verdade (removeAttribute
 * ('src') + load() → o navegador libera decoder e buffer). Quem está esperando
 * na fila recebe o slot na ordem.
 */
const MAX_ACTIVE = 3;

type Ticket = { grant: () => void; cancelled: boolean };

let activeCount = 0;
const queue: Ticket[] = [];

function requestSlot(grant: () => void): Ticket {
  const ticket: Ticket = { grant, cancelled: false };
  if (activeCount < MAX_ACTIVE) {
    activeCount++;
    grant();
  } else {
    queue.push(ticket);
  }
  return ticket;
}

function releaseSlot() {
  // Passa o slot pro próximo da fila que ainda quer
  while (queue.length > 0) {
    const next = queue.shift()!;
    if (!next.cancelled) {
      next.grant();
      return; // slot transferido, activeCount não muda
    }
  }
  activeCount = Math.max(0, activeCount - 1);
}

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** rootMargin do observer — quão antes de entrar na tela começa a carregar. */
  rootMargin?: string;
}

/**
 * Vídeo leve para grids. Aceita DOIS tipos de fonte:
 * - Arquivo de vídeo (mp4/webm...) → <video> com slot/descarregamento (abaixo).
 * - PLAYER EMBUTIDO (VTurb/ConverteAI, YouTube, Vimeo, .../embed.html) →
 *   <iframe> preguiçoso: só monta quando visível + slot, desmonta ao sair
 *   da tela (destrói o player e libera a memória). Um escudo transparente
 *   preserva o clique do card (ex: abrir o modal do viral).
 */
export function LazyVideo(props: LazyVideoProps) {
  return (
    <VideoErrorBoundary className={props.className}>
      {isVturbUrl(props.src) ? (
        <LazyVturb {...props} />
      ) : isEmbedUrl(props.src) ? (
        <LazyEmbed {...props} />
      ) : (
        <LazyFileVideo {...props} />
      )}
    </VideoErrorBoundary>
  );
}

/**
 * Vídeo do VTurb no grid: resolve o embed pro HLS do CDN deles e toca com o
 * NOSSO <video> — mudo, loop perfeito, sem barra de progresso, mesmo sistema
 * de slots dos vídeos de arquivo. Se a resolução ou a reprodução falhar,
 * cai pro iframe do player oficial (LazyEmbed), que sempre funciona.
 */
function LazyVturb(props: LazyVideoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <LazyEmbed {...props} />;
  return <LazyVturbInner {...props} onFail={() => setFailed(true)} />;
}

function LazyVturbInner({
  src,
  poster,
  className,
  rootMargin = '100px',
  onFail,
}: LazyVideoProps & { onFail: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [resolvedPoster, setResolvedPoster] = useState<string | undefined>();

  // Observa visibilidade (mesmo padrão dos outros)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin, threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Poster cedo: assim que aparece na tela, resolve (1 fetch cacheado por URL)
  // pra capa do vídeo aparecer mesmo antes de ganhar slot de reprodução.
  useEffect(() => {
    if (!inView || poster) return;
    let alive = true;
    resolveVturb(src).then((info) => {
      if (alive && info?.poster) setResolvedPoster(info.poster);
    });
    return () => {
      alive = false;
    };
  }, [inView, src, poster]);

  // Reprodução: visível + slot → resolve HLS e toca; sai da tela → descarrega.
  useEffect(() => {
    if (!inView || !src) return;

    let granted = false;
    let disposed = false;
    let cleanupHls: (() => void) | null = null;

    const ticket = requestSlot(() => {
      granted = true;
      if (disposed) {
        releaseSlot();
        return;
      }
      (async () => {
        const info = await resolveVturb(src);
        if (disposed) return;
        if (!info) {
          onFail();
          return;
        }
        const el = videoRef.current;
        if (!el) return;
        try {
          cleanupHls = await attachHls(el, info.hls);
          if (disposed) {
            // Slot já foi devolvido enquanto o hls.js carregava
            cleanupHls();
            cleanupHls = null;
            return;
          }
          const p = el.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {
          onFail();
        }
      })();
    });

    return () => {
      disposed = true;
      if (granted) {
        const el = videoRef.current;
        if (el) el.pause();
        cleanupHls?.();
        cleanupHls = null;
        if (el) {
          el.removeAttribute('src');
          try {
            el.load();
          } catch {
            /* ignore */
          }
        }
        releaseSlot();
      } else {
        ticket.cancelled = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, src]);

  return (
    <video
      ref={videoRef}
      poster={poster || resolvedPoster}
      muted
      loop
      playsInline
      preload="none"
      className={cn('h-full w-full object-cover', className)}
    />
  );
}

/**
 * REGRA DE OURO: um card de vídeo com problema NUNCA pode derrubar a página
 * inteira (o aluno via "Application error" e a tela toda morria). Qualquer
 * erro de renderização aqui dentro vira um placeholder inofensivo só naquele
 * card; o resto do grid continua funcionando.
 */
class VideoErrorBoundary extends Component<
  { children: ReactNode; className?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          className={cn(
            'relative h-full w-full bg-bg-elevated flex items-center justify-center',
            this.props.className,
          )}
        >
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
            <Play size={18} className="text-white/70 ml-0.5" fill="currentColor" />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LazyEmbed({ src, poster, className, rootMargin = '100px' }: LazyVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin, threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!inView) return;
    let granted = false;
    let disposed = false;
    const ticket = requestSlot(() => {
      granted = true;
      if (disposed) {
        releaseSlot();
        return;
      }
      setActive(true);
    });
    return () => {
      disposed = true;
      if (granted) {
        setActive(false); // desmonta o iframe → player destruído, memória liberada
        releaseSlot();
      } else {
        ticket.cancelled = true;
      }
    };
  }, [inView, src]);

  return (
    <div ref={ref} className={cn('relative h-full w-full overflow-hidden bg-bg-elevated', className)}>
      {/* Poster/placeholder enquanto o player não está ativo */}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        !active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
              <Play size={18} className="text-white/70 ml-0.5" fill="currentColor" />
            </div>
          </div>
        )
      )}

      {active && (
        <iframe
          src={src}
          title="Vídeo"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {/* Escudo de clique: o toque no card continua indo pro card (abrir modal),
          não pro player. O preview é visual. */}
      <div className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}

/**
 * Arquivo de vídeo para grids:
 * - preload="none": nunca baixa nada sozinho.
 * - Só recebe src quando está visível E ganha um slot (máx 3 simultâneos).
 * - Ao sair da tela: pausa, REMOVE o src e chama load() — libera memória/decoder.
 * - O poster (thumbnail) fica no lugar enquanto o vídeo não está ativo.
 *
 * Nada disso usa estado do React durante o play/unload (só DOM direto), então
 * o custo de re-render é zero e a thread principal fica livre pros cliques.
 */
function LazyFileVideo({ src, poster, className, rootMargin = '100px' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  // Convenção: vídeos otimizados ganham um poster automático em
  // `<arquivo>.poster.webp`. Sem thumb manual, usamos ele. Se o arquivo
  // não existir (vídeo antigo ainda não otimizado), o 404 é inofensivo.
  // `src` pode chegar vazio/undefined se um item foi salvo sem vídeo — não
  // pode explodir a página por causa disso.
  const effectivePoster =
    poster || (src?.startsWith('/api/media/') ? `${src}.poster.webp` : undefined);

  // Observa visibilidade
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin, threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Liga/desliga a mídia conforme visibilidade + slot disponível
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !inView || !src) return;

    let granted = false;
    let disposed = false;

    const ticket = requestSlot(() => {
      granted = true;
      if (disposed) {
        // Slot chegou depois do cleanup — devolve imediatamente
        releaseSlot();
        return;
      }
      el.src = src;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });

    return () => {
      disposed = true;
      if (granted) {
        // Descarrega DE VERDADE: libera buffer e decoder do navegador
        el.pause();
        el.removeAttribute('src');
        try {
          el.load();
        } catch {
          /* ignore */
        }
        releaseSlot();
      } else {
        ticket.cancelled = true;
      }
    };
  }, [inView, src]);

  return (
    <video
      ref={videoRef}
      poster={effectivePoster}
      muted
      loop
      playsInline
      preload="none"
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
