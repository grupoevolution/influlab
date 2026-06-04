'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import type { AccessLogEntry } from '@/lib/db/types';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'webhook' | 'login' | 'blocked' | 'import' | 'upload';

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'webhook', label: 'Webhooks' },
  { value: 'login', label: 'Logins' },
  { value: 'blocked', label: 'Bloqueados' },
  { value: 'import', label: 'Imports' },
  { value: 'upload', label: 'Uploads' },
];

type LogMeta = {
  platform?: string;
  action?: 'added' | 'removed' | 'remove-noop';
  plan?: 'basic' | 'pro';
  autoDefault?: boolean;
  productId?: string;
  productName?: string;
  source?: string;
  kind?: string;
};

export default function AdminLogsPage() {
  const [items, setItems] = useState<AccessLogEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/admin/access-log?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((l) => l.type === filter);
  }, [items, filter]);

  return (
    <>
      <AdminHeader
        title="Log de acessos"
        description="Histórico de tudo que aconteceu no sistema. Webhooks só logam quando uma ação foi de fato tomada (added/removed) — eventos intermediários (pix gerado, boleto, etc) são silenciosos."
      />
      <section className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-4">
        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 px-3 h-8 rounded-full text-xs font-medium transition border',
                filter === f.value
                  ? 'bg-gradient-brand-soft border-brand-violet-400/40 text-text-primary'
                  : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <Card variant="glass" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-elevated/50 text-left">
              <tr>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Tipo</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Email</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Ação</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Detalhe</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-text-muted">Sem registros.</td></tr>
              )}
              {filtered.map((l) => {
                const meta = (l.meta ?? {}) as LogMeta;
                return (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-2">
                      <span className={cn(
                        'inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded',
                        l.type === 'login' && 'bg-emerald-500/15 text-emerald-300',
                        l.type === 'blocked' && 'bg-red-500/15 text-red-300',
                        l.type === 'webhook' && 'bg-brand-violet-500/15 text-brand-violet-300',
                        l.type === 'import' && 'bg-brand-cyan-500/15 text-brand-cyan-300',
                        l.type === 'upload' && 'bg-amber-500/15 text-amber-300',
                        l.type === 'visit' && 'bg-bg-elevated text-text-muted',
                      )}>
                        {l.type}
                      </span>
                      {meta.platform && (
                        <span className="ml-1 text-[10px] text-text-subtle font-mono">{meta.platform}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{l.email}</td>
                    <td className="px-3 py-2">
                      {meta.action === 'added' && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-200">
                          ✓ added
                          {meta.plan && (
                            <span className={cn(
                              'ml-1 normal-case font-semibold',
                              meta.plan === 'pro' ? 'text-amber-300' : 'text-brand-cyan-300',
                            )}>
                              {meta.plan.toUpperCase()}
                            </span>
                          )}
                        </span>
                      )}
                      {meta.action === 'removed' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-200">
                          ✗ removed
                        </span>
                      )}
                      {meta.action === 'remove-noop' && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">
                          remove (já fora)
                        </span>
                      )}
                      {!meta.action && l.role && (
                        <span className="text-xs text-text-muted">{l.role}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-text-muted font-mono truncate max-w-[200px]">
                      {meta.productName || meta.productId || meta.source || meta.kind || ''}
                      {meta.autoDefault && (
                        <span className="ml-1 text-[10px] text-amber-300">auto</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-text-muted whitespace-nowrap">
                      {new Date(l.at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>
    </>
  );
}
