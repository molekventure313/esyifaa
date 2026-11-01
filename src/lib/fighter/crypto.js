// Fighter — sulit / nyahsulit key rahsia fighter (CHIP API key, Claude API key). Server sahaja.
// AES-256-GCM, kunci 32 bait (base64) dalam env INDIE_SECRET_KEY. Format: v1:<iv>:<tag>:<ciphertext> (base64).
import crypto from 'node:crypto';

function key() {
  const raw = process.env.INDIE_SECRET_KEY;
  if (!raw) throw new Error('INDIE_SECRET_KEY belum ditetapkan dalam env server.');
  const k = Buffer.from(raw, 'base64');
  if (k.length !== 32) throw new Error('INDIE_SECRET_KEY mesti 32 bait (base64).');
  return k;
}

export function encryptSecret(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return ['v1', iv, cipher.getAuthTag(), enc].map(x => (typeof x === 'string' ? x : x.toString('base64'))).join(':');
}

export function decryptSecret(stored) {
  const [v, iv, tag, enc] = String(stored).split(':');
  if (v !== 'v1') throw new Error('Format key tidak dikenali.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(enc, 'base64')), decipher.final()]).toString('utf8');
}

export const last4 = s => String(s || '').slice(-4);
