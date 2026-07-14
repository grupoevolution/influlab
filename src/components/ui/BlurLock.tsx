'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './Button';

const DISMISSED_KEY = 'influlab.blurlock-dismissed';

/**
 * Popup de bloqueio para usuários sem compra confirmada.
 * Aparece UMA VEZ ao entrar; depois pode ser fechado e o usuário navega livremente.
 * A BottomCTA continua aparecendo no rodapé enquanto não comprar.
 */
export function BlurLock({
  title = 'Conteúdo exclusivo para alunos Influencers Lab.ia',
  description = 'Libere o acesso completo ao laboratório e comece a criar vídeos virais para o TikTok Shop hoje mesmo.',
  ctaLabel = 'Quero liberar meu acesso',
  ctaHref = '#',
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = window.localStorage.getItem(DISMISSED_KEY);
    // Se nunca fechou, mostra agora
    if (!dismissed) {
      // Pequeno delay para deixar a página carregar antes
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  const close = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    setOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 backdrop-blur-md bg-bg/70"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative max-w-md w-full glass-strong rounded-3xl p-7 md:p-8 text-center shadow-glow-violet"
            >
              <button
                onClick={close}
                className="absolute top-3 right-3 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-brand">
                <div className="absolute inset-0 rounded-2xl bg-gradient-brand blur-xl opacity-60" />
                <Lock className="relative text-white" size={28} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet-500/15 border border-brand-violet-400/30 mb-3">
                <Sparkles size={12} className="text-brand-cyan-300" />
                <span className="text-xs font-medium text-brand-violet-200">Acesso bloqueado</span>
              </div>

              <h3 className="text-xl md:text-2xl font-display font-bold mb-2 text-gradient-brand">
                {title}
              </h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">{description}</p>

              <a href={ctaHref} className="block w-full mb-2">
                <Button size="lg" className="w-full">
                  {ctaLabel}
                </Button>
              </a>

              <button
                onClick={close}
                className="w-full py-2 text-xs text-text-muted hover:text-text-primary transition"
              >
                Só quero dar uma olhada antes
              </button>

              <p className="mt-3 text-xs text-text-subtle">
                Já comprou? Faça login com o mesmo email da compra.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra fixa no rodapé enquanto não comprar */}
      <BottomCTA ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </>
  );
}

function BottomCTA({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const [hidden, setHidden] = useState(false);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ delay: 0.4, type: 'spring', damping: 22, stiffness: 220 }}
          className="fixed bottom-20 lg:bottom-4 inset-x-3 md:inset-x-auto md:right-4 md:w-[420px] z-40 pointer-events-none"
        >
          <div className="pointer-events-auto glass-strong rounded-2xl p-3 shadow-glow-violet border border-brand-violet-400/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                <Lock size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                  Demonstração ativa
                </p>
                <p className="text-[11px] text-text-muted leading-tight">
                  Compre para liberar acesso completo
                </p>
              </div>
              <a href={ctaHref} className="shrink-0">
                <Button size="sm" className="h-9 px-3 text-xs">
                  {ctaLabel}
                </Button>
              </a>
              <button
                onClick={() => setHidden(true)}
                className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition"
                aria-label="Esconder"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
