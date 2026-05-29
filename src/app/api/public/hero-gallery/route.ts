import { NextResponse } from 'next/server';
import { listAll } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const all = (await listAll('heroGallery')) ?? [];
  // Ordena por campo `order` (asc), fallback pra createdAt
  const sorted = [...all].sort((a, b) => {
    const ao = a.order ?? 9999;
    const bo = b.order ?? 9999;
    if (ao !== bo) return ao - bo;
    return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
  });
  return NextResponse.json({ data: sorted });
}
