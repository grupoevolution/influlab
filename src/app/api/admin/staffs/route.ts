import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB, newId } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import type { StaffUser } from '@/lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getCurrentSession();
  if (!s) return { ok: false as const, status: 401, session: null };
  if (s.role !== 'admin') return { ok: false as const, status: 403, session: null };
  return { ok: true as const, session: s };
}

/** Remove o hash da senha antes de devolver ao client. */
function sanitize(u: StaffUser): Omit<StaffUser, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function GET() {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const db = await getDB();
  const data = (db.staffs ?? [])
    .slice()
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .map(sanitize);
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    active?: boolean;
  };

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password ?? '';

  if (!name) return NextResponse.json({ error: 'nome obrigatório' }, { status: 400 });
  if (!email.includes('@')) return NextResponse.json({ error: 'email inválido' }, { status: 400 });
  if (password.length < 6) {
    return NextResponse.json({ error: 'senha precisa ter ao menos 6 caracteres' }, { status: 400 });
  }

  const db = await getDB();
  const exists = (db.staffs ?? []).some((s) => s.email === email);
  if (exists) {
    return NextResponse.json({ error: 'já existe um funcionário com esse email' }, { status: 409 });
  }

  const entry: StaffUser = {
    id: newId('st-'),
    name,
    email,
    passwordHash: hashPassword(password),
    active: body.active !== false,
    createdAt: new Date().toISOString(),
    createdBy: ac.session.email,
  };

  await mutateDB((db) => {
    db.staffs = db.staffs ?? [];
    db.staffs.unshift(entry);
  });

  return NextResponse.json({ data: sanitize(entry) }, { status: 201 });
}

/**
 * PATCH /api/admin/staffs?id=... { name?, email?, password?, active? }
 * Atualiza qualquer campo informado. Email único validado.
 */
export async function PATCH(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const patch = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    active?: boolean;
  };

  if (patch.password !== undefined && patch.password.length < 6) {
    return NextResponse.json({ error: 'senha precisa ter ao menos 6 caracteres' }, { status: 400 });
  }
  const newEmail = patch.email?.trim().toLowerCase();
  if (newEmail !== undefined && !newEmail.includes('@')) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 });
  }

  const result = await mutateDB((db) => {
    const list = db.staffs ?? (db.staffs = []);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return { __notFound: true } as const;

    if (newEmail && newEmail !== list[idx].email) {
      const conflict = list.some((s, i) => i !== idx && s.email === newEmail);
      if (conflict) return { __conflict: true } as const;
      list[idx].email = newEmail;
    }
    if (patch.name !== undefined) list[idx].name = patch.name.trim();
    if (patch.active !== undefined) list[idx].active = !!patch.active;
    if (patch.password) list[idx].passwordHash = hashPassword(patch.password);

    return list[idx];
  });

  if ('__notFound' in (result as Record<string, unknown>)) {
    return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  }
  if ('__conflict' in (result as Record<string, unknown>)) {
    return NextResponse.json({ error: 'email já em uso' }, { status: 409 });
  }

  return NextResponse.json({ data: sanitize(result as StaffUser) });
}

export async function DELETE(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const removed = await mutateDB((db) => {
    const list = db.staffs ?? (db.staffs = []);
    const before = list.length;
    db.staffs = list.filter((s) => s.id !== id);
    return db.staffs.length < before;
  });

  if (!removed) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
