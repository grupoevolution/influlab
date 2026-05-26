'use client';

import { Crown, X, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function UpgradeProModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <div className="p-7 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
        >
          <X size={18} />
        </button>

        <div className="relative mx-auto mb-5 h-16 w-16">
          <div className="absolute inset-0 bg-gradient-brand rounded-2xl blur-xl opacity-60" />
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
            <Crown size={28} className="text-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 mb-3">
          <Zap size={12} className="text-amber-300" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-200">
            Conteúdo exclusivo PRO
          </span>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2 leading-tight">
          Vire <span className="text-gradient-brand">PRO</span> e desbloqueie tudo
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          Acesse os <strong className="text-text-primary">produtos premium</strong> com maior comissão
          e ticket alto. Esses são os produtos que os top criadores estão usando para faturar 5-6 dígitos.
        </p>

        <a href="#upgrade" className="block">
          <Button size="lg" className="w-full" leftIcon={<Crown size={16} />}>
            Quero fazer upgrade
          </Button>
        </a>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-text-muted hover:text-text-primary transition"
        >
          Ver os produtos básicos primeiro
        </button>
      </div>
    </Modal>
  );
}
