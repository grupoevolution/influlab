'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[Admin]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-7 max-w-lg w-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Erro no painel admin</p>
            <h1 className="text-xl font-display font-bold leading-tight">Algo deu errado</h1>
          </div>
        </div>

        <div className="rounded-xl bg-bg-elevated border border-border p-3 mb-4">
          <p className="text-xs font-mono text-text-secondary break-words">
            {error.message || 'Erro desconhecido'}
          </p>
          {error.digest && (
            <p className="text-[10px] text-text-subtle mt-2 font-mono">Digest: {error.digest}</p>
          )}
        </div>

        <p className="text-xs text-text-muted leading-relaxed mb-4">
          Causa mais comum: o diretório <code className="text-brand-cyan-300">/app/data</code> não está montado como volume no EasyPanel.
          Os dados do painel precisam de espaço persistente em disco.
        </p>

        <button
          onClick={reset}
          className="w-full h-11 rounded-xl bg-gradient-brand text-white font-semibold shadow-glow-brand inline-flex items-center justify-center gap-2 active:brightness-110"
        >
          <RefreshCcw size={14} />
          Tentar novamente
        </button>

        <a
          href="/admin"
          className="mt-2 w-full inline-flex items-center justify-center h-10 rounded-xl text-xs text-text-muted hover:text-text-primary transition"
        >
          Voltar para o dashboard
        </a>
      </div>
    </div>
  );
}
