import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB } from '@/lib/db';
import type { WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';

async function requireAdmin() {
  const s = await getCurrentSession();
  if (!s) return { ok: false as const, status: 401 };
  if (s.role !== 'admin') return { ok: false as const, status: 403 };
  return { ok: true as const, session: s };
}

export async function GET() {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const db = await getDB();
  return NextResponse.json({ data: db.whitelist });
}

export async function POST(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const { email, note } = (await req.json()) as { email?: string; note?: string };
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });

  const entry: WhitelistEntry = {
    email: email.trim().toLowerCase(),
    source: 'manual',
    note,
    addedAt: new Date().toISOString(),
  };

  await mutateDB((db) => {
    const exists = db.whitelist.findIndex((w) => w.email === entry.email);
    if (exists >= 0) db.whitelist[exists] = entry;
    else db.whitelist.unshift(entry);
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function DELETE(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const { email } = (await req.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });

  const e = email.trim().toLowerCase();
  await mutateDB((db) => {
    db.whitelist = db.whitelist.filter((w) => w.email !== e);
  });

  return NextResponse.json({ ok: true });
}
