'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { NotificationBroadcast } from '@/lib/db/types';

const STORAGE_KEY = 'influlab.last-broadcast-id';

/**
 * Faz polling em /api/public/broadcast a cada 60s.
 * Quando detecta um novo broadcast, mostra um toast no canto e dispara
 * notificação nativa (se permitida e instalado como PWA).
 */
export function BroadcastListener() {
  const [current, setCurrent] = useState<NotificationBroadcast | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const r = await fetch('/api/public/broadcast', { cache: 'no-store' });
        const j = await r.json();
        const b = j.data as NotificationBroadcast | null;
        if (!b || cancelled) return;
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen === b.id) return;
        localStorage.setItem(STORAGE_KEY, b.id);
        setCurrent(b);

        // Push nativo se permitido
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) {
              reg.showNotification(b.title, {
                body: b.body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                data: { url: b.url ?? '/app' },
                tag: `broadcast-${b.id}`,
              });
            } else {
              new Notification(b.title, { body: b.body, icon: '/icon.svg' });
            }
          } catch {
            // ignora
          }
        }
      } catch {
        // ignora
      }
    };

    check();
    const id = window.setInterval(check, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const dismiss = () => setCurrent(null);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-24 lg:bottom-6 inset-x-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="glass-strong rounded-2xl p-4 shadow-glow-violet relative">
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                <Bell size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm leading-tight mb-1">{current.title}</p>
                <p className="text-xs text-text-muted leading-relaxed mb-2">{current.body}</p>
                {current.url && (
                  <Link
                    href={current.url}
                    onClick={dismiss}
                    className="inline-flex items-center text-xs font-semibold text-brand-cyan-300 hover:text-brand-cyan-200"
                  >
                    Abrir →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
