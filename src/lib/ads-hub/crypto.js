// Ads Hub — sulit / nyahsulit token Meta marketer (server sahaja).
// AES-256-GCM, kunci 32 bait (base64) dalam env ADS_TOKEN_KEY. Format: v1:<iv>:<tag>:<ciphertext> (base64).
import crypto from 'node:crypto';

function key() {
  const raw = process.env.ADS_TOKEN_KEY;
  if (!raw) throw new Error('ADS_TOKEN_KEY belum ditetapkan dalam env server.');
  const k = Buffer.from(raw, 'base64');
  if (k.length !== 32) throw new Error('ADS_TOKEN_KEY mesti 32 bait (base64).');
  return k;
}

export function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return ['v1', iv, cipher.getAuthTag(), enc].map(x => (typeof x === 'string' ? x : x.toString('base64'))).join(':');
}

export function decryptToken(stored) {
  const [v, iv, tag, enc] = String(stored).split(':');
  if (v !== 'v1') throw new Error('Format token tidak dikenali.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(enc, 'base64')), decipher.final()]).toString('utf8');
}
