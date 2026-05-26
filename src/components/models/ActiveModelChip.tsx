'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Plus, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useModels } from '@/lib/models-store';
import { cn } from '@/lib/utils';

/**
 * Chip no topbar que mostra o modelo ativo e permite trocar.
 * Quando há modelo ativo, todos os "Copiar prompt" injetam a descrição dele.
 */
export function ActiveModelChip() {
  const { items, active, setActive } = useModels();
  const [open, setOpen] = useState(false);

  const hasModels = items.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-semibold transition',
          active
            ? 'bg-gradient-brand-soft border-brand-violet-400/40 text-text-primary'
            : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-brand-violet-400/30',
        )}
        aria-label="Selecionar modelo ativo"
      >
        <UserCircle size={14} className={active ? 'text-brand-cyan-300' : ''} />
        <span className="hidden md:inline max-w-[120px] truncate">
          {active ? active.name : 'Sem modelo'}
        </span>
        <ChevronDown size={12} className="opacity-70" />
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
              className="absolute right-0 top-12 z-50 w-72 rounded-2xl glass-strong border border-border shadow-glow-violet overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-[10px] uppercase tracking-widest font-bold text-brand-cyan-300 mb-0.5">
                  Modelo ativo
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  O personagem selecionado é colado automaticamente nos prompts que você copiar.
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto p-2">
                {!hasModels && (
                  <div className="text-center p-4">
                    <p className="text-xs text-text-muted mb-3">
                      Você ainda não criou nenhum modelo
                    </p>
                    <Link
                      href="/app/modelos"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-gradient-brand text-white text-xs font-semibold shadow-glow-brand"
                    >
                      <Plus size={12} />
                      Criar primeiro modelo
                    </Link>
                  </div>
                )}

                {hasModels && (
                  <>
                    <button
                      onClick={() => {
                        setActive(null);
                        setOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition',
                        !active
                          ? 'bg-bg-elevated text-text-primary'
                          : 'text-text-muted hover:text-text-primary hover:bg-white/5',
                      )}
                    >
                      <X size={12} />
                      <span className="flex-1 text-left">Nenhum modelo</span>
                      {!active && <Check size={12} className="text-brand-cyan-300" />}
                    </button>

                    {items.map((m) => {
                      const isActive = active?.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActive(m.id);
                            setOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition',
                            isActive
                              ? 'bg-gradient-brand-soft text-text-primary border border-brand-violet-400/30'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                          )}
                        >
                          <UserCircle size={14} className={isActive ? 'text-brand-cyan-300' : ''} />
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold truncate">{m.name}</p>
                            <p className="text-[10px] text-text-muted truncate">
                              {m.gender === 'feminino' ? 'F' : 'M'} · {m.ageRange} · {m.ethnicity}
                            </p>
                          </div>
                          {isActive && <Check size={12} className="text-brand-cyan-300 shrink-0" />}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="border-t border-border-subtle p-2">
                <Link
                  href="/app/modelos"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition"
                >
                  <Plus size={12} />
                  Gerenciar modelos
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
