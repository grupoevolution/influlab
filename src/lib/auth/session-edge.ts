// Versão edge-runtime safe (sem node:crypto) — usada no middleware.

export const SESSION_COOKIE_NAME = 'influlab_session';

export type Role = 'admin' | 'staff';

export type SessionPayload = {
  email: string;
  role: Role;
  exp: number;
};

export async function decodeSessionEdge(
  token: string | undefined | null,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    // converter ArrayBuffer -> base64url
    const sigBytes = new Uint8Array(sigBuf);
    let s = '';
    for (let i = 0; i < sigBytes.length; i++) s += String.fromCharCode(sigBytes[i]);
    const expected = btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (expected !== sig) return null;

    // base64url decode body -> JSON
    const padded = body + '='.repeat((4 - (body.length % 4)) % 4);
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
