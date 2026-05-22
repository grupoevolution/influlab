'use client';

import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { useVideoPrompts } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const cats = ['Todos', 'UGC', 'Antes/Depois', 'Cinematic', 'Unboxing', 'Lifestyle', 'Tutorial'];

export default function BancoVideosPage() {
  const [active, setActive] = useState('Todos');
  const { data: videoPrompts } = useVideoPrompts();

  const filtered = active === 'Todos' ? videoPrompts : videoPrompts.filter((v) => v.category === active);

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

      {/* Filtros — uma linha scroll horizontal */}
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

      {/* Galeria 2 colunas (mobile) com videos rodando */}
      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Card variant="glass" hoverable className="overflow-hidden">
                  {/* Vídeo em loop, sem som */}
                  <div className="relative aspect-[9/16] bg-bg-elevated overflow-hidden">
                    <video
                      src={v.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card/70 via-transparent to-transparent pointer-events-none" />

                    {/* Categoria só */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="brand" className="text-[10px] px-1.5 py-0">{v.category}</Badge>
                    </div>
                  </div>

                  <div className="p-2.5 md:p-3">
                    <h3 className="font-semibold text-xs md:text-sm leading-snug mb-2 line-clamp-1">{v.title}</h3>

                    <div className="space-y-1.5">
                      <CopyButton text={v.prompt} label="Copiar prompt" size="sm" className="w-full h-8 text-xs" />
                      <a
                        href="https://labs.google/flow"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full h-8 px-2 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-brand-cyan-400/40 transition"
                      >
                        <Wand2 size={12} />
                        Abrir Flow
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
