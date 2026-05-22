'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export function CopyButton({ text, label = 'Copiar prompt', className, size = 'md', variant = 'primary' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar', e);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      size={size}
      variant={copied ? 'outline' : variant}
      className={cn('transition-all', className)}
      leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
    >
      {copied ? 'Copiado!' : label}
    </Button>
  );
}
