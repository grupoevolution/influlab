import path from 'node:path';
import fs from 'node:fs';
import type DatabaseNS from 'better-sqlite3';
import type { AccessLogEntry, Plan, WhitelistEntry } from './types';

type SqliteDB = DatabaseNS.Database;

/**
 * ===== Banco SQLite para os dados QUENTES e GRANDES =====
 *
 * Por que existe: a whitelist (~20 mil emails) e o log de acessos viviam num
 * arquivo JSON que era reescrito INTEIRO a cada venda que chegava pelo
 * webhook. Em escala (várias vendas por minuto), o servidor ficava travando
 * em série pra serializar 20k registros — atrasando TODAS as outras
 * requisições (páginas, vídeos, APIs).
 *
 * Agora: whitelist e access_log são tabelas SQLite (WAL). Uma venda nova é
 * um INSERT de 1 linha (<1ms). Login do aluno é um SELECT por chave primária.
 * Busca e paginação do painel rodam em SQL.
 *
 * MIGRAÇÃO SEM PERDA: na primeira inicialização, os dados existentes do
 * db.json são importados automaticamente pro SQLite (com backup do JSON
 * original em db.json.pre-sqlite.bak). Conteúdo (produtos, prompts, etc.)
 * continua no db.json — é pequeno e raramente muda. Mídias (data/uploads)
 * não são tocadas.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'app.db');

type SqlGlobal = { db: SqliteDB | null; driverError: string | null };
const g = globalThis as unknown as { __INFLULAB_SQLITE__?: SqlGlobal };
if (!g.__INFLULAB_SQLITE__) g.__INFLULAB_SQLITE__ = { db: null, driverError: null };
const holder = g.__INFLULAB_SQLITE__!;

const LOG_CAP = 5000;

/**
 * Carrega o driver nativo sob demanda e À PROVA DE FALHA.
 * Se o binário do better-sqlite3 não funcionar no ambiente (ex: build errado
 * pra Alpine/musl), NÃO derruba o servidor: registra o erro e o db/index.ts
 * cai automaticamente pro modo JSON antigo. O status fica visível em
 * /api/health e /api/admin/diag.
 */
function loadDriver(): typeof DatabaseNS | null {
  if (holder.driverError) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Driver = require('better-sqlite3') as typeof DatabaseNS;
    return Driver;
  } catch (err) {
    holder.driverError = (err as Error)?.message ?? String(err);
    // eslint-disable-next-line no-console
    console.error('[SQLITE] Driver better-sqlite3 indisponível — contingência em modo JSON.', err);
    return null;
  }
}

/** Status pro /api/health e /api/admin/diag. */
export function sqliteStatus(): { loaded: boolean; error: string | null } {
  return { loaded: !!holder.db, error: holder.driverError };
}

function getSqlite(): SqliteDB {
  if (holder.db) return holder.db;
  const Driver = loadDriver();
  if (!Driver) {
    throw new Error(`sqlite driver indisponível: ${holder.driverError ?? 'motivo desconhecido'}`);
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Driver(SQLITE_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS whitelist (
      email      TEXT PRIMARY KEY,
      plan       TEXT NOT NULL DEFAULT 'basic',
      source     TEXT,
      platform   TEXT,
      productRef TEXT,
      note       TEXT,
      addedAt    TEXT
    );
    CREATE TABLE IF NOT EXISTS access_log (
      id        TEXT PRIMARY KEY,
      type      TEXT,
      email     TEXT,
      role      TEXT,
      ip        TEXT,
      userAgent TEXT,
      meta      TEXT,
      at        TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_log_type ON access_log(type);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
  `);
  holder.db = db;
  return db;
}

// ===== Migração única a partir do db.json =====

export function isJsonMigrated(): boolean {
  const db = getSqlite();
  const row = db.prepare(`SELECT value FROM meta WHERE key = 'migrated_json'`).get() as
    | { value: string }
    | undefined;
  return row?.value === '1';
}

/**
 * Importa whitelist[] e accessLog[] vindos do db.json (uma única vez).
 * Chamado pelo db/index.ts na inicialização. Retorna true se migrou agora.
 */
export function migrateFromJson(whitelist: WhitelistEntry[], accessLog: AccessLogEntry[]): boolean {
  const db = getSqlite();
  if (isJsonMigrated()) return false;

  const insWl = db.prepare(`
    INSERT OR IGNORE INTO whitelist (email, plan, source, platform, productRef, note, addedAt)
    VALUES (@email, @plan, @source, @platform, @productRef, @note, @addedAt)
  `);
  const insLog = db.prepare(`
    INSERT OR IGNORE INTO access_log (id, type, email, role, ip, userAgent, meta, at)
    VALUES (@id, @type, @email, @role, @ip, @userAgent, @meta, @at)
  `);

  const tx = db.transaction(() => {
    for (const w of whitelist) {
      insWl.run({
        email: (w.email ?? '').trim().toLowerCase(),
        plan: w.plan === 'pro' ? 'pro' : 'basic',
        source: w.source ?? null,
        platform: w.platform ?? null,
        productRef: w.productRef ?? null,
        note: w.note ?? null,
        addedAt: w.addedAt ?? new Date().toISOString(),
      });
    }
    for (const l of accessLog) {
      insLog.run({
        id: l.id,
        type: l.type ?? null,
        email: l.email ?? null,
        role: l.role ?? null,
        ip: l.ip ?? null,
        userAgent: l.userAgent ?? null,
        meta: l.meta ? JSON.stringify(l.meta) : null,
        at: l.at ?? new Date().toISOString(),
      });
    }
    db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('migrated_json', '1')`).run();
  });
  tx();
  return true;
}

// ===== Whitelist =====

function rowToEntry(r: Record<string, unknown>): WhitelistEntry {
  return {
    email: String(r.email),
    plan: r.plan === 'pro' ? 'pro' : 'basic',
    source: (r.source ?? 'manual') as WhitelistEntry['source'],
    platform: (r.platform ?? undefined) as string | undefined,
    productRef: (r.productRef ?? undefined) as string | undefined,
    note: (r.note ?? undefined) as string | undefined,
    addedAt: String(r.addedAt ?? ''),
  };
}

export function wlGet(email: string): WhitelistEntry | null {
  const row = getSqlite()
    .prepare(`SELECT * FROM whitelist WHERE email = ?`)
    .get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  return row ? rowToEntry(row) : null;
}

export function wlStats(): { total: number; basic: number; pro: number } {
  const db = getSqlite();
  const total = (db.prepare(`SELECT COUNT(*) c FROM whitelist`).get() as { c: number }).c;
  const pro = (db.prepare(`SELECT COUNT(*) c FROM whitelist WHERE plan = 'pro'`).get() as { c: number }).c;
  return { total, basic: total - pro, pro };
}

export function wlList(opts: {
  q?: string;
  plan?: Plan;
  page: number;
  limit: number;
}): { data: WhitelistEntry[]; totalFiltered: number } {
  const db = getSqlite();
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (opts.plan === 'basic' || opts.plan === 'pro') {
    where.push(`plan = @plan`);
    params.plan = opts.plan;
  }
  if (opts.q) {
    where.push(`email LIKE @q`);
    params.q = `%${opts.q.trim().toLowerCase()}%`;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalFiltered = (
    db.prepare(`SELECT COUNT(*) c FROM whitelist ${whereSql}`).get(params) as { c: number }
  ).c;
  const rows = db
    .prepare(`SELECT * FROM whitelist ${whereSql} ORDER BY addedAt DESC LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: opts.limit, offset: (opts.page - 1) * opts.limit }) as Record<string, unknown>[];
  return { data: rows.map(rowToEntry), totalFiltered };
}

/** Insere ou atualiza (mantém addedAt original se o email já existir). */
export function wlAdd(entry: WhitelistEntry): WhitelistEntry {
  const db = getSqlite();
  db.prepare(`
    INSERT INTO whitelist (email, plan, source, platform, productRef, note, addedAt)
    VALUES (@email, @plan, @source, @platform, @productRef, @note, @addedAt)
    ON CONFLICT(email) DO UPDATE SET
      plan = excluded.plan,
      source = excluded.source,
      platform = COALESCE(excluded.platform, whitelist.platform),
      productRef = COALESCE(excluded.productRef, whitelist.productRef),
      note = COALESCE(excluded.note, whitelist.note)
  `).run({
    email: entry.email.trim().toLowerCase(),
    plan: entry.plan,
    source: entry.source ?? 'manual',
    platform: entry.platform ?? null,
    productRef: entry.productRef ?? null,
    note: entry.note ?? null,
    addedAt: entry.addedAt ?? new Date().toISOString(),
  });
  return wlGet(entry.email)!;
}

export function wlUpdatePlan(email: string, plan: Plan): boolean {
  const res = getSqlite()
    .prepare(`UPDATE whitelist SET plan = ? WHERE email = ?`)
    .run(plan, email.trim().toLowerCase());
  return res.changes > 0;
}

export function wlRename(oldEmail: string, newEmail: string): 'ok' | 'notfound' | 'conflict' {
  const db = getSqlite();
  const oldE = oldEmail.trim().toLowerCase();
  const newE = newEmail.trim().toLowerCase();
  if (!wlGet(oldE)) return 'notfound';
  if (oldE !== newE && wlGet(newE)) return 'conflict';
  db.prepare(`UPDATE whitelist SET email = ? WHERE email = ?`).run(newE, oldE);
  return 'ok';
}

export function wlDelete(email: string): boolean {
  const res = getSqlite()
    .prepare(`DELETE FROM whitelist WHERE email = ?`)
    .run(email.trim().toLowerCase());
  return res.changes > 0;
}

/** Import em massa (transação). Upsert por email. Retorna quantos processou. */
export function wlImportMany(entries: WhitelistEntry[]): number {
  const db = getSqlite();
  const stmt = db.prepare(`
    INSERT INTO whitelist (email, plan, source, platform, productRef, note, addedAt)
    VALUES (@email, @plan, @source, @platform, @productRef, @note, @addedAt)
    ON CONFLICT(email) DO UPDATE SET plan = excluded.plan, source = excluded.source
  `);
  const tx = db.transaction((list: WhitelistEntry[]) => {
    for (const e of list) {
      stmt.run({
        email: e.email.trim().toLowerCase(),
        plan: e.plan,
        source: e.source ?? 'import',
        platform: e.platform ?? null,
        productRef: e.productRef ?? null,
        note: e.note ?? null,
        addedAt: e.addedAt ?? new Date().toISOString(),
      });
    }
  });
  tx(entries);
  return entries.length;
}

// ===== Access log =====

export function logAdd(entry: AccessLogEntry): void {
  const db = getSqlite();
  db.prepare(`
    INSERT OR REPLACE INTO access_log (id, type, email, role, ip, userAgent, meta, at)
    VALUES (@id, @type, @email, @role, @ip, @userAgent, @meta, @at)
  `).run({
    id: entry.id,
    type: entry.type ?? null,
    email: entry.email ?? null,
    role: entry.role ?? null,
    ip: entry.ip ?? null,
    userAgent: entry.userAgent ?? null,
    meta: entry.meta ? JSON.stringify(entry.meta) : null,
    at: entry.at ?? new Date().toISOString(),
  });
  // Mantém só os LOG_CAP mais recentes (barato: 1 delete indexado por rowid)
  db.prepare(`
    DELETE FROM access_log WHERE rowid <= (
      SELECT rowid FROM access_log ORDER BY rowid DESC LIMIT 1 OFFSET ?
    )
  `).run(LOG_CAP);
}

export function logList(limit: number): AccessLogEntry[] {
  const rows = getSqlite()
    .prepare(`SELECT * FROM access_log ORDER BY rowid DESC LIMIT ?`)
    .all(limit) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    type: (r.type ?? 'visit') as AccessLogEntry['type'],
    email: String(r.email ?? ''),
    role: (r.role ?? 'guest') as AccessLogEntry['role'],
    ip: (r.ip ?? undefined) as string | undefined,
    userAgent: (r.userAgent ?? undefined) as string | undefined,
    meta: r.meta ? (JSON.parse(String(r.meta)) as Record<string, unknown>) : undefined,
    at: String(r.at ?? ''),
  }));
}

export function logCount(): number {
  return (getSqlite().prepare(`SELECT COUNT(*) c FROM access_log`).get() as { c: number }).c;
}

/** Emails de webhooks que ainda NÃO estão na whitelist (pra recuperação retroativa). */
export function recoverCandidates(): { email: string; firstAt: string }[] {
  const rows = getSqlite()
    .prepare(`
      SELECT email, MIN(at) firstAt
      FROM access_log
      WHERE type = 'webhook' AND email LIKE '%@%'
        AND email NOT IN (SELECT email FROM whitelist)
      GROUP BY email
    `)
    .all() as { email: string; firstAt: string }[];
  return rows;
}

export function recoverStats(): { foundInLog: number } {
  const c = (
    getSqlite()
      .prepare(`SELECT COUNT(DISTINCT email) c FROM access_log WHERE type = 'webhook' AND email LIKE '%@%'`)
      .get() as { c: number }
  ).c;
  return { foundInLog: c };
}
