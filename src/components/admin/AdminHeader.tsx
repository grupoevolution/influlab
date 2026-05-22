import type { ReactNode } from 'react';

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4 border-b border-border-subtle">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-text-muted mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
