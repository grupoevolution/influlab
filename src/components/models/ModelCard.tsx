'use client';

import { motion } from 'framer-motion';
import { Check, Copy, Edit3, Star, Trash2, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { buildModelBasePrompt, type Model } from '@/lib/models-store';
import { cn } from '@/lib/utils';

interface ModelCardProps {
  model: Model;
  isActive: boolean;
  delay?: number;
  onActivate: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

export function ModelCard({
  model: m,
  isActive,
  delay = 0,
  onActivate,
  onEdit,
  onRemove,
}: ModelCardProps) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      const text = buildModelBasePrompt(m);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        variant="glass"
        hoverable
        className={cn(
          'p-4 relative overflow-hidden group',
          isActive && 'border-brand-violet-400/60 shadow-glow-violet',
        )}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-brand-soft opacity-30 pointer-events-none" />
        )}

        {/* Ações secundárias no canto superior direito */}
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="h-7 w-7 rounded-lg bg-bg/60 backdrop-blur border border-border text-text-muted hover:text-brand-cyan-300 hover:border-brand-cyan-400/40 transition inline-flex items-center justify-center"
            title="Editar modelo"
            aria-label="Editar modelo"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={onRemove}
            className="h-7 w-7 rounded-lg bg-bg/60 backdrop-blur border border-border text-text-muted hover:text-red-400 hover:border-red-400/40 transition inline-flex items-center justify-center"
            title="Remover modelo"
            aria-label="Remover modelo"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="relative">
          <div className="flex items-start gap-3 mb-3 pr-16">
            <div
              className={cn(
                'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0',
                isActive
                  ? 'bg-gradient-brand shadow-glow-brand'
                  : 'bg-bg-elevated border border-border',
              )}
            >
              <UserCircle size={22} className={isActive ? 'text-white' : 'text-text-muted'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold truncate">{m.name || 'Sem nome'}</h3>
                {isActive && <Star size={12} className="text-amber-300 fill-amber-300 shrink-0" />}
              </div>
              <p className="text-[11px] text-text-muted">
                {m.gender === 'feminino' ? 'F' : 'M'} · {m.ageRange} · {m.ethnicity}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge className="text-[9px] px-1.5 py-0">{m.hairColor}</Badge>
            <Badge className="text-[9px] px-1.5 py-0">{m.eyeColor}</Badge>
            <Badge className="text-[9px] px-1.5 py-0">{m.vibe.split(' ')[0]}</Badge>
          </div>

          {/* Ação principal: copiar prompt */}
          <button
            onClick={copyPrompt}
            className={cn(
              'w-full h-11 rounded-xl font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 active:scale-[0.98]',
              copied
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
                : 'bg-gradient-brand text-white shadow-glow-brand hover:brightness-110',
            )}
          >
            {copied ? (
              <>
                <Check size={15} />
                Prompt copiado!
              </>
            ) : (
              <>
                <Copy size={15} />
                Copiar prompt da foto-base
              </>
            )}
          </button>

          {/* Linha secundária: ativar */}
          {isActive ? (
            <div className="mt-1.5 text-center text-[10px] font-semibold text-brand-cyan-300 inline-flex items-center justify-center gap-1 w-full">
              <Star size={10} className="fill-amber-300 text-amber-300" />
              Modelo ativo nos prompts do app
            </div>
          ) : (
            <button
              onClick={onActivate}
              className="mt-1.5 w-full h-8 rounded-lg text-[11px] text-text-muted hover:text-text-primary transition inline-flex items-center justify-center gap-1.5"
            >
              <Star size={11} />
              Marcar como ativo no app
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
