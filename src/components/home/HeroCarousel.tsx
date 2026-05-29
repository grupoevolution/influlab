'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useHeroGallery } from '@/lib/api/client';

/**
 * Carrossel de vídeos 9:16 que roda atrás do hero da home do aluno.
 * - Vídeos puxados de /api/public/hero-gallery (gerenciados em /admin/galeria)
 * - Inclinação sutil de -2° para sensação de profundidade
 * - Loop horizontal infinito sem corte (duplica a lista)
 * - Vídeos rodam silenciados em loop, com playsInline pra funcionar em iOS
 * - Respeita prefers-reduced-motion: para a animação pra acessibilidade
 *
 * Quando a galeria está vazia, o componente não renderiza nada — quem chama
 * pode colocar um fallback (vídeo único, gradiente etc.).
 */
export function HeroCarousel() {
  const { data: items, loading } = useHeroGallery();
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplica a lista pra loop infinito sem "salto" visual
  const looped = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [...items, ...items];
  }, [items]);

  // Pausa a animação se o usuário preferir menos movimento (acessibilidade)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const el = trackRef.current;
      if (!el) return;
      el.style.animationPlayState = mq.matches ? 'paused' : 'running';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [items]);

  if (loading || !items || items.length === 0) return null;

  // Calcula uma duração proporcional à quantidade de itens — 4s por item.
  // 6 vídeos = 24s, 10 vídeos = 40s. Fica perceptivelmente fluido em qualquer caso.
  const durationSec = Math.max(20, items.length * 4);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={trackRef}
        className="influlab-hero-track absolute inset-y-0 flex items-center gap-3.5 px-3.5"
        style={{
          width: 'max-content',
          animation: `influlab-hero-scroll ${durationSec}s linear infinite`,
          transform: 'translateY(-8px) rotate(-2deg)',
          transformOrigin: 'center',
        }}
      >
        {looped.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="relative shrink-0 w-[150px] md:w-[180px] aspect-[9/16] rounded-[18px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            <video
              src={item.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-violet-500/20" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes influlab-hero-scroll {
          from { transform: translateY(-8px) rotate(-2deg) translateX(0); }
          to   { transform: translateY(-8px) rotate(-2deg) translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
