import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'brand' | 'cyan' | 'success' | 'warning' | 'live';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-secondary border border-border',
  brand: 'bg-brand-violet-500/15 text-brand-violet-200 border border-brand-violet-400/30',
  cyan: 'bg-brand-cyan-500/15 text-brand-cyan-300 border border-brand-cyan-400/30',
  success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
  live: 'bg-red-500/15 text-red-300 border border-red-400/30',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    >
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
      )}
      {children}
    </span>
  );
}
