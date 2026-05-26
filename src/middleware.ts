import { NextResponse, type NextRequest } from 'next/server';
import { decodeSessionEdge, SESSION_COOKIE_NAME } from '@/lib/auth/session-edge';

// Caminhos admin-only (staff é bloqueado)
const ADMIN_ONLY_PREFIXES = [
  '/admin/avisos',
  '/admin/acessos',
  '/admin/notificacoes',
  '/admin/integracoes',
  '/admin/logs',
  '/api/admin/whitelist',
  '/api/admin/broadcasts',
  '/api/admin/access-log',
  '/api/admin/announcements',
  '/api/admin/integrations',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Páginas de login sempre liberadas
  if (pathname === '/admin/login' || pathname === '/staff/login') {
    return NextResponse.next();
  }

  const needsAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/api/admin');
  if (!needsAuth) return NextResponse.next();

  const secret = process.env.AUTH_SECRET ?? '';
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = secret ? await decodeSessionEdge(token, secret) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith('/staff') ? '/staff/login' : '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Staff bloqueado em rotas admin-only
  if (session.role === 'staff') {
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
  matcher: ['/admin/:path*', '/staff/:path*', '/api/admin/:path*'],
};
