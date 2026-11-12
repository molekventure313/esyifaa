// Token peranti untuk app Android E-Syifa (notifikasi order "cing!").
// Token tanpa jadual DB: esd_<base64url(json)>.<hmac>. Ditandatangani dengan APP_DEVICE_SECRET
// (fallback CRON_SECRET). Tukar secret = semua token peranti terbatal.
// Role disemak semula pada setiap panggilan feed — user dibuang/diturunkan role terus hilang akses.
import crypto from 'crypto';

export const APP_ROLES = ['super_admin', 'admin', 'marketer'];

function secret() {
  const s = process.env.APP_DEVICE_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error('APP_DEVICE_SECRET / CRON_SECRET tidak ditetapkan');
  return `esyifa-app-device:${s}`;
}

const sign = body => crypto.createHmac('sha256', secret()).update(body).digest('base64url');

export function signDeviceToken(userId) {
  const body = Buffer.from(JSON.stringify({ u: userId, t: Date.now() })).toString('base64url');
  return `esd_${body}.${sign(body)}`;
}

/** Pulang userId jika token sah, null jika tidak. */
export function verifyDeviceToken(token) {
  if (!token?.startsWith('esd_')) return null;
  const [body, sig] = token.slice(4).split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).u || null; } catch { return null; }
}
