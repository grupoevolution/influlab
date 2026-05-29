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
 * Detecta se o usuário tem sessão de admin/staff (cookie influlab_session).
 * Admin/staff podem navegar livremente no /app sem bloqueio — eles estão
 * "vendo o que o aluno vê" para gerenciar conteúdo.
 *
 * O cookie influlab_session é HttpOnly, então não dá pra ler do client.
 * Em vez disso, perguntamos pro servidor via /api/auth/me — esse retorna
 * 200 com a sessão se logado como admin/staff, 401 se não.
 */
async function isAdminOrStaff(): Promise<boolean> {
  try {
    const r = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!r.ok) return false;
    const j = (await r.json()) as { session?: { role?: string } | null };
    const role = j?.session?.role;
    return role === 'admin' || role === 'staff';
  } catch {
    return false;
  }
}

/**
 * Verifica se o aluno tem acesso liberado e mostra BlurLock se não tiver.
 * Não bloqueia a renderização — apenas sobrepõe o conteúdo.
 *
 * Admin/staff NUNCA veem o bloqueio (eles estão revisando o app dos alunos).
 */
export function AccessGate() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Se for admin/staff, libera direto — sem BlurLock.
      if (await isAdminOrStaff()) {
        if (!cancelled) setStatus('allowed');
        return;
      }

      // 2) Caso contrário, verifica o cookie de aluno.
      const cookie = readStudentCookie();
      if (cancelled) return;
      if (!cookie) {
        setStatus('no-email');
        return;
      }
      setStatus(cookie.allowed ? 'allowed' : 'blocked');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'allowed' || status === 'loading') return null;

  return <BlurLock />;
}
