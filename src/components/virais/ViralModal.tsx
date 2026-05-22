'use client';

import { Eye, Flame, Play, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import type { ViralVideoDB as ViralVideo } from '@/lib/db/types';

export function ViralModal({ video, open, onClose }: { video: ViralVideo | null; open: boolean; onClose: () => void }) {
  if (!video) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Vídeo */}
        <div className="relative aspect-[9/16] md:aspect-auto md:min-h-[600px] bg-bg-elevated overflow-hidden">
          <video
            src={video.videoUrl}
            poster={video.thumb}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="live">
              <Flame size={11} /> Viral
            </Badge>
            <Badge variant="default">
              <Eye size={11} /> {video.views}
            </Badge>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 md:p-8">
          <Badge variant="cyan" className="mb-3">{video.category}</Badge>
          <h2 className="text-2xl font-display font-bold leading-tight mb-4">{video.title}</h2>

          <div className="glass rounded-xl p-3 mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1">
              🎯 Hook
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">{video.hook}</p>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-violet-300 mb-2">
            📋 Passo a passo
          </p>
          <ol className="space-y-2.5 mb-5">
            {video.instructions.map((inst, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 h-6 w-6 rounded-lg bg-brand-violet-500/20 text-brand-violet-200 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-text-secondary leading-relaxed pt-0.5">{inst}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-xl bg-bg-elevated border border-border p-3 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1">
              ✨ Prompt para o Flow
            </p>
            <p className="text-xs text-text-muted leading-relaxed font-mono">{video.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CopyButton text={video.prompt} label="Copiar prompt" size="md" />
            <a
              href="https://labs.google/flow"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-bg-elevated border border-border text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-brand-cyan-400/40 transition"
            >
              <Play size={14} fill="currentColor" />
              Abrir Flow
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
            <Zap size={12} className="text-amber-300" />
            <span>Replicar este modelo leva ~5 minutos</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
