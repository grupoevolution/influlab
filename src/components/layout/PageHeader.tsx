import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  highlights?: { label: string; value: string }[];
}

export function PageHeader({ eyebrow, title, description, actions, highlights }: PageHeaderProps) {
  return (
    <div className="relative px-4 md:px-8 pt-8 pb-6 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="max-w-3xl">
            {eyebrow && (
              <Badge variant="cyan" className="mb-3">
                {eyebrow}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-text-muted text-sm md:text-base leading-relaxed">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
        </div>

        {highlights && highlights.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="glass rounded-xl p-3">
                <div className="text-xs text-text-muted">{h.label}</div>
                <div className="text-xl md:text-2xl font-display font-bold mt-0.5">{h.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
