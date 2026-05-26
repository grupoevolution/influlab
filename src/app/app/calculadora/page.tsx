'use client';

import { motion } from 'framer-motion';
import { Calculator, Check, Percent, Save, Tag, TrendingUp, Users, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import { calcularProjecao, useGoal, type GoalSettings } from '@/lib/goal-store';
import { formatCurrency, formatNumber } from '@/lib/utils';

const RANGES = {
  contas: { min: 1, max: 20, step: 1, label: 'Contas TikTok' },
  postsPorDia: { min: 1, max: 20, step: 1, label: 'Posts por dia (por conta)' },
  taxaConversao: { min: 0.1, max: 2, step: 0.1, label: 'Taxa de conversão' },
  ticketMedio: { min: 20, max: 300, step: 5, label: 'Ticket médio' },
  comissao: { min: 8, max: 15, step: 1, label: 'Comissão de afiliado' },
};

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

  useEffect(() => {
    setLocal(goal);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projection = useMemo(() => calcularProjecao(local), [local]);

  const update = <K extends keyof GoalSettings>(key: K, value: GoalSettings[K]) =>
    setLocal((g) => ({ ...g, [key]: value }));

  const save = () => {
    setGoal(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  if (!hydrated) return null;

  return (
    <>
      <PageHeader
        eyebrow="Simulador de escalabilidade"
        title={
          <>
            Quanto você pode <span className="text-gradient-brand">faturar?</span>
          </>
        }
      />

      <section className="px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Inputs */}
          <Card variant="glass" className="relative overflow-hidden">
            <CircuitDecor className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" />

            <div className="relative p-5 md:p-6 space-y-5">
              <SliderField
                icon={Users}
                accent="brand-violet-300"
                label={RANGES.contas.label}
                value={local.contas}
                onChange={(v) => update('contas', v)}
                min={RANGES.contas.min}
                max={RANGES.contas.max}
                step={RANGES.contas.step}
                format={(v) => `${v}`}
                marks={[1, 5, 10, 15, 20]}
              />

              <SliderField
                icon={Video}
                accent="brand-cyan-300"
                label={RANGES.postsPorDia.label}
                value={local.postsPorDia}
                onChange={(v) => update('postsPorDia', v)}
                min={RANGES.postsPorDia.min}
                max={RANGES.postsPorDia.max}
                step={RANGES.postsPorDia.step}
                format={(v) => `${v}`}
                marks={[1, 5, 10, 15, 20]}
              />

              <SliderField
                icon={Percent}
                accent="amber-300"
                label={RANGES.taxaConversao.label}
                value={local.taxaConversao}
                onChange={(v) => update('taxaConversao', v)}
                min={RANGES.taxaConversao.min}
                max={RANGES.taxaConversao.max}
                step={RANGES.taxaConversao.step}
                format={(v) => `${v.toFixed(1)}%`}
                marks={[0.1, 0.5, 1, 1.5, 2]}
              />

              <SliderField
                icon={Tag}
                accent="emerald-300"
                label={RANGES.ticketMedio.label}
                value={local.ticketMedio}
                onChange={(v) => update('ticketMedio', v)}
                min={RANGES.ticketMedio.min}
                max={RANGES.ticketMedio.max}
                step={RANGES.ticketMedio.step}
                format={(v) => `R$ ${v}`}
                marks={[20, 80, 150, 220, 300]}
              />

              <SliderField
                icon={Percent}
                accent="pink-300"
                label={RANGES.comissao.label}
                value={local.comissao}
                onChange={(v) => update('comissao', v)}
                min={RANGES.comissao.min}
                max={RANGES.comissao.max}
                step={RANGES.comissao.step}
                format={(v) => `${v}%`}
                marks={[8, 10, 12, 14, 15]}
              />
            </div>
          </Card>

          {/* Header de projeção */}
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
              const style = SCENARIO_STYLES[c.label as keyof typeof SCENARIO_STYLES];
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
                      <p>Faturamento: {formatCurrency(c.faturamento)}</p>
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
                  Com <strong className="text-text-primary">{local.contas} conta(s)</strong> postando{' '}
                  <strong className="text-text-primary">{local.postsPorDia} vídeo(s)/dia</strong>, sua
                  comissão moderada projetada é{' '}
                  <strong className="text-emerald-300">
                    {formatCurrency(projection.cenarios[1].comissao)}/mês
                  </strong>
                  .
                </p>
                <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                  Mais consistência aumenta o alcance base por post (algoritmo TikTok).
                  Dobrar volume costuma triplicar a audiência base, não dobrar.
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
            Audiência base = 1.000 + (posts/dia × 100) views por post. Cenários aplicam multiplicadores de conversão e ticket sobre essa base.
          </p>
        </div>
      </section>
    </>
  );
}

function SliderField({
  icon: Icon,
  accent,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  marks,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  marks: number[];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-xs font-semibold inline-flex items-center gap-1.5 text-${accent}`}>
          <Icon size={13} />
          {label}
        </label>
        <span className="text-xl font-display font-bold text-text-primary">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #22D3EE 0%, #7C3AED ${pct}%, rgb(var(--c-bg-elevated)) ${pct}%, rgb(var(--c-bg-elevated)) 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-text-muted mt-1">
        {marks.map((m) => (
          <span key={m}>{format(m)}</span>
        ))}
      </div>
    </div>
  );
}
