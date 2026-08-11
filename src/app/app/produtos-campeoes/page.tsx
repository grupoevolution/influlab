'use client';

import { Crown, Flame, Loader2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductModal } from '@/components/products/ProductModal';
import { LockedProductCard } from '@/components/products/LockedProductCard';
import { UpgradeProModal } from '@/components/products/UpgradeProModal';
import { useProducts } from '@/lib/api/client';
import { useStudentSession } from '@/lib/student-session';
import { useIncremental } from '@/lib/use-incremental';
import type { AdProduct } from '@/lib/db/types';
import { cn, formatCurrency } from '@/lib/utils';

type Sort = 'top' | 'recent';
type Period = 'all' | 'today' | '7d' | '14d' | '30d';

const sorts: { value: Sort; label: string; icon: typeof Flame }[] = [
  { value: 'top', label: 'Mais vendido', icon: Flame },
  { value: 'recent', label: 'Recente', icon: Sparkles },
];

const periods: { value: Period; label: string }[] = [
  { value: 'all', label: 'Todos períodos' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
];

function periodLabel(p: AdProduct['period']): string {
  switch (p) {
    case 'today': return 'hoje';
    case '7d': return '7d';
    case '14d': return '14d';
    case '30d': return '30d';
    default: return '—';
  }
}

export default function ProdutosCampeoesPage() {
  const [sort, setSort] = useState<Sort>('top');
  const [period, setPeriod] = useState<Period>('all');
  const [niche, setNiche] = useState<string>('Todos');
  const [selected, setSelected] = useState<AdProduct | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { data: products } = useProducts();
  const session = useStudentSession();
  const isPro = session?.plan === 'pro' || !session?.email; // sem login no admin = preview livre

  const niches = useMemo(() => {
    const set = new Set(products.map((p) => p.niche));
    return ['Todos', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (period === 'today' && p.period !== 'today') return false;
      if (period === '7d' && !['today', '7d'].includes(p.period)) return false;
      if (period === '14d' && !['today', '7d', '14d'].includes(p.period)) return false;
      if (period === '30d' && !['today', '7d', '14d', '30d'].includes(p.period)) return false;
      if (niche !== 'Todos' && p.niche !== niche) return false;
      return true;
    });
    if (sort === 'top') {
      // Ranking automático por receita (maior primeiro).
      return [...list].sort((a, b) => (b.revenueEstimate ?? 0) - (a.revenueEstimate ?? 0));
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [sort, period, niche, products]);

  // Renderização incremental: 12 cards por vez (ver src/lib/use-incremental.ts)
  const { visible, sentinelRef, hasMore } = useIncremental(filtered, 12, `${sort}|${period}|${niche}`);

  const handleProductClick = (p: AdProduct) => {
    if (p.plan === 'pro' && !isPro) {
      setUpgradeOpen(true);
      return;
    }
    setSelected(p);
  };

  return (
    <>
      <PageHeader
        eyebrow="Atualizado diariamente"
        title={
          <>
            Produtos <span className="text-gradient-brand">campeões</span>
          </>
        }
      />

      {/* Filtros */}
      <div className="border-b border-border-subtle sticky top-16 z-20 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide items-center">
            {sorts.map((s) => {
              const Icon = s.icon;
              const active = sort === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1.5 px-3 h-9 text-xs md:text-sm font-medium rounded-full transition border',
                    active
                      ? 'bg-gradient-brand text-white border-transparent shadow-glow-brand'
                      : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/30',
                  )}
                >
                  <Icon size={13} />
                  {s.label}
                </button>
              );
            })}

            <div className="shrink-0 h-5 w-px bg-border mx-1" />

            {periods.map((p) => {
              const active = period === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    'shrink-0 px-3 h-9 text-xs md:text-sm font-medium rounded-full transition border',
                    active
                      ? 'bg-gradient-brand-soft border-brand-violet-400/40 text-text-primary'
                      : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/30',
                  )}
                >
                  {p.label}
                </button>
              );
            })}

            {niches.length > 1 && <div className="shrink-0 h-5 w-px bg-border mx-1" />}

            {niches.map((n) => {
              const active = niche === n;
              return (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={cn(
                    'shrink-0 px-3 h-9 text-xs md:text-sm font-medium rounded-full transition border',
                    active
                      ? 'bg-brand-cyan-500/15 border-brand-cyan-400/40 text-brand-cyan-200'
                      : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-cyan-400/30',
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((product, i) => {
              const isLocked = product.plan === 'pro' && !isPro;

              if (isLocked) {
                return (
                  <LockedProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setUpgradeOpen(true)}
                    delay={0}
                  />
                );
              }

              // Ranking calculado: posição dele na lista ATUAL (visible é prefixo
              // da filtered ordenada, então i + 1 continua sendo o rank global)
              const rankingPosition = i + 1;
              const img = product.image || product.coverImage;

              return (
                <div key={product.id}>
                  <button onClick={() => handleProductClick(product)} className="block w-full text-left group">
                    <Card variant="default" hoverable className="overflow-hidden">
                      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent pointer-events-none" />

                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px]">
                          <Crown size={10} className="text-amber-300" />
                          <span className="font-bold">#{rankingPosition}</span>
                        </div>

                        {product.plan === 'pro' && (
                          <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-brand text-white text-[9px] font-bold uppercase tracking-widest">
                            <Crown size={9} /> Pro
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <Badge variant="brand" className="text-[10px] px-1.5 py-0">{product.niche}</Badge>
                          <span className="text-xs font-display font-bold text-brand-cyan-300 drop-shadow">
                            {product.commission}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-gradient-brand transition-all">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-muted">
                            em <span className="text-text-primary font-semibold">{periodLabel(product.period)}</span>
                          </span>
                          <span className="text-emerald-300 font-semibold">{formatCurrency(product.revenueEstimate)}</span>
                        </div>
                      </div>
                    </Card>
                  </button>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center gap-2 py-8 text-text-muted text-xs">
              <Loader2 size={14} className="animate-spin" />
              Carregando mais...
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-text-muted">
              Nenhum produto encontrado com esses filtros.
            </div>
          )}
        </div>
      </section>

      <ProductModal product={selected} open={!!selected} onClose={() => setSelected(null)} />
      <UpgradeProModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
