import { getCurrentSession } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';

// O middleware já redireciona usuários não autenticados (exceto /admin/login).
// Se chegamos aqui sem sessão, é porque estamos no /admin/login — renderiza sem o shell.

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) return <>{children}</>;
  return (
    <AdminShell role={session.role} email={session.email}>
      {children}
    </AdminShell>
  );
}
