import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, logAccess, newId } from '@/lib/db';
import { wlImportMany } from '@/lib/db/sqlite';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';

/**
 * Importa emails em massa via CSV.
 * Aceita 2 formatos:
 *   1. Apenas emails, um por linha
 *   2. CSV com cabeçalho: email,plan
 */
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'no auth' }, { status: 401 });
  }

  const { csv, defaultPlan = 'basic' } = (await req.json()) as { csv?: string; defaultPlan?: Plan };
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'csv obrigatório' }, { status: 400 });
  }

  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return NextResponse.json({ error: 'csv vazio' }, { status: 400 });
  }

  // Detectar cabeçalho
  const first = lines[0].toLowerCase();
  const hasHeader = first.includes('email');
  const headerCols = hasHeader ? first.split(/[,;\t]/).map((c) => c.trim()) : [];
  const emailIdx = hasHeader ? headerCols.findIndex((c) => c === 'email') : 0;
  const planIdx = hasHeader ? headerCols.findIndex((c) => c === 'plan' || c === 'plano') : -1;

  const rows = hasHeader ? lines.slice(1) : lines;
  const entries: WhitelistEntry[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const cells = row.split(/[,;\t]/).map((c) => c.trim());
    const email = (cells[emailIdx] ?? cells[0] ?? '').toLowerCase();
    if (!email || !email.includes('@')) {
      if (email) errors.push(`Email inválido: ${email}`);
      continue;
    }
    const planRaw = planIdx >= 0 ? (cells[planIdx] ?? '').toLowerCase() : '';
    const plan: Plan = planRaw === 'pro' ? 'pro' : planRaw === 'basic' || planRaw === 'basico' ? 'basic' : defaultPlan;

    entries.push({
      email,
      plan,
      source: 'import',
      addedAt: new Date().toISOString(),
    });
  }

  // Import em massa direto no SQLite (transação única — rápido mesmo com milhares)
  await getDB();
  wlImportMany(entries);

  await logAccess({
    id: newId('al-'),
    type: 'import',
    email: session.email,
    role: 'admin',
    meta: { imported: entries.length, errors: errors.length },
    at: new Date().toISOString(),
  });

  return NextResponse.json({ imported: entries.length, errors });
}
