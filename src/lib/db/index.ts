import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Schema, SchemaKey, SchemaArrayKey } from './types';
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
  platformMappings: [],
  platformConfig: { kiwify: { enabled: true }, ticto: { enabled: true } },
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

export async function listAll<K extends SchemaArrayKey>(key: K): Promise<Schema[K]> {
  const db = await getDB();
  return db[key];
}

type ArrItem<K extends SchemaArrayKey> = Schema[K] extends ReadonlyArray<infer U> ? U : never;

export async function findById<K extends SchemaArrayKey>(
  key: K,
  id: string,
): Promise<ArrItem<K> | null> {
  const db = await getDB();
  const arr = db[key] as unknown as { id: string }[];
  return (arr.find((item) => item.id === id) ?? null) as ArrItem<K> | null;
}

export function newId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function insertOne<K extends SchemaArrayKey>(
  key: K,
  item: ArrItem<K>,
): Promise<ArrItem<K>> {
  await mutateDB((db) => {
    const arr = db[key] as unknown as ArrItem<K>[];
    arr.unshift(item);
  });
  return item;
}

export async function updateOne<K extends SchemaArrayKey>(
  key: K,
  id: string,
  patch: Partial<ArrItem<K>>,
): Promise<ArrItem<K> | null> {
  return mutateDB((db) => {
    const arr = db[key] as unknown as ({ id: string } & Record<string, unknown>)[];
    const idx = arr.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch } as typeof arr[number];
    return arr[idx] as ArrItem<K>;
  });
}

export async function deleteOne<K extends SchemaArrayKey>(key: K, id: string): Promise<boolean> {
  return mutateDB((db) => {
    const arr = db[key] as unknown as { id: string }[];
    const before = arr.length;
    const next = arr.filter((item) => item.id !== id);
    (db[key] as unknown) = next;
    return next.length < before;
  });
}

export async function logAccess(entry: import('./types').AccessLogEntry) {
  await mutateDB((db) => {
    db.accessLog.unshift(entry);
    if (db.accessLog.length > 1000) db.accessLog.length = 1000;
  });
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  return (await getEmailAccess(email)).allowed;
}

/** Verifica se o email tem acesso e qual é o plano (basic / pro) */
export async function getEmailAccess(email: string): Promise<{ allowed: boolean; plan: 'basic' | 'pro' | null }> {
  const e = email.trim().toLowerCase();

  // Envs PRO sempre acessam tudo
  const envAllowedPro = (process.env.DEFAULT_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (envAllowedPro.includes(e)) return { allowed: true, plan: 'pro' };

  const db = await getDB();
  const entry = db.whitelist.find((w) => w.email.trim().toLowerCase() === e);
  if (!entry) return { allowed: false, plan: null };
  return { allowed: true, plan: entry.plan };
}

export async function getActiveAnnouncement() {
  const db = await getDB();
  return db.announcements.find((a) => a.active) ?? null;
}

export function isPersistenceAvailable(): boolean {
  return persistenceAvailable;
}
