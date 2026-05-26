import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB } from '@/lib/db';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

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
  const { email, plan = 'basic', note } = (await req.json()) as { email?: string; plan?: Plan; note?: string };
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });

  const entry: WhitelistEntry = {
    email: email.trim().toLowerCase(),
    plan,
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

export async function PATCH(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const { email, plan } = (await req.json()) as { email?: string; plan?: Plan };
  if (!email || !plan) return NextResponse.json({ error: 'email e plan obrigatórios' }, { status: 400 });

  const e = email.trim().toLowerCase();
  const updated = await mutateDB((db) => {
    const idx = db.whitelist.findIndex((w) => w.email === e);
    if (idx === -1) return null;
    db.whitelist[idx] = { ...db.whitelist[idx], plan };
    return db.whitelist[idx];
  });

  if (!updated) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return NextResponse.json({ data: updated });
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
