'use client';

import { useCallback, useEffect, useState } from 'react';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dom, 6=Sáb

export type Reminder = {
  id: string;
  label: string;          // ex: "Criar vídeo do dia"
  time: string;           // "HH:mm" 24h local
  days: DayOfWeek[];      // dias da semana ativos
  enabled: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'influlab.reminders';
const FIRED_KEY = 'influlab.reminders-fired'; // marca qual reminder já disparou hoje (Record<id, YYYY-MM-DD>)

function read(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    return [];
  }
}

function write(items: Reminder[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('influlab:reminders-changed'));
}

export function useReminders() {
  const [items, setItems] = useState<Reminder[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener('influlab:reminders-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('influlab:reminders-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const add = useCallback((data: Omit<Reminder, 'id' | 'createdAt' | 'enabled'> & { enabled?: boolean }) => {
    const item: Reminder = {
      ...data,
      enabled: data.enabled ?? true,
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    write([...read(), item]);
    return item;
  }, []);

  const toggle = useCallback((id: string) => {
    write(read().map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((r) => r.id !== id));
  }, []);

  return { items, add, toggle, remove };
}

// ===== Engine que dispara as notificações =====

function getFired(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(FIRED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markFired(id: string, date: string) {
  if (typeof window === 'undefined') return;
  const fired = getFired();
  fired[id] = date;
  window.localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
}

export async function fireReminder(r: Reminder) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  // Tenta usar service worker (suporta no PWA instalado), senão fallback browser API
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      reg.showNotification('Influencers Lab.ia ⚡', {
        body: r.label,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `reminder-${r.id}`,
        data: { url: '/app' },
      });
      return;
    }
  } catch {
    // ignora
  }

  new Notification('Influencers Lab.ia ⚡', {
    body: r.label,
    icon: '/icon.svg',
  });
}

/** Verifica todos os reminders e dispara se for o momento. Chame periodicamente. */
export function checkAndFire() {
  if (typeof window === 'undefined') return;
  const reminders = read();
  if (reminders.length === 0) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const dow = now.getDay() as DayOfWeek;
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const nowHM = `${hh}:${mm}`;
  const fired = getFired();

  for (const r of reminders) {
    if (!r.enabled) continue;
    if (!r.days.includes(dow)) continue;
    if (r.time !== nowHM) continue;
    if (fired[r.id] === today) continue;
    markFired(r.id, today);
    fireReminder(r);
  }
}
