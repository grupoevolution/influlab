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

/**
 * PATCH aceita 2 modos:
 *  - { email, plan }            → muda o plano
 *  - { email, newEmail }        → renomeia o email (correção de digitação)
 *  - { email, plan, newEmail }  → ambos numa só chamada
 */
export async function PATCH(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });

  const body = (await req.json()) as { email?: string; plan?: Plan; newEmail?: string };
  const { email, plan, newEmail } = body;

  if (!email) {
    return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });
  }
  if (!plan && !newEmail) {
    return NextResponse.json({ error: 'informe plan ou newEmail' }, { status: 400 });
  }

  const e = email.trim().toLowerCase();
  const ne = newEmail?.trim().toLowerCase();
  if (newEmail !== undefined && (!ne || !ne.includes('@'))) {
    return NextResponse.json({ error: 'newEmail inválido' }, { status: 400 });
  }

  const updated = await mutateDB((db) => {
    const idx = db.whitelist.findIndex((w) => w.email === e);
    if (idx === -1) return null;

    // Renomear (e novo email já não pode existir em outra entrada)
    if (ne && ne !== e) {
      const conflict = db.whitelist.findIndex((w) => w.email === ne);
      if (conflict !== -1 && conflict !== idx) {
        return { __error: 'já existe uma entrada com esse novo email' } as const;
      }
      db.whitelist[idx] = { ...db.whitelist[idx], email: ne };
    }
    if (plan) {
      db.whitelist[idx] = { ...db.whitelist[idx], plan };
    }
    return db.whitelist[idx];
  });

  if (!updated) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  if ('__error' in (updated as Record<string, unknown>)) {
    return NextResponse.json({ error: (updated as { __error: string }).__error }, { status: 409 });
  }
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
