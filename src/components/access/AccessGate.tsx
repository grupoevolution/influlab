'use client';

import { useEffect, useState } from 'react';
import { BlurLock } from '@/components/ui/BlurLock';

type Status = 'loading' | 'allowed' | 'blocked' | 'no-email';

function readStudentCookie(): { email: string; allowed: boolean } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )influlab_student=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

/**
 * Verifica se o aluno tem acesso liberado e mostra BlurLock se não tiver.
 * Não bloqueia a renderização — apenas sobrepõe o conteúdo.
 */
export function AccessGate() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const cookie = readStudentCookie();
    if (!cookie) {
      setStatus('no-email');
      return;
    }
    setStatus(cookie.allowed ? 'allowed' : 'blocked');
  }, []);

  if (status === 'allowed' || status === 'loading') return null;

  return <BlurLock />;
}
