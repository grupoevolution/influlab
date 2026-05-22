'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from './Button';

/**
 * Overlay de bloqueio para usuários sem compra confirmada.
 * Renderiza por cima do conteúdo deixando-o visível com blur (gera desejo).
 */
export function BlurLock({
  title = 'Conteúdo exclusivo para alunos InfluLab',
  description = 'Libere o acesso completo ao laboratório e comece a criar vídeos virais para o TikTok Shop hoje mesmo.',
  ctaLabel = 'Quero liberar meu acesso',
  ctaHref = '#',
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-6">
      <div className="absolute inset-0 backdrop-blur-xl bg-bg/60" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pointer-events-auto relative max-w-md w-full glass-strong rounded-3xl p-8 text-center shadow-glow-violet"
      >
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

        <a href={ctaHref} className="inline-block w-full">
          <Button size="lg" className="w-full">
            {ctaLabel}
          </Button>
        </a>

        <p className="mt-4 text-xs text-text-subtle">
          Já comprou? Faça login com o mesmo email da compra.
        </p>
      </motion.div>
    </div>
  );
}
