'use client';

import { motion } from 'framer-motion';

/**
 * Background animado para hero e telas premium.
 * Combina: mesh gradient + orbs flutuantes + grid sutil + partículas.
 */
export function AnimatedBackground({ variant = 'default' }: { variant?: 'default' | 'subtle' | 'intense' }) {
  const intensity = variant === 'intense' ? 1.4 : variant === 'subtle' ? 0.5 : 1;

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

      {/* orbs */}
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)',
          opacity: 0.5 * intensity,
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)',
          opacity: 0.5 * intensity,
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.40) 0%, transparent 70%)',
          opacity: 0.45 * intensity,
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/80" />
    </div>
  );
}
