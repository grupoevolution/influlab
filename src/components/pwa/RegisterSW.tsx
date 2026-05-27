'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    let reg: ServiceWorkerRegistration | null = null;

    const onLoad = async () => {
      try {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

        // Sempre que o navegador detectar uma nova versão do sw.js,
        // ativamos imediatamente e damos reload — sem o usuário precisar
        // limpar cache manualmente.
        reg.addEventListener('updatefound', () => {
          const newWorker = reg?.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Pede pro SW novo assumir já
              newWorker.postMessage('SKIP_WAITING');
            }
          });
        });

        // Quando o controller muda (SW novo assumiu), recarrega uma vez só.
        let reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloaded) return;
          reloaded = true;
          window.location.reload();
        });

        // Checa por update a cada 30 minutos enquanto a aba estiver aberta.
        const interval = window.setInterval(() => {
          reg?.update().catch(() => {});
        }, 30 * 60 * 1000);

        // Também checa quando a aba volta a ficar visível
        const onVisible = () => {
          if (document.visibilityState === 'visible') reg?.update().catch(() => {});
        };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
          window.clearInterval(interval);
          document.removeEventListener('visibilitychange', onVisible);
        };
      } catch (err) {
        console.warn('[SW] registration failed', err);
      }
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
