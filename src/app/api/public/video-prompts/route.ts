import { NextResponse } from 'next/server';
import { listAll } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const all = (await listAll('videoPrompts')) ?? [];
  // Fixados primeiro (pinnedOrder asc), depois resto na ordem original.
  const sorted = [...all].sort((a, b) => {
    const ap = a.pinned ? 0 : 1;
    const bp = b.pinned ? 0 : 1;
    if (ap !== bp) return ap - bp;
    if (a.pinned && b.pinned) {
      return (a.pinnedOrder ?? 9999) - (b.pinnedOrder ?? 9999);
    }
    return 0;
  });
  return NextResponse.json({ data: sorted });
}
