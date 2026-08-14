'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

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
 * Vídeo leve para grids:
 * - preload="none": nunca baixa nada sozinho.
 * - Só recebe src quando está visível E ganha um slot (máx 3 simultâneos).
 * - Ao sair da tela: pausa, REMOVE o src e chama load() — libera memória/decoder.
 * - O poster (thumbnail) fica no lugar enquanto o vídeo não está ativo.
 *
 * Nada disso usa estado do React durante o play/unload (só DOM direto), então
 * o custo de re-render é zero e a thread principal fica livre pros cliques.
 */
export function LazyVideo({ src, poster, className, rootMargin = '100px' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  // Convenção: vídeos otimizados ganham um poster automático em
  // `<arquivo>.poster.webp`. Sem thumb manual, usamos ele. Se o arquivo
  // não existir (vídeo antigo ainda não otimizado), o 404 é inofensivo.
  const effectivePoster =
    poster || (src.startsWith('/api/media/') ? `${src}.poster.webp` : undefined);

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
    if (!el || !inView) return;

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
