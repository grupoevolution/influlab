import { NextResponse } from 'next/server';
import { isEmailWhitelisted, logAccess, newId } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Login do aluno: verifica se o email está na whitelist (compradores).
 * Resposta: { allowed: boolean }. O cliente decide se libera o conteúdo ou aplica BlurLock.
 */
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 });
  }
  const e = email.trim().toLowerCase();
  const allowed = await isEmailWhitelisted(e);

  await logAccess({
    id: newId('al-'),
    type: allowed ? 'login' : 'visit',
    email: e,
    role: 'student',
    userAgent: req.headers.get('user-agent') ?? undefined,
    at: new Date().toISOString(),
  });

  // Cookie de "intent" pra cliente saber qual email digitou (não dá acesso por si só)
  const res = NextResponse.json({ allowed, email: e });
  res.cookies.set('influlab_student', JSON.stringify({ email: e, allowed }), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
