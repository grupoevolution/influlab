import { NextResponse, type NextRequest } from 'next/server';
import { decodeSessionEdge, SESSION_COOKIE_NAME } from '@/lib/auth/session-edge';

// Caminhos admin-only (staff é bloqueado)
const ADMIN_ONLY_PREFIXES = [
  '/admin/avisos',
  '/admin/acessos',
  '/admin/notificacoes',
  '/admin/integracoes',
  '/admin/site',
  '/admin/logs',
  '/api/admin/whitelist',
  '/api/admin/broadcasts',
  '/api/admin/access-log',
  '/api/admin/announcements',
  '/api/admin/integrations',
  '/api/admin/site-settings',
];

/**
 * Lê o cookie `influlab_student` (JSON) e diz se o aluno tem acesso liberado.
 * O cookie só é setado pelo /api/student/login quando o email está na whitelist.
 */
function readStudentAccess(req: NextRequest): { allowed: boolean } | null {
  const raw = req.cookies.get('influlab_student')?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { allowed?: boolean };
    return { allowed: !!parsed.allowed };
  } catch {
    try {
      const parsed = JSON.parse(raw) as { allowed?: boolean };
      return { allowed: !!parsed.allowed };
    } catch {
      return null;
    }
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Páginas de login sempre liberadas
  if (pathname === '/admin/login' || pathname === '/staff/login' || pathname === '/login') {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? '';
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const adminSession = secret ? await decodeSessionEdge(token, secret) : null;

  // === Bloqueio do app do aluno ===
  // Admin/staff logados podem navegar livremente. Aluno precisa de cookie válido.
  if (pathname.startsWith('/app')) {
    if (adminSession) return NextResponse.next(); // admin/staff: livre
    const student = readStudentAccess(req);
    if (student?.allowed) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // === Bloqueio do painel admin ===
  const needsAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/api/admin');
  if (!needsAuth) return NextResponse.next();

  if (!adminSession) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith('/staff') ? '/staff/login' : '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Staff bloqueado em rotas admin-only
  if (adminSession.role === 'staff') {
    if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/staff/:path*', '/api/admin/:path*'],
};
