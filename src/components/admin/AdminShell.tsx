'use client';

import {
  Bell,
  CalendarClock,
  Clapperboard,
  Crown,
  Flame,
  Home,
  Image as ImageIcon,
  LogOut,
  Megaphone,
  Send,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/produtos', label: 'Produtos campeões', icon: Crown },
  { href: '/admin/prompts-video', label: 'Prompts de vídeo', icon: Clapperboard },
  { href: '/admin/prompts-imagem', label: 'Prompts de imagem', icon: ImageIcon },
  { href: '/admin/virais', label: 'Vídeos virais', icon: Flame },
  { href: '/admin/criadores', label: 'Top criadores', icon: Trophy },
  { href: '/admin/avisos', label: 'Avisos do dia', icon: Megaphone, adminOnly: true },
  { href: '/admin/acessos', label: 'Liberar acessos', icon: UserCheck, adminOnly: true },
  { href: '/admin/notificacoes', label: 'Notificações', icon: Send, adminOnly: true },
  { href: '/admin/logs', label: 'Log de acessos', icon: CalendarClock, adminOnly: true },
];

export function AdminShell({
  children,
  role,
  email,
}: {
  children: ReactNode;
  role: 'admin' | 'staff';
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems.filter((i) => !i.adminOnly || role === 'admin');

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 flex-col bg-bg-surface/80 backdrop-blur-xl border-r border-border-subtle z-40">
        <div className="px-6 h-16 border-b border-border-subtle flex items-center justify-between">
          <Logo size="sm" />
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
            role === 'admin' ? 'bg-brand-violet-500/20 text-brand-violet-200 border border-brand-violet-400/30' : 'bg-brand-cyan-500/15 text-brand-cyan-300 border border-brand-cyan-400/30',
          )}>
            {role}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
            Administração
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  active
                    ? 'bg-gradient-to-r from-brand-violet-500/20 to-brand-cyan-500/10 border border-brand-violet-400/30 text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03]',
                )}
              >
                <Icon size={18} className={active ? 'text-brand-cyan-300' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border-subtle">
          <div className="glass rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-cyan-300 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{email}</p>
                <p className="text-[10px] text-text-muted">{role === 'admin' ? 'Administrador' : 'Operação'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 border-b border-border-subtle bg-bg/80 backdrop-blur-xl flex items-center justify-between">
          <Logo size="sm" />
          <button onClick={logout} className="p-2 text-text-muted hover:text-red-400">
            <LogOut size={16} />
          </button>
        </header>
        <main className="pb-16">{children}</main>
      </div>
    </div>
  );
}
