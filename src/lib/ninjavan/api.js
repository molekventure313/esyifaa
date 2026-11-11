// Klien NinjaVan API (OAuth 2.0, Order Create 4.2, Waybill, Cancel, verifikasi webhook V2).
// Spec rasmi: https://api-docs.ninjavan.co/en — keperluan audit yang dipatuhi di sini:
//  • token WAJIB di-cache dalam storan kekal (jadual ninjavan_tokens) + dijana semula 5 minit sebelum luput / bila 401
//  • 5xx / timeout / ralat rangkaian → cuba semula; 4xx → log respons, JANGAN cuba semula tanpa betulkan
// Sandbox SENTIASA guna URL Singapura (/sg) walaupun alamat Malaysia; live guna /my.
import crypto from 'crypto';

export const NV_ENV = process.env.NINJAVAN_ENV === 'live' ? 'live' : 'sandbox';
const BASE = NV_ENV === 'live' ? 'https://api.ninjavan.co/my' : 'https://api-sandbox.ninjavan.co/sg';

const REFRESH_BEFORE_MS = 5 * 60 * 1000;   // jana token baru 5 minit sebelum luput
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;                     // untuk 5xx / timeout sahaja

export class NinjaVanError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = 'NinjaVanError';
    this.status = status;
    this.body = body;
  }
}

function creds() {
  const clientId = process.env.NINJAVAN_CLIENT_ID;
  const clientSecret = process.env.NINJAVAN_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new NinjaVanError('NINJAVAN_CLIENT_ID / NINJAVAN_CLIENT_SECRET belum diset.');
  return { clientId, clientSecret };
}

/** Mesej ralat yang boleh dibaca dari respons ErrorResponse NinjaVan */
export function errorMessageOf(body, fallback = 'Ralat NinjaVan') {
  const e = body?.error;
  if (!e) return typeof body === 'string' && body ? body.slice(0, 300) : fallback;
  const details = (e.details || []).map(d => [d.field, d.message].filter(Boolean).join(': ')).filter(Boolean);
  return [e.message || e.title || fallback, ...details].join(' — ');
}

// ─── Token ──────────────────────────────────────────────────────────────────

let memToken = null;        // cache dalam proses (lambda yang masih panas) — DB tetap sumber utama
let inflight = null;        // elak beberapa request serentak minta token baru

const isFresh = t => t && t.expiresAt - Date.now() > REFRESH_BEFORE_MS;

async function requestNewToken(db, key) {
  const { clientId, clientSecret } = creds();
  const res = await fetch(`${BASE}/2.0/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    console.error('[ninjavan] token gagal', res.status, JSON.stringify(body));
    throw new NinjaVanError(`Gagal dapatkan token NinjaVan: ${errorMessageOf(body, `HTTP ${res.status}`)}`, { status: res.status, body });
  }
  const expiresAt = body.expires ? body.expires * 1000 : Date.now() + (body.expires_in || 3600) * 1000;
  const { error } = await db.from('ninjavan_tokens').upsert({
    id: key,
    access_token: body.access_token,
    expires_at: new Date(expiresAt).toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[ninjavan] simpan token gagal:', error.message);
  memToken = { key, token: body.access_token, expiresAt };
  return memToken.token;
}

/** Token Bearer — guna semula dari cache selagi > 5 minit sebelum luput */
export async function getToken(db, { force = false } = {}) {
  const key = `${NV_ENV}:${creds().clientId}`;
  if (!force) {
    if (memToken?.key === key && isFresh(memToken)) return memToken.token;
    const { data } = await db.from('ninjavan_tokens').select('access_token, expires_at').eq('id', key).maybeSingle();
    const stored = data && { key, token: data.access_token, expiresAt: new Date(data.expires_at).getTime() };
    if (isFresh(stored)) {
      memToken = stored;
      return stored.token;
    }
  }
  if (!inflight) inflight = requestNewToken(db, key).finally(() => { inflight = null; });
  return inflight;
}

// ─── Request ────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Panggil API dengan token; 401 → token baru sekali; 5xx/timeout → cuba semula. Pulang { status, body } */
async function nvFetch(db, path, { method = 'GET', json, binary = false } = {}) {
  let token = await getToken(db);
  let refreshed = false;

  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: binary ? 'application/pdf' : 'application/json',
          ...(json ? { 'Content-Type': 'application/json' } : {}),
        },
        body: json ? JSON.stringify(json) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      // timeout / ralat rangkaian — selamat diulang (requested_tracking_number menghalang order berganda)
      if (attempt < MAX_RETRIES) { await sleep(1000 * 2 ** attempt); continue; }
      throw new NinjaVanError(`NinjaVan tidak dapat dihubungi: ${e.message}`);
    }

    if (res.status === 401 && !refreshed) {
      refreshed = true;
      token = await getToken(db, { force: true });
      attempt--;                      // cubaan dengan token baru tidak dikira sebagai retry
      continue;
    }
    if (res.status >= 500 && attempt < MAX_RETRIES) { await sleep(1000 * 2 ** attempt); continue; }

    if (binary && res.ok) return { status: res.status, body: Buffer.from(await res.arrayBuffer()) };
    const text = await res.text();
    let body = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* bukan JSON */ }
    if (!res.ok) {
      console.error(`[ninjavan] ${method} ${path} → ${res.status}`, typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body));
      throw new NinjaVanError(errorMessageOf(body, `HTTP ${res.status}`), { status: res.status, body });
    }
    return { status: res.status, body };
  }
}

// ─── Endpoint ───────────────────────────────────────────────────────────────

/** POST /4.2/orders — pulang OrderCreateResponseSuccess (tracking_number, ...) */
export async function createOrder(db, payload) {
  const { body } = await nvFetch(db, '/4.2/orders', { method: 'POST', json: payload });
  return body;
}

/** DELETE /2.2/orders/{tid} — hanya order 'Pending Pickup' boleh dibatalkan */
export async function cancelOrder(db, trackingNumber) {
  const { body } = await nvFetch(db, `/2.2/orders/${encodeURIComponent(trackingNumber)}`, { method: 'DELETE' });
  return body;
}

/** GET /2.0/reports/waybill — PDF (Buffer). Panggil SEKALI per tracking; simpan & guna semula (lihat shipments.js) */
export async function fetchWaybillPdf(db, trackingNumber) {
  // Sorok alamat & telefon pengirim pada waybill (sama seperti tetapan semasa submit manual di dashboard NinjaVan)
  const qs = new URLSearchParams({ tid: trackingNumber, hide_shipper_details: 'true' });
  const { body } = await nvFetch(db, `/2.0/reports/waybill?${qs}`, { binary: true });
  return body;
}

// ─── Webhook ────────────────────────────────────────────────────────────────

/** X-Ninjavan-Hmac-Sha256 = base64(HMAC-SHA256(raw body, client secret)) */
export function verifyWebhook(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const { clientSecret } = creds();
  const expected = crypto.createHmac('sha256', clientSecret).update(rawBody, 'utf8').digest();
  let given;
  try { given = Buffer.from(signatureHeader.trim(), 'base64'); } catch { return false; }
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
