'use client';

import { Check, Copy, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useModels, withModelPrompt } from '@/lib/models-store';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Se true (default), injeta o prompt do modelo ativo no topo do texto */
  injectModel?: boolean;
  /** Mostrar @nome do modelo no botão quando ativo */
  showModelHint?: boolean;
}

export function CopyButton({
  text,
  label = 'Copiar prompt',
  copiedLabel,
  className,
  size = 'md',
  variant = 'primary',
  injectModel = true,
  showModelHint = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { active } = useModels();

  const handleCopy = async () => {
    try {
      const finalText = injectModel ? withModelPrompt(text, active) : text;
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar', e);
    }
  };

  const usingModel = injectModel && !!active;
  const displayLabel = copied
    ? copiedLabel ?? (usingModel ? `Copiado com ${active?.name}!` : 'Copiado!')
    : usingModel && showModelHint
    ? `${label} · ${active?.name}`
    : label;

  return (
    <Button
      onClick={handleCopy}
      size={size}
      variant={copied ? 'outline' : variant}
      className={cn('transition-all', className)}
      leftIcon={
        copied ? (
          <Check size={16} />
        ) : usingModel && showModelHint ? (
          <UserCircle size={16} />
        ) : (
          <Copy size={16} />
        )
      }
      title={usingModel ? `Copiará com modelo: ${active?.name}` : undefined}
    >
      {displayLabel}
    </Button>
  );
}
