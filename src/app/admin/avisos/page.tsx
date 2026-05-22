'use client';

import { Check, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { AnnouncementDB } from '@/lib/db/types';

export default function AdminAvisosPage() {
  const [items, setItems] = useState<AnnouncementDB[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AnnouncementDB>>({
    emoji: '✨', title: '', message: '', ctaLabel: '', ctaHref: '', active: true,
  });

  const load = async () => {
    const r = await fetch('/api/admin/announcements', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ emoji: '✨', title: '', message: '', ctaLabel: '', ctaHref: '', active: true });
    load();
  };

  const setActive = async (id: string) => {
    await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, patch: { active: true } }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este aviso?')) return;
    await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <>
      <AdminHeader
        title="Avisos do dia"
        description="O aviso ativo aparece no topo da home dos alunos."
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Novo aviso</Button>}
      />

      <section className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-3">
        {items.length === 0 && (
          <Card variant="glass" className="p-6 text-center text-sm text-text-muted">
            Nenhum aviso criado.
          </Card>
        )}
        {items.map((a) => (
          <Card key={a.id} variant="glass" className="p-4 flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/30 flex items-center justify-center shrink-0 text-2xl">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{a.title}</h3>
                {a.active && <Badge variant="success" className="text-[10px]">Ativo</Badge>}
              </div>
              <p className="text-xs text-text-muted line-clamp-2">{a.message}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {!a.active && (
                <button onClick={() => setActive(a.id)} className="p-2 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10" title="Ativar">
                  <Check size={14} />
                </button>
              )}
              <button onClick={() => remove(a.id)} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10">
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </section>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-display font-bold mb-2">Novo aviso</h3>
          <Field label="Emoji">
            <input value={form.emoji ?? ''} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="w-20 h-10 px-3 rounded-xl bg-bg-elevated border border-border text-center text-xl" />
          </Field>
          <Field label="Título">
            <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border" />
          </Field>
          <Field label="Mensagem">
            <textarea value={form.message ?? ''} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3} className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Texto do botão">
              <input value={form.ctaLabel ?? ''} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                placeholder="Ex: Saber mais" className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border" />
            </Field>
            <Field label="URL do botão">
              <input value={form.ctaHref ?? ''} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                placeholder="/app/produtos-campeoes" className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-brand-violet-500" />
            Ativar imediatamente (desativa o anterior)
          </label>
          <div className="flex gap-2 pt-3">
            <Button onClick={create} className="flex-1">Criar aviso</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-secondary mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
