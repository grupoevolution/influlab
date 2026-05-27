import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/admin/login');
  return <AdminDashboardClient role={session.role} email={session.email} />;
}
