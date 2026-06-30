'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowUp, Edit3, ImageIcon, Loader2, Pin, PinOff, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { cn } from '@/lib/utils';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'url'
  | 'image'
  | 'select'
  | 'tags'
  | 'list'
  | 'boolean'
  | 'media-image'
  | 'media-video';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helper?: string;
  imagePreview?: boolean;
};

export type EntityManagerProps<T extends { id: string }> = {
  endpoint: string;
  fields: FieldDef[];
  primaryField: keyof T;
  imageField?: keyof T;
  secondaryFields?: (keyof T)[];
  emptyState?: string;
  /**
   * Quando true, mostra botão de fixar/desafixar e setas pra ordenar
   * os fixados entre si. Os itens precisam ter os campos opcionais
   * `pinned: boolean` e `pinnedOrder: number`.
   */
  pinnable?: boolean;
};

type Pinnable = { pinned?: boolean; pinnedOrder?: number };

export function EntityManager<T extends { id: string } & Record<string, unknown>>({
  endpoint,
  fields,
  primaryField,
  imageField,
  secondaryFields,
  emptyState,
  pinnable = false,
}: EntityManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const remove = async (id: string) => {
    if (!confirm('Remover este item? Esta ação não pode ser desfeita.')) return;
    const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(`Erro ao remover: ${j.error ?? res.status}`);
    }
  };

  // Ordena: fixados primeiro (pinnedOrder asc), depois resto (createdAt desc ou ordem original).
  const ordered = useMemo(() => {
    if (!pinnable) return items;
    const list = [...items];
    list.sort((a, b) => {
      const ap = (a as unknown as Pinnable).pinned ? 0 : 1;
      const bp = (b as unknown as Pinnable).pinned ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (ap === 0) {
        // ambos fixados: ordena por pinnedOrder
        const ao = (a as unknown as Pinnable).pinnedOrder ?? 9999;
        const bo = (b as unknown as Pinnable).pinnedOrder ?? 9999;
        return ao - bo;
      }
      return 0;
    });
    return list;
  }, [items, pinnable]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ordered;
    const q = query.toLowerCase();
    return ordered.filter((it) => String(it[primaryField] ?? '').toLowerCase().includes(q));
  }, [ordered, query, primaryField]);

  const pinnedItems = useMemo(
    () => (pinnable ? items.filter((i) => (i as unknown as Pinnable).pinned) : []),
    [items, pinnable],
  );

  const patchItem = async (id: string, patch: Record<string, unknown>) => {
    await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
  };

  const togglePin = async (item: T) => {
    const p = item as unknown as Pinnable;
    if (p.pinned) {
      // Desafixar: limpa pinnedOrder
      await patchItem(item.id, { pinned: false, pinnedOrder: null });
    } else {
      // Fixar: vai pro fim dos fixados
      const nextOrder = (pinnedItems.length || 0) + 1;
      await patchItem(item.id, { pinned: true, pinnedOrder: nextOrder });
    }
    load();
  };

  const movePinned = async (id: string, dir: -1 | 1) => {
    const sortedPinned = [...pinnedItems].sort(
      (a, b) =>
        ((a as unknown as Pinnable).pinnedOrder ?? 9999) -
        ((b as unknown as Pinnable).pinnedOrder ?? 9999),
    );
    const idx = sortedPinned.findIndex((it) => it.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= sortedPinned.length) return;
    const a = sortedPinned[idx];
    const b = sortedPinned[swap];
    const ao = (a as unknown as Pinnable).pinnedOrder ?? idx + 1;
    const bo = (b as unknown as Pinnable).pinnedOrder ?? swap + 1;
    await Promise.all([
      patchItem(a.id, { pinnedOrder: bo }),
      patchItem(b.id, { pinnedOrder: ao }),
    ]);
    load();
  };

  return (
    <div className="px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
              />
            </div>
            <Badge className="text-xs whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
          <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Novo
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
              <ImageIcon size={20} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted mb-4">
              {query ? 'Nenhum item encontrado para essa busca.' : emptyState ?? 'Nenhum item cadastrado.'}
            </p>
            {!query && (
              <Button onClick={() => setCreating(true)} leftIcon={<Plus size={14} />}>
                Criar primeiro
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, i) => {
              const p = item as unknown as Pinnable;
              const isPinned = !!p.pinned;
              const pinnedIdx = isPinned
                ? [...pinnedItems]
                    .sort(
                      (a, b) =>
                        ((a as unknown as Pinnable).pinnedOrder ?? 9999) -
                        ((b as unknown as Pinnable).pinnedOrder ?? 9999),
                    )
                    .findIndex((it) => it.id === item.id)
                : -1;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                >
                  <Card
                    variant="glass"
                    hoverable
                    className={cn(
                      'overflow-hidden group',
                      isPinned && 'border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
                    )}
                  >
                    <div className="flex items-stretch">
                      {imageField && item[imageField] ? (
                        <div className="relative w-24 h-24 shrink-0 bg-bg-elevated overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={String(item[imageField])}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="flex-1 min-w-0 p-3.5">
                        <div className="flex items-start gap-2 mb-1.5">
                          {isPinned && (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0 shrink-0">
                              <Pin size={9} /> Fixado #{pinnedIdx + 1}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">
                          {String(item[primaryField] ?? '—')}
                        </h3>
                        {secondaryFields && (
                          <div className="flex flex-wrap gap-1">
                            {secondaryFields.map((f) => {
                              const v = item[f];
                              if (!v) return null;
                              return (
                                <Badge key={String(f)} className="text-[9px] px-1.5 py-0">
                                  {String(v)}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {/* Setas de ordem (só pros fixados) */}
                        {pinnable && isPinned && pinnedItems.length > 1 && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => movePinned(item.id, -1)}
                              disabled={pinnedIdx === 0}
                              className="h-6 w-6 rounded-md bg-bg-elevated text-text-muted hover:text-amber-300 disabled:opacity-30 flex items-center justify-center"
                              title="Subir entre fixados"
                              aria-label="Subir"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => movePinned(item.id, 1)}
                              disabled={pinnedIdx === pinnedItems.length - 1}
                              className="h-6 w-6 rounded-md bg-bg-elevated text-text-muted hover:text-amber-300 disabled:opacity-30 flex items-center justify-center"
                              title="Descer entre fixados"
                              aria-label="Descer"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col border-l border-border-subtle">
                        {pinnable && (
                          <>
                            <button
                              onClick={() => togglePin(item)}
                              className={cn(
                                'flex-1 px-3 transition',
                                isPinned
                                  ? 'text-amber-300 hover:bg-amber-500/10'
                                  : 'text-text-muted hover:text-amber-300 hover:bg-amber-500/5',
                              )}
                              title={isPinned ? 'Desafixar' : 'Fixar no topo'}
                            >
                              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                            </button>
                            <div className="h-px bg-border-subtle" />
                          </>
                        )}
                        <button
                          onClick={() => setEditing(item)}
                          className="flex-1 px-3 text-text-muted hover:text-brand-cyan-300 hover:bg-brand-cyan-500/5 transition"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <div className="h-px bg-border-subtle" />
                        <button
                          onClick={() => remove(item.id)}
                          className="flex-1 px-3 text-text-muted hover:text-red-400 hover:bg-red-500/5 transition"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(editing || creating) && (
          <EntityForm
            endpoint={endpoint}
            fields={fields}
            initial={editing}
            onClose={() => {
              setEditing(null);
              setCreating(false);
            }}
            onSaved={() => {
              setEditing(null);
              setCreating(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EntityForm<T extends { id: string } & Record<string, unknown>>({
  endpoint,
  fields,
  initial,
  onClose,
  onSaved,
}: {
  endpoint: string;
  fields: FieldDef[];
  initial: T | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(
    initial ? { ...(initial as Record<string, unknown>) } : {},
  );
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = initial ? `${endpoint}?id=${encodeURIComponent(initial.id)}` : endpoint;
      const method = initial ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        onSaved();
      } else {
        const j = await res.json().catch(() => ({}));
        alert(`Erro ao salvar: ${j.error ?? res.status}`);
      }
    } catch (err) {
      alert(`Erro de conexão: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="xl">
      <form onSubmit={submit} className="p-5 md:p-7">
        <div className="mb-5 pr-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1">
            {initial ? 'Editando' : 'Novo registro'}
          </p>
          <h3 className="text-xl font-display font-bold leading-tight">
            {initial ? 'Atualizar item' : 'Criar item'}
          </h3>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-border-subtle">
          <Button
            type="submit"
            leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            className="flex-1"
            disabled={saving}
          >
            {saving ? 'Salvando...' : initial ? 'Atualizar' : 'Criar'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const v = value as string | number | boolean | string[] | undefined;
  return (
    <div>
      <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.type === 'media-image' || field.type === 'media-video' ? (
        <MediaUpload
          accept={field.type === 'media-image' ? 'image' : 'video'}
          value={(v as string) ?? ''}
          onChange={(url) => onChange(url)}
          hint={field.helper}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          required={field.required}
          value={(v as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none resize-none"
        />
      ) : field.type === 'select' ? (
        <select
          required={field.required}
          value={(v as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary focus:border-brand-violet-400/50 outline-none"
        >
          <option value="">Selecione...</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === 'tags' || field.type === 'list' ? (
        <input
          type="text"
          value={Array.isArray(v) ? (v as string[]).join(', ') : ''}
          onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder={field.placeholder ?? 'Separe por vírgula'}
          className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none"
        />
      ) : field.type === 'boolean' ? (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-brand-violet-500"
          />
          <span className="text-sm text-text-secondary">{field.placeholder ?? 'Ativo'}</span>
        </label>
      ) : field.type === 'number' ? (
        <input
          type="number"
          required={field.required}
          value={(v as number) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder={field.placeholder}
          className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none"
        />
      ) : (
        <input
          type={field.type === 'url' || field.type === 'image' ? 'url' : 'text'}
          required={field.required}
          value={(v as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none"
        />
      )}
      {field.imagePreview && field.type === 'image' && typeof v === 'string' && v && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={v as string}
            alt="preview"
            className="h-20 w-20 rounded-lg object-cover bg-bg-elevated border border-border"
          />
        </div>
      )}
      {field.helper && <p className="text-[11px] text-text-subtle mt-1">{field.helper}</p>}
    </div>
  );
}
