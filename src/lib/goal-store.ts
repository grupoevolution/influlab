'use client';

import { useCallback, useEffect, useState } from 'react';

export type GoalSettings = {
  contas: number;          // 1 - 10
  postsPorDia: number;     // 1 - 20 (por conta)
  metaMensal: number;      // R$ (a meta que o usuário arrasta)
  comissao: number;        // 8 - 15 (%)
};

const STORAGE_KEY = 'influlab.goal.v3';
const DEFAULT: GoalSettings = {
  contas: 1,
  postsPorDia: 5,
  metaMensal: 5000,
  comissao: 10,
};

// Parâmetros internos fixos do modelo (não expostos ao usuário)
const TAXA_CONVERSAO_INTERNA = 0.005; // 0.5%
const TICKET_MEDIO_INTERNO = 80;      // R$ 80 médio
const MULT_MODERADO_CONV = 1.0;
const MULT_MODERADO_TICKET = 1.0;
const MULT_CONSERVADOR_CONV = 0.5;
const MULT_CONSERVADOR_TICKET = 0.8;
const MULT_AGRESSIVO_CONV = 1.8;
const MULT_AGRESSIVO_TICKET = 1.2;

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
  label: 'Conservador' | 'Moderado' | 'Agressivo';
  vendas: number;
  faturamento: number;
  comissao: number;
};

export type Projection = {
  postsMes: number;
  visualizacoesBase: number;
  totalAudiencia: number;
  cenarios: ScenarioResult[];
};

/** Projeção dada uma quantidade de contas/posts. */
export function calcularProjecao(
  contas: number,
  postsPorDia: number,
  comissao: number,
): Projection {
  const postsTotalDia = contas * postsPorDia;
  const postsMes = postsTotalDia * 30;
  const visualizacoesBase = 1000 + postsPorDia * 100;
  const totalAudiencia = postsMes * visualizacoesBase;
  const comFrac = comissao / 100;

  const calc = (cMult: number, tMult: number): ScenarioResult => {
    const vendas = Math.round(totalAudiencia * TAXA_CONVERSAO_INTERNA * cMult);
    const faturamento = vendas * (TICKET_MEDIO_INTERNO * tMult);
    const comissaoFinal = faturamento * comFrac;
    return { label: 'Moderado', vendas, faturamento, comissao: comissaoFinal };
  };

  return {
    postsMes,
    visualizacoesBase,
    totalAudiencia,
    cenarios: [
      { ...calc(MULT_CONSERVADOR_CONV, MULT_CONSERVADOR_TICKET), label: 'Conservador' },
      { ...calc(MULT_MODERADO_CONV, MULT_MODERADO_TICKET), label: 'Moderado' },
      { ...calc(MULT_AGRESSIVO_CONV, MULT_AGRESSIVO_TICKET), label: 'Agressivo' },
    ],
  };
}

/**
 * Resolve quantos posts/dia (por conta) são necessários pra bater uma meta mensal,
 * dado o número de contas e a comissão. Usa o cenário Moderado como referência.
 */
export function postsParaBaterMeta(
  metaMensal: number,
  contas: number,
  comissao: number,
): number {
  if (contas <= 0 || metaMensal <= 0) return 1;
  const comFrac = comissao / 100;
  // comissaoMod = postsMes * visualizacoesBase * TAXA * TICKET * comFrac
  // postsMes = contas * postsPorDia * 30
  // visualizacoesBase = 1000 + postsPorDia * 100
  // Resolvemos por busca binária (visualizacoesBase depende de postsPorDia)
  let lo = 1;
  let hi = 30;
  let ans = 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const proj = calcularProjecao(contas, mid, comissao);
    const mod = proj.cenarios[1].comissao;
    if (mod >= metaMensal) {
      ans = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return ans;
}
