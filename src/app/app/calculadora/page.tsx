'use client';

import { motion } from 'framer-motion';
import { Calculator, Check, Target, TrendingUp, Video, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import {
  MAX_VIDEOS_PER_DAY,
  projectMonthlyRevenue,
  useGoal,
  videosNeededForGoal,
} from '@/lib/goal-store';
import { formatCurrency } from '@/lib/utils';

const GOAL_MIN = 500;
const GOAL_MAX = 30000;
const GOAL_STEP = 250;

export default function CalculadoraPage() {
  const router = useRouter();
  const { goal, setGoal } = useGoal();

  // Estados locais totalmente independentes
  const [videosPerDay, setVideosPerDay] = useState(2);
  const [monthlyGoal, setMonthlyGoal] = useState(3000);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Carrega os valores do storage apenas uma vez (no mount)
  useEffect(() => {
    setVideosPerDay(goal.videosPerDay);
    setMonthlyGoal(goal.monthlyGoal);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projection = useMemo(() => projectMonthlyRevenue(videosPerDay), [videosPerDay]);
  const needed = useMemo(() => videosNeededForGoal(monthlyGoal), [monthlyGoal]);
  const onTrack = projection.realistic >= monthlyGoal;

  const save = () => {
    setGoal({ videosPerDay, monthlyGoal });
    setSaved(true);
    setTimeout(() => router.push('/app/agenda'), 700);
  };

  // Calcula posição visual do slider em %
  const goalPct = ((monthlyGoal - GOAL_MIN) / (GOAL_MAX - GOAL_MIN)) * 100;
  const vpdPct = ((videosPerDay - 1) / (MAX_VIDEOS_PER_DAY - 1)) * 100;

  if (!hydrated) return null;

  return (
    <>
      <PageHeader
        eyebrow="Simulador exclusivo"
        title={
          <>
            Quanto você quer <span className="text-gradient-brand">faturar?</span>
          </>
        }
      />

      <section className="px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <Card variant="glass" className="relative overflow-hidden">
            <CircuitDecor className="absolute inset-0 w-full h-full opacity-20" />

            <div className="relative p-6 md:p-8">
              {/* Meta de faturamento */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="goal-input" className="text-xs font-semibold text-text-secondary inline-flex items-center gap-1.5">
                    <Target size={13} className="text-brand-cyan-300" />
                    Sua meta mensal
                  </label>
                  <span className="text-2xl font-display font-bold text-gradient-brand">
                    {formatCurrency(monthlyGoal)}
                  </span>
                </div>
                <input
                  id="goal-input"
                  type="range"
                  min={GOAL_MIN}
                  max={GOAL_MAX}
                  step={GOAL_STEP}
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-violet-500"
                  style={{
                    background: `linear-gradient(to right, #22D3EE 0%, #7C3AED ${goalPct}%, rgb(var(--c-bg-elevated)) ${goalPct}%, rgb(var(--c-bg-elevated)) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>R$ 500</span>
                  <span>R$ 5k</span>
                  <span>R$ 10k</span>
                  <span>R$ 20k</span>
                  <span>R$ 30k+</span>
                </div>
              </div>

              {/* Vídeos por dia */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="vpd-input" className="text-xs font-semibold text-text-secondary inline-flex items-center gap-1.5">
                    <Video size={13} className="text-brand-violet-300" />
                    Vídeos por dia
                  </label>
                  <span className="text-2xl font-display font-bold">
                    {videosPerDay}
                    <span className="text-sm font-normal text-text-muted ml-1">/ dia</span>
                  </span>
                </div>
                <input
                  id="vpd-input"
                  type="range"
                  min={1}
                  max={MAX_VIDEOS_PER_DAY}
                  step={1}
                  value={videosPerDay}
                  onChange={(e) => setVideosPerDay(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-cyan-400"
                  style={{
                    background: `linear-gradient(to right, #7C3AED 0%, #22D3EE ${vpdPct}%, rgb(var(--c-bg-elevated)) ${vpdPct}%, rgb(var(--c-bg-elevated)) 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>

              {/* Projeção principal */}
              <motion.div
                key={projection.realistic}
                initial={{ scale: 0.96, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                className="relative rounded-3xl overflow-hidden mb-3"
              >
                <div className="absolute inset-0 bg-gradient-brand opacity-90" />
                <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
                <div className="relative p-6 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80 mb-1">
                    Projeção mensal
                  </p>
                  <p className="text-4xl md:text-5xl font-display font-bold leading-none mb-2 drop-shadow">
                    {formatCurrency(projection.realistic)}
                  </p>
                  <p className="text-xs opacity-90">
                    ≈ {projection.totalVideosMonth} vídeos no mês
                  </p>
                </div>
              </motion.div>

              {/* Cenários */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="rounded-xl bg-bg-elevated border border-border p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Conservador</p>
                  <p className="text-sm md:text-base font-display font-bold">{formatCurrency(projection.conservative)}</p>
                </div>
                <div className="rounded-xl bg-gradient-brand-soft border border-brand-violet-400/40 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-brand-violet-200 mb-1">Realista</p>
                  <p className="text-sm md:text-base font-display font-bold">{formatCurrency(projection.realistic)}</p>
                </div>
                <div className="rounded-xl bg-bg-elevated border border-border p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1">Otimista</p>
                  <p className="text-sm md:text-base font-display font-bold text-emerald-300">{formatCurrency(projection.optimistic)}</p>
                </div>
              </div>

              {/* Insight */}
              <div className={`flex items-start gap-2.5 p-3 rounded-xl mb-5 border ${
                onTrack
                  ? 'bg-emerald-500/10 border-emerald-400/30'
                  : 'bg-amber-500/10 border-amber-400/30'
              }`}>
                <TrendingUp size={16} className={onTrack ? 'text-emerald-300 shrink-0 mt-0.5' : 'text-amber-300 shrink-0 mt-0.5'} />
                <p className="text-xs text-text-secondary leading-relaxed">
                  {onTrack ? (
                    <>
                      Com <strong className="text-text-primary">{videosPerDay} vídeo{videosPerDay > 1 ? 's' : ''}/dia</strong>, você passa da meta de <strong className="text-emerald-300">{formatCurrency(monthlyGoal)}</strong>. Sua agenda vai usar isso como base.
                    </>
                  ) : (
                    <>
                      Pra bater <strong className="text-text-primary">{formatCurrency(monthlyGoal)}</strong>, você precisa <strong className="text-amber-300">{needed} vídeo{needed > 1 ? 's' : ''}/dia</strong>. Ajuste o slider acima.
                    </>
                  )}
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                leftIcon={saved ? <Check size={16} /> : <Zap size={16} />}
                onClick={save}
              >
                {saved ? 'Meta salva!' : 'Salvar e ir pra agenda'}
              </Button>

              <p className="text-[10px] text-text-subtle text-center mt-3 leading-relaxed">
                Base: criadores InfluLab consistentes (~ R$ 33 / vídeo postado, na média).
              </p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
