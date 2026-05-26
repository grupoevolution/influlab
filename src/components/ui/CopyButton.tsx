'use client';

import { Check, Copy, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useModels, withModelPrompt } from '@/lib/models-store';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /**
   * Se true (default), injeta o prompt do modelo ativo no topo do texto copiado.
   * Use false em textos que não são prompts (ex: cópia genérica).
   */
  injectModel?: boolean;
}

export function CopyButton({
  text,
  label = 'Copiar prompt',
  className,
  size = 'md',
  variant = 'primary',
  injectModel = true,
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

  return (
    <Button
      onClick={handleCopy}
      size={size}
      variant={copied ? 'outline' : variant}
      className={cn('transition-all', className)}
      leftIcon={
        copied ? (
          <Check size={16} />
        ) : usingModel ? (
          <UserCircle size={16} />
        ) : (
          <Copy size={16} />
        )
      }
      title={usingModel ? `Copiará com modelo: ${active?.name}` : undefined}
    >
      {copied
        ? usingModel
          ? `Copiado com ${active?.name}!`
          : 'Copiado!'
        : usingModel
        ? `Copiar com ${active?.name}`
        : label}
    </Button>
  );
}
