'use client';

import { useCallback, useEffect, useState } from 'react';

export type GoalSettings = {
  videosPerDay: number;
  monthlyGoal: number;
};

const STORAGE_KEY = 'influlab.goal';
const DEFAULT: GoalSettings = { videosPerDay: 2, monthlyGoal: 3000 };

// Limite máximo de vídeos/dia exposto na calculadora
export const MAX_VIDEOS_PER_DAY = 30;

// Reais por vídeo postado consistente — calibrado para 3 vídeos/dia ≈ R$ 3.000/mês
export const RPV = 33;

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

export function projectMonthlyRevenue(videosPerDay: number) {
  const totalVideosMonth = videosPerDay * 30;
  const realistic = totalVideosMonth * RPV;
  return {
    realistic,
    conservative: realistic * 0.55,
    optimistic: realistic * 1.7,
    totalVideosMonth,
  };
}

export function videosNeededForGoal(monthlyGoal: number): number {
  if (monthlyGoal <= 0) return 0;
  return Math.max(1, Math.ceil(monthlyGoal / RPV / 30));
}
