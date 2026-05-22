'use client';

import { Mail, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { WhitelistEntry } from '@/lib/db/types';

export default function AdminAcessosPage() {
  const [items, setItems] = useState<WhitelistEntry[]>([]);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const r = await fetch('/api/admin/whitelist', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, note }),
      });
      setEmail(''); setNote('');
      load();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (e: string) => {
    if (!confirm(`Revogar acesso de ${e}?`)) return;
    await fetch('/api/admin/whitelist', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: e }),
    });
    load();
  };

  const filtered = useMemo(() =>
    items.filter((i) => !query || i.email.includes(query.toLowerCase())),
    [items, query],
  );

  return (
    <>
      <AdminHeader
        title="Liberar acessos"
        description="Emails autorizados a usar o sistema como aluno. Quem digitar email fora desta lista verá tudo bloqueado."
      />

      <section className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-5">
        <Card variant="glass" className="p-4">
          <form onSubmit={add} className="space-y-3">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-[200px]">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@aluno.com"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-bg-elevated border border-border text-sm"
                />
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm flex-1 min-w-[140px]"
              />
              <Button type="submit" loading={loading} leftIcon={<Plus size={14} />}>
                Liberar
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">{items.length} {items.length === 1 ? 'email liberado' : 'emails liberados'}</p>
          <div className="relative w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar..."
              className="w-full h-8 pl-7 pr-2 rounded-lg bg-bg-elevated border border-border text-xs"
            />
          </div>
        </div>

        <Card variant="glass" className="divide-y divide-border-subtle">
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-text-muted text-center">Nenhum email liberado ainda.</div>
          )}
          {filtered.map((w) => (
            <div key={w.email} className="flex items-center gap-3 p-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0">
                <UserCheck size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{w.email}</p>
                <p className="text-[10px] text-text-muted">
                  {new Date(w.addedAt).toLocaleString('pt-BR')} {w.note ? `· ${w.note}` : ''}
                </p>
              </div>
              <Badge variant={w.source === 'webhook' ? 'success' : 'default'} className="text-[10px]">{w.source}</Badge>
              <button
                onClick={() => remove(w.email)}
                className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
}
