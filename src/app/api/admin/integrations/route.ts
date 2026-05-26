import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB, newId } from '@/lib/db';
import type { Plan, PlatformConfig, PlatformProductMapping } from '@/lib/db/types';

export const runtime = 'nodejs';

async function requireAdmin() {
  const s = await getCurrentSession();
  if (!s || s.role !== 'admin') return null;
  return s;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const db = await getDB();
  return NextResponse.json({
    config: db.platformConfig,
    mappings: db.platformMappings,
  });
}

/** Atualiza config (enable / secret) de uma plataforma */
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const body = (await req.json()) as { platform: 'kiwify' | 'ticto'; patch: Partial<PlatformConfig['kiwify']> };
  if (!body.platform) return NextResponse.json({ error: 'platform obrigatório' }, { status: 400 });

  await mutateDB((db) => {
    db.platformConfig = db.platformConfig ?? {};
    db.platformConfig[body.platform] = {
      ...(db.platformConfig[body.platform] ?? { enabled: true }),
      ...body.patch,
    };
  });

  const db = await getDB();
  return NextResponse.json({ config: db.platformConfig });
}

/** Cria mapeamento de produto */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const body = (await req.json()) as Partial<PlatformProductMapping>;

  const mapping: PlatformProductMapping = {
    id: newId('pm-'),
    platform: (body.platform ?? 'kiwify') as 'kiwify' | 'ticto',
    productId: body.productId ?? '',
    productName: body.productName,
    plan: (body.plan ?? 'basic') as Plan,
    createdAt: new Date().toISOString(),
  };

  if (!mapping.productId && !mapping.productName) {
    return NextResponse.json({ error: 'productId ou productName obrigatório' }, { status: 400 });
  }

  await mutateDB((db) => {
    db.platformMappings = db.platformMappings ?? [];
    db.platformMappings.unshift(mapping);
  });

  return NextResponse.json({ data: mapping }, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  await mutateDB((db) => {
    db.platformMappings = (db.platformMappings ?? []).filter((m) => m.id !== id);
  });

  return NextResponse.json({ ok: true });
}
