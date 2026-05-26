import { NextResponse } from 'next/server';
import { getEmailAccess, logAccess, newId } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 });
  }
  const e = email.trim().toLowerCase();
  const { allowed, plan } = await getEmailAccess(e);

  await logAccess({
    id: newId('al-'),
    type: allowed ? 'login' : 'visit',
    email: e,
    role: 'student',
    userAgent: req.headers.get('user-agent') ?? undefined,
    at: new Date().toISOString(),
  });

  const res = NextResponse.json({ allowed, email: e, plan });
  res.cookies.set(
    'influlab_student',
    JSON.stringify({ email: e, allowed, plan }),
    {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    },
  );
  return res;
}
