import { NextResponse } from 'next/server';
import { checkCredentials, setSessionCookie } from '@/lib/auth/session';
import { logAccess } from '@/lib/db';
import { newId } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
  }

  const role = checkCredentials(email, password);

  await logAccess({
    id: newId('al-'),
    type: role ? 'login' : 'blocked',
    email: email.trim().toLowerCase(),
    role: role ?? 'guest',
    userAgent: req.headers.get('user-agent') ?? undefined,
    at: new Date().toISOString(),
  });

  if (!role) {
    return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
  }

  await setSessionCookie({ email: email.trim().toLowerCase(), role });
  return NextResponse.json({ role });
}
