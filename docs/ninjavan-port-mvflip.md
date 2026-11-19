# Port Ninja Van E-Syifa → MvFlip (terus production, tanpa audit sandbox)

> Untuk: pembangun / ejen AI yang kerja dalam repo **MvFlip** (`C:\Users\ACER\Desktop\MvFlipSystem\mvflip-clone`, Vite + Supabase Edge Functions Deno).
> Sumber rujukan: E-Syifa (`src/lib/ninjavan/*`, `src/app/api/webhooks/ninjavan/route.js`, `sql/029_ninjavan_api.sql`) — sistem ini **sudah lulus audit Ninja Van dan berjalan live** (`NINJAVAN_ENV=live`, API `https://api.ninjavan.co/my`).
> Tarikh: 17 Nov 2026

---

## 1. Ringkasan

MvFlip akan guna **akaun Ninja Van production E-Syifa** (Client ID & Client Secret yang sama). Akaun itu dah lulus audit, jadi MvFlip tak perlu melalui sandbox lagi — terus panggil API production `/my`.

Yang perlu dibuat:

| # | Di mana | Apa |
|---|---|---|
| A | **E-Syifa** | Relay webhook: event untuk parcel MvFlip dihantar terus ke edge function `ninjavan-webhook` MvFlip (Ninja Van hanya benarkan **satu URL webhook per akaun**). |
| B | MvFlip | Secrets production (credential E-Syifa) + maklumat pengirim MvFlip. |
| C | MvFlip | Migration `sql/009_ninjavan_live.sql`. |
| D | MvFlip | Modul kongsi `supabase/functions/_shared/ninjavan.ts` (port `src/lib/ninjavan/api.js`). |
| E | MvFlip | Tulis semula `ninjavan-shipment`, `ninjavan-webhook`; tambah `ninjavan-cancel`, `ninjavan-waybill`. |
| F | MvFlip | Butang UI: Cetak Waybill & Batal Parcel di halaman Orders. |
| G | Kedua-dua | Ujian go-live dengan satu order sebenar. |

---

## 2. Perkara wajib faham — akaun dikongsi

### 2.1 Tracking number: penanda `M` (elak berlaga dengan E-Syifa)

Ninja Van: `requested_tracking_number` = 1–9 aksara alfanumerik, **unik dalam satu akaun**. Ninja Van tambah prefix akaun sendiri di depan, jadi `tracking_number` sebenar = `<PREFIX_AKAUN><requested>`.

Format yang sudah dipakai dalam akaun ini:

| Sistem | requested_tracking_number (9 aksara) |
|---|---|
| E-Syifa order HQ | 8 hex id order + 1 aksara cubaan (`0-9A-F…`) |
| E-Syifa fighter | `F` + 7 hex + 1 aksara cubaan |
| **MvFlip (baru)** | **`M` + 7 hex id order + 1 aksara cubaan** |

`M` bukan aksara hex, jadi ia **tidak boleh** berlaga dengan order HQ E-Syifa, dan berbeza daripada `F`. Aksara terakhir = bilangan parcel yang pernah dibatalkan untuk order itu (base36: `0`, `1`, `2`…), supaya order boleh dihantar semula selepas batal.

```ts
const hex = order.id.replace(/-/g, '').toUpperCase();
const requested = `M${hex.slice(0, 7)}${attempt.toString(36).toUpperCase()}`;   // tepat 9 aksara
```

**Peraturan routing webhook** (dipakai oleh relay E-Syifa): 9 aksara terakhir `tracking_id` bermula dengan `M` → parcel MvFlip.

> ⚠️ Jangan ubah panjang (9) atau penanda `M` tanpa kemas kini relay di E-Syifa.
> Kod MvFlip sedia ada guna `orderId.slice(0, 9).replace(/-/g,'')` — **wajib diganti**, ia boleh berlaga dengan order E-Syifa.

### 2.2 Webhook: satu URL sahaja → E-Syifa relay

Webhook didaftarkan di Dashboard Ninja Van → Settings → IT Settings → Webhooks, dan sudah menghala ke E-Syifa (`https://<domain-esyifa>/api/webhooks/ninjavan`). Jangan tukar URL itu.

Aliran:

```
Ninja Van ──POST (raw body + X-Ninjavan-Hmac-Sha256)──▶ E-Syifa /api/webhooks/ninjavan
                                                         │ sah HMAC
                                                         ├─ tracking penanda M → forward body + header ASAL ──▶ MvFlip edge fn ninjavan-webhook
                                                         │                       (MvFlip sah HMAC sendiri — secret sama)
                                                         └─ lain → proses E-Syifa seperti biasa
```

Sebab header HMAC asal diteruskan tanpa ubah dan kedua-dua sistem pegang Client Secret yang sama, MvFlip mengesahkan signature **sama seperti terima terus dari Ninja Van**. Kalau suatu hari MvFlip ada akaun sendiri, cuma daftar URL MvFlip di dashboard — kod MvFlip tak perlu diubah.

Jika forward gagal (MvFlip down / bukan 2xx), E-Syifa pulangkan **500** → Ninja Van hantar semula event itu.

### 2.3 Token OAuth

- Ninja Van wajibkan token di-cache dalam storan kekal dan dijana semula hanya bila hampir luput (≤ 5 minit) atau bila 401.
- E-Syifa cache dalam DB sendiri; MvFlip cache dalam jadual `ninjavan_tokens` MvFlip. Dua cache, client ID sama.
- Kedua-dua sistem ada logik **401 → minta token baru sekali → ulang request**, jadi kalau Ninja Van membatalkan token lama bila token baru dikeluarkan, sistem akan pulih sendiri.
- **Pantau** log 7 hari pertama: jika nampak `token gagal` / 401 berulang-ulang silih berganti antara dua sistem, beritahu HQ — penyelesaiannya ialah MvFlip ambil token dari endpoint dalaman E-Syifa (belum dibina).

### 2.4 Kewangan & operasi (akaun gabung)

- **Invois kos pos & remittance COD** Ninja Van datang sebagai **satu akaun** (E-Syifa). Asingkan ikut tracking: penanda `M` = MvFlip. Tanda `transferred` dalam `cod_remittances` MvFlip secara manual seperti biasa.
- Dashboard Pos & COD E-Syifa tidak akan nampak parcel MvFlip (ia baca `ninjavan_shipments` E-Syifa sahaja) — itu betul.
- **Pengirim**: `from.name` / telefon = jenama MvFlip (tercetak pada waybill). Waybill diminta dengan `hide_shipper_details=true` (alamat & telefon pengirim disorok), sama seperti E-Syifa.
- **Pickup**: MvFlip kini hantar sendiri ke Ninja Point → `NINJAVAN_PICKUP_REQUIRED=false` (lalai dokumen ini). Jika mahu Ninja Van datang ambil di Kuantan, **sahkan dulu dengan Account Manager Ninja Van** sama ada akaun E-Syifa boleh pickup di alamat kedua — jangan hidupkan tanpa pengesahan.

---

## 3. (A) Perubahan di E-Syifa — relay webhook

Fail: `src/app/api/webhooks/ninjavan/route.js` (E-Syifa, Next.js). Tambah selepas JSON di-parse, **sebelum** `applyWebhookEvent`:

```js
// Parcel MvFlip (akaun NinjaVan dikongsi) — requested_tracking_number 9 aksara bermula 'M' (docs/ninjavan-port-mvflip.md)
const MVFLIP_WEBHOOK_URL = process.env.MVFLIP_NV_WEBHOOK_URL;
const isMvFlipParcel = t => typeof t === 'string' && t.length >= 9 && t.slice(-9).startsWith('M');

// ... dalam POST, selepas `payload = JSON.parse(rawBody)`:
if (MVFLIP_WEBHOOK_URL && isMvFlipParcel(payload.tracking_id)) {
  try {
    const res = await fetch(MVFLIP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ninjavan-Hmac-Sha256': req.headers.get('x-ninjavan-hmac-sha256'),
      },
      body: rawBody,                          // RAW — jangan JSON.stringify semula (HMAC akan rosak)
      signal: AbortSignal.timeout(2500),      // Ninja Van timeout 3 saat
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return NextResponse.json({ ok: true, relayed: 'mvflip' });
  } catch (e) {
    console.error('[ninjavan webhook] relay MvFlip gagal:', e.message);
    return NextResponse.json({ error: 'Relay failed' }, { status: 500 });   // Ninja Van akan cuba semula
  }
}
```

Env baharu E-Syifa (Netlify/Vercel + `.env.local.example`):

```
# Webhook parcel MvFlip (akaun NinjaVan dikongsi) — kosong = relay dimatikan
MVFLIP_NV_WEBHOOK_URL=https://<project-ref-mvflip>.supabase.co/functions/v1/ninjavan-webhook
```

Nota: event MvFlip **tidak** dilog dalam `ninjavan_events` E-Syifa (dilog di MvFlip). `src/middleware.js` sudah membenarkan `/api/webhooks` tanpa login — tiada perubahan.

---

## 4. (B) Secrets MvFlip

Set di Supabase MvFlip (`supabase secrets set ...` atau Dashboard → Edge Functions → Secrets). **Salin nilai credential sendiri dari env production E-Syifa — jangan tampal dalam chat, commit, atau fail repo.**

```
NINJAVAN_ENVIRONMENT=production
NINJAVAN_CLIENT_ID=<sama dengan E-Syifa NINJAVAN_CLIENT_ID>
NINJAVAN_CLIENT_SECRET=<sama dengan E-Syifa NINJAVAN_CLIENT_SECRET>
NINJAVAN_PICKUP_REQUIRED=false

# Pengirim (tercetak pada waybill sebagai nama pengirim) — jenama MvFlip
NINJAVAN_SENDER_NAME=MOLEK VENTURE
NINJAVAN_SENDER_PHONE=01XXXXXXXX
NINJAVAN_SENDER_EMAIL=<emel operasi MvFlip>
NINJAVAN_SENDER_ADDRESS1=No 14 Jalan Pandan Jaya 10
NINJAVAN_SENDER_ADDRESS2=Perkampungan Pandan Jaya
NINJAVAN_SENDER_CITY=Kuantan
NINJAVAN_SENDER_STATE=Pahang
NINJAVAN_SENDER_POSTCODE=25150
```

Buang `NINJAVAN_WEBHOOK_SECRET` — Ninja Van menandatangani webhook dengan **Client Secret**, bukan secret berasingan.
`scripts/ninjavan-sandbox-audit.mjs` tidak diperlukan lagi.

---

## 5. (C) Migration MvFlip — `sql/009_ninjavan_live.sql`

Dijalankan manual di Supabase SQL Editor **sebelum** deploy edge function.

```sql
-- 009: NinjaVan production (akaun E-Syifa dikongsi) — rekod parcel penuh, dedupe webhook, cache waybill
-- Rujukan: docs/ninjavan-port-mvflip.md (repo E-Syifa)

-- 1. cod_remittances = satu baris setiap parcel Ninja Van
ALTER TABLE public.cod_remittances
  ADD COLUMN IF NOT EXISTS requested_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS env              TEXT NOT NULL DEFAULT 'production',
  ADD COLUMN IF NOT EXISTS nv_status        TEXT,          -- 'status' webhook V2 (Pending Pickup, Delivered, ...)
  ADD COLUMN IF NOT EXISTS nv_event         TEXT,          -- 'event' penuh (cth 'Delivered, Received by Customer')
  ADD COLUMN IF NOT EXISTS is_terminal      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waybill_path     TEXT,          -- PDF dalam bucket ninjavan-waybills (WAJIB cache)
  ADD COLUMN IF NOT EXISTS request_payload  JSONB,
  ADD COLUMN IF NOT EXISTS response_payload JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS cod_remittances_requested_tn_key
  ON public.cod_remittances (requested_tracking_number) WHERE requested_tracking_number IS NOT NULL;

-- 2. Ralat push pada order (untuk paparan "perlu dibetulkan")
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS nv_error    TEXT,
  ADD COLUMN IF NOT EXISTS nv_error_at TIMESTAMPTZ;

-- 3. Webhook V2: dedupe event diulang Ninja Van
ALTER TABLE public.ninjavan_webhook_logs ADD COLUMN IF NOT EXISTS event_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS ninjavan_webhook_logs_dedupe
  ON public.ninjavan_webhook_logs (tracking_id, event, event_at);

-- 4. Token sandbox lama (akaun MOVEN) tidak dipakai lagi
DELETE FROM public.ninjavan_tokens WHERE environment = 'sandbox';

-- 5. Bucket persendirian untuk PDF waybill
INSERT INTO storage.buckets (id, name, public)
VALUES ('ninjavan-waybills', 'ninjavan-waybills', false)
ON CONFLICT (id) DO NOTHING;
```

> Parcel sandbox lama dalam `cod_remittances` / `orders.tracking_number` (prefix MOVEN) — semak dan kosongkan secara manual jika ada order sebenar yang tersangkut dengan tracking sandbox.

---

## 6. (D) Modul kongsi — `supabase/functions/_shared/ninjavan.ts`

Port terus `src/lib/ninjavan/api.js` E-Syifa (sudah lulus audit). Peraturan audit yang dipatuhi:
- token di-cache dalam DB, dijana semula 5 minit sebelum luput / bila 401 (sekali)
- 5xx / timeout / ralat rangkaian → cuba semula (maks 2, backoff 1s, 2s); **4xx → log & berhenti, jangan ulang**
- waybill diminta **sekali** setiap tracking, kemudian dibaca dari storage
- webhook disahkan HMAC-SHA256 **base64** atas RAW body

```ts
// Klien Ninja Van API — port src/lib/ninjavan/api.js (E-Syifa). Akaun production E-Syifa dikongsi.
// deno-lint-ignore-file no-explicit-any
type Db = any;

export const NV_ENV = Deno.env.get('NINJAVAN_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
const BASE = NV_ENV === 'production' ? 'https://api.ninjavan.co/my' : 'https://api-sandbox.ninjavan.co/sg';
export const TZ = 'Asia/Kuala_Lumpur';

const REFRESH_BEFORE_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;

export class NinjaVanError extends Error {
  status: number; body: unknown;
  constructor(message: string, { status = 0, body = null }: { status?: number; body?: unknown } = {}) {
    super(message); this.name = 'NinjaVanError'; this.status = status; this.body = body;
  }
}

function creds() {
  const clientId = Deno.env.get('NINJAVAN_CLIENT_ID')?.trim();
  const clientSecret = Deno.env.get('NINJAVAN_CLIENT_SECRET')?.trim();
  if (!clientId || !clientSecret) throw new NinjaVanError('NINJAVAN_CLIENT_ID / NINJAVAN_CLIENT_SECRET belum diset.');
  return { clientId, clientSecret };
}

export function errorMessageOf(body: any, fallback = 'Ralat NinjaVan'): string {
  const e = body?.error;
  if (!e) return typeof body === 'string' && body ? body.slice(0, 300) : fallback;
  const details = (e.details || []).map((d: any) => [d.field, d.message].filter(Boolean).join(': ')).filter(Boolean);
  return [e.message || e.title || fallback, ...details].join(' — ');
}

// ─── Token ───────────────────────────────────────────────────────────────────
let memToken: { token: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;
const isFresh = (t: { expiresAt: number } | null) => !!t && t.expiresAt - Date.now() > REFRESH_BEFORE_MS;

async function requestNewToken(db: Db): Promise<string> {
  const { clientId, clientSecret } = creds();
  const res = await fetch(`${BASE}/2.0/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },   // JSON, BUKAN form-urlencoded; tiada 'scope'
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    console.error('[ninjavan] token gagal', res.status, JSON.stringify(body));
    throw new NinjaVanError(`Gagal dapatkan token NinjaVan: ${errorMessageOf(body, `HTTP ${res.status}`)}`, { status: res.status, body });
  }
  // Guna tempoh luput SEBENAR dari Ninja Van (jangan anggap 23 jam)
  const expiresAt = body.expires ? body.expires * 1000 : Date.now() + (body.expires_in || 3600) * 1000;
  const { error } = await db.from('ninjavan_tokens').upsert(
    { environment: NV_ENV, access_token: body.access_token, expires_at: new Date(expiresAt).toISOString() },
    { onConflict: 'environment' });
  if (error) console.error('[ninjavan] simpan token gagal:', error.message);
  memToken = { token: body.access_token, expiresAt };
  return memToken.token;
}

export async function getToken(db: Db, { force = false } = {}): Promise<string> {
  if (!force) {
    if (isFresh(memToken)) return memToken!.token;
    const { data } = await db.from('ninjavan_tokens').select('access_token, expires_at').eq('environment', NV_ENV).maybeSingle();
    const stored = data && { token: data.access_token as string, expiresAt: new Date(data.expires_at).getTime() };
    if (isFresh(stored)) { memToken = stored; return stored.token; }
  }
  if (!inflight) inflight = requestNewToken(db).finally(() => { inflight = null; });
  return inflight;
}

// ─── Request ─────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function nvFetch(db: Db, path: string, { method = 'GET', json, binary = false }: { method?: string; json?: unknown; binary?: boolean } = {}) {
  let token = await getToken(db);
  let refreshed = false;
  for (let attempt = 0; ; attempt++) {
    let res: Response;
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
      // selamat diulang — requested_tracking_number menghalang order berganda
      if (attempt < MAX_RETRIES) { await sleep(1000 * 2 ** attempt); continue; }
      throw new NinjaVanError(`NinjaVan tidak dapat dihubungi: ${(e as Error).message}`);
    }
    if (res.status === 401 && !refreshed) { refreshed = true; token = await getToken(db, { force: true }); attempt--; continue; }
    if (res.status >= 500 && attempt < MAX_RETRIES) { await sleep(1000 * 2 ** attempt); continue; }

    if (binary && res.ok) return { status: res.status, body: new Uint8Array(await res.arrayBuffer()) };
    const text = await res.text();
    let body: any = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* bukan JSON */ }
    if (!res.ok) {
      console.error(`[ninjavan] ${method} ${path} → ${res.status}`, typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body));
      throw new NinjaVanError(errorMessageOf(body, `HTTP ${res.status}`), { status: res.status, body });
    }
    return { status: res.status, body };
  }
}

// ─── Endpoint ────────────────────────────────────────────────────────────────
export async function createOrder(db: Db, payload: unknown) {
  return (await nvFetch(db, '/4.2/orders', { method: 'POST', json: payload })).body;
}
/** Hanya parcel yang belum diambil kurier (Pending Pickup / Pickup Exception) boleh dibatalkan */
export async function cancelOrder(db: Db, trackingNumber: string) {
  return (await nvFetch(db, `/2.2/orders/${encodeURIComponent(trackingNumber)}`, { method: 'DELETE' })).body;
}
/** PDF waybill — panggil SEKALI per tracking, simpan & guna semula */
export async function fetchWaybillPdf(db: Db, trackingNumber: string): Promise<Uint8Array> {
  const qs = new URLSearchParams({ tid: trackingNumber, hide_shipper_details: 'true' });
  return (await nvFetch(db, `/2.0/reports/waybill?${qs}`, { binary: true })).body as Uint8Array;
}

// ─── Webhook ─────────────────────────────────────────────────────────────────
/** X-Ninjavan-Hmac-Sha256 = base64(HMAC-SHA256(raw body, CLIENT SECRET)) */
export async function verifyWebhook(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(creds().clientSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(rawBody)));
  let given: Uint8Array;
  try { given = Uint8Array.from(atob(signature.trim()), c => c.charCodeAt(0)); } catch { return false; }
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
  return diff === 0;
}

// ─── Bantuan payload ─────────────────────────────────────────────────────────
export const todayMY = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()); // yyyy-MM-dd

/** E.164 Malaysia: 0123456789 / 60123456789 / 123456789 → +60123456789 */
export function e164(phone: string): string {
  const d = String(phone || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('60')) return `+${d}`;
  if (d.startsWith('0')) return `+6${d}`;
  return `+60${d}`;
}

export function senderInfo() {
  const env = (k: string) => Deno.env.get(k) || '';
  const missing = ['NINJAVAN_SENDER_NAME', 'NINJAVAN_SENDER_PHONE', 'NINJAVAN_SENDER_EMAIL', 'NINJAVAN_SENDER_ADDRESS1', 'NINJAVAN_SENDER_POSTCODE'].filter(k => !env(k));
  if (missing.length) throw new NinjaVanError(`Maklumat pengirim belum diset: ${missing.join(', ')}`);
  return {
    name: env('NINJAVAN_SENDER_NAME'),
    phone_number: e164(env('NINJAVAN_SENDER_PHONE')),
    email: env('NINJAVAN_SENDER_EMAIL'),
    address: {
      address1: env('NINJAVAN_SENDER_ADDRESS1'), address2: env('NINJAVAN_SENDER_ADDRESS2'),
      area: env('NINJAVAN_SENDER_AREA'), city: env('NINJAVAN_SENDER_CITY'), state: env('NINJAVAN_SENDER_STATE'),
      address_type: 'office', country: 'MY', postcode: env('NINJAVAN_SENDER_POSTCODE'),
    },
  };
}

/** Status V2 Ninja Van → status cod_remittances MvFlip (logik sama dengan statusGroupOf E-Syifa) */
export function mapStatus(status?: string, event?: string): string {
  const s = status || event || '';
  if (s === 'Cancelled' || event === 'Cancelled') return 'cancelled';
  if (s === 'Delivered' || event?.startsWith('Delivered')) return 'delivered';
  if (s === 'Returned to Sender' || event === 'Returned to Sender') return 'returned';
  if (event === 'Delivery Exception, Return to Sender Initiated' || s === 'Return to Shipper Exception') return 'return_initiated';
  if (['Created', 'Pending Pickup', 'Driver dispatched for Pickup', 'Pickup Exception'].includes(s)) return 'pending';
  if (s === 'On Vehicle for Delivery' || s === 'Delivery Exception') return 'on_delivery';
  return 'picked_up';
}

const TERMINAL_EVENTS = new Set([
  'Pickup Exception, Max Attempts Reached', 'Returned to Sender', 'Cancelled',
  'International Transit, Returned to Sender at Origin Facility', 'International Transit, Returned to XB Warehouse',
]);
export const isTerminal = (event?: string) => !!event && (event.startsWith('Delivered') || TERMINAL_EVENTS.has(event));
export const INFO_ONLY_EVENTS = new Set(['Parcel Measurements Update']);   // dilog sahaja, tak ubah status

/** "2024-11-21T11:45:40+0800" → Date */
export function parseNvTime(ts?: string): Date {
  if (!ts) return new Date();
  const d = new Date(String(ts).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
```

---

## 7. (E) Edge functions MvFlip

Semua guna `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` dan `corsHeaders` sedia ada. `verify_jwt = true` untuk shipment/cancel/waybill (dipanggil dari dashboard), `false` untuk webhook (dah ada dalam `supabase/config.toml`). Tambah dalam `config.toml`:

```toml
[functions.ninjavan-cancel]
verify_jwt = true

[functions.ninjavan-waybill]
verify_jwt = true
```

### 7.1 `ninjavan-shipment` (tulis semula)

Input kekal `{ orderId }` (UI sedia ada tak perlu ubah). Aliran:

1. Ambil order: `id, nama, no_telefon, alamat, kawasan, negeri, poskod, pakej, product_name, qty, order_items, payment_method, payment_status, amount, tracking_number, is_returned`.
2. Semakan (pulang 400 dengan mesej Melayu, dan tulis `orders.nv_error`):
   - `payment_method = 'cod'`, **atau** FPX yang `payment_status` selesai (kalau MvFlip mahu FPX juga dihantar melalui API — sekarang COD sahaja; kekalkan guard COD jika itu keputusan owner).
   - `poskod` 5 digit, `no_telefon` ≥ 9 digit, `alamat` tidak kosong, `is_returned` false.
3. **Idempotensi**: cari `cod_remittances` order ini yang `status <> 'cancelled'` → jika ada, pulang tracking sedia ada (200, `created:false`), jangan cipta lagi.
4. `attempt` = bilangan baris `cod_remittances` order ini dengan `status = 'cancelled'`. Bina `requested` (§2.1).
5. Bina payload (sama struktur dengan `buildOrderPayload` E-Syifa):

```ts
const pickup = Deno.env.get('NINJAVAN_PICKUP_REQUIRED') === 'true';
const today = todayMY();
const cod = order.payment_method === 'cod' ? Math.round(Number(order.amount)) / 100 : 0;   // amount dalam SEN → RM
const itemText = String(order.pakej || order.product_name || 'Parcel').replace(/\n/g, ' · ');
const payload = {
  service_type: 'Parcel',
  service_level: 'Standard',
  requested_tracking_number: requested,
  reference: { merchant_order_number: order.id },
  from: senderInfo(),
  to: {
    name: order.nama,
    phone_number: e164(order.no_telefon),
    address: {
      address1: order.alamat, address2: '', area: '',
      city: order.kawasan || order.negeri || '', state: order.negeri || '',
      address_type: 'home', country: 'MY', postcode: order.poskod,
    },
  },
  parcel_job: {
    is_pickup_required: pickup,
    ...(pickup ? {
      pickup_service_type: 'Scheduled', pickup_service_level: 'Standard', pickup_date: today,
      pickup_timeslot: { start_time: '09:00', end_time: '22:00', timezone: TZ },
    } : {}),
    delivery_start_date: today,
    delivery_timeslot: { start_time: '09:00', end_time: '22:00', timezone: TZ },
    // Ruangan "Comments" pada waybill = delivery_instructions → produk & kuantiti untuk packing
    delivery_instructions: itemText.slice(0, 255),
    ...(cod > 0 ? { cash_on_delivery: cod, cash_on_delivery_currency: 'MYR' } : {}),
    dimensions: { weight: 1 },
    items: [{ item_description: itemText.slice(0, 255), quantity: Number(order.qty) || 1, is_dangerous_good: false }],
  },
};
```

> Jangan hantar `email` palsu (`order…@customer.com`) — `to.email` pilihan, tinggalkan kosong.

6. `createOrder(db, payload)`:
   - **Gagal** → `orders.nv_error = e.message`, pulang 400 (jika `e.status` 4xx) atau 502. Jangan cuba semula untuk 4xx.
   - **Berjaya** → upsert `cod_remittances` (`onConflict: 'tracking_number'`):
     `{ order_id, tracking_number: res.tracking_number, requested_tracking_number: requested, env: NV_ENV, cod_amount: order.amount /*sen*/, status: 'pending', nv_status: 'Created', is_terminal: false, request_payload: payload, response_payload: res }`
   - kemas kini `orders`: `tracking_number`, `shipment_status: 'shipped'`, `ninjavan_exported_at: now`, `nv_error: null`.
7. Pulang `{ success: true, tracking_number, created: true, environment: NV_ENV }`.

### 7.2 `ninjavan-cancel` (baru)

Input `{ orderId }`.
1. Parcel aktif = `cod_remittances` order itu, `status NOT IN ('cancelled')`, terkini.
2. Hanya boleh jika `status = 'pending'` (belum diambil kurier). Lain → 400 "Parcel dah diambil kurier — hubungi Ninja Van".
3. `cancelOrder(db, tracking_number)`.
4. `cod_remittances`: `status 'cancelled', nv_status 'Cancelled', nv_event 'Cancelled', is_terminal true, cancelled_at now`.
5. `orders`: `tracking_number null, shipment_status 'pending', ninjavan_exported_at null` → order boleh dihantar semula (attempt +1 → aksara akhir tracking bertukar).

### 7.3 `ninjavan-waybill` (baru)

Input `{ orderIds: string[] }` (maks 25 setiap panggilan).
1. Untuk setiap order: parcel aktif (bukan `cancelled`).
2. Jika `waybill_path` ada → `db.storage.from('ninjavan-waybills').download(path)`.
   Jika tiada → `fetchWaybillPdf(db, tracking)` → upload ke `production/<tracking>_h.pdf` → simpan `waybill_path`. (**Wajib**: API waybill dipanggil sekali sahaja setiap tracking.)
3. Gabung PDF dengan `pdf-lib` (`import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'`), 5 serentak, kekalkan urutan.
4. Pulang `Content-Type: application/pdf`; ralat sebahagian dalam header `X-Waybill-Errors` (rujuk `src/lib/ninjavan/waybill.js` E-Syifa).

Di UI: `supabase.functions.invoke('ninjavan-waybill', { body: { orderIds } })` → `data` ialah `Blob` → `URL.createObjectURL(data)` → buka tab baharu. Buka tetingkap (`window.open('', '_blank')`) **sebelum** `await` untuk elak penyekat pop-up (lihat `src/lib/ninjavan/waybill-client.js`).

### 7.4 `ninjavan-webhook` (tulis semula)

Kod sedia ada ada 4 masalah serius: HMAC hex (patut base64), lulus bila tiada signature, peta status V1 (`Completed`, `Delivery Fail`) yang tak wujud dalam webhook V2, dan sentiasa pulang 200 walaupun gagal (Ninja Van tak cuba semula).

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyWebhook, mapStatus, isTerminal, INFO_ONLY_EVENTS, parseNvTime } from '../_shared/ninjavan.ts';

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

// Diterima terus dari Ninja Van ATAU di-relay oleh E-Syifa (body & header HMAC asal).
// 200 = diterima · 401 = signature salah · 500 = minta hantar semula
serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const rawBody = await req.text();
  if (!(await verifyWebhook(rawBody, req.headers.get('x-ninjavan-hmac-sha256')))) {
    console.error('[ninjavan-webhook] signature tidak sah');
    return json({ error: 'Invalid signature' }, 401);
  }
  let p: any;
  try { p = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const tracking = p.tracking_id;
  if (!tracking) return json({ ok: true, ignored: 'tiada tracking_id' });
  const event = p.event || p.status;
  const at = parseNvTime(p.timestamp).toISOString();
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const { error: logErr } = await db.from('ninjavan_webhook_logs').insert({
      tracking_id: tracking, event, status: p.status || null, event_at: at, raw_payload: p, processed: false,
    });
    if (logErr?.code === '23505') return json({ ok: true, duplicate: true });   // event diulang
    if (logErr) throw new Error(logErr.message);
    if (INFO_ONLY_EVENTS.has(event)) return json({ ok: true, logged: true });

    const mapped = mapStatus(p.status, event);
    const patch: Record<string, unknown> = {
      nv_status: p.status || event, nv_event: event, is_terminal: isTerminal(event),
      last_webhook_event: event, last_webhook_at: at, updated_at: new Date().toISOString(),
      ...(mapped === 'picked_up' ? { picked_up_at: at } : {}),
      ...(mapped === 'delivered' ? { delivered_at: at, collected_at: at } : {}),
      ...(mapped === 'return_initiated' ? { return_initiated_at: at } : {}),
      ...(mapped === 'returned' ? { returned_at: at } : {}),
      ...(mapped === 'cancelled' ? { cancelled_at: at } : {}),
    };
    // Event lama (tiba lewat) tidak menimpa status semasa
    const { data: rows, error: upErr } = await db.from('cod_remittances').update(patch)
      .eq('tracking_number', tracking)
      .or(`last_webhook_at.is.null,last_webhook_at.lte."${at}"`)
      .select('id, order_id, status');
    if (upErr) throw new Error(upErr.message);

    for (const r of rows || []) {
      // 'transferred' ditanda manual oleh owner (COD diterima) — jangan timpa
      if (r.status !== 'transferred') await db.from('cod_remittances').update({ status: mapped }).eq('id', r.id);
      if (!r.order_id) continue;
      const orderStatus = ({ pending: 'pending', picked_up: 'shipped', on_delivery: 'shipped', delivered: 'delivered',
        return_initiated: 'return_initiated', returned: 'returned', cancelled: 'cancelled' } as Record<string, string>)[mapped] || 'shipped';
      if (mapped === 'cancelled') {
        // Dibatal dari dashboard Ninja Van → buka semula order untuk dihantar semula
        await db.from('orders').update({ tracking_number: null, shipment_status: 'pending', ninjavan_exported_at: null })
          .eq('id', r.order_id).eq('tracking_number', tracking);
      } else {
        await db.from('orders').update({ shipment_status: orderStatus }).eq('id', r.order_id);
      }
    }
    await db.from('ninjavan_webhook_logs').update({ processed: true })
      .eq('tracking_id', tracking).eq('event', event).eq('event_at', at);
    return json({ ok: true, updated: rows?.length || 0 });
  } catch (e) {
    console.error('[ninjavan-webhook] gagal proses:', (e as Error).message);
    return json({ error: 'Processing failed' }, 500);
  }
});
```

> Kerja dalam webhook mesti ringkas — Ninja Van timeout **3 saat**, dan relay E-Syifa beri 2.5 saat.

---

## 8. (F) UI MvFlip — `src/pages/Orders.tsx`

- Butang sedia ada "Hantar ke Ninja Van" (`functions.invoke('ninjavan-shipment')`) kekal. Paparkan `created:false` sebagai "Dah ada tracking".
- Tambah **Cetak Waybill** (pilih beberapa order → `ninjavan-waybill`, kumpulan 25).
- Tambah **Batal Parcel** (hanya bila `cod_remittances.status = 'pending'`) → `ninjavan-cancel`, dengan dialog pengesahan.
- Paparkan `orders.nv_error` (merah) supaya order yang ditolak boleh dibetulkan alamat/telefonnya lalu dihantar semula.
- Export CSV Ninja Van lama boleh dikekalkan sebagai sandaran, tapi **jangan** guna kedua-dua cara untuk order yang sama (parcel berganda).

---

## 9. (G) Turutan go-live & ujian

1. **E-Syifa**: tambah relay (§3) + set `MVFLIP_NV_WEBHOOK_URL` → deploy. (Selamat dideploy dahulu — tiada parcel `M` lagi, jadi tiada kesan.)
2. **MvFlip**: owner jalankan `sql/009_ninjavan_live.sql` di Supabase.
3. **MvFlip**: set secrets (§4) → deploy `ninjavan-shipment`, `ninjavan-webhook`, `ninjavan-cancel`, `ninjavan-waybill`.
4. **Ujian 1 — cipta & batal** (tiada kos): pilih satu order COD sebenar → Hantar ke Ninja Van.
   - Semak `tracking_number` dipulang dan **berakhir dengan** `requested_tracking_number` (cth `…M1A2B3C40`). Jika tidak, **hentikan** — relay §3 bergantung pada ini.
   - Dalam ~1 minit, `ninjavan_webhook_logs` MvFlip patut terima event `Pending Pickup` (melalui relay E-Syifa). Log E-Syifa patut tunjuk tiada ralat `relay MvFlip gagal`.
   - Cetak Waybill → PDF keluar, nama pengirim = jenama MvFlip, alamat pengirim disorok, ruangan Comments = produk.
   - Batal Parcel → status `cancelled`, order kembali boleh dihantar; Hantar semula → tracking baharu berakhir `…1`.
5. **Ujian 2 — parcel sebenar**: hantar satu parcel dan ikut sampai `Delivered` di MvFlip.
6. Pantau 7 hari: 401 token berulang (§2.3), event tidak sampai, ralat relay.

---

## 10. Jadual perbezaan: kod MvFlip sekarang vs yang betul

| Isu dalam kod MvFlip sedia ada | Betulkan kepada |
|---|---|
| `requested_tracking_number = orderId.slice(0,9)` — boleh berlaga dengan E-Syifa, tiada cubaan semula selepas batal | `M` + 7 hex + aksara cubaan (§2.1) |
| Token diminta form-urlencoded + `scope` | JSON, tanpa `scope` (§6) |
| Tempoh token diandaikan 23 jam | Guna `expires` / `expires_in` sebenar |
| 401 → padam cache & throw; tiada retry 5xx/timeout | `nvFetch`: 401 → refresh sekali; 5xx/timeout → ulang 2× backoff |
| Pengirim hardcode, telefon placeholder `+601XXXXXXXX` | `NINJAVAN_SENDER_*` secrets |
| Telefon `0…` → `+6…` betul, tapi `60…`/tanpa 0 tidak konsisten | `e164()` |
| `to.email` palsu `order…@customer.com` | Tinggalkan kosong |
| COD tanpa `cash_on_delivery_currency` | Tambah `'MYR'` |
| Tiada `delivery_instructions` → produk tak tercetak pada waybill | `delivery_instructions = pakej` |
| Webhook HMAC **hex** dengan `NINJAVAN_WEBHOOK_SECRET` | HMAC **base64** dengan **Client Secret** |
| Webhook lulus bila tiada signature / signature salah | 401, tidak diproses |
| Peta status V1 (`Completed`, `Delivery Fail`) | `mapStatus()` V2 (§6) |
| Webhook sentiasa 200 walaupun gagal | 500 bila gagal → Ninja Van hantar semula |
| Tiada dedupe / tiada lindungan event lewat | Unique index + guard `last_webhook_at` |
| Tiada batal parcel & waybill API | `ninjavan-cancel`, `ninjavan-waybill` (waybill di-cache) |

---

## 11. Rujukan fail E-Syifa

| Fail | Isi |
|---|---|
| `src/lib/ninjavan/api.js` | Klien API (token, retry, create/cancel/waybill, HMAC) — sumber §6 |
| `src/lib/ninjavan/shipments.js` | Bina payload, idempotensi, cache waybill, proses webhook, batal |
| `src/lib/ninjavan/waybill.js` / `waybill-client.js` | Gabung PDF waybill (server / pelayar) |
| `src/app/api/webhooks/ninjavan/route.js` | Endpoint webhook (tempat relay §3) |
| `src/lib/shipping-validate.js` | Semakan alamat/telefon sebelum push (boleh di-port jika mahu semakan lebih ketat) |
| `sql/029_ninjavan_api.sql`, `036`, `042` | Skema rujukan |
