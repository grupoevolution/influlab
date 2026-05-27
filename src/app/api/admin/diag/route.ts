import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDiagnostic } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  return NextResponse.json({
    session: { email: session.email, role: session.role },
    db: getDiagnostic(),
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      STAFF_EMAIL: !!process.env.STAFF_EMAIL,
      DATA_DIR: process.env.DATA_DIR || '(default ./data)',
      DEFAULT_ALLOWED_EMAILS: !!process.env.DEFAULT_ALLOWED_EMAILS,
    },
  });
}
