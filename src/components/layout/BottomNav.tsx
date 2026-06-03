'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Crown,
  Clapperboard,
  CalendarDays,
  LayoutDashboard,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/app', label: 'Início', icon: LayoutDashboard },
  { href: '/app/produtos-campeoes', label: 'Campeões', icon: Crown },
  { href: '/app/banco-videos', label: 'Vídeos', icon: Clapperboard },
  { href: '/app/agenda', label: 'Agenda', icon: CalendarDays },
];

export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      aria-label="Navegação principal"
    >
      {/* gradient fade for visual contrast */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none" />

      <div className="pointer-events-auto relative px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="glass-strong rounded-2xl shadow-glow-violet border border-brand-violet-400/20">
          <div className="grid grid-cols-5 items-stretch">
            {items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/app' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors',
                    active ? 'text-text-primary' : 'text-text-muted active:text-text-secondary',
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-active"
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-brand shadow-glow-brand"
                      transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                    />
                  )}
                  <div className="relative">
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-gradient-brand opacity-30 blur-md" />
                    )}
                    <Icon
                      size={22}
                      className={cn(
                        'relative transition-colors',
                        active && 'text-brand-cyan-300',
                      )}
                    />
                  </div>
                  <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                </Link>
              );
            })}

            {/* More button */}
            <button
              onClick={onMore}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-text-muted active:text-text-secondary"
              aria-label="Mais op\u00e7\u00f5es"
            >
              <Menu size={22} />
              <span className="text-[10px] font-medium leading-tight">Mais</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
