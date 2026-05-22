import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB, newId } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getCurrentSession();
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'no auth' }, { status: 401 });
  const db = await getDB();
  return NextResponse.json({ data: db.broadcasts });
}

export async function POST(req: Request) {
  const s = await getCurrentSession();
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'no auth' }, { status: 401 });

  const { title, body, url } = (await req.json()) as { title?: string; body?: string; url?: string };
  if (!title || !body) {
    return NextResponse.json({ error: 'título e corpo obrigatórios' }, { status: 400 });
  }

  const broadcast = {
    id: newId('br-'),
    title,
    body,
    url,
    sentAt: new Date().toISOString(),
  };

  await mutateDB((db) => {
    db.broadcasts.unshift(broadcast);
    if (db.broadcasts.length > 100) db.broadcasts.length = 100;
  });

  // NOTA: o disparo real (Web Push) precisa de chaves VAPID + subscriptions dos clientes.
  // Por ora, o cliente verifica esse endpoint via polling e exibe o último broadcast como toast.
  return NextResponse.json({ data: broadcast }, { status: 201 });
}
