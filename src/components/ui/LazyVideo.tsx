'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  /** rootMargin do observer — quão antes de entrar na tela começa a carregar. */
  rootMargin?: string;
}

/**
 * Vídeo que só carrega e toca quando entra na viewport.
 *
 * Por que isso importa (escala):
 * - Antes: TODOS os cards usavam <video autoPlay preload="metadata">. Numa página
 *   com dezenas de prompts, o navegador tentava baixar e decodificar dezenas de
 *   vídeos ao mesmo tempo. Isso travava a thread principal — e era por isso que os
 *   botões de copiar "não funcionavam" (o clique não era processado).
 * - Agora: preload="none" + IntersectionObserver. O card mostra só a miniatura
 *   (poster) até chegar perto da tela. Só o que está visível carrega e toca; ao
 *   sair da tela, pausa. A página fica leve e os botões respondem na hora.
 */
export function LazyVideo({ src, poster, className, rootMargin = '200px' }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Observa se o vídeo está (perto de) visível
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin, threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Uma vez visível, marca como "carregar" (mantém carregado depois disso)
  useEffect(() => {
    if (inView && !loaded) setLoaded(true);
  }, [inView, loaded]);

  // Toca quando visível, pausa quando sai — economiza CPU/bateria
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loaded) return;
    if (inView) {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, loaded]);

  return (
    <video
      ref={videoRef}
      src={loaded ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
