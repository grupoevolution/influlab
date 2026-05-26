'use client';

import { Crown, FileSpreadsheet, Mail, Plus, Search, Trash2, Upload, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Plan, WhitelistEntry } from '@/lib/db/types';
import { cn } from '@/lib/utils';

export default function AdminAcessosPage() {
  const [items, setItems] = useState<WhitelistEntry[]>([]);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<Plan>('basic');
  const [query, setQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | Plan>('all');
  const [loading, setLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = async () => {
    const r = await fetch('/api/admin/whitelist', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      });
      setEmail('');
      load();
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (em: string, newPlan: Plan) => {
    await fetch('/api/admin/whitelist', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: em, plan: newPlan }),
    });
    load();
  };

  const remove = async (em: string) => {
    if (!confirm(`Revogar acesso de ${em}?`)) return;
    await fetch('/api/admin/whitelist', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: em }),
    });
    load();
  };

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (filterPlan !== 'all' && i.plan !== filterPlan) return false;
        if (query && !i.email.includes(query.toLowerCase())) return false;
        return true;
      }),
    [items, query, filterPlan],
  );

  const stats = useMemo(() => {
    const basic = items.filter((i) => i.plan === 'basic').length;
    const pro = items.filter((i) => i.plan === 'pro').length;
    return { basic, pro, total: items.length };
  }, [items]);

  return (
    <>
      <AdminHeader
        title="Liberar acessos"
        description="Emails autorizados a usar o sistema como aluno. Defina o plano (Básico ou PRO) de cada um."
        actions={
          <Button leftIcon={<FileSpreadsheet size={14} />} variant="secondary" onClick={() => setImportOpen(true)}>
            Importar CSV
          </Button>
        }
      />

      <section className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card variant="glass" className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Total</p>
            <p className="text-2xl font-display font-bold">{stats.total}</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-brand-cyan-300">Básico</p>
            <p className="text-2xl font-display font-bold text-brand-cyan-300">{stats.basic}</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-amber-300">PRO</p>
            <p className="text-2xl font-display font-bold text-amber-300">{stats.pro}</p>
          </Card>
        </div>

        {/* Form de adicionar */}
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
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as Plan)}
                className="h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm"
              >
                <option value="basic">Básico</option>
                <option value="pro">PRO</option>
              </select>
              <Button type="submit" loading={loading} leftIcon={<Plus size={14} />}>
                Liberar
              </Button>
            </div>
          </form>
        </Card>

        {/* Filtros */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {(['all', 'basic', 'pro'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlan(p)}
                className={cn(
                  'px-3 h-8 rounded-full text-xs font-medium transition border',
                  filterPlan === p
                    ? 'bg-gradient-brand-soft border-brand-violet-400/40 text-text-primary'
                    : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary',
                )}
              >
                {p === 'all' ? 'Todos' : p === 'basic' ? 'Básico' : 'PRO'}
              </button>
            ))}
          </div>
          <div className="relative w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar email..."
              className="w-full h-8 pl-7 pr-2 rounded-lg bg-bg-elevated border border-border text-xs"
            />
          </div>
        </div>

        {/* Lista */}
        <Card variant="glass" className="divide-y divide-border-subtle">
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-text-muted text-center">Nenhum email encontrado.</div>
          )}
          {filtered.map((w) => (
            <div key={w.email} className="flex items-center gap-3 p-3">
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                w.plan === 'pro'
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-brand-cyan-500/15 text-brand-cyan-300',
              )}>
                {w.plan === 'pro' ? <Crown size={14} /> : <UserCheck size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{w.email}</p>
                <p className="text-[10px] text-text-muted truncate">
                  {new Date(w.addedAt).toLocaleString('pt-BR')}
                  {w.source !== 'manual' && ` · via ${w.source}`}
                </p>
              </div>
              <select
                value={w.plan}
                onChange={(e) => updatePlan(w.email, e.target.value as Plan)}
                className="h-8 px-2 rounded-lg bg-bg-elevated border border-border text-xs"
              >
                <option value="basic">Básico</option>
                <option value="pro">PRO</option>
              </select>
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

      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} onDone={load} />
    </>
  );
}

function ImportCsvModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [csv, setCsv] = useState('');
  const [defaultPlan, setDefaultPlan] = useState<Plan>('basic');
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!csv.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/admin/whitelist/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ csv, defaultPlan }),
      });
      const j = await r.json();
      setResult({ imported: j.imported ?? 0, errors: j.errors ?? [] });
      if (j.imported > 0) onDone();
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCsv(text);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="lg">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <FileSpreadsheet size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold leading-tight">Importar emails</h3>
            <p className="text-xs text-text-muted">Cole CSV ou faça upload do arquivo</p>
          </div>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan-300 mb-1">
            Formato aceito
          </p>
          <pre className="text-[10px] text-text-secondary font-mono whitespace-pre-wrap">
{`email
joao@email.com
maria@email.com

OU com plano:

email,plan
joao@email.com,basic
maria@email.com,pro`}
          </pre>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInput}
            type="file"
            accept=".csv,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
          <Button variant="secondary" leftIcon={<Upload size={14} />} onClick={() => fileInput.current?.click()}>
            Selecionar arquivo
          </Button>
          <select
            value={defaultPlan}
            onChange={(e) => setDefaultPlan(e.target.value as Plan)}
            className="h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm"
          >
            <option value="basic">Plano padrão: Básico</option>
            <option value="pro">Plano padrão: PRO</option>
          </select>
        </div>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          placeholder="Cole aqui o conteúdo CSV ou um email por linha..."
          className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm font-mono focus:border-brand-violet-400/50 outline-none resize-none"
        />

        {result && (
          <div className={cn(
            'rounded-xl p-3 border text-xs',
            result.imported > 0
              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
              : 'bg-amber-500/10 border-amber-400/30 text-amber-200',
          )}>
            <p className="font-semibold">{result.imported} emails importados.</p>
            {result.errors.length > 0 && (
              <p className="mt-1 text-text-muted">{result.errors.length} linhas com problema.</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={submit} loading={loading} className="flex-1">
            Importar
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
