import { NextResponse, type NextRequest } from 'next/server';
import { decodeSessionEdge, SESSION_COOKIE_NAME } from '@/lib/auth/session-edge';

// Caminhos restritos APENAS ao administrador (staff não pode acessar)
const ADMIN_ONLY_PREFIXES = [
  '/admin/avisos',
  '/admin/acessos',
  '/admin/notificacoes',
  '/admin/logs',
  '/api/admin/whitelist',
  '/api/admin/broadcasts',
  '/api/admin/access-log',
  '/api/admin/announcements',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login pages sempre liberadas
  if (pathname === '/admin/login' || pathname === '/staff/login') {
    return NextResponse.next();
  }

  const needsAuth = pathname.startsWith('/admin') || pathname.startsWith('/staff');
  if (!needsAuth) return NextResponse.next();

  const secret = process.env.AUTH_SECRET || '';
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = secret ? await decodeSessionEdge(token, secret) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith('/staff') ? '/staff/login' : '/admin/login';
    return NextResponse.redirect(url);
  }

  // Staff bloqueado em rotas admin-only
  if (session.role === 'staff') {
    if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/api/admin/:path*'],
};
