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
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { todayISO, useCalendar } from '@/lib/calendar-store';
import { TranscriptionModal } from './TranscriptionModal';
import type { AdProduct } from '@/lib/db/types';

export function ProductModal({ product, open, onClose }: { product: AdProduct | null; open: boolean; onClose: () => void }) {
  const { add } = useCalendar();
  const [added, setAdded] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  if (!product) return null;

  const handleAddToCalendar = () => {
    add({
      productId: product.id,
      productName: product.name,
      image: product.coverImage || product.image,
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
          <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/30 to-transparent md:bg-gradient-to-r" />

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong">
              <Crown size={14} className="text-amber-300" />
              <span className="text-xs font-semibold">#{product.rankingPosition} no ranking</span>
            </div>
            <Badge
              variant={
                product.rankingTrend === 'up' ? 'success' : product.rankingTrend === 'down' ? 'warning' : 'default'
              }
            >
              <TrendingUp size={12} />
              {product.rankingTrend === 'up' ? 'Em alta' : product.rankingTrend === 'down' ? 'Caindo' : 'Estável'}
            </Badge>
          </div>

          {product.plan === 'pro' && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-gradient-brand text-white">
                <Crown size={11} /> Exclusivo PRO
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="md:col-span-3 p-6 md:p-7">
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge variant="brand">{product.niche}</Badge>
              {product.tags?.slice(0, 3).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Vendas/dia</div>
              <div className="text-lg font-display font-bold mt-0.5">{formatNumber(product.salesEstimate)}</div>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated p-3">
              <div className="text-[10px] uppercase tracking-wider text-text-muted">Receita</div>
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
              {(product.imagePromptUrl || product.image) && (
                <a href={product.imagePromptUrl || product.image} target="_blank" rel="noreferrer" download>
                  <Button variant="secondary" size="md" className="w-full" leftIcon={<Download size={14} />}>
                    Baixar imagem
                  </Button>
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {product.gptAgentUrl && (
                <a href={product.gptAgentUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="md" className="w-full" leftIcon={<Bot size={14} />}>
                    Agente GPT
                  </Button>
                </a>
              )}
              {product.flowUrl && (
                <a href={product.flowUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="md" className="w-full" leftIcon={<Wand2 size={14} />}>
                    Abrir Flow
                  </Button>
                </a>
              )}
            </div>

            {product.videoTranscription && (
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                leftIcon={<FileText size={14} />}
                onClick={() => setTranscriptOpen(true)}
              >
                Ver transcrição do vídeo
              </Button>
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
