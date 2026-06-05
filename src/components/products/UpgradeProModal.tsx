'use client';

import { Crown, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { SiteSettings } from '@/lib/db/types';

const DEFAULT_TITLE = 'Vire PRO e desbloqueie tudo';
const DEFAULT_DESCRIPTION =
  'Acesse os produtos premium com maior comissão e ticket alto. Esses são os produtos que os top criadores estão usando para faturar 5-6 dígitos.';
const DEFAULT_BUTTON = 'Quero fazer upgrade';

export function UpgradeProModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [site, setSite] = useState<SiteSettings>({});

  useEffect(() => {
    if (!open) return;
    fetch('/api/public/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setSite(j?.data ?? {}))
      .catch(() => {});
  }, [open]);

  const title = site.upgradeTitle?.trim() || DEFAULT_TITLE;
  const description = site.upgradeDescription?.trim() || DEFAULT_DESCRIPTION;
  const buttonLabel = site.upgradeButtonLabel?.trim() || DEFAULT_BUTTON;
  const upgradeUrl = site.upgradeUrl?.trim() || '';

  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <div className="p-7 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Fechar"
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

        <h2 className="text-2xl font-display font-bold mb-2 leading-tight whitespace-pre-line">
          {title}
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6 whitespace-pre-line">
          {description}
        </p>

        {upgradeUrl ? (
          <a href={upgradeUrl} target="_blank" rel="noreferrer" className="block">
            <Button size="lg" className="w-full" leftIcon={<Crown size={16} />}>
              {buttonLabel}
            </Button>
          </a>
        ) : (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl px-3 py-2">
            ⚠️ URL de upgrade não configurada. Configure em <strong>/admin/site</strong>.
          </div>
        )}

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
