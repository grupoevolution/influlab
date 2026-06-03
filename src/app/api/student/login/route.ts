import { NextResponse } from 'next/server';
import { getEmailAccess, logAccess, newId } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Login do aluno. Bloqueio é REAL: só emails na whitelist (importados, manuais
 * ou vindos de webhook aprovado) recebem o cookie de acesso. Outros emails
 * recebem 403 e a página /login mostra a mensagem de erro.
 */
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 });
  }
  const e = email.trim().toLowerCase();
  const { allowed, plan } = await getEmailAccess(e);

  await logAccess({
    id: newId('al-'),
    type: allowed ? 'login' : 'blocked',
    email: e,
    role: 'student',
    userAgent: req.headers.get('user-agent') ?? undefined,
    at: new Date().toISOString(),
  });

  if (!allowed) {
    // Sem acesso: 403 e nada de cookie. Front mostra mensagem.
    return NextResponse.json(
      {
        allowed: false,
        error:
          'Esse email não tem acesso liberado. Verifique se digitou o mesmo email da compra ou fale com o suporte.',
      },
      { status: 403 },
    );
  }

  const res = NextResponse.json({ allowed: true, email: e, plan });
  res.cookies.set(
    'influlab_student',
    JSON.stringify({ email: e, allowed: true, plan }),
    {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    },
  );
  return res;
}
