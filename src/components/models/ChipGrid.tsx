'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChipItem = { value: string; label: string; emoji?: string };

interface ChipGridProps {
  options: ChipItem[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  cols?: number;
}

export function ChipGrid({ options, value, onChange, multi = false, cols = 4 }: ChipGridProps) {
  const isActive = (v: string) => (multi ? (value as string[]).includes(v) : value === v);

  const toggle = (v: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  const colsClass =
    cols === 2 ? 'grid-cols-2' :
    cols === 3 ? 'grid-cols-3' :
    cols === 5 ? 'grid-cols-3 sm:grid-cols-5' :
    cols === 6 ? 'grid-cols-3 sm:grid-cols-6' :
    'grid-cols-2 sm:grid-cols-4';

  return (
    <div className={cn('grid gap-1.5', colsClass)}>
      {options.map((opt) => {
        const active = isActive(opt.value);
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative p-2.5 rounded-xl border text-center transition text-xs',
              active
                ? 'bg-gradient-brand-soft border-brand-violet-400/60 text-text-primary shadow-glow-violet'
                : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/30',
            )}
          >
            {active && (
              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-gradient-brand flex items-center justify-center">
                <Check size={9} className="text-white" />
              </span>
            )}
            {opt.emoji && <div className="text-lg leading-none mb-1">{opt.emoji}</div>}
            <div className="font-medium leading-tight">{opt.label}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Variante para opções com cor (skin, hair, eyes)
type ColorOpt = { value: string; label: string; color: string };
export function ColorGrid({
  options,
  value,
  onChange,
  cols = 6,
}: {
  options: ColorOpt[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  const colsClass =
    cols === 5 ? 'grid-cols-3 sm:grid-cols-5' :
    cols === 6 ? 'grid-cols-3 sm:grid-cols-6' :
    'grid-cols-3 sm:grid-cols-4';

  return (
    <div className={cn('grid gap-2', colsClass)}>
      {options.map((opt) => {
        const active = value === opt.value;
        const bg = opt.color.startsWith('linear-gradient') ? { backgroundImage: opt.color } : { backgroundColor: opt.color };
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative p-2 rounded-xl border transition text-center',
              active
                ? 'border-brand-violet-400 ring-2 ring-brand-violet-400/40'
                : 'border-border hover:border-brand-violet-400/40',
            )}
          >
            <div
              className="mx-auto h-10 w-10 rounded-full border border-white/10 shadow-inner"
              style={bg}
            />
            {active && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow-brand">
                <Check size={10} className="text-white" />
              </div>
            )}
            <p className="text-[10px] mt-1.5 leading-tight text-text-secondary">{opt.label}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
