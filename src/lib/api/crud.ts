import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { deleteOne, insertOne, listAll, newId, updateOne } from '@/lib/db';
import type { Schema, SchemaArrayKey } from '@/lib/db/types';

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

type ArrayItem<K extends SchemaArrayKey> = Schema[K] extends ReadonlyArray<infer U> ? U : never;

export function makeListHandler<K extends SchemaArrayKey>(key: K, opts: CrudOptions = {}) {
  return async function GET() {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const data = await listAll(key);
    return NextResponse.json({ data });
  };
}

export function makeCreateHandler<K extends SchemaArrayKey>(
  key: K,
  idPrefix: string,
  opts: CrudOptions = {},
) {
  return async function POST(req: Request) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const body = (await req.json()) as Partial<ArrayItem<K>>;
    const item = {
      ...body,
      id: newId(idPrefix),
      createdAt: new Date().toISOString(),
    } as ArrayItem<K>;
    await insertOne(key, item);
    return NextResponse.json({ data: item }, { status: 201 });
  };
}

/** PATCH na rota base — id vem do body ou ?id= */
export function makePatchHandler<K extends SchemaArrayKey>(key: K, opts: CrudOptions = {}) {
  return async function PATCH(req: Request) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });

    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get('id');
    const body = (await req.json().catch(() => ({}))) as Partial<ArrayItem<K>> & { id?: string };

    const id = idFromQuery ?? body.id;
    if (!id) {
      return NextResponse.json({ error: 'id obrigatório (use ?id=... ou no body)' }, { status: 400 });
    }

    const { id: _omit, ...patch } = body as { id?: string } & Partial<ArrayItem<K>>;
    const updated = await updateOne(key, id, patch as Partial<ArrayItem<K>>);
    if (!updated) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ data: updated });
  };
}

/** DELETE na rota base — id vem do body ou ?id= */
export function makeRemoveHandler<K extends SchemaArrayKey>(key: K, opts: CrudOptions = {}) {
  return async function DELETE(req: Request) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });

    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id) {
      try {
        const body = (await req.json()) as { id?: string };
        id = body?.id ?? null;
      } catch {
        id = null;
      }
    }
    if (!id) {
      return NextResponse.json({ error: 'id obrigatório (use ?id=...)' }, { status: 400 });
    }

    const ok = await deleteOne(key, id);
    if (!ok) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  };
}

// ===== Compatibilidade legada (caso ainda existam rotas [id]) =====

export function makeUpdateHandler<K extends SchemaArrayKey>(key: K, opts: CrudOptions = {}) {
  return async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const { id } = await ctx.params;
    const patch = (await req.json()) as Partial<ArrayItem<K>>;
    const updated = await updateOne(key, id, patch);
    if (!updated) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ data: updated });
  };
}

export function makeDeleteHandler<K extends SchemaArrayKey>(key: K, opts: CrudOptions = {}) {
  return async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const ac = await checkAccess(opts);
    if (!ac.ok) return NextResponse.json({ error: ac.error }, { status: ac.status });
    const { id } = await ctx.params;
    const ok = await deleteOne(key, id);
    if (!ok) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  };
}
