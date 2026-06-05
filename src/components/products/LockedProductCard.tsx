'use client';

import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { AdProduct } from '@/lib/db/types';

function periodLabel(p: AdProduct['period']): string {
  switch (p) {
    case 'today': return 'hoje';
    case '7d': return '7d';
    case '14d': return '14d';
    case '30d': return '30d';
    default: return '—';
  }
}

/**
 * Card de produto PRO bloqueado pra usuários do plano básico.
 * A imagem e o nome aparecem EMBAÇADOS (não escondidos) — o aluno
 * vê a silhueta do produto, ficando claro o que ele tá perdendo.
 * Toca → abre o modal de upgrade.
 */
export function LockedProductCard({
  product,
  onClick,
  delay = 0,
}: {
  product?: AdProduct;
  onClick?: () => void;
  delay?: number;
}) {
  const img = product?.image || product?.coverImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <button onClick={onClick} className="block w-full text-left group">
        <Card variant="glass" hoverable className="overflow-hidden relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
            {/* Imagem real do produto, mas embaçada */}
            {img ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover scale-110 select-none pointer-events-none"
                  style={{ filter: 'blur(18px) brightness(0.6) saturate(1.2)' }}
                  draggable={false}
                />
              </>
            ) : (
              <>
                {/* Sem imagem cadastrada: usa mosaico abstrato */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-violet-700/40 via-bg-card to-brand-cyan-700/40" />
                <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
              </>
            )}

            {/* Tint violet escuro por cima pra dar mood premium */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-card/30 via-bg-card/10 to-bg-card/70" />

            {/* Cadeado central com glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-brand blur-2xl opacity-70" />
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
                  <Lock size={22} className="text-white" />
                </div>
              </div>
            </div>

            {/* Badge PRO no topo */}
            <div className="absolute top-2 left-2 right-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-brand text-white text-[10px] font-bold uppercase tracking-widest shadow-glow-brand">
                <Crown size={11} />
                Exclusivo PRO
              </span>
            </div>

            {/* Nicho + Comissão (info pública, fica nítida) */}
            {product && (
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                  {product.niche}
                </Badge>
                <span className="text-xs font-display font-bold text-white drop-shadow">
                  {product.commission}%
                </span>
              </div>
            )}
          </div>

          <div className="p-3">
            {/* Nome do produto BORRADO */}
            {product ? (
              <>
                <h3
                  className={cn(
                    'font-semibold text-sm leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem] select-none',
                    'text-text-primary/70',
                  )}
                  style={{ filter: 'blur(4px)' }}
                  aria-hidden="true"
                >
                  {product.name}
                </h3>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">
                    em <span className="font-semibold">{periodLabel(product.period)}</span>
                  </span>
                  <span
                    className="text-emerald-300/80 font-semibold select-none"
                    style={{ filter: 'blur(4px)' }}
                    aria-hidden="true"
                  >
                    {formatCurrency(product.revenueEstimate ?? 0)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="h-3 w-3/4 rounded bg-white/10 mb-2" />
                <div className="flex items-center justify-between">
                  <div className="h-2 w-1/3 rounded bg-white/5" />
                  <div className="h-2 w-1/4 rounded bg-white/5" />
                </div>
              </>
            )}
          </div>

          {/* Hover hint */}
          <div className="absolute inset-x-0 bottom-0 px-3 pb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="text-center text-[10px] font-semibold text-brand-cyan-200 drop-shadow">
              Toque pra desbloquear
            </p>
          </div>
        </Card>
      </button>
    </motion.div>
  );
}
