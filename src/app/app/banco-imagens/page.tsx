'use client';

import { motion } from 'framer-motion';
import { Download, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { useImagePrompts } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const cats = ['Todos', 'Hero', 'Flat Lay', 'Tech', 'Lifestyle', 'Mockup', 'Pop', 'Macro', 'Studio'];

export default function BancoImagensPage() {
  const [active, setActive] = useState('Todos');
  const { data: imagePrompts } = useImagePrompts();

  const filtered = active === 'Todos' ? imagePrompts : imagePrompts.filter((i) => i.category === active);

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
                    : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-cyan-400/30',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Galeria 2 cols mobile */}
      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Card variant="glass" hoverable className="overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image}
                      alt={img.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Tags overlay */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                      <Badge variant="cyan" className="text-[10px] px-1.5 py-0">{img.category}</Badge>
                      <Badge variant="brand" className="text-[10px] px-1.5 py-0">{img.style}</Badge>
                    </div>

                    {/* Download quick action */}
                    <a
                      href={img.image}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg glass-strong text-text-primary hover:bg-bg-card"
                      title="Baixar imagem"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={12} />
                    </a>
                  </div>

                  <div className="p-2.5 md:p-3">
                    <h3 className="font-semibold text-xs md:text-sm leading-snug mb-2 line-clamp-1">{img.title}</h3>

                    <div className="space-y-1.5">
                      <CopyButton text={img.prompt} label="Copiar prompt" size="sm" className="w-full h-8 text-xs" />
                      <a
                        href="https://gemini.google.com/gem/image-generator"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full h-8 px-2 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-brand-cyan-400/40 transition"
                      >
                        <Wand2 size={12} />
                        Abrir Nano Banana
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
