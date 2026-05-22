import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { deleteOne, insertOne, listAll, newId, updateOne } from '@/lib/db';
import type { Schema, SchemaKey } from '@/lib/db/types';

export type CrudOptions = {
  requireRole?: 'admin' | 'staff' | 'any';
};

async function checkAccess(opts: CrudOptions = {}) {
  const session = await getCurrentSession();
  if (!session) return { ok: false as const, status: 401, error: 'Não autenticado.' };
  const requirement = opts.requireRole ?? 'any';
  if (requirement === 'admin' && session.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Apenas administradores.' };
  }
  return { ok: true as const, session };
}

export function makeListHandler<K extends SchemaKey>(key: K, opts: CrudOptions = {}) {
  return async function GET() {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const data = await listAll(key);
    return NextResponse.json({ data });
  };
}

export function makeCreateHandler<K extends SchemaKey>(
  key: K,
  idPrefix: string,
  opts: CrudOptions = {},
) {
  return async function POST(req: Request) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const body = (await req.json()) as Partial<Schema[K][number]>;
    const item = {
      ...body,
      id: newId(idPrefix),
      createdAt: new Date().toISOString(),
    } as Schema[K][number];
    await insertOne(key, item);
    return NextResponse.json({ data: item }, { status: 201 });
  };
}

export function makeUpdateHandler<K extends SchemaKey>(key: K, opts: CrudOptions = {}) {
  return async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const { id } = await ctx.params;
    const patch = (await req.json()) as Partial<Schema[K][number]>;
    const updated = await updateOne(key, id, patch);
    if (!updated) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ data: updated });
  };
}

export function makeDeleteHandler<K extends SchemaKey>(key: K, opts: CrudOptions = {}) {
  return async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const { id } = await ctx.params;
    const ok = await deleteOne(key, id);
    if (!ok) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  };
}
