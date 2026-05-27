'use client';

import { motion } from 'framer-motion';
import { Check, Info, Minus, Plus, Save, Target, TrendingUp, Users, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import { calcularProjecao, postsParaBaterMeta, useGoal, type GoalSettings } from '@/lib/goal-store';
import { formatCurrency } from '@/lib/utils';

const META_MIN = 500;
const META_MAX = 50000;
const META_STEP = 250;
const POSTS_MIN = 1;
const POSTS_MAX = 20;
const CONTAS_MIN = 1;
const CONTAS_MAX = 10;
const COMISSAO_DEFAULT = 10;

// Renomeação dos cenários
const SCENARIO_STYLES = {
  realista: { label: 'Cenário realista', color: 'text-brand-cyan-300', bg: 'from-brand-cyan-500/15 to-brand-cyan-400/5', border: 'border-brand-cyan-400/30' },
  baseSegura: { label: 'Base segura', color: 'text-amber-300', bg: 'from-amber-500/15 to-amber-400/5', border: 'border-amber-400/30' },
  topPerformer: { label: 'Top performer', color: 'text-emerald-300', bg: 'from-emerald-500/15 to-emerald-400/5', border: 'border-emerald-400/30' },
};

export default function CalculadoraPage() {
  const { goal, setGoal } = useGoal();
  const [local, setLocal] = useState<GoalSettings>(goal);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocal({ ...goal, comissao: COMISSAO_DEFAULT });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projection = useMemo(
    () => calcularProjecao(local.contas, local.postsPorDia, local.comissao),
    [local.contas, local.postsPorDia, local.comissao],
  );

  // Pega resultados nomeados
  const baseSegura = projection.cenarios[0]; // Conservador
  const realista = projection.cenarios[1];   // Moderado
  const topPerformer = projection.cenarios[2]; // Agressivo

  const onMetaChange = (value: number) => {
    const posts = postsParaBaterMeta(value, local.contas, local.comissao);
    setLocal((g) => ({ ...g, metaMensal: value, postsPorDia: posts }));
  };

  const onPostsChange = (value: number) => {
    const proj = calcularProjecao(local.contas, value, local.comissao);
    const novaMeta = Math.round(proj.cenarios[1].comissao / META_STEP) * META_STEP;
    setLocal((g) => ({
      ...g,
      postsPorDia: value,
      metaMensal: Math.min(META_MAX, Math.max(META_MIN, novaMeta)),
    }));
  };

  const onContasChange = (value: number) => {
    const clamped = Math.max(CONTAS_MIN, Math.min(CONTAS_MAX, value));
    const posts = postsParaBaterMeta(local.metaMensal, clamped, local.comissao);
    setLocal((g) => ({ ...g, contas: clamped, postsPorDia: posts }));
  };

  const save = () => {
    setGoal(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  if (!hydrated) return null;

  const metaPct = ((local.metaMensal - META_MIN) / (META_MAX - META_MIN)) * 100;
  const postsPct = ((local.postsPorDia - POSTS_MIN) / (POSTS_MAX - POSTS_MIN)) * 100;

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
          {/* Contas com +/- */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <label className="text-xs font-semibold inline-flex items-center gap-1.5 text-brand-violet-300">
                  <Users size={13} />
                  Quantas contas do TikTok você tem?
                </label>
                <p className="text-[11px] text-text-muted mt-1">
                  Cada conta posta a quantidade definida abaixo.
                </p>
              </div>

              <div className="inline-flex items-center bg-bg-elevated border border-border rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => onContasChange(local.contas - 1)}
                  disabled={local.contas <= CONTAS_MIN}
                  className="h-10 w-10 rounded-xl bg-bg hover:bg-bg-card disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary transition inline-flex items-center justify-center"
                  aria-label="Diminuir"
                >
                  <Minus size={14} />
                </button>
                <div className="px-5 min-w-[80px] text-center">
                  <div className="text-2xl font-display font-bold leading-none">{local.contas}</div>
                  <div className="text-[9px] uppercase tracking-widest text-text-muted mt-0.5">
                    {local.contas === 1 ? 'conta' : 'contas'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onContasChange(local.contas + 1)}
                  disabled={local.contas >= CONTAS_MAX}
                  className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand disabled:opacity-30 disabled:cursor-not-allowed text-white inline-flex items-center justify-center active:brightness-110"
                  aria-label="Aumentar"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </Card>

          {/* Meta + posts */}
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
                <span>R$ 12,5k</span>
                <span>R$ 25k</span>
                <span>R$ 37,5k</span>
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
              <p className="text-[11px] text-brand-cyan-300/80 mt-2 leading-relaxed">
                Total: <strong>{local.contas * local.postsPorDia} vídeos/dia</strong> ·{' '}
                {local.contas * local.postsPorDia * 30} no mês.
              </p>
            </div>

            {/* Aviso de comissão (sem slider) */}
            <div className="relative pt-3 border-t border-border-subtle">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-400/5 border border-amber-400/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Info size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-200 mb-1">
                      Sempre escolha produtos com pelo menos 10% de comissão
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      A calculadora usa <strong className="text-amber-200">10% como base</strong> pra projeção. Comissões mais altas escalam muito mais rápido — sempre dê preferência.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD PRINCIPAL — Cenário Realista (Moderado) com destaque */}
          <motion.div
            key={realista.comissao}
            initial={{ opacity: 0.6, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-brand opacity-90" />
            <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
            <div className="relative p-6 text-white text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80 mb-1">
                Sua comissão mensal esperada
              </p>
              <p className="text-4xl md:text-5xl font-display font-bold leading-none mb-2 drop-shadow">
                {formatCurrency(realista.comissao)}
              </p>
              <p className="text-xs opacity-85">
                ≈ {realista.vendas.toLocaleString('pt-BR')} vendas no mês
              </p>
            </div>
          </motion.div>

          {/* Cenários secundários */}
          <div className="grid grid-cols-2 gap-3">
            <Card variant="glass" className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${SCENARIO_STYLES.baseSegura.bg}`} />
              <div className={`relative p-4 border-l-2 ${SCENARIO_STYLES.baseSegura.border}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${SCENARIO_STYLES.baseSegura.color}`}>
                  {SCENARIO_STYLES.baseSegura.label}
                </p>
                <p className={`text-xl md:text-2xl font-display font-bold mb-0.5 ${SCENARIO_STYLES.baseSegura.color}`}>
                  {formatCurrency(baseSegura.comissao)}
                </p>
                <p className="text-[10px] text-text-muted">
                  {baseSegura.vendas.toLocaleString('pt-BR')} vendas/mês
                </p>
              </div>
            </Card>
            <Card variant="glass" className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${SCENARIO_STYLES.topPerformer.bg}`} />
              <div className={`relative p-4 border-l-2 ${SCENARIO_STYLES.topPerformer.border}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${SCENARIO_STYLES.topPerformer.color}`}>
                  {SCENARIO_STYLES.topPerformer.label}
                </p>
                <p className={`text-xl md:text-2xl font-display font-bold mb-0.5 ${SCENARIO_STYLES.topPerformer.color}`}>
                  {formatCurrency(topPerformer.comissao)}
                </p>
                <p className="text-[10px] text-text-muted">
                  {topPerformer.vendas.toLocaleString('pt-BR')} vendas/mês
                </p>
              </div>
            </Card>
          </div>

          {/* Insight */}
          <Card variant="glass" className="p-4 border-emerald-400/30">
            <div className="flex items-start gap-3">
              <TrendingUp size={18} className="text-emerald-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Com <strong className="text-text-primary">{local.contas} conta{local.contas > 1 ? 's' : ''}</strong> postando{' '}
                  <strong className="text-text-primary">{local.postsPorDia} vídeo{local.postsPorDia > 1 ? 's' : ''}/dia</strong>, sua projeção realista é{' '}
                  <strong className="text-emerald-300">
                    {formatCurrency(realista.comissao)}/mês
                  </strong>.
                </p>
                <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                  <strong className="text-text-secondary">Base segura</strong> é o pior caso esperado. <strong className="text-text-secondary">Top performer</strong> é o que os melhores alunos batem com consistência + virais.
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
        </div>
      </section>
    </>
  );
}
