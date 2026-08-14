'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Decoração de linhas de circuito animadas (puxando da identidade da logo).
 * Usar como overlay decorativo em hero/cards grandes.
 *
 * PERFORMANCE MOBILE: animações SVG infinitas custam CPU em Android fraco.
 * O componente inteiro só renderiza em desktop (md+) — no mobile o hero
 * mantém os gradientes de fundo, que são estáticos e baratos.
 */
export function CircuitDecor({ className }: { className?: string }) {
  return (
    <svg
      className={cn('hidden md:block', className)}
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="circuit-grad" x1="0" y1="0" x2="800" y2="400">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[
        'M0 80 L120 80 L160 120 L300 120 L340 80 L500 80',
        'M0 200 L80 200 L120 240 L260 240 L300 200 L520 200 L560 240 L800 240',
        'M0 320 L180 320 L220 280 L380 280 L420 320 L640 320',
      ].map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="url(#circuit-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0.5] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeInOut',
          }}
        />
      ))}

      {[
        [120, 80],
        [340, 80],
        [120, 240],
        [560, 240],
        [220, 280],
        [420, 320],
      ].map(([x, y], i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={x}
          cy={y}
          r="3"
          fill="#22D3EE"
          initial={{ opacity: 0.3 }}
          // Anima só opacity: animar o atributo `r` via framer-motion escrevia
          // "undefined" em alguns frames (erro infinito no console) e gastava
          // thread principal à toa.
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}
