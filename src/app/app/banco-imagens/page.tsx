'use client';

import { Download, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { useImagePrompts } from '@/lib/api/client';
import { useIncremental } from '@/lib/use-incremental';
import { cn } from '@/lib/utils';

/**
 * NOTA DE PERFORMANCE (não reverter sem medir):
 * Esta página travava mesmo sem vídeos. Causas: dezenas de cards com
 * backdrop-filter (glass), animação JS por card na montagem e todas as
 * imagens grandes decodificando de uma vez. Correções: Card sólido,
 * sem motion por card, useIncremental (12 por vez) e loading="lazy" +
 * decoding="async" nas imagens.
 */
export default function BancoImagensPage() {
  const [active, setActive] = useState('Todos');
  const { data: imagePrompts } = useImagePrompts();

  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const i of imagePrompts) if (i.category) set.add(i.category);
    return ['Todos', ...Array.from(set).sort()];
  }, [imagePrompts]);

  const filtered = useMemo(
    () => (active === 'Todos' ? imagePrompts : imagePrompts.filter((i) => i.category === active)),
    [imagePrompts, active],
  );

  const { visible, sentinelRef, hasMore } = useIncremental(filtered, 12, active);

  return (
    <>
      <PageHeader
        eyebrow="Geração premium"
        title={
          <>
            Lab de <span className="text-gradient-brand">imagens</span>
          </>
        }
      />

      {cats.length > 1 && (
        <div className="border-b border-border-subtle sticky top-16 z-20 bg-bg/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={cn(
                    'shrink-0 px-3 h-9 text-xs md:text-sm font-medium rounded-full transition border',
                    active === c
                      ? 'bg-gradient-brand-soft border-brand-violet-400/40 text-text-primary'
                      : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-cyan-400/30',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((img) => (
              <div key={img.id}>
                <Card variant="default" hoverable className="overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image}
                      alt={img.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                      {img.category && <Badge variant="cyan" className="text-[10px] px-1.5 py-0">{img.category}</Badge>}
                      {img.style && <Badge variant="brand" className="text-[10px] px-1.5 py-0">{img.style}</Badge>}
                    </div>

                    <a
                      href={img.image}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-text-primary hover:bg-bg-card"
                      title="Baixar imagem"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={12} />
                    </a>
                  </div>

                  <div className="p-2.5 md:p-3">
                    <h3 className="font-semibold text-xs md:text-sm leading-snug mb-2 line-clamp-1">{img.title}</h3>
                    <div className="space-y-1.5">
                      <CopyButton
                        text={img.prompt}
                        label="Copiar prompt da imagem"
                        size="sm"
                        className="w-full h-8 text-xs"
                      />
                      {img.videoPrompt && (
                        <CopyButton
                          text={img.videoPrompt}
                          label="Copiar prompt do vídeo"
                          size="sm"
                          variant="secondary"
                          className="w-full h-8 text-xs"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center gap-2 py-8 text-text-muted text-xs">
              <Loader2 size={14} className="animate-spin" />
              Carregando mais...
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-muted text-sm">
              Nenhuma imagem nessa categoria.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
