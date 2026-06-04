'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Crown,
  Clapperboard,
  Image as ImageIcon,
  Flame,
  Trophy,
  LayoutDashboard,
  CalendarDays,
  Calculator,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app', label: 'Início', icon: LayoutDashboard },
  { href: '/app/produtos-campeoes', label: 'Produtos Campeões', icon: Crown },
  { href: '/app/banco-videos', label: 'Lab de Vídeos', icon: Clapperboard },
  { href: '/app/banco-imagens', label: 'Lab de Imagens', icon: ImageIcon },
  { href: '/app/virais', label: 'Vídeos Virais', icon: Flame },
  { href: '/app/criadores', label: 'Top Criadores', icon: Trophy },
];

const toolsItems = [
  { href: '/app/modelos', label: 'Modelos', icon: Users },
  { href: '/app/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/app/calculadora', label: 'Calculadora', icon: Calculator },
];

const secondaryItems = [
  { href: '/app/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/app/ajuda', label: 'Ajuda', icon: HelpCircle },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const renderItem = (item: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }, withLayoutId = true) => {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== '/app' && pathname?.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          active ? 'text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.03]',
        )}
      >
        {active && withLayoutId && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet-500/20 to-brand-cyan-500/10 border border-brand-violet-400/30"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
        )}
        {active && !withLayoutId && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet-500/20 to-brand-cyan-500/10 border border-brand-violet-400/30" />
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
    <aside className="flex h-full flex-col bg-bg-surface/80 backdrop-blur-xl border-r border-border-subtle">
      <div
        className="flex items-center px-6 border-b border-border-subtle"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)', paddingBottom: '0.5rem', minHeight: '4rem' }}
      >
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
          Laboratório
        </p>
        {navItems.map((item) => renderItem(item))}

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
          Ferramentas
        </p>
        {toolsItems.map((item) => renderItem(item, false))}

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
          Conta
        </p>
        {secondaryItems.map((item) => renderItem(item, false))}
      </nav>

      <div className="px-3 pb-4">
        <div className="glass rounded-2xl p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-brand shrink-0 flex items-center justify-center text-white text-sm font-bold">
              I
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">aluno@influlab.io</p>
              <p className="text-xs text-text-muted">Plano Aluno • Ativo</p>
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition"
        >
          <LogOut size={16} />
          Sair
        </Link>
      </div>
    </aside>
  );
}
