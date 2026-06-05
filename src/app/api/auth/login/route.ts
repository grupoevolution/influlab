import { NextResponse } from 'next/server';
import { checkCredentials, setSessionCookie, type Role } from '@/lib/auth/session';
import { getDB, logAccess, mutateDB, newId } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

export const runtime = 'nodejs';

/**
 * Login admin/staff. Ordem de checagem:
 *  1. Credenciais do .env (ADMIN_EMAIL/PASSWORD e STAFF_EMAIL/PASSWORD) — fallback
 *     pra você ter como acessar mesmo se mexer no DB sem querer.
 *  2. Funcionários cadastrados em /admin/equipe (DB → db.staffs com senha hashada).
 */
export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // 1) Credenciais via env (admin + staff principal)
  let role: Role | null = checkCredentials(email, password);

  // 2) Funcionários no DB
  if (!role) {
    const db = await getDB();
    const staff = (db.staffs ?? []).find((s) => s.email === normalized);
    if (staff && staff.active && verifyPassword(password, staff.passwordHash)) {
      role = 'staff';
      // Atualiza lastLoginAt — não bloqueia a resposta se falhar
      mutateDB((db) => {
        const list = db.staffs ?? [];
        const idx = list.findIndex((s) => s.id === staff.id);
        if (idx !== -1) list[idx].lastLoginAt = new Date().toISOString();
      }).catch(() => {});
    }
  }

  await logAccess({
    id: newId('al-'),
    type: role ? 'login' : 'blocked',
    email: normalized,
    role: role ?? 'guest',
    userAgent: req.headers.get('user-agent') ?? undefined,
    at: new Date().toISOString(),
  });

  if (!role) {
    return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
  }

  await setSessionCookie({ email: normalized, role });
  return NextResponse.json({ role });
}
