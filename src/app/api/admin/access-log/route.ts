import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB } from '@/lib/db';
import { logList } from '@/lib/db/sqlite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const s = await getCurrentSession();
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 1000);
  await getDB(); // garante migração inicial feita
  return NextResponse.json({ data: logList(limit) });
}
