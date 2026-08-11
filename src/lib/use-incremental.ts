'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Renderização incremental de listas grandes.
 *
 * Por que existe: os grids de prompts renderizavam TODOS os cards de uma vez
 * (30, 50, 100...). Só a montagem disso já ocupava a thread principal por
 * segundos em celular — e enquanto ela está ocupada, NENHUM clique é
 * processado (era uma das causas do "botão de copiar não funciona").
 *
 * Uso:
 *   const { visible, sentinelRef, hasMore } = useIncremental(filtered, 12, activeCategory);
 *   ... visible.map(...)
 *   {hasMore && <div ref={sentinelRef} />}
 *
 * Renderiza `step` itens; quando o sentinela (fim da lista) se aproxima da
 * tela, adiciona mais `step`. Trocar `resetKey` (ex: filtro de categoria)
 * volta pro primeiro lote.
 */
export function useIncremental<T>(items: T[], step = 12, resetKey: unknown = null) {
  const [count, setCount] = useState(step);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Filtro/categoria mudou → volta pro primeiro lote
  useEffect(() => {
    setCount(step);
  }, [resetKey, step]);

  const hasMore = count < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCount((c) => Math.min(items.length, c + step));
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, items.length, step, count]);

  return { visible: items.slice(0, count), sentinelRef, hasMore };
}
