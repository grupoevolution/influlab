'use client';

import { FileText, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CopyButton } from '@/components/ui/CopyButton';

export function TranscriptionModal({
  open,
  onClose,
  productName,
  transcription,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  transcription: string;
}) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="lg">
      <div className="p-6 md:p-7">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="h-11 w-11 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
            <FileText size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-brand-cyan-300 font-bold">
              Transcrição do vídeo
            </p>
            <h2 className="text-lg md:text-xl font-display font-bold leading-tight truncate">
              {productName}
            </h2>
          </div>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border p-4 mb-4 max-h-[55vh] overflow-y-auto">
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {transcription || 'Sem transcrição cadastrada para este produto.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {transcription && (
            <CopyButton
              text={transcription}
              label="Copiar transcrição"
              size="lg"
              variant="primary"
              injectModel={false}
              className="flex-1"
            />
          )}
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-xl bg-bg-elevated border border-border text-sm font-semibold text-text-secondary hover:text-text-primary transition"
          >
            Fechar
          </button>
        </div>

        <p className="text-[10px] text-text-subtle text-center mt-3 leading-relaxed">
          Cole no agente GPT pra gerar uma copy personalizada do mesmo produto.
        </p>
      </div>
    </Modal>
  );
}
