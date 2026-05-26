'use client';

import { useCallback, useEffect, useState } from 'react';

export type GoalSettings = {
  // Parâmetros novos (modelo de escalabilidade)
  contas: number;          // 1 - 20
  postsPorDia: number;     // 1 - 20 (por conta)
  taxaConversao: number;   // 0.1 - 2 (em %)
  ticketMedio: number;     // 20 - 300 (R$)
  comissao: number;        // 8 - 15 (%)
};

const STORAGE_KEY = 'influlab.goal.v2';
const DEFAULT: GoalSettings = {
  contas: 3,
  postsPorDia: 5,
  taxaConversao: 0.5,
  ticketMedio: 80,
  comissao: 10,
};

function read(): GoalSettings {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<GoalSettings>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function write(g: GoalSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
  window.dispatchEvent(new CustomEvent('influlab:goal-changed'));
}

export function useGoal() {
  const [goal, setGoalState] = useState<GoalSettings>(DEFAULT);

  useEffect(() => {
    setGoalState(read());
    const h = () => setGoalState(read());
    window.addEventListener('influlab:goal-changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('influlab:goal-changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const setGoal = useCallback((g: Partial<GoalSettings>) => {
    const next = { ...read(), ...g };
    write(next);
    setGoalState(next);
  }, []);

  return { goal, setGoal };
}

export type ScenarioResult = {
  label: string;
  vendas: number;
  faturamento: number;
  comissao: number;
};

export function calcularProjecao(g: GoalSettings) {
  const postsPorDia = g.contas * g.postsPorDia;
  const postsMes = postsPorDia * 30;
  const visualizacoesBase = 1000 + g.postsPorDia * 100;
  const totalAudiencia = postsMes * visualizacoesBase;
  const taxa = g.taxaConversao / 100;
  const comissao = g.comissao / 100;

  const cenarios: ScenarioResult[] = (
    [
      { label: 'Conservador', cMult: 0.5, tMult: 0.8 },
      { label: 'Moderado', cMult: 1.0, tMult: 1.0 },
      { label: 'Agressivo', cMult: 1.8, tMult: 1.2 },
    ] as const
  ).map((c) => {
    const vendas = Math.round(totalAudiencia * taxa * c.cMult);
    const faturamento = vendas * (g.ticketMedio * c.tMult);
    const comissaoFinal = faturamento * comissao;
    return { label: c.label, vendas, faturamento, comissao: comissaoFinal };
  });

  return {
    postsMes,
    visualizacoesBase,
    totalAudiencia,
    cenarios,
  };
}
