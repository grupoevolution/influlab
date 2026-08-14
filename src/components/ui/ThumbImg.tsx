'use client';

import { useState } from 'react';

/**
 * <img> que serve a MINIATURA (480px, ~15-40KB) no lugar da imagem master
 * (1600px, 200-500KB) — essencial pros grids carregarem rápido em 4G fraco.
 *
 * Convenção: pra imagem interna `/api/media/abc.webp`, a miniatura fica em
 * `/api/media/abc.webp.thumb.webp` (gerada no upload ou pelo botão
 * "Otimizar mídias" do admin). Se a miniatura ainda não existir (404), o
 * onError troca automaticamente pra imagem original — nada quebra.
 *
 * URLs externas (http...) não têm miniatura: usa a original direto.
 */
export function ThumbImg({
  src,
  alt = '',
  className,
  style,
  draggable,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}) {
  const canThumb = src.startsWith('/api/media/') && !src.endsWith('.thumb.webp');
  const [failed, setFailed] = useState(false);
  const effectiveSrc = canThumb && !failed ? `${src}.thumb.webp` : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      draggable={draggable}
      onError={() => {
        if (canThumb && !failed) setFailed(true);
      }}
    />
  );
}
