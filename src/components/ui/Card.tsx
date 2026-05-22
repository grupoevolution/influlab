'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glass' | 'gradient' | 'plain';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const variants: Record<CardVariant, string> = {
  default:
    'bg-bg-card border border-border shadow-card',
  glass: 'glass shadow-card',
  gradient:
    'bg-gradient-to-br from-bg-elevated to-bg-card border border-brand-violet-400/20 shadow-card',
  plain: 'bg-bg-surface',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        variants[variant],
        hoverable && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-violet-400/40',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-2', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-3 border-t border-border-subtle', className)} {...props} />;
}
