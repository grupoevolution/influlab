'use client';

import { motion } from 'framer-motion';
import { Eye, Flame } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ViralModal } from '@/components/virais/ViralModal';
import { LazyVideo } from '@/components/ui/LazyVideo';
import { useVirals } from '@/lib/api/client';
import type { ViralVideoDB as ViralVideo } from '@/lib/db/types';
import { cn } from '@/lib/utils';

export default function ViraisPage() {
  const [active, setActive] = useState('Todos');
  const [selected, setSelected] = useState<ViralVideo | null>(null);
  const { data: viralVideos } = useVirals();

  const cats = useMemo(() => {
    const set = new Set<string>();
    for (const v of viralVideos) if (v.category) set.add(v.category);
    return ['Todos', ...Array.from(set).sort()];
  }, [viralVideos]);

  const filtered = useMemo(
    () => (active === 'Todos' ? viralVideos : viralVideos.filter((v) => v.category === active)),
    [viralVideos, active],
  );

  return (
    <>
      <PageHeader
        eyebrow="Crescer perfil rápido"
        title={
          <>
            Vídeos <span className="text-gradient-brand">virais</span>
          </>
        }
      />

      {cats.length > 1 && (
        <div className="px-4 md:px-8 py-5 border-b border-border-subtle sticky top-16 z-20 bg-bg/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  'shrink-0 px-4 py-2 text-sm font-medium rounded-full transition border',
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
      )}

      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                onClick={() => setSelected(v)}
                className="block text-left group"
              >
                <Card variant="glass" hoverable className="overflow-hidden">
                  <div className="relative aspect-[9/16] bg-bg-elevated overflow-hidden">
                    <LazyVideo
                      src={v.videoUrl}
                      poster={v.thumb}
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent pointer-events-none" />

                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <Badge variant="live" className="px-2 py-0.5 text-[10px]">
                        <Flame size={9} /> Viral
                      </Badge>
                      {v.views && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full glass-strong text-[10px] font-medium">
                          <Eye size={9} />
                          <span>{v.views}</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-3">
                      {v.category && (
                        <Badge variant="brand" className="mb-1.5 text-[10px]">{v.category}</Badge>
                      )}
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 drop-shadow">
                        {v.title}
                      </h3>
                    </div>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-muted text-sm">
              Nenhum modelo viral nesta categoria.
            </div>
          )}
        </div>
      </section>

      <ViralModal video={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}
