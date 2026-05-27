import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function StaffHome() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/staff/login');
  }
  // Admin/Staff veem o dashboard principal (com permissões adaptadas pelo role)
  redirect('/admin');
}
