'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { ActiveModelChip } from '@/components/models/ActiveModelChip';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [query, setQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border-subtle bg-bg/70 backdrop-blur-xl">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-cyan-300 transition-colors"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Buscar produtos, prompts, criadores..."
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-brand-violet-400/50 focus:bg-bg-card transition-colors outline-none"
            />
            <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 rounded-md bg-bg border border-border text-[10px] text-text-muted">
              <span>⌘</span>K
            </kbd>
          </div>
        </div>

        <ActiveModelChip />

        <button
          className="relative p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Notifica\u00e7\u00f5es"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-cyan-400 ring-2 ring-bg" />
        </button>
      </div>
    </header>
  );
}
