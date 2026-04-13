import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Cast to include the options parameter (N, r, p cost settings)
const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const SCRYPT_PARAMS = {
  N: process.env.NODE_ENV === 'test' ? 16384 : 32768,
  r: 8,
  p: 1,
  keylen: 64,
  maxmem: 64 * 1024 * 1024,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const { N, r, p, keylen, maxmem } = SCRYPT_PARAMS;
  const hash = await scryptAsync(password, salt, keylen, { N, r, p, maxmem });
  return `${hash.toString('hex')}.${salt.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [hashHex, saltHex] = stored.split('.');
  if (!hashHex || !saltHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const storedHash = Buffer.from(hashHex, 'hex');
  const { N, r, p, keylen, maxmem } = SCRYPT_PARAMS;
  const hash = await scryptAsync(password, salt, keylen, { N, r, p, maxmem });

  return timingSafeEqual(hash, storedHash);
}
