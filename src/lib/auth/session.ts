import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export type Role = 'admin' | 'staff';

export type SessionPayload = {
  email: string;
  role: Role;
  exp: number; // epoch ms
};

const COOKIE_NAME = 'influlab_session';
const COOKIE_MAX_AGE_DAYS = 7;

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET ausente ou curto demais (mínimo 16 caracteres).');
  }
  return s;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function encodeSession(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// === Server actions / route handlers helpers ===

export async function setSessionCookie(payload: Omit<SessionPayload, 'exp'>) {
  const exp = Date.now() + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const token = encodeSession({ ...payload, exp });
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  return decodeSession(c.get(COOKIE_NAME)?.value);
}

// === Credentials check (server-side, env-based) ===
export function checkCredentials(email: string, password: string): Role | null {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD;
  const staffEmail = process.env.STAFF_EMAIL?.trim().toLowerCase();
  const staffPass = process.env.STAFF_PASSWORD;

  const e = email.trim().toLowerCase();
  if (adminEmail && adminPass && e === adminEmail && password === adminPass) return 'admin';
  if (staffEmail && staffPass && e === staffEmail && password === staffPass) return 'staff';
  return null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
