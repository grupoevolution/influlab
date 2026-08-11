import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB } from '@/lib/db';
import { wlAdd, wlDelete, wlGet, wlList, wlRename, wlStats, wlUpdatePlan } from '@/lib/db/sqlite';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getCurrentSession();
  if (!s) return { ok: false as const, status: 401 };
  if (s.role !== 'admin') return { ok: false as const, status: 403 };
  return { ok: true as const, session: s };
}

/**
 * GET paginado + busca — agora direto no SQLite (a base de ~20k emails não
 * passa mais pelo JSON nem trafega inteira pro navegador).
 *
 * Query params: q, plan ('basic'|'pro'), page (1-based), limit (máx 200).
 */
export async function GET(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  await getDB(); // garante migração inicial feita

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const planParam = url.searchParams.get('plan');
  const plan = planParam === 'basic' || planParam === 'pro' ? (planParam as Plan) : undefined;
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10) || 50));

  const stats = wlStats();
  const { data, totalFiltered } = wlList({ q: q || undefined, plan, page, limit });

  return NextResponse.json({
    data,
    stats,
    pagination: {
      page,
      limit,
      totalFiltered,
      totalPages: Math.max(1, Math.ceil(totalFiltered / limit)),
    },
  });
}

export async function POST(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  await getDB();

  const { email, plan = 'basic', note } = (await req.json()) as { email?: string; plan?: Plan; note?: string };
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });
  }

  const entry: WhitelistEntry = {
    email: email.trim().toLowerCase(),
    plan,
    source: 'manual',
    note,
    addedAt: new Date().toISOString(),
  };
  const saved = wlAdd(entry);
  return NextResponse.json({ data: saved }, { status: 201 });
}

/**
 * PATCH:
 *  - { email, plan }           → muda o plano
 *  - { email, newEmail }       → corrige email digitado errado
 *  - { email, plan, newEmail } → ambos
 */
export async function PATCH(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  await getDB();

  const body = (await req.json()) as { email?: string; plan?: Plan; newEmail?: string };
  const { email, plan, newEmail } = body;

  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });
  if (!plan && !newEmail) {
    return NextResponse.json({ error: 'informe plan ou newEmail' }, { status: 400 });
  }

  let current = email.trim().toLowerCase();

  if (newEmail !== undefined) {
    const ne = newEmail.trim().toLowerCase();
    if (!ne.includes('@')) return NextResponse.json({ error: 'newEmail inválido' }, { status: 400 });
    const res = wlRename(current, ne);
    if (res === 'notfound') return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
    if (res === 'conflict') {
      return NextResponse.json({ error: 'já existe uma entrada com esse novo email' }, { status: 409 });
    }
    current = ne;
  }

  if (plan) {
    const ok = wlUpdatePlan(current, plan);
    if (!ok) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ data: wlGet(current) });
}

export async function DELETE(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  await getDB();

  const { email } = (await req.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 });

  wlDelete(email);
  return NextResponse.json({ ok: true });
}
