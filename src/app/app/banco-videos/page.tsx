'use client';

import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { LazyVideo } from '@/components/ui/LazyVideo';
import { useVideoPrompts } from '@/lib/api/client';
import { cn, formatNumber } from '@/lib/utils';

export default function BancoVideosPage() {
  const [active, setActive] = useState('Todos');
  const { data: videoPrompts } = useVideoPrompts();

  // Categorias dinâmicas: extrai do que existir cadastrado
  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const v of videoPrompts) if (v.category) set.add(v.category);
    return ['Todos', ...Array.from(set).sort()];
  }, [videoPrompts]);

  const filtered = useMemo(
    () => (active === 'Todos' ? videoPrompts : videoPrompts.filter((v) => v.category === active)),
    [videoPrompts, active],
  );

  return (
    <>
      <PageHeader
        eyebrow="Prompts validados"
        title={
          <>
            Lab de <span className="text-gradient-brand">vídeos</span>
          </>
        }
      />

      {/* Filtros */}
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
                      : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/30',
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
            {filtered.map((v, i) => {
              const flowText = v.promptFlow || v.prompt || '';
              const createText = v.promptCreate || v.prompt || '';
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Card variant="glass" hoverable className="overflow-hidden">
                    <div className="relative aspect-[9/16] bg-bg-elevated overflow-hidden">
                      <LazyVideo
                        src={v.videoUrl}
                        poster={v.thumb}
                        className="absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                        {v.category && (
                          <Badge variant="brand" className="text-[10px] px-1.5 py-0">{v.category}</Badge>
                        )}
                        {v.views > 0 && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full glass-strong text-[10px]">
                            <Eye size={9} />
                            <span>{formatNumber(v.views)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 md:p-3">
                      <h3 className="font-semibold text-xs md:text-sm leading-snug mb-2 line-clamp-1">
                        {v.title}
                      </h3>

                      <div className="space-y-1.5">
                        {flowText && (
                          <CopyButton
                            text={flowText}
                            label="Prompt do Flow"
                            size="sm"
                            className="w-full h-8 text-xs"
                          />
                        )}
                        {createText && (
                          <CopyButton
                            text={createText}
                            label="Prompt do Create"
                            size="sm"
                            variant="secondary"
                            className="w-full h-8 text-xs"
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-muted text-sm">
              Nenhum prompt cadastrado nessa categoria.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
