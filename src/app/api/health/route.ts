import { NextResponse } from 'next/server';
import { getDB, getDiagnostic } from '@/lib/db';
import { sqliteStatus } from '@/lib/db/sqlite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health-check público e leve. Serve pra:
 *  - diagnosticar produção de fora (curl https://.../api/health)
 *  - saber se o SQLite carregou ou se o app está em contingência JSON
 * Não expõe dado sensível — só status.
 */
export async function GET() {
  try {
    await getDB(); // dispara init/migração se ainda não rodou
    const diag = getDiagnostic();
    const sql = sqliteStatus();
    return NextResponse.json({
      ok: true,
      sqlite: sql.loaded ? 'ok' : `off${sql.error ? `: ${sql.error}` : ''}`,
      persistence: diag.persistenceAvailable,
      lastError: diag.lastError,
      uptimeSec: Math.round(process.uptime()),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error)?.message ?? 'unknown' },
      { status: 500 },
    );
  }
}
