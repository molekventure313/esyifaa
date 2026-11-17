import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhook } from '@/lib/ninjavan/api';
import { applyWebhookEvent } from '@/lib/ninjavan/shipments';

// Webhook V2 NinjaVan — satu URL untuk semua event (daftar di Dashboard NinjaVan → Settings → IT Settings → Webhooks).
// NinjaVan timeout 3 saat: kerja di sini ringkas (log + kemas kini status). Signature disahkan atas RAW body.
// Respons: 200 = diterima · 401 = signature salah (tiada retry) · 500 = minta NinjaVan hantar semula.
export const dynamic = 'force-dynamic';

// Parcel MvFlip (akaun NinjaVan dikongsi) — requested_tracking_number 9 aksara bermula 'M' (docs/ninjavan-port-mvflip.md).
// Body & header HMAC asal diteruskan tanpa ubah; MvFlip sahkan sendiri dengan Client Secret yang sama.
const MVFLIP_WEBHOOK_URL = process.env.MVFLIP_NV_WEBHOOK_URL;
const isMvFlipParcel = t => typeof t === 'string' && t.length >= 9 && t.slice(-9).startsWith('M');

async function relayToMvFlip(rawBody, signature) {
  const res = await fetch(MVFLIP_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Ninjavan-Hmac-Sha256': signature },
    body: rawBody,                          // RAW — jangan stringify semula (HMAC rosak)
    signal: AbortSignal.timeout(2500),      // NinjaVan timeout 3 saat
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-ninjavan-hmac-sha256');
  if (!verifyWebhook(rawBody, signature)) {
    console.error('[ninjavan webhook] signature tidak sah');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (MVFLIP_WEBHOOK_URL && isMvFlipParcel(payload?.tracking_id)) {
    try {
      await relayToMvFlip(rawBody, signature);
      return NextResponse.json({ ok: true, relayed: 'mvflip' });
    } catch (e) {
      console.error('[ninjavan webhook] relay MvFlip gagal:', e.message);
      return NextResponse.json({ error: 'Relay failed' }, { status: 500 });   // NinjaVan akan cuba semula
    }
  }

  try {
    const out = await applyWebhookEvent(createAdminClient(), payload);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    console.error('[ninjavan webhook] gagal proses:', e.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
