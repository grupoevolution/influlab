'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Film, Loader2, Plus, Trash2, X } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LazyVideo } from '@/components/ui/LazyVideo';
import { Modal } from '@/components/ui/Modal';
import type { HeroGalleryItem } from '@/lib/db/types';

const ENDPOINT = '/api/admin/hero-gallery';
const MAX_ITEMS_RECOMMENDED = 10;

export default function AdminGaleriaPage() {
  const [items, setItems] = useState<HeroGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(ENDPOINT, { cache: 'no-store' });
      const j = await r.json();
      const data = (j.data ?? []) as HeroGalleryItem[];
      // Ordena igual à API pública
      data.sort((a, b) => {
        const ao = a.order ?? 9999;
        const bo = b.order ?? 9999;
        if (ao !== bo) return ao - bo;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
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
    load();
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    // Troca os campos `order` entre os dois
    const a = items[idx];
    const b = items[swap];
    const ao = a.order ?? idx + 1;
    const bo = b.order ?? swap + 1;
    updateOrder(a.id, bo);
    updateOrder(b.id, ao);
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este vídeo da galeria?')) return;
    const res = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Erro ao remover');
  };

  return (
    <>
      <AdminHeader
        title="Galeria do hero"
        description="Vídeos curtos (2-3s, 9:16) que ficam rolando atrás do título 'Olá, criador' na home do app."
      />

      <section className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <p className="text-xs text-text-muted">
              {items.length} {items.length === 1 ? 'vídeo' : 'vídeos'} cadastrados ·{' '}
              <span className={items.length > MAX_ITEMS_RECOMMENDED ? 'text-amber-300' : 'text-text-subtle'}>
                recomendado: até {MAX_ITEMS_RECOMMENDED}
              </span>
            </p>
          </div>
          <Button leftIcon={<Plus size={16} />} onClick={() => setAdding(true)}>
            Adicionar vídeo
          </Button>
        </div>

        {/* Recomendações */}
        <Card variant="glass" className="p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
              <Film size={16} className="text-white" />
            </div>
            <div className="text-xs leading-relaxed">
              <p className="text-sm font-semibold mb-1">Boas práticas</p>
              <ul className="text-text-muted space-y-0.5 list-disc pl-4">
                <li>Vídeos curtos, de <strong className="text-text-secondary">2 a 3 segundos</strong>, formato vertical 9:16.</li>
                <li>Tamanho máximo de <strong className="text-text-secondary">15MB</strong> por vídeo.</li>
                <li>Rodam em loop, automaticamente e sem som — escolha vídeos com bom impacto visual.</li>
                <li>A ordem definida aqui é a ordem que eles aparecem no carrossel.</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : items.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
              <Film size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-display font-bold mb-1">Nenhum vídeo na galeria</h3>
            <p className="text-sm text-text-muted mb-4 max-w-md mx-auto">
              Adicione vídeos curtos pra dar vida ao hero da home. Sem itens, o hero usa o estilo padrão.
            </p>
            <Button leftIcon={<Plus size={14} />} onClick={() => setAdding(true)}>
              Adicionar primeiro vídeo
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, i) => (
              <Card key={item.id} variant="glass" className="overflow-hidden p-0">
                <div className="relative aspect-[9/16] bg-bg-elevated overflow-hidden">
                  <LazyVideo
                    src={item.videoUrl}
                    className="absolute inset-0"
                  />
                  <Badge variant="cyan" className="absolute top-2 left-2 text-[10px]">
                    #{i + 1}
                  </Badge>
                </div>
                <div className="p-2 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(item.id, -1)}
                      disabled={i === 0}
                      className="h-7 w-7 rounded-lg bg-bg-elevated text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                      aria-label="Mover pra cima"
                      title="Antes"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => move(item.id, 1)}
                      disabled={i === items.length - 1}
                      className="h-7 w-7 rounded-lg bg-bg-elevated text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                      aria-label="Mover pra baixo"
                      title="Depois"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="h-7 w-7 rounded-lg bg-bg-elevated text-text-muted hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"
                    aria-label="Remover"
                    title="Remover"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AddVideoModal
        open={adding}
        onClose={() => setAdding(false)}
        nextOrder={items.length + 1}
        onSaved={() => {
          setAdding(false);
          load();
        }}
      />
    </>
  );
}

function AddVideoModal({
  open,
  onClose,
  nextOrder,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  nextOrder: number;
  onSaved: () => void;
}) {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta quando abre
  useEffect(() => {
    if (open) {
      setVideoUrl('');
      setTitle('');
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) {
      setError('Faça upload do vídeo antes de salvar.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ videoUrl, title: title || undefined, order: nextOrder }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Erro ${res.status}`);
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

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
            Novo vídeo
          </p>
          <h3 className="text-xl font-display font-bold leading-tight">Adicionar à galeria</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Vídeo (9:16, 2-3s, até 15MB) <span className="text-red-400">*</span>
            </label>
            <MediaUpload
              accept="video"
              value={videoUrl}
              onChange={(url) => {
                setVideoUrl(url);
                setError(null);
              }}
              hint="Formato vertical funciona melhor. Roda silencioso e em loop."
              maxSizeMB={15}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Título (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Demo skincare 1"
              className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
            />
            <p className="text-[10px] text-text-subtle mt-1">
              Só pra você se organizar no admin. Não aparece pro aluno.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-border-subtle">
          <Button
            type="submit"
            leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            disabled={saving || !videoUrl}
            className="flex-1"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
