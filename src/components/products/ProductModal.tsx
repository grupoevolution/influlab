'use client';

import {
  ArrowUpRight,
  Bot,
  CalendarPlus,
  Check,
  Crown,
  Download,
  ExternalLink,
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
import type { AdProduct } from '@/lib/db/types';

export function ProductModal({ product, open, onClose }: { product: AdProduct | null; open: boolean; onClose: () => void }) {
  const { add } = useCalendar();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCalendar = () => {
    add({
      productId: product.id,
      productName: product.name,
      image: product.image,
      niche: product.niche,
      scheduledDate: todayISO(),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Imagem do produto */}
        <div className="md:col-span-2 relative aspect-square md:aspect-auto bg-gradient-to-br from-brand-violet-500/10 to-brand-cyan-500/10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/30 to-transparent md:bg-gradient-to-r" />

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong">
              <Crown size={14} className="text-amber-300" />
              <span className="text-xs font-semibold">#{product.rankingPosition} no ranking</span>
            </div>
            <Badge variant={product.rankingTrend === 'up' ? 'success' : product.rankingTrend === 'down' ? 'warning' : 'default'}>
              <TrendingUp size={12} />
              {product.rankingTrend === 'up' ? 'Em alta' : product.rankingTrend === 'down' ? 'Caindo' : 'Estável'}
            </Badge>
          </div>
        </div>

        {/* Informações */}
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">{product.niche}</Badge>
              {product.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 mb-6 mt-5">
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
            <a href={product.videoExampleUrl} target="_blank" rel="noreferrer" className="block">
              <Button variant="primary" size="lg" className="w-full justify-between" rightIcon={<ExternalLink size={16} />}>
                <span className="flex items-center gap-2">
                  <Film size={16} /> Ver vídeo campeão no TikTok
                </span>
              </Button>
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a href={product.affiliateUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="md" className="w-full" rightIcon={<ArrowUpRight size={14} />}>
                  <Tag size={14} /> Me afiliar
                </Button>
              </a>
              <a href={product.imagePromptUrl} target="_blank" rel="noreferrer" download>
                <Button variant="secondary" size="md" className="w-full" leftIcon={<Download size={14} />}>
                  Baixar imagem
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a href={product.gptAgentUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="md" className="w-full" leftIcon={<Bot size={14} />}>
                  Agente GPT
                </Button>
              </a>
              <a href={product.flowUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="md" className="w-full" leftIcon={<Wand2 size={14} />}>
                  Abrir Flow
                </Button>
              </a>
            </div>

            <Button
              variant={added ? 'outline' : 'ghost'}
              size="md"
              className="w-full"
              leftIcon={added ? <Check size={14} /> : <CalendarPlus size={14} />}
              onClick={handleAddToCalendar}
            >
              {added ? 'Adicionado à agenda!' : 'Adicionar à minha agenda'}
            </Button>

            <CopyButton
              text={`Crie um vídeo UGC vertical 9:16 para o produto: ${product.name}. Nicho: ${product.niche}. Use o prompt validado para imagem antes do Flow.`}
              label="Copiar prompt rápido"
              variant="ghost"
              className="w-full mt-1"
            />
          </div>

          {/* Como replicar */}
          <div className="mt-6 pt-5 border-t border-border-subtle">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon size={14} className="text-brand-cyan-300" /> Fluxo de criação recomendado
            </h4>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="shrink-0 h-5 w-5 rounded-md bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">1</span>
                <span>Baixe a imagem campeã do produto acima.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 h-5 w-5 rounded-md bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">2</span>
                <span>Use o Agente GPT para gerar o roteiro vencedor desse produto.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 h-5 w-5 rounded-md bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">3</span>
                <span>Abra o Flow e cole o prompt + imagem para gerar o vídeo final.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 h-5 w-5 rounded-md bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">4</span>
                <span>Publique no TikTok com o link de afiliado já configurado.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}
