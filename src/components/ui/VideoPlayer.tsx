'use client';

import { Play } from 'lucide-react';
import { parseVideoUrl } from '@/lib/video-embed';
import { cn } from '@/lib/utils';

/**
 * Renderiza o player apropriado para uma URL de vídeo.
 * - MP4/WebM → <video controls>
 * - YouTube/Vimeo → <iframe>
 * - Inválido/vazio → placeholder (se `fallback`) ou null
 */
export function VideoPlayer({
  url,
  className,
  fallback,
}: {
  url?: string | null;
  className?: string;
  /** Mostrado se a URL estiver vazia ou inválida. */
  fallback?: React.ReactNode;
}) {
  const parsed = parseVideoUrl(url);

  if (!parsed) {
    if (fallback) {
      return <div className={cn('w-full aspect-video', className)}>{fallback}</div>;
    }
    return null;
  }

  if (parsed.kind === 'native') {
    return (
      <video
        src={parsed.src}
        controls
        playsInline
        preload="metadata"
        className={cn('w-full aspect-video object-cover bg-black', className)}
      />
    );
  }

  // YouTube ou Vimeo
  return (
    <iframe
      src={parsed.src}
      title="Vídeo tutorial"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={cn('w-full aspect-video border-0 bg-black', className)}
    />
  );
}

/** Placeholder padrão quando nenhum vídeo foi configurado ainda. */
export function VideoPlayerPlaceholder({ message }: { message?: string }) {
  return (
    <div className="w-full aspect-video bg-bg-elevated relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="relative text-center px-6">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-brand shadow-glow-brand flex items-center justify-center">
          <Play size={26} className="text-white ml-1" fill="currentColor" />
        </div>
        <h3 className="text-xl font-display font-bold mb-2">Vídeo tutorial</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          {message ?? 'O admin ainda não cadastrou o vídeo tutorial.'}
        </p>
      </div>
    </div>
  );
}
