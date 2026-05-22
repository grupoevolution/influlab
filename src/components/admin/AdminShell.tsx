'use client';

import {
  Bell,
  CalendarClock,
  ChevronDown,
  Clapperboard,
  Crown,
  ExternalLink,
  Flame,
  LayoutDashboard,
  Image as ImageIcon,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Send,
  ShieldCheck,
  Trophy,
  UserCheck,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
};

const contentNav: NavItem[] = [
  { href: '/admin/produtos', label: 'Produtos campeões', icon: Crown },
  { href: '/admin/prompts-video', label: 'Prompts de vídeo', icon: Clapperboard },
  { href: '/admin/prompts-imagem', label: 'Prompts de imagem', icon: ImageIcon },
  { href: '/admin/virais', label: 'Vídeos virais', icon: Flame },
  { href: '/admin/criadores', label: 'Top criadores', icon: Trophy },
];

const systemNav: NavItem[] = [
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === 'admin';

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 flex-col bg-bg-surface/90 backdrop-blur-xl border-r border-border-subtle z-40">
        <SidebarContent role={role} email={email} pathname={pathname} onLogout={logout} />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden bg-bg/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden flex flex-col bg-bg-surface/95 backdrop-blur-xl border-r border-border-subtle"
            >
              <SidebarContent
                role={role}
                email={email}
                pathname={pathname}
                onLogout={logout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border-subtle bg-bg/80 backdrop-blur-xl">
          <div className="h-full px-4 md:px-8 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-cyan-300 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Buscar no painel..."
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 focus:bg-bg-card transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Link
                href="/app"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-brand-cyan-400/40 transition"
              >
                <ExternalLink size={13} />
                Ver app
              </Link>

              <button className="relative p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5">
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-cyan-400 ring-2 ring-bg" />
              </button>

              <UserMenu email={email} role={role} onLogout={logout} />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  role,
  email,
  pathname,
  onLogout,
  onNavigate,
}: {
  role: 'admin' | 'staff';
  email: string;
  pathname: string | null;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const isAdmin = role === 'admin';
  const visibleSystemNav = systemNav.filter((i) => !i.adminOnly || isAdmin);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active =
      pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          active
            ? 'text-text-primary'
            : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03]',
        )}
      >
        {active && (
          <motion.div
            layoutId="admin-active"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet-500/20 to-brand-cyan-500/10 border border-brand-violet-400/30"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
        )}
        <Icon
          size={18}
          className={cn(
            'relative shrink-0 transition-colors',
            active ? 'text-brand-cyan-300' : 'text-text-muted group-hover:text-brand-violet-300',
          )}
        />
        <span className="relative">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Logo */}
      <div className="px-6 h-16 border-b border-border-subtle flex items-center justify-between">
        <Logo size="sm" />
        <span
          className={cn(
            'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded',
            isAdmin
              ? 'bg-brand-violet-500/20 text-brand-violet-200 border border-brand-violet-400/30'
              : 'bg-brand-cyan-500/15 text-brand-cyan-300 border border-brand-cyan-400/30',
          )}
        >
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            pathname === '/admin'
              ? 'text-text-primary'
              : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03]',
          )}
        >
          {pathname === '/admin' && (
            <motion.div
              layoutId="admin-active"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet-500/20 to-brand-cyan-500/10 border border-brand-violet-400/30"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <LayoutDashboard
            size={18}
            className={cn(
              'relative shrink-0',
              pathname === '/admin' ? 'text-brand-cyan-300' : 'text-text-muted group-hover:text-brand-violet-300',
            )}
          />
          <span className="relative">Dashboard</span>
        </Link>

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
          Conteúdo
        </p>
        {contentNav.map(renderItem)}

        {visibleSystemNav.length > 0 && (
          <>
            <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
              Sistema
            </p>
            {visibleSystemNav.map(renderItem)}
          </>
        )}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4 border-t border-border-subtle pt-3">
        <div className="glass rounded-2xl p-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-brand blur opacity-50" />
              <div className="relative h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                {email[0]?.toUpperCase() ?? 'A'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">{email}</p>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <ShieldCheck size={9} className="text-emerald-400" />
                Conectado
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </>
  );
}

function UserMenu({
  email,
  role,
  onLogout,
}: {
  email: string;
  role: 'admin' | 'staff';
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-10 px-2 pr-3 rounded-xl bg-bg-elevated border border-border hover:border-brand-violet-400/30 transition"
      >
        <div className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
          {email[0]?.toUpperCase() ?? 'A'}
        </div>
        <span className="hidden md:inline text-xs font-semibold text-text-primary truncate max-w-[140px]">
          {email}
        </span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-64 rounded-xl glass-strong border border-border shadow-glow-violet p-2"
            >
              <div className="px-3 py-2 border-b border-border-subtle mb-1">
                <p className="text-xs text-text-muted">Logado como</p>
                <p className="text-sm font-semibold truncate">{email}</p>
                <p className="text-[10px] text-brand-cyan-300 uppercase tracking-widest font-bold mt-0.5">
                  {role}
                </p>
              </div>
              <Link
                href="/app"
                target="_blank"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
              >
                <ExternalLink size={14} />
                Ver app do aluno
              </Link>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={14} />
                Sair
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
