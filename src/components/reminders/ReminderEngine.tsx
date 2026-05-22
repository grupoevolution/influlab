'use client';

import { useEffect } from 'react';
import { checkAndFire } from '@/lib/reminders-store';

/**
 * Componente invisível que verifica reminders a cada 30 segundos enquanto o app está aberto.
 * No PWA instalado, isso garante que notificações disparam mesmo se o app estiver em background.
 */
export function ReminderEngine() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // primeira verificação imediata
    checkAndFire();

    // intervalo de 30s
    const id = window.setInterval(() => {
      checkAndFire();
    }, 30_000);

    // refaz checagem ao voltar foco
    const onFocus = () => checkAndFire();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  return null;
}
