import { getCurrentSession } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';

// O middleware já redireciona quem não tem sessão pra /admin/login.
// Se chegamos aqui SEM sessão, é porque é a página /admin/login — renderiza sem o shell.

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) {
    // Página de login (renderizada SEM shell + sem PWA prompts)
    return (
      <div className="min-h-screen" data-admin-login>
        {children}
      </div>
    );
  }
  return (
    <AdminShell role={session.role} email={session.email}>
      {children}
    </AdminShell>
  );
}
