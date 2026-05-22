'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { AccessLogEntry } from '@/lib/db/types';

/**
 * Mini gráfico de barras dos últimos 14 dias de acessos.
 * 100% SVG, sem dependências externas.
 */
export function AccessChart({ logs }: { logs: AccessLogEntry[] }) {
  const data = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      days.push({ date: iso, label, count: 0 });
    }
    for (const log of logs) {
      const iso = log.at.slice(0, 10);
      const day = days.find((d) => d.date === iso);
      if (day) day.count++;
    }
    return days;
  }, [logs]);

  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="relative">
      <div className="flex items-end gap-1.5 h-40 mb-2">
        {data.map((d, i) => {
          const heightPct = (d.count / max) * 100;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group">
              <span className="text-[9px] text-text-muted opacity-0 group-hover:opacity-100 transition">
                {d.count}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                className="w-full rounded-t-md bg-gradient-to-t from-brand-violet-500/60 to-brand-cyan-400/80 group-hover:from-brand-violet-500 group-hover:to-brand-cyan-400 transition-colors min-h-[2px]"
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-text-muted">
        {data.filter((_, i) => i % 2 === 0).map((d) => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
      <p className="text-[10px] text-text-subtle mt-2 text-center">
        <strong className="text-text-secondary">{total}</strong> acessos nos últimos 14 dias
      </p>
    </div>
  );
}
