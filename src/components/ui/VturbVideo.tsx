'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { attachHls, resolveVturb } from '@/lib/vturb';

/**
 * Vídeo do VTurb fora dos grids (ex: modal do viral): toca o HLS do CDN
 * deles com o nosso <video> — autoplay mudo em loop, igual aos vídeos de
 * arquivo. Sem slot (é um único vídeo em destaque). Se a resolução ou a
 * reprodução falhar, cai pro iframe do player oficial.
 */
export function VturbAutoVideo({
  src,
  poster,
  title,
  className,
}: {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [resolvedPoster, setResolvedPoster] = useState<string | undefined>();

  useEffect(() => {
    if (failed) return;
    const el = videoRef.current;
    if (!el) return;

    let disposed = false;
    let cleanupHls: (() => void) | null = null;

    (async () => {
      const info = await resolveVturb(src);
      if (disposed) return;
      if (!info) {
        setFailed(true);
        return;
      }
      if (info.poster) setResolvedPoster(info.poster);
      try {
        cleanupHls = await attachHls(el, info.hls);
        if (disposed) {
          cleanupHls();
          cleanupHls = null;
          return;
        }
        const p = el.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      el.pause();
      cleanupHls?.();
      cleanupHls = null;
      el.removeAttribute('src');
      try {
        el.load();
      } catch {
        /* ignore */
      }
    };
  }, [src, failed]);

  if (failed) {
    return (
      <iframe
        src={src}
        title={title ?? 'Vídeo'}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className={cn('h-full w-full border-0', className)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      poster={poster || resolvedPoster}
      autoPlay
      muted
      loop
      playsInline
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
