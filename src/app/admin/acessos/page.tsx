'use client';

import { Check, Crown, Edit3, FileSpreadsheet, History, Mail, Plus, Search, Trash2, Upload, UserCheck, X } from 'lucide-react';
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
  const [recoverOpen, setRecoverOpen] = useState(false);

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

  const renameEmail = async (oldEmail: string, newEmail: string) => {
    const ne = newEmail.trim().toLowerCase();
    if (!ne || !ne.includes('@')) {
      alert('Email inválido');
      return false;
    }
    if (ne === oldEmail) return true; // nada a fazer
    const r = await fetch('/api/admin/whitelist', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: oldEmail, newEmail: ne }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(`Erro ao alterar: ${j.error ?? r.status}`);
      return false;
    }
    load();
    return true;
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
          <div className="flex gap-2 flex-wrap">
            <Button leftIcon={<History size={14} />} variant="ghost" onClick={() => setRecoverOpen(true)}>
              Recuperar webhooks
            </Button>
            <Button leftIcon={<FileSpreadsheet size={14} />} variant="secondary" onClick={() => setImportOpen(true)}>
              Importar CSV
            </Button>
          </div>
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
            <WhitelistRow
              key={w.email}
              entry={w}
              onPlanChange={(p) => updatePlan(w.email, p)}
              onRename={(ne) => renameEmail(w.email, ne)}
              onRemove={() => remove(w.email)}
            />
          ))}
        </Card>
      </section>

      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} onDone={load} />
      <RecoverFromLogModal open={recoverOpen} onClose={() => setRecoverOpen(false)} onDone={load} />
    </>
  );
}

function RecoverFromLogModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [preview, setPreview] = useState<{
    foundInLog: number;
    alreadyInWhitelist: number;
    wouldAdd: number;
    sample: string[];
  } | null>(null);
  const [result, setResult] = useState<{ added: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'intro' | 'preview' | 'done'>('intro');

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/whitelist/recover-from-log?dryRun=1', { method: 'POST' });
      const j = await r.json();
      setPreview(j);
      setStage('preview');
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/whitelist/recover-from-log', { method: 'POST' });
      const j = await r.json();
      setResult({ added: j.added ?? 0 });
      setStage('done');
      onDone();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setStage('intro');
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      maxWidth="md"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <History size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold leading-tight">Recuperar webhooks antigos</h3>
            <p className="text-xs text-text-muted">
              Resgata emails que chegaram via webhook mas foram ignorados antes do fix
            </p>
          </div>
        </div>

        {stage === 'intro' && (
          <>
            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 text-xs leading-relaxed">
              <p className="text-amber-200 font-semibold mb-1">O que essa ação faz?</p>
              <p className="text-text-secondary">
                Varre o <strong>log de acessos</strong> e adiciona à whitelist todos os emails
                que receberam um webhook (de qualquer plataforma), no plano <strong>Básico</strong>.
                Idempotente: se o email já estiver liberado, não muda nada.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={fetchPreview} loading={loading}>
                Ver preview
              </Button>
            </div>
          </>
        )}

        {stage === 'preview' && preview && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-bg-elevated border border-border p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Total no log</p>
                <p className="text-xl font-display font-bold">{preview.foundInLog}</p>
              </div>
              <div className="rounded-xl bg-bg-elevated border border-border p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Já liberados</p>
                <p className="text-xl font-display font-bold text-text-secondary">{preview.alreadyInWhitelist}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-emerald-300">Vão entrar</p>
                <p className="text-xl font-display font-bold text-emerald-200">{preview.wouldAdd}</p>
              </div>
            </div>
            {preview.sample.length > 0 && (
              <div className="rounded-xl bg-bg-elevated border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan-300 mb-1.5">
                  Amostra dos emails que serão liberados
                </p>
                <ul className="text-xs space-y-0.5 text-text-secondary font-mono">
                  {preview.sample.map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                  {preview.wouldAdd > preview.sample.length && (
                    <li className="text-text-muted italic">
                      ... e mais {preview.wouldAdd - preview.sample.length}
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={reset}>
                Voltar
              </Button>
              <Button onClick={apply} loading={loading} disabled={preview.wouldAdd === 0}>
                Liberar {preview.wouldAdd} emails
              </Button>
            </div>
          </>
        )}

        {stage === 'done' && result && (
          <>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-4 text-center">
              <p className="text-2xl font-display font-bold text-emerald-200 mb-1">
                {result.added}
              </p>
              <p className="text-sm text-text-secondary">emails foram liberados no plano Básico</p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Fechar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function WhitelistRow({
  entry,
  onPlanChange,
  onRename,
  onRemove,
}: {
  entry: WhitelistEntry;
  onPlanChange: (plan: Plan) => void;
  onRename: (newEmail: string) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.email);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(entry.email);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(entry.email);
    setEditing(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const ok = await onRename(draft);
      if (ok) setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3">
      <div
        className={cn(
          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
          entry.plan === 'pro'
            ? 'bg-amber-500/15 text-amber-300'
            : 'bg-brand-cyan-500/15 text-brand-cyan-300',
        )}
      >
        {entry.plan === 'pro' ? <Crown size={14} /> : <UserCheck size={14} />}
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            autoFocus
            disabled={saving}
            className="w-full h-8 px-2 rounded-lg bg-bg-elevated border border-brand-violet-400/40 text-sm focus:border-brand-violet-400 outline-none"
          />
        ) : (
          <>
            <p className="text-sm font-semibold truncate">{entry.email}</p>
            <p className="text-[10px] text-text-muted truncate">
              {new Date(entry.addedAt).toLocaleString('pt-BR')}
              {entry.source !== 'manual' && ` · via ${entry.source}`}
            </p>
          </>
        )}
      </div>

      {editing ? (
        <>
          <button
            onClick={saveEdit}
            disabled={saving || !draft.includes('@')}
            className="p-2 rounded-lg text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40"
            title="Salvar"
            aria-label="Salvar"
          >
            <Check size={14} />
          </button>
          <button
            onClick={cancelEdit}
            disabled={saving}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"
            title="Cancelar"
            aria-label="Cancelar"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <select
            value={entry.plan}
            onChange={(e) => onPlanChange(e.target.value as Plan)}
            className="h-8 px-2 rounded-lg bg-bg-elevated border border-border text-xs"
          >
            <option value="basic">Básico</option>
            <option value="pro">PRO</option>
          </select>
          <button
            onClick={startEdit}
            className="p-2 rounded-lg text-text-muted hover:text-brand-cyan-300 hover:bg-brand-cyan-500/10"
            title="Editar email"
            aria-label="Editar email"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
            title="Remover"
            aria-label="Remover"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
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
