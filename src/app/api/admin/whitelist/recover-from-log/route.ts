import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB, logAccess, newId } from '@/lib/db';
import type { WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Migração retroativa: varre o accessLog em busca de webhooks que chegaram
 * antes da correção (onde produtos não mapeados eram ignorados), e adiciona
 * os emails à whitelist como Básico. Idempotente: emails já existentes
 * mantêm o plano atual.
 *
 * Sem parâmetros: pega todos os emails únicos do log com type='webhook'.
 * Com ?dryRun=1: só conta quantos seriam adicionados, sem alterar nada.
 */
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'no auth' }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1';

  const db = await getDB();

  // Coleta emails únicos com type='webhook' (independente de status)
  const webhookEmails = new Map<string, string>(); // email -> primeiro at
  for (const entry of db.accessLog) {
    if (entry.type !== 'webhook') continue;
    const e = (entry.email || '').trim().toLowerCase();
    if (!e || !e.includes('@') || e === '—') continue;
    if (!webhookEmails.has(e)) webhookEmails.set(e, entry.at);
  }

  // Emails que já estão na whitelist: mantém como estão
  const existing = new Set(db.whitelist.map((w) => w.email));
  const toAdd: string[] = [];
  for (const email of webhookEmails.keys()) {
    if (!existing.has(email)) toAdd.push(email);
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      foundInLog: webhookEmails.size,
      alreadyInWhitelist: webhookEmails.size - toAdd.length,
      wouldAdd: toAdd.length,
      sample: toAdd.slice(0, 5),
    });
  }

  // Aplica
  await mutateDB((db) => {
    for (const email of toAdd) {
      const at = webhookEmails.get(email) ?? new Date().toISOString();
      const entry: WhitelistEntry = {
        email,
        plan: 'basic',
        source: 'webhook',
        addedAt: at,
        note: 'recuperado do log retroativamente',
      };
      // Não cria duplicado se já existir (dupla checagem por segurança)
      const idx = db.whitelist.findIndex((w) => w.email === email);
      if (idx === -1) db.whitelist.unshift(entry);
    }
  });

  await logAccess({
    id: newId('al-'),
    type: 'import',
    email: session.email,
    role: 'admin',
    meta: { source: 'recover-from-log', added: toAdd.length },
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    foundInLog: webhookEmails.size,
    alreadyInWhitelist: webhookEmails.size - toAdd.length,
    added: toAdd.length,
  });
}
