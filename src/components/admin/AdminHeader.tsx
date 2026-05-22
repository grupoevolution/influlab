'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const labels: Record<string, string> = {
  admin: 'Dashboard',
  produtos: 'Produtos campeões',
  'prompts-video': 'Prompts de vídeo',
  'prompts-imagem': 'Prompts de imagem',
  virais: 'Vídeos virais',
  criadores: 'Top criadores',
  avisos: 'Avisos do dia',
  acessos: 'Liberar acessos',
  notificacoes: 'Notificações',
  logs: 'Log de acessos',
};

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const parts = pathname.split('/').filter(Boolean);

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-8 pb-5 border-b border-border-subtle relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
          <Link href="/admin" className="hover:text-text-primary inline-flex items-center gap-1">
            <Home size={12} />
            <span>Admin</span>
          </Link>
          {parts.slice(1).map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <ChevronRight size={11} className="text-text-subtle" />
              <span className={i === parts.length - 2 ? 'text-text-primary font-medium' : ''}>
                {labels[p] ?? p}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
