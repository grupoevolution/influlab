'use client';

import { useEffect, useState } from 'react';
import type { Plan } from '@/lib/db/types';

export type StudentSession = {
  email: string;
  allowed: boolean;
  plan: Plan | null;
};

function readCookie(): StudentSession | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )influlab_student=([^;]+)/);
  if (!m) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(m[1]));
    return {
      email: obj.email ?? '',
      allowed: !!obj.allowed,
      plan: obj.plan ?? null,
    };
  } catch {
    return null;
  }
}

export function useStudentSession(): StudentSession | null {
  const [session, setSession] = useState<StudentSession | null>(null);

  useEffect(() => {
    setSession(readCookie());
  }, []);

  return session;
}
