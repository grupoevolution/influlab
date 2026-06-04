'use client';

import {
  ArrowUpRight,
  Bot,
  CalendarPlus,
  Check,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  Tag,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { todayISO, useCalendar } from '@/lib/calendar-store';
import { TranscriptionModal } from './TranscriptionModal';
import type { AdProduct, SiteSettings } from '@/lib/db/types';

function periodLabel(p: AdProduct['period']): string {
  switch (p) {
    case 'today': return 'hoje';
    case '7d': return '7 dias';
    case '14d': return '14 dias';
    case '30d': return '30 dias';
    default: return 'no período';
  }
}

export function ProductModal({ product, open, onClose }: { product: AdProduct | null; open: boolean; onClose: () => void }) {
  const { add } = useCalendar();
  const [added, setAdded] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [site, setSite] = useState<SiteSettings>({});

  useEffect(() => {
    if (!open) return;
    fetch('/api/public/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setSite(j.data ?? {}))
      .catch(() => {});
  }, [open]);

  if (!product) return null;

  // Imagem única: prefere o campo `image` (novo); cai pra `coverImage` em produtos antigos.
  const img = product.image || product.coverImage;

  // URLs Flow / GPT são GLOBAIS — vêm de /admin/site. Se não configuradas, botão some.
  const flowUrl = site.flowUrl?.trim() || '';
  const gptAgentUrl = site.gptAgentUrl?.trim() || '';

  const handleAddToCalendar = () => {
    add({
      productId: product.id,
      productName: product.name,
      image: img,
      niche: product.niche,
      scheduledDate: todayISO(),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Imagem */}
        <div className="md:col-span-2 relative aspect-square md:aspect-auto bg-gradient-to-br from-brand-violet-500/10 to-brand-cyan-500/10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/30 to-transparent md:bg-gradient-to-r" />

          {product.plan === 'pro' && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-brand text-white">
                <Crown size={11} /> Exclusivo PRO
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="md:col-span-3 p-6 md:p-7">
          <div className="mb-4">
            <Badge variant="brand" className="mb-2">{product.niche}</Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">
              {product.name}
            </h2>
          </div>

          {/* Métricas — receita do período + comissão */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">
                Em {periodLabel(product.period)}
              </div>
              <div className="text-lg font-display font-bold mt-0.5 text-emerald-300">
                {formatCurrency(product.revenueEstimate)}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Comissão</div>
              <div className="text-lg font-display font-bold mt-0.5 text-brand-cyan-300">
                {product.commission}%
              </div>
            </div>
          </div>

          {/* Ações principais */}
          <div className="space-y-2.5">
            {product.videoExampleUrl && (
              <a href={product.videoExampleUrl} target="_blank" rel="noreferrer" className="block">
                <Button variant="primary" size="lg" className="w-full justify-between" rightIcon={<ExternalLink size={16} />}>
                  <span className="flex items-center gap-2">
                    <Film size={16} /> Ver vídeo campeão no TikTok
                  </span>
                </Button>
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              {product.affiliateUrl && (
                <a href={product.affiliateUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="md" className="w-full" rightIcon={<ArrowUpRight size={14} />}>
                    <Tag size={14} /> Me afiliar
                  </Button>
                </a>
              )}
              {img && (
                <a href={img} target="_blank" rel="noreferrer" download>
                  <Button variant="secondary" size="md" className="w-full" leftIcon={<Download size={14} />}>
                    Baixar imagem
                  </Button>
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {gptAgentUrl && (
                <a href={gptAgentUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="md" className="w-full" leftIcon={<Bot size={14} />}>
                    Agente GPT
                  </Button>
                </a>
              )}
              {flowUrl && (
                <a href={flowUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="md" className="w-full" leftIcon={<Wand2 size={14} />}>
                    Abrir Flow
                  </Button>
                </a>
              )}
            </div>

            {product.videoTranscription && (
              <button
                type="button"
                onClick={() => setTranscriptOpen(true)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-cyan-500/20 to-brand-violet-500/20 border border-brand-cyan-400/40 text-sm font-semibold text-brand-cyan-200 hover:from-brand-cyan-500/30 hover:to-brand-violet-500/30 transition inline-flex items-center justify-center gap-2"
              >
                <FileText size={14} />
                Ver transcrição do vídeo
              </button>
            )}

            <Button
              variant={added ? 'outline' : 'ghost'}
              size="md"
              className="w-full"
              leftIcon={added ? <Check size={14} /> : <CalendarPlus size={14} />}
              onClick={handleAddToCalendar}
            >
              {added ? 'Adicionado à agenda!' : 'Adicionar à minha agenda'}
            </Button>
          </div>

          {/* Fluxo */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon size={14} className="text-brand-cyan-300" /> Fluxo de criação recomendado
            </h4>
            <ol className="space-y-2 text-sm text-text-secondary">
              {[
                'Baixe a imagem campeã do produto acima.',
                'Cole a transcrição no Agente GPT pra gerar sua copy.',
                'Abra o Flow e cole o prompt + imagem pra gerar o vídeo final.',
                'Publique no TikTok com o link de afiliado configurado.',
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 h-5 w-5 rounded-md bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <TranscriptionModal
        open={transcriptOpen}
        onClose={() => setTranscriptOpen(false)}
        productName={product.name}
        transcription={product.videoTranscription ?? ''}
      />
    </Modal>
  );
}
