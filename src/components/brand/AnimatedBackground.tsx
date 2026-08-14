'use client';

import { motion } from 'framer-motion';

/**
 * Background animado para hero e telas premium.
 * Combina: mesh gradient + orbs flutuantes + grid sutil.
 *
 * PERFORMANCE MOBILE: animar elementos grandes com blur-3xl obriga o
 * celular a recompor a tela o tempo todo — em Android fraco isso rouba a
 * CPU/GPU que deveria estar carregando conteúdo. No mobile os orbs ficam
 * ESTÁTICOS (mesmo visual, custo zero); a animação só roda em desktop.
 */
export function AnimatedBackground({ variant = 'default' }: { variant?: 'default' | 'subtle' | 'intense' }) {
  const intensity = variant === 'intense' ? 1.4 : variant === 'subtle' ? 0.5 : 1;

  const orbs = [
    {
      cls: 'absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-3xl',
      bg: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)',
      op: 0.5 * intensity,
      anim: { x: [0, 60, 0], y: [0, 40, 0] },
      dur: 18,
    },
    {
      cls: 'absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full blur-3xl',
      bg: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)',
      op: 0.5 * intensity,
      anim: { x: [0, -80, 0], y: [0, 60, 0] },
      dur: 22,
    },
    {
      cls: 'absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-3xl',
      bg: 'radial-gradient(circle, rgba(139,92,246,0.40) 0%, transparent 70%)',
      op: 0.45 * intensity,
      anim: { x: [0, 100, 0], y: [0, -50, 0] },
      dur: 26,
    },
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* mesh gradient base */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-80" />

      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.4) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* Orbs ESTÁTICOS — só mobile (mesmo visual, sem custo de animação) */}
      <div className="md:hidden">
        {orbs.map((o, i) => (
          <div key={i} className={o.cls} style={{ background: o.bg, opacity: o.op }} />
        ))}
      </div>

      {/* Orbs ANIMADOS — só desktop */}
      <div className="hidden md:block">
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            className={o.cls}
            style={{ background: o.bg, opacity: o.op }}
            animate={o.anim}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/80" />
    </div>
  );
}
