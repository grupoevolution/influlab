'use client';

import { motion } from 'framer-motion';
import { Check, Info, Percent, Save, Target, TrendingUp, Users, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import { calcularProjecao, postsParaBaterMeta, useGoal, type GoalSettings } from '@/lib/goal-store';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

const META_MIN = 500;
const META_MAX = 50000;
const META_STEP = 250;
const POSTS_MIN = 1;
const POSTS_MAX = 20;
const COMISSAO_MIN = 8;
const COMISSAO_MAX = 15;
const CONTAS_MAX = 10;

const SCENARIO_STYLES = {
  Conservador: { color: 'text-amber-300', bg: 'from-amber-500/15 to-amber-400/5', border: 'border-amber-400/30' },
  Moderado: { color: 'text-brand-cyan-300', bg: 'from-brand-cyan-500/15 to-brand-cyan-400/5', border: 'border-brand-cyan-400/30' },
  Agressivo: { color: 'text-emerald-300', bg: 'from-emerald-500/15 to-emerald-400/5', border: 'border-emerald-400/30' },
};

export default function CalculadoraPage() {
  const { goal, setGoal } = useGoal();
  const [local, setLocal] = useState<GoalSettings>(goal);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastChanged, setLastChanged] = useState<'meta' | 'posts' | null>(null);

  useEffect(() => {
    setLocal(goal);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projection = useMemo(
    () => calcularProjecao(local.contas, local.postsPorDia, local.comissao),
    [local.contas, local.postsPorDia, local.comissao],
  );

  // Quando muda a META, recalcula posts/dia
  const onMetaChange = (value: number) => {
    const posts = postsParaBaterMeta(value, local.contas, local.comissao);
    setLocal((g) => ({ ...g, metaMensal: value, postsPorDia: posts }));
    setLastChanged('meta');
  };

  // Quando muda POSTS/DIA, atualiza meta para refletir o moderado dessa configuração
  const onPostsChange = (value: number) => {
    const proj = calcularProjecao(local.contas, value, local.comissao);
    const novaMeta = Math.round(proj.cenarios[1].comissao / META_STEP) * META_STEP;
    setLocal((g) => ({
      ...g,
      postsPorDia: value,
      metaMensal: Math.min(META_MAX, Math.max(META_MIN, novaMeta)),
    }));
    setLastChanged('posts');
  };

  // Quando muda contas, recalcula posts baseado na meta atual
  const onContasChange = (value: number) => {
    const posts = postsParaBaterMeta(local.metaMensal, value, local.comissao);
    setLocal((g) => ({ ...g, contas: value, postsPorDia: posts }));
  };

  const onComissaoChange = (value: number) => {
    const posts = postsParaBaterMeta(local.metaMensal, local.contas, value);
    setLocal((g) => ({ ...g, comissao: value, postsPorDia: posts }));
  };

  const save = () => {
    setGoal(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  if (!hydrated) return null;

  const metaPct = ((local.metaMensal - META_MIN) / (META_MAX - META_MIN)) * 100;
  const postsPct = ((local.postsPorDia - POSTS_MIN) / (POSTS_MAX - POSTS_MIN)) * 100;
  const comissaoPct = ((local.comissao - COMISSAO_MIN) / (COMISSAO_MAX - COMISSAO_MIN)) * 100;

  return (
    <>
      <PageHeader
        eyebrow="Simulador de escalabilidade"
        title={
          <>
            Quanto você quer <span className="text-gradient-brand">faturar?</span>
          </>
        }
      />

      <section className="px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Contas (cards) */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold inline-flex items-center gap-1.5 text-brand-violet-300">
                <Users size={13} />
                Quantas contas do TikTok você tem?
              </label>
              <span className="text-xl font-display font-bold text-text-primary">
                {local.contas} {local.contas === 1 ? 'conta' : 'contas'}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: CONTAS_MAX }, (_, i) => i + 1).map((n) => {
                const active = local.contas === n;
                return (
                  <motion.button
                    key={n}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onContasChange(n)}
                    className={cn(
                      'relative h-12 rounded-xl border transition text-sm font-display font-bold',
                      active
                        ? 'bg-gradient-brand text-white border-transparent shadow-glow-brand'
                        : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/40',
                    )}
                  >
                    {n}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-[10px] text-text-subtle mt-2">
              Mais contas = mais alcance distribuído. Cada conta posta a quantidade definida abaixo.
            </p>
          </Card>

          {/* Cards de meta + posts/dia */}
          <Card variant="glass" className="relative overflow-hidden p-5 space-y-5">
            <CircuitDecor className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="text-xs font-semibold inline-flex items-center gap-1.5 text-brand-cyan-300">
                  <Target size={13} />
                  Quanto você quer faturar por mês?
                </label>
                <span className="text-2xl font-display font-bold text-gradient-brand">
                  {formatCurrency(local.metaMensal)}
                </span>
              </div>
              <input
                type="range"
                min={META_MIN}
                max={META_MAX}
                step={META_STEP}
                value={local.metaMensal}
                onChange={(e) => onMetaChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22D3EE 0%, #7C3AED ${metaPct}%, rgb(var(--c-bg-elevated)) ${metaPct}%, rgb(var(--c-bg-elevated)) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>R$ 500</span>
                <span>R$ 10k</span>
                <span>R$ 25k</span>
                <span>R$ 50k</span>
              </div>
            </div>

            <div className="relative pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="text-xs font-semibold inline-flex items-center gap-1.5 text-brand-violet-300">
                  <Video size={13} />
                  Posts por dia (por conta)
                </label>
                <span className="text-2xl font-display font-bold">
                  {local.postsPorDia}
                  <span className="text-sm font-normal text-text-muted ml-1">/ dia</span>
                </span>
              </div>
              <input
                type="range"
                min={POSTS_MIN}
                max={POSTS_MAX}
                step={1}
                value={local.postsPorDia}
                onChange={(e) => onPostsChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #7C3AED 0%, #22D3EE ${postsPct}%, rgb(var(--c-bg-elevated)) ${postsPct}%, rgb(var(--c-bg-elevated)) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
              <p className="text-[10px] text-brand-cyan-300/80 mt-2 leading-relaxed">
                {lastChanged === 'meta'
                  ? `Pra bater ${formatCurrency(local.metaMensal)}/mês, você precisa de ${local.postsPorDia} vídeo${local.postsPorDia > 1 ? 's' : ''}/dia em cada uma das ${local.contas} conta${local.contas > 1 ? 's' : ''}.`
                  : `Total: ${local.contas * local.postsPorDia} vídeos/dia · ${local.contas * local.postsPorDia * 30} no mês.`}
              </p>
            </div>

            <div className="relative pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="text-xs font-semibold inline-flex items-center gap-1.5 text-amber-300">
                  <Percent size={13} />
                  Comissão de afiliado
                </label>
                <span className="text-2xl font-display font-bold">{local.comissao}%</span>
              </div>
              <input
                type="range"
                min={COMISSAO_MIN}
                max={COMISSAO_MAX}
                step={1}
                value={local.comissao}
                onChange={(e) => onComissaoChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #F59E0B 0%, #7C3AED ${comissaoPct}%, rgb(var(--c-bg-elevated)) ${comissaoPct}%, rgb(var(--c-bg-elevated)) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>8%</span>
                <span>10%</span>
                <span>12%</span>
                <span>14%</span>
                <span>15%</span>
              </div>
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-500/10 border border-amber-400/30 p-2">
                <Info size={12} className="text-amber-300 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200 leading-relaxed">
                  <strong>Dica:</strong> dê preferência a produtos com pelo menos <strong>10% de comissão</strong>. Comissões mais altas escalam muito mais rápido.
                </p>
              </div>
            </div>
          </Card>

          {/* Audiência base */}
          <motion.div
            key={projection.totalAudiencia}
            initial={{ opacity: 0.6, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-brand opacity-90" />
            <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
            <div className="relative p-5 text-white text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80 mb-1">
                Audiência base estimada
              </p>
              <p className="text-3xl md:text-4xl font-display font-bold leading-none">
                {formatNumber(projection.totalAudiencia)} <span className="text-sm font-normal opacity-80">views/mês</span>
              </p>
              <p className="text-[11px] opacity-80 mt-1">
                {projection.postsMes.toLocaleString('pt-BR')} posts no mês ·{' '}
                {projection.visualizacoesBase.toLocaleString('pt-BR')} views/post (base)
              </p>
            </div>
          </motion.div>

          {/* Cenários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projection.cenarios.map((c) => {
              const style = SCENARIO_STYLES[c.label];
              return (
                <Card key={c.label} variant="glass" className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${style.bg}`} />
                  <div className={`relative p-4 border-l-2 ${style.border}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${style.color}`}>
                      {c.label}
                    </p>
                    <p className={`text-2xl md:text-3xl font-display font-bold mb-1 ${style.color}`}>
                      {formatCurrency(c.comissao)}
                    </p>
                    <div className="text-[11px] text-text-muted space-y-0.5">
                      <p>{c.vendas.toLocaleString('pt-BR')} vendas/mês</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Insight */}
          <Card variant="glass" className="p-4 border-emerald-400/30">
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-emerald-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Com <strong className="text-text-primary">{local.contas} conta{local.contas > 1 ? 's' : ''}</strong> postando{' '}
                  <strong className="text-text-primary">{local.postsPorDia} vídeo{local.postsPorDia > 1 ? 's' : ''}/dia</strong>{' '}
                  com produtos de <strong className="text-text-primary">{local.comissao}% de comissão</strong>, sua projeção
                  moderada é{' '}
                  <strong className="text-emerald-300">
                    {formatCurrency(projection.cenarios[1].comissao)}/mês
                  </strong>
                  .
                </p>
              </div>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            leftIcon={saved ? <Check size={16} /> : <Save size={16} />}
            onClick={save}
          >
            {saved ? 'Configurações salvas!' : 'Salvar configurações'}
          </Button>

          <p className="text-[10px] text-text-subtle text-center leading-relaxed">
            Modelo baseado em criadores InfluLab: 0.5% de conversão média e ticket médio de R$ 80. Audiência base = 1000 + (posts/dia × 100) views/post.
          </p>
        </div>
      </section>
    </>
  );
}
