'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, Crown, Flame, Megaphone, Radio, Sparkles, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LazyVideo } from '@/components/ui/LazyVideo';
import { ThumbImg } from '@/components/ui/ThumbImg';
import { useAnnouncement, useProducts, useUpcomingEvents, useVirals } from '@/lib/api/client';
import type { UpcomingEventDB } from '@/lib/db/types';
import { cn, formatCurrency } from '@/lib/utils';

const ANNOUNCEMENT_KEY = 'influlab.announcement-dismissed';

export function AnnouncementBanner() {
  const { data: announcement } = useAnnouncement();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!announcement) {
      setVisible(false);
      return;
    }
    const dismissed = window.localStorage.getItem(ANNOUNCEMENT_KEY);
    if (dismissed !== announcement.id) setVisible(true);
  }, [announcement]);

  const close = () => {
    if (announcement && typeof window !== 'undefined') {
      window.localStorage.setItem(ANNOUNCEMENT_KEY, announcement.id);
    }
    setVisible(false);
  };

  if (!mounted || !announcement) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 md:px-8 -mt-8 md:-mt-10 relative z-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative glass-strong rounded-2xl p-4 md:p-5 overflow-hidden border-brand-violet-400/40 shadow-glow-violet">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-violet-500/20 via-transparent to-brand-cyan-500/20 pointer-events-none" />

              <button
                type="button"
                onClick={close}
                className="absolute top-2 right-2 z-30 p-2 rounded-lg bg-bg-elevated/60 text-text-secondary hover:text-text-primary hover:bg-bg-card transition"
                aria-label="Fechar aviso"
              >
                <X size={16} />
              </button>

              <div className="relative flex items-start gap-3 md:gap-4 pr-10">
                <div className="shrink-0">
                  <div className="relative h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
                    <span className="text-2xl">{announcement.emoji}</span>
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-bg" />
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="live" className="text-[10px]">
                      <Radio size={10} /> Aviso do dia
                    </Badge>
                    <span className="text-[10px] text-text-muted">há 12 min</span>
                  </div>
                  <h3 className="font-display font-bold text-base md:text-lg leading-tight mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-2.5">
                    {announcement.message}
                  </p>
                  {announcement.ctaHref && announcement.ctaLabel && (
                    <Link
                      href={announcement.ctaHref}
                      className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-brand-cyan-300 hover:text-brand-cyan-200 transition"
                    >
                      <Calendar size={13} />
                      {announcement.ctaLabel}
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DailyDrop() {
  const { data: products } = useProducts();
  // Drop = produto #1 do ranking (maior receita)
  const drop = [...products].sort((a, b) => (b.revenueEstimate ?? 0) - (a.revenueEstimate ?? 0))[0];
  if (!drop) return null;
  const dropImg = drop.image || drop.coverImage || '';

  return (
    <section className="px-4 md:px-8 pt-6 md:pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 mb-2">
              <Sparkles size={11} className="text-amber-300" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-200">Drop do dia</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold leading-tight">
              O produto <span className="text-gradient-brand">para criar hoje</span>
            </h2>
          </div>
          <Link
            href="/app/produtos-campeoes"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-300 hover:text-brand-cyan-200 transition"
          >
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>

        <Link href="/app/produtos-campeoes" className="block group">
          <Card variant="glass" hoverable className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-bg-elevated overflow-hidden">
                <ThumbImg
                  src={dropImg}
                  alt={drop.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bg-card via-bg-card/30 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-strong">
                  <Crown size={11} className="text-amber-300" />
                  <span className="text-[10px] font-bold">#1 hoje</span>
                </div>
              </div>

              <div className="p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="brand">{drop.niche}</Badge>
                    <Badge variant="cyan">{drop.commission}% comissão</Badge>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold leading-tight mb-2">
                    {drop.name}
                  </h3>
                </div>

                <div>
                  <div className="rounded-xl bg-bg-elevated/70 border border-border p-3 mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted">
                      Receita em {drop.period === 'today' ? 'hoje' : drop.period === '7d' ? '7 dias' : drop.period === '14d' ? '14 dias' : drop.period === '30d' ? '30 dias' : 'período'}
                    </div>
                    <div className="text-xl font-display font-bold mt-0.5 text-emerald-300">
                      {formatCurrency(drop.revenueEstimate)}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan-300 group-hover:gap-2.5 transition-all">
                    <Sparkles size={14} />
                    Criar vídeo com esse produto
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
}

export function TrendingNow() {
  const { data: viralVideos } = useVirals();
  if (viralVideos.length === 0) return null;
  return (
    <section className="px-4 md:px-8 pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 mb-2">
              <TrendingUp size={11} className="text-pink-300" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-200">Em alta agora</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold leading-tight">
              Modelos <span className="text-gradient-brand">virais</span> da semana
            </h2>
          </div>
          <Link
            href="/app/virais"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-300 hover:text-brand-cyan-200 transition"
          >
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8 pb-2">
          {viralVideos.slice(0, 6).map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="shrink-0 w-36 md:w-44"
            >
              <Link href="/app/virais" className="block group">
                <Card variant="glass" hoverable className="overflow-hidden">
                  <div className="relative aspect-[9/16] bg-bg-elevated overflow-hidden">
                    <LazyVideo
                      src={v.videoUrl}
                      poster={v.thumb}
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card/70 to-transparent pointer-events-none" />

                    <div className="absolute top-2 left-2">
                      <Badge variant="live" className="text-[9px] px-1.5 py-0">
                        <Flame size={8} /> {v.views}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 inset-x-2">
                      <p className="text-[11px] font-semibold leading-tight line-clamp-2 drop-shadow">
                        {v.title}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const EVENT_ICONS = {
  radio: Radio,
  crown: Crown,
  megaphone: Megaphone,
  calendar: Calendar,
  sparkles: Sparkles,
  flame: Flame,
} as const;

const ACCENT_STYLES: Record<UpcomingEventDB['accent'], { color: string; bg: string }> = {
  red:     { color: 'text-red-300',          bg: 'from-red-500/20 to-red-400/5' },
  amber:   { color: 'text-amber-300',        bg: 'from-amber-500/20 to-amber-400/5' },
  cyan:    { color: 'text-brand-cyan-300',   bg: 'from-brand-cyan-500/20 to-brand-cyan-400/5' },
  violet:  { color: 'text-brand-violet-300', bg: 'from-brand-violet-500/20 to-brand-violet-400/5' },
  emerald: { color: 'text-emerald-300',      bg: 'from-emerald-500/20 to-emerald-400/5' },
  pink:    { color: 'text-pink-300',         bg: 'from-pink-500/20 to-pink-400/5' },
};

export function UpcomingEvents() {
  const { data: events, loading } = useUpcomingEvents();

  // Se ainda carregando OU lista vazia, NÃO renderiza nada — seção some.
  if (loading || !events || events.length === 0) return null;

  return (
    <section className="px-4 md:px-8 pt-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cyan-500/15 border border-brand-cyan-400/30 mb-2">
            <Calendar size={11} className="text-brand-cyan-300" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-200">Próximos dias</span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold leading-tight">
            Não perca <span className="text-gradient-brand">essas datas</span>
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {events.map((e, i) => {
            const Icon = EVENT_ICONS[e.icon] ?? Calendar;
            const style = ACCENT_STYLES[e.accent] ?? ACCENT_STYLES.cyan;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card variant="glass" hoverable className="p-4 relative overflow-hidden">
                  <div className={cn('absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-50 bg-gradient-to-br', style.bg)} />
                  <div className="relative flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl glass-strong flex items-center justify-center shrink-0">
                      <Icon size={16} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', style.color)}>{e.dateText}</div>
                      <p className="text-sm font-semibold leading-tight">{e.title}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
