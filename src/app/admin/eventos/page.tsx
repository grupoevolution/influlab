'use client';

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Crown,
  Flame,
  Loader2,
  Megaphone,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { UpcomingEventDB } from '@/lib/db/types';

const ENDPOINT = '/api/admin/events';

const ICONS: Record<UpcomingEventDB['icon'], { Comp: typeof Radio; label: string }> = {
  radio:     { Comp: Radio,     label: 'Live / podcast' },
  crown:     { Comp: Crown,     label: 'Lançamento' },
  megaphone: { Comp: Megaphone, label: 'Anúncio' },
  calendar:  { Comp: Calendar,  label: 'Data geral' },
  sparkles:  { Comp: Sparkles,  label: 'Novidade' },
  flame:     { Comp: Flame,     label: 'Viral / tendência' },
};

const ACCENTS: Record<UpcomingEventDB['accent'], { label: string; chip: string; ring: string }> = {
  red:     { label: 'Vermelho', chip: 'bg-red-500/20 text-red-300',                 ring: 'ring-red-400/60' },
  amber:   { label: 'Âmbar',    chip: 'bg-amber-500/20 text-amber-300',             ring: 'ring-amber-400/60' },
  cyan:    { label: 'Ciano',    chip: 'bg-brand-cyan-500/20 text-brand-cyan-300',   ring: 'ring-brand-cyan-400/60' },
  violet:  { label: 'Violeta',  chip: 'bg-brand-violet-500/20 text-brand-violet-300', ring: 'ring-brand-violet-400/60' },
  emerald: { label: 'Verde',    chip: 'bg-emerald-500/20 text-emerald-300',         ring: 'ring-emerald-400/60' },
  pink:    { label: 'Rosa',     chip: 'bg-pink-500/20 text-pink-300',               ring: 'ring-pink-400/60' },
};

export default function AdminEventosPage() {
  const [items, setItems] = useState<UpcomingEventDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UpcomingEventDB | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(ENDPOINT, { cache: 'no-store' });
      const j = await r.json();
      const data = (j.data ?? []) as UpcomingEventDB[];
      data.sort((a, b) => {
        const ao = a.order ?? 9999;
        const bo = b.order ?? 9999;
        if (ao !== bo) return ao - bo;
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateOrder = async (id: string, order: number) => {
    await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ order }),
    });
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const a = items[idx];
    const b = items[swap];
    const ao = a.order ?? idx + 1;
    const bo = b.order ?? swap + 1;
    await Promise.all([updateOrder(a.id, bo), updateOrder(b.id, ao)]);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este evento?')) return;
    const res = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <>
      <AdminHeader
        title="Próximos eventos"
        description='Aparecem na home do aluno em "Não perca essas datas". Se a lista ficar vazia, a seção inteira some.'
        actions={
          <Button leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
            Novo evento
          </Button>
        }
      />

      <section className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : items.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
              <Calendar size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-display font-bold mb-1">Nenhum evento cadastrado</h3>
            <p className="text-sm text-text-muted mb-4 max-w-md mx-auto">
              Sem eventos cadastrados, a seção "Próximos dias" não aparece pro aluno.
              Cadastre lives, lançamentos, workshops, etc.
            </p>
            <Button leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
              Cadastrar primeiro evento
            </Button>
          </Card>
        ) : (
          <Card variant="glass" className="divide-y divide-border-subtle">
            {items.map((e, i) => {
              const Icon = ICONS[e.icon]?.Comp ?? Calendar;
              const accent = ACCENTS[e.accent] ?? ACCENTS.cyan;
              return (
                <div key={e.id} className="flex items-center gap-3 p-3.5">
                  <div className={cn('h-10 w-10 rounded-xl glass-strong flex items-center justify-center shrink-0', accent.chip)}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-0.5', accent.chip.split(' ').find((c) => c.startsWith('text-')))}>
                      {e.dateText}
                    </p>
                    <p className="text-sm font-semibold truncate">{e.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(e.id, -1)}
                      disabled={i === 0}
                      className="h-8 w-8 rounded-lg bg-bg-elevated text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                      title="Antes"
                      aria-label="Mover pra cima"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => move(e.id, 1)}
                      disabled={i === items.length - 1}
                      className="h-8 w-8 rounded-lg bg-bg-elevated text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                      title="Depois"
                      aria-label="Mover pra baixo"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => setEditing(e)}
                    className="px-3 h-8 rounded-lg text-xs font-semibold text-brand-cyan-300 hover:bg-brand-cyan-500/10"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
                    title="Remover"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </Card>
        )}
      </section>

      <EventFormModal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        initial={editing}
        nextOrder={items.length + 1}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />
    </>
  );
}

function EventFormModal({
  open,
  onClose,
  initial,
  nextOrder,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: UpcomingEventDB | null;
  nextOrder: number;
  onSaved: () => void;
}) {
  const [dateText, setDateText] = useState('');
  const [title, setTitle] = useState('');
  const [accent, setAccent] = useState<UpcomingEventDB['accent']>('cyan');
  const [icon, setIcon] = useState<UpcomingEventDB['icon']>('calendar');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDateText(initial?.dateText ?? '');
      setTitle(initial?.title ?? '');
      setAccent(initial?.accent ?? 'cyan');
      setIcon(initial?.icon ?? 'calendar');
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!initial;
      const url = isEdit ? `${ENDPOINT}?id=${encodeURIComponent(initial!.id)}` : ENDPOINT;
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit
        ? { dateText, title, accent, icon }
        : { dateText, title, accent, icon, order: nextOrder };
      const r = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) onSaved();
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initial;

  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <form onSubmit={submit} className="p-5 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="mb-5 pr-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1">
            {isEdit ? 'Editando evento' : 'Novo evento'}
          </p>
          <h3 className="text-xl font-display font-bold leading-tight">
            {isEdit ? initial!.title : 'Cadastrar próximo evento'}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Data / horário <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              placeholder='Ex: "Hoje · 20h", "Amanhã · 09h", "Sex · 18h"'
              className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
            />
            <p className="text-[10px] text-text-subtle mt-1">
              Texto livre — escreva como vai aparecer pro aluno (não é um campo de data).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Título do evento <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ex: "Live: Faturando R$ 10k em 30 dias"'
              className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Ícone</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ICONS) as UpcomingEventDB['icon'][]).map((key) => {
                const { Comp, label } = ICONS[key];
                const selected = icon === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setIcon(key)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border transition text-left',
                      selected
                        ? 'bg-brand-violet-500/15 border-brand-violet-400/50'
                        : 'bg-bg-elevated border-border hover:border-brand-violet-400/30',
                    )}
                  >
                    <Comp size={16} className="text-text-secondary shrink-0" />
                    <span className="text-xs truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Cor de destaque</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(ACCENTS) as UpcomingEventDB['accent'][]).map((key) => {
                const a = ACCENTS[key];
                const selected = accent === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setAccent(key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition',
                      a.chip,
                      selected && `ring-2 ${a.ring}`,
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-border-subtle">
          <Button
            type="submit"
            disabled={saving || !dateText || !title}
            leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            className="flex-1"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar evento'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
