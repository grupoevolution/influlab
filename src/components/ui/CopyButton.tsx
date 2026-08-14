'use client';

import { AlertTriangle, Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { getActiveModel, withModelPrompt } from '@/lib/models-store';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Se true (default), injeta o prompt do modelo ativo no topo do texto */
  injectModel?: boolean;
}

/**
 * Botão de copiar — a FUNÇÃO MAIS IMPORTANTE do app. Duas decisões de
 * confiabilidade (não reverter sem medir):
 *
 * 1. SEM hook useModels(): o modelo ativo é lido do localStorage só no
 *    momento do clique (getActiveModel). Antes, 24-48 instâncias por grid
 *    criavam ~150 event listeners na montagem — página "surda" a cliques
 *    em Android fraco até a hidratação terminar.
 *
 * 2. Clipboard com FALLBACK + feedback de erro: navigator.clipboard falha
 *    em alguns Android/PWA (NotAllowedError). Antes o erro era engolido e o
 *    botão parecia morto. Agora: tenta a API moderna → cai pro método
 *    clássico (textarea + execCommand) → se ambos falharem, MOSTRA
 *    "Erro — tente de novo" no próprio botão.
 */
export function CopyButton({
  text,
  label = 'Copiar prompt',
  copiedLabel,
  className,
  size = 'md',
  variant = 'primary',
  injectModel = true,
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [modelName, setModelName] = useState<string | null>(null);
  const resetTimer = useRef<number | null>(null);

  const flash = (s: 'copied' | 'error') => {
    setState(s);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  const legacyCopy = (value: string): boolean => {
    try {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    // Modelo ativo lido AGORA (barato, sempre fresco)
    const active = injectModel ? getActiveModel() : null;
    const finalText = injectModel ? withModelPrompt(text, active) : text;
    setModelName(active?.name ?? null);

    // 1ª tentativa: API moderna
    try {
      await navigator.clipboard.writeText(finalText);
      flash('copied');
      return;
    } catch {
      /* segue pro fallback */
    }

    // 2ª tentativa: método clássico (funciona em WebView/PWA antigos)
    if (legacyCopy(finalText)) {
      flash('copied');
      return;
    }

    flash('error');
  };

  const displayLabel =
    state === 'copied'
      ? copiedLabel ?? (modelName ? `Copiado com ${modelName}!` : 'Copiado!')
      : state === 'error'
      ? 'Erro — tente de novo'
      : label;

  return (
    <Button
      onClick={handleCopy}
      size={size}
      variant={state === 'copied' ? 'outline' : variant}
      className={cn('transition-all', state === 'error' && 'border-red-400/60 text-red-300', className)}
      leftIcon={
        state === 'copied' ? (
          <Check size={16} />
        ) : state === 'error' ? (
          <AlertTriangle size={16} />
        ) : (
          <Copy size={16} />
        )
      }
    >
      {displayLabel}
    </Button>
  );
}
