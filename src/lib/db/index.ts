import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Schema, SchemaKey } from './types';
import { seedIfEmpty } from './seed';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let cache: Schema | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();
let persistenceAvailable = true; // se falhar, vira false e roda em memória

const EMPTY_SCHEMA: Schema = {
  products: [],
  videoPrompts: [],
  imagePrompts: [],
  virals: [],
  creators: [],
  whitelist: [],
  announcements: [],
  accessLog: [],
  broadcasts: [],
};

async function ensureFile() {
  if (!persistenceAvailable) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      const seeded = seedIfEmpty(EMPTY_SCHEMA);
      await fs.writeFile(DB_FILE, JSON.stringify(seeded, null, 2), 'utf8');
    }
  } catch (err) {
    persistenceAvailable = false;
    console.warn(
      '[InfluLab DB] Persistência em disco indisponível. Rodando em memória.\n' +
        'Para persistir dados entre reinicializações, monte um volume em /app/data no EasyPanel.\n' +
        'Erro:',
      err,
    );
  }
}

async function loadFromDisk(): Promise<Schema> {
  await ensureFile();
  if (!persistenceAvailable) {
    return seedIfEmpty({ ...EMPTY_SCHEMA });
  }
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Schema>;
    return { ...EMPTY_SCHEMA, ...parsed };
  } catch {
    return seedIfEmpty({ ...EMPTY_SCHEMA });
  }
}

export async function getDB(): Promise<Schema> {
  if (cache) return cache;
  cache = await loadFromDisk();
  return cache;
}

async function flushToDisk() {
  if (!cache || !persistenceAvailable) return;
  try {
    const tmp = DB_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(cache, null, 2), 'utf8');
    await fs.rename(tmp, DB_FILE);
  } catch (err) {
    console.warn('[InfluLab DB] Falha ao salvar:', err);
    persistenceAvailable = false;
  }
}

export async function mutateDB<T>(fn: (db: Schema) => T | Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const db = await getDB();
    const result = await fn(db);
    await flushToDisk();
    return result;
  };
  const p = writeQueue.then(run, run);
  writeQueue = p.then(
    () => undefined,
    () => undefined,
  );
  return p;
}

export async function listAll<K extends SchemaKey>(key: K): Promise<Schema[K]> {
  const db = await getDB();
  return db[key];
}

export async function findById<K extends SchemaKey>(
  key: K,
  id: string,
): Promise<Schema[K][number] | null> {
  const db = await getDB();
  // @ts-expect-error generic narrowing
  return db[key].find((item: { id: string }) => item.id === id) ?? null;
}

export function newId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function insertOne<K extends SchemaKey>(
  key: K,
  item: Schema[K][number],
): Promise<Schema[K][number]> {
  await mutateDB((db) => {
    // @ts-expect-error generic narrowing
    db[key].unshift(item);
  });
  return item;
}

export async function updateOne<K extends SchemaKey>(
  key: K,
  id: string,
  patch: Partial<Schema[K][number]>,
): Promise<Schema[K][number] | null> {
  return mutateDB((db) => {
    // @ts-expect-error generic narrowing
    const idx = db[key].findIndex((item: { id: string }) => item.id === id);
    if (idx === -1) return null;
    db[key][idx] = { ...db[key][idx], ...patch };
    return db[key][idx];
  });
}

export async function deleteOne<K extends SchemaKey>(key: K, id: string): Promise<boolean> {
  return mutateDB((db) => {
    const before = db[key].length;
    // @ts-expect-error generic narrowing
    db[key] = db[key].filter((item: { id: string }) => item.id !== id);
    return db[key].length < before;
  });
}

export async function logAccess(entry: import('./types').AccessLogEntry) {
  await mutateDB((db) => {
    db.accessLog.unshift(entry);
    if (db.accessLog.length > 1000) db.accessLog.length = 1000;
  });
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();

  // Emails sempre liberados via variável de ambiente (separados por vírgula).
  const envAllowed = (process.env.DEFAULT_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (envAllowed.includes(e)) return true;

  // Liberados pelo painel administrativo
  const db = await getDB();
  return db.whitelist.some((w) => w.email.trim().toLowerCase() === e);
}

export async function getActiveAnnouncement() {
  const db = await getDB();
  return db.announcements.find((a) => a.active) ?? null;
}

export function isPersistenceAvailable(): boolean {
  return persistenceAvailable;
}
