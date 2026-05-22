'use client';

import { useCallback, useEffect, useState } from 'react';

export type CalendarItem = {
  id: string;
  productId?: string;
  productName: string;
  image?: string;
  niche?: string;
  scheduledDate: string;   // YYYY-MM-DD
  posted: boolean;
  postedAt?: string;       // ISO
  note?: string;
  createdAt: string;
};

const STORAGE_KEY = 'influlab.calendar.items.v2';

function read(): CalendarItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CalendarItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CalendarItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('influlab:calendar-changed'));
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function useCalendar() {
  const [items, setItems] = useState<CalendarItem[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener('influlab:calendar-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('influlab:calendar-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const add = useCallback((data: Omit<CalendarItem, 'id' | 'createdAt' | 'posted'> & { posted?: boolean }) => {
    const item: CalendarItem = {
      ...data,
      posted: data.posted ?? false,
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    write([...read(), item]);
    return item;
  }, []);

  const reschedule = useCallback((id: string, date: string) => {
    write(read().map((i) => (i.id === id ? { ...i, scheduledDate: date } : i)));
  }, []);

  const togglePosted = useCallback((id: string) => {
    write(
      read().map((i) =>
        i.id === id
          ? {
              ...i,
              posted: !i.posted,
              postedAt: !i.posted ? new Date().toISOString() : undefined,
            }
          : i,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  return { items, add, reschedule, togglePosted, remove };
}

// Util para semana ISO
export function getWeekDates(reference: Date = new Date()): string[] {
  const d = new Date(reference);
  const day = d.getDay(); // 0=Dom, 1=Seg...
  // Segunda = início
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`;
  });
}
