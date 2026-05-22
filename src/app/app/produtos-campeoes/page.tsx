'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Crown, Flame, Minus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductModal } from '@/components/products/ProductModal';
import { useProducts } from '@/lib/api/client';
import type { AdProduct } from '@/lib/db/types';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

type Sort = 'recent' | 'top';
type Period = 'all' | 'today' | '7d' | '14d';
type Niche = 'Todos' | 'Eletrônicos' | 'Beleza' | 'Saúde & Bem-estar' | 'Decoração' | 'Skincare';

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: 'all', label: 'Todos' },
];

const niches: Niche[] = ['Todos', 'Eletrônicos', 'Beleza', 'Saúde & Bem-estar', 'Decoração', 'Skincare'];

export default function ProdutosCampeoesPage() {
  const [sort, setSort] = useState<Sort>('recent');
  const [period, setPeriod] = useState<Period>('today');
  const [niche, setNiche] = useState<Niche>('Todos');
  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<AdProduct | null>(null);
  const { data: products } = useProducts();

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      if (period === 'today' && p.period !== 'today') return false;
      if (period === '7d' && !['today', '7d'].includes(p.period)) return false;
      if (niche !== 'Todos' && p.niche !== niche) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    if (sort === 'top') {
      return [...list].sort((a, b) => b.salesEstimate - a.salesEstimate);
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sort, period, niche, query, products]);

  return (
    <>
      <PageHeader
        title={
          <>
            Produtos <span className="text-gradient-brand">campeões</span>
          </>
        }
      />

      {/* Filtros */}
      <div className="border-b border-border-subtle sticky top-16 z-20 bg-bg/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 space-y-2.5">
          {/* Linha 1 — Período (filtro principal) */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {periods.map((p) => {
              const active = period === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    'shrink-0 px-4 h-9 text-xs md:text-sm font-semibold rounded-full transition',
                    active
                      ? 'bg-gradient-brand text-white shadow-glow-brand'
                      : 'bg-bg-elevated text-text-muted border border-border hover:text-text-primary hover:border-brand-violet-400/40',
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Linha 2 — Sort + Niche + Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort segmented */}
            <div className="inline-flex p-0.5 rounded-xl bg-bg-elevated border border-border">
              <button
                onClick={() => setSort('recent')}
                className={cn(
                  'relative inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg transition',
                  sort === 'recent' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {sort === 'recent' && (
                  <motion.div
                    layoutId="sort-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-brand-soft border border-brand-violet-400/40"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Sparkles size={12} className="relative" />
                <span className="relative">Recente</span>
              </button>
              <button
                onClick={() => setSort('top')}
                className={cn(
                  'relative inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg transition',
                  sort === 'top' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {sort === 'top' && (
                  <motion.div
                    layoutId="sort-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-brand-soft border border-brand-violet-400/40"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Flame size={12} className="relative" />
                <span className="relative">Mais vendido</span>
              </button>
            </div>

            {/* Niche dropdown */}
            <div className="relative">
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as Niche)}
                className="appearance-none h-9 pl-3 pr-8 rounded-xl bg-bg-elevated border border-border text-xs md:text-sm font-medium text-text-primary hover:border-brand-cyan-400/40 focus:border-brand-cyan-400/60 outline-none cursor-pointer transition"
              >
                {niches.map((n) => (
                  <option key={n} value={n} className="bg-bg-elevated text-text-primary">
                    {n === 'Todos' ? 'Todos os nichos' : n}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">▾</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Buscar produto..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-bg-elevated border border-border text-xs md:text-sm placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="px-3 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product, i) => {
              const TrendIcon =
                product.rankingTrend === 'up' ? ArrowUp : product.rankingTrend === 'down' ? ArrowDown : Minus;
              const trendColor =
                product.rankingTrend === 'up'
                  ? 'text-emerald-400'
                  : product.rankingTrend === 'down'
                  ? 'text-red-400'
                  : 'text-text-muted';

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <button onClick={() => setSelected(product)} className="block w-full text-left group">
                    <Card variant="glass" hoverable className="overflow-hidden">
                      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent" />

                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full glass-strong text-[10px]">
                          <Crown size={10} className="text-amber-300" />
                          <span className="font-bold">#{product.rankingPosition}</span>
                        </div>

                        <div className={cn('absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full glass-strong', trendColor)}>
                          <TrendIcon size={10} />
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <Badge variant="brand" className="text-[10px] px-1.5 py-0">{product.niche}</Badge>
                          <span className="text-xs font-display font-bold text-brand-cyan-300 drop-shadow">{product.commission}%</span>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-gradient-brand transition-all">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-text-muted">
                            <span className="text-text-primary font-semibold">{formatNumber(product.salesEstimate)}</span> vendas
                          </span>
                          <span className="text-emerald-300 font-semibold">{formatCurrency(product.revenueEstimate)}</span>
                        </div>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-text-muted">
              Nenhum produto encontrado com esses filtros.
            </div>
          )}
        </div>
      </section>

      <ProductModal product={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}
