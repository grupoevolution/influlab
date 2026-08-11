import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, logAccess, newId } from '@/lib/db';
import { recoverCandidates, recoverStats, wlImportMany } from '@/lib/db/sqlite';
import type { WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Migração retroativa: varre o log de acessos (SQLite) em busca de webhooks
 * cujos emails ainda não estão na whitelist e adiciona como Básico.
 * Idempotente. Com ?dryRun=1 só conta, sem alterar nada.
 */
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'no auth' }, { status: 401 });
  }
  await getDB(); // garante migração inicial

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1';

  const candidates = recoverCandidates();
  const { foundInLog } = recoverStats();

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      foundInLog,
      alreadyInWhitelist: foundInLog - candidates.length,
      wouldAdd: candidates.length,
      sample: candidates.slice(0, 5).map((c) => c.email),
    });
  }

  const entries: WhitelistEntry[] = candidates.map((c) => ({
    email: c.email,
    plan: 'basic',
    source: 'webhook',
    addedAt: c.firstAt || new Date().toISOString(),
    note: 'recuperado do log retroativamente',
  }));
  if (entries.length > 0) wlImportMany(entries);

  await logAccess({
    id: newId('al-'),
    type: 'import',
    email: session.email,
    role: 'admin',
    meta: { source: 'recover-from-log', added: entries.length },
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    foundInLog,
    alreadyInWhitelist: foundInLog - entries.length,
    added: entries.length,
  });
}
