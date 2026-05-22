'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  href,
  accent = 'violet',
  delay = 0,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  href?: string;
  accent?: 'violet' | 'cyan' | 'amber' | 'emerald' | 'pink';
  delay?: number;
}) {
  const accentMap = {
    violet: { text: 'text-brand-violet-300', bg: 'from-brand-violet-500/15 to-brand-violet-400/5', border: 'border-brand-violet-400/20' },
    cyan: { text: 'text-brand-cyan-300', bg: 'from-brand-cyan-500/15 to-brand-cyan-400/5', border: 'border-brand-cyan-400/20' },
    amber: { text: 'text-amber-300', bg: 'from-amber-500/15 to-amber-400/5', border: 'border-amber-400/20' },
    emerald: { text: 'text-emerald-300', bg: 'from-emerald-500/15 to-emerald-400/5', border: 'border-emerald-400/20' },
    pink: { text: 'text-pink-300', bg: 'from-pink-500/15 to-pink-400/5', border: 'border-pink-400/20' },
  }[accent];

  const content = (
    <Card variant="glass" hoverable className="relative h-full overflow-hidden">
      <div className={cn('absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl bg-gradient-to-br', accentMap.bg)} />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('h-10 w-10 rounded-xl border bg-gradient-to-br flex items-center justify-center', accentMap.bg, accentMap.border)}>
            <Icon size={18} className={accentMap.text} />
          </div>
          {trend && (
            <span className="text-[10px] font-semibold text-emerald-400 inline-flex items-center gap-0.5">
              {trend}
            </span>
          )}
        </div>

        <p className="text-xs text-text-muted mb-1">{label}</p>
        <p className="text-3xl font-display font-bold leading-none mb-1">{value}</p>
        {hint && <p className="text-[10px] text-text-subtle">{hint}</p>}

        {href && (
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">Gerenciar</span>
            <ArrowRight size={12} className={cn('transition-transform', accentMap.text)} />
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {href ? <Link href={href} className="block group">{content}</Link> : content}
    </motion.div>
  );
}
