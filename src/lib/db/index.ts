import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Schema, SchemaKey, SchemaArrayKey } from './types';
import { seedIfEmpty } from './seed';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

// Estado global compartilhado entre requests (sobrevive a hot reload em dev).
type DBGlobal = {
  cache: Schema | null;
  writeQueue: Promise<unknown>;
  persistenceAvailable: boolean;
  initPromise: Promise<void> | null;
  lastError: string | null;
};

const g = globalThis as unknown as { __INFLULAB_DB__?: DBGlobal };
if (!g.__INFLULAB_DB__) {
  g.__INFLULAB_DB__ = {
    cache: null,
    writeQueue: Promise.resolve(),
    persistenceAvailable: true,
    initPromise: null,
    lastError: null,
  };
}
const state = g.__INFLULAB_DB__!;

async function tryLoadFromDisk(): Promise<Schema | null> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    state.persistenceAvailable = false;
    state.lastError = `mkdir ${DATA_DIR}: ${(err as Error).message}`;
    return null;
  }
  try {
    await fs.access(DB_FILE);
  } catch {
    // Não existe ainda — cria com seed
    try {
      const seeded = seedIfEmpty(JSON.parse(JSON.stringify(EMPTY_SCHEMA)));
      await fs.writeFile(DB_FILE, JSON.stringify(seeded, null, 2), 'utf8');
      return seeded;
    } catch (err) {
      state.persistenceAvailable = false;
      state.lastError = `write seed ${DB_FILE}: ${(err as Error).message}`;
      return null;
    }
  }
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Schema>;
    return { ...EMPTY_SCHEMA, ...parsed };
  } catch (err) {
    state.lastError = `read ${DB_FILE}: ${(err as Error).message}`;
    return null;
  }
}

async function initialize(): Promise<void> {
  if (state.cache) return;
  const fromDisk = await tryLoadFromDisk();
  if (fromDisk) {
    state.cache = fromDisk;
  } else {
    // Fallback: roda em memória global com seed
    state.cache = seedIfEmpty(JSON.parse(JSON.stringify(EMPTY_SCHEMA)));
  }
}

export async function getDB(): Promise<Schema> {
  if (!state.cache) {
    if (!state.initPromise) {
      state.initPromise = initialize();
    }
    await state.initPromise;
  }
  return state.cache!;
}

async function flushToDisk() {
  if (!state.cache || !state.persistenceAvailable) return;
  try {
    const tmp = DB_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(state.cache, null, 2), 'utf8');
    await fs.rename(tmp, DB_FILE);
  } catch (err) {
    state.persistenceAvailable = false;
    state.lastError = `flush: ${(err as Error).message}`;
    // eslint-disable-next-line no-console
    console.warn('[InfluLab DB] Falha ao salvar em disco. Continuando em memória.', err);
  }
}

export async function mutateDB<T>(fn: (db: Schema) => T | Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const db = await getDB();
    const result = await fn(db);
    await flushToDisk();
    return result;
  };
  const p = state.writeQueue.then(run, run);
  state.writeQueue = p.then(
    () => undefined,
    () => undefined,
  );
  return p;
}

type ArrItem<K extends SchemaArrayKey> = Schema[K] extends ReadonlyArray<infer U> ? U : never;

export async function listAll<K extends SchemaArrayKey>(key: K): Promise<Schema[K]> {
  const db = await getDB();
  return db[key];
}

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
    (db as unknown as Record<string, unknown>)[key as string] = next;
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

export async function getEmailAccess(
  email: string,
): Promise<{ allowed: boolean; plan: 'basic' | 'pro' | null }> {
  const e = email.trim().toLowerCase();

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
  return state.persistenceAvailable;
}

export function getDiagnostic() {
  return {
    persistenceAvailable: state.persistenceAvailable,
    cacheLoaded: !!state.cache,
    dataDir: DATA_DIR,
    dbFile: DB_FILE,
    lastError: state.lastError,
    counts: state.cache
      ? {
          products: state.cache.products.length,
          videoPrompts: state.cache.videoPrompts.length,
          imagePrompts: state.cache.imagePrompts.length,
          virals: state.cache.virals.length,
          creators: state.cache.creators.length,
          whitelist: state.cache.whitelist.length,
          announcements: state.cache.announcements.length,
          accessLog: state.cache.accessLog.length,
        }
      : null,
  };
}
