import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB, newId } from '@/lib/db';
import type { AnnouncementDB } from '@/lib/db/types';

export const runtime = 'nodejs';

async function requireAuth() {
  const s = await getCurrentSession();
  if (!s) return null;
  return s;
}

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const db = await getDB();
  return NextResponse.json({ data: db.announcements });
}

export async function POST(req: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const body = (await req.json()) as Partial<AnnouncementDB>;

  const entry: AnnouncementDB = {
    id: newId('an-'),
    emoji: body.emoji ?? '✨',
    title: body.title ?? '',
    message: body.message ?? '',
    ctaLabel: body.ctaLabel,
    ctaHref: body.ctaHref,
    active: body.active ?? true,
    createdAt: new Date().toISOString(),
  };

  await mutateDB((db) => {
    // Se for active, desativa os outros
    if (entry.active) {
      db.announcements = db.announcements.map((a) => ({ ...a, active: false }));
    }
    db.announcements.unshift(entry);
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const { id, patch } = (await req.json()) as { id: string; patch: Partial<AnnouncementDB> };
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const updated = await mutateDB((db) => {
    const idx = db.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    if (patch.active === true) {
      db.announcements = db.announcements.map((a) => ({ ...a, active: false }));
    }
    db.announcements[idx] = { ...db.announcements[idx], ...patch };
    return db.announcements[idx];
  });

  if (!updated) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: Request) {
  if (!(await requireAuth())) return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const { id } = (await req.json()) as { id: string };
  await mutateDB((db) => {
    db.announcements = db.announcements.filter((a) => a.id !== id);
  });
  return NextResponse.json({ ok: true });
}
