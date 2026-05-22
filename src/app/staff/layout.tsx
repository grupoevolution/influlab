// O painel staff usa o mesmo shell do admin, mas com role 'staff'.
// O AdminShell internamente esconde itens marcados como adminOnly.
import { getCurrentSession } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) return <>{children}</>;
  return (
    <AdminShell role={session.role} email={session.email}>
      {children}
    </AdminShell>
  );
}
