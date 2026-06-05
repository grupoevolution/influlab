import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Hash de senha usando scrypt (built-in do Node, sem deps externas).
 * Formato armazenado: scrypt$<saltHex>$<hashHex>
 *
 * - salt: 16 bytes aleatórios (128 bits, suficiente)
 * - hash: 64 bytes (512 bits) com N=16384, r=8, p=1 (defaults do scryptSync)
 * - verify: timing-safe comparison
 */

const ALGO = 'scrypt';
const SALT_BYTES = 16;
const HASH_BYTES = 64;

export function hashPassword(plain: string): string {
  if (typeof plain !== 'string' || plain.length === 0) {
    throw new Error('senha vazia');
  }
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(plain, salt, HASH_BYTES);
  return `${ALGO}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!plain || !stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const [algo, saltHex, hashHex] = parts;
  if (algo !== ALGO) return false;

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = scryptSync(plain, salt, expected.length);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
