import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhook } from '@/lib/ninjavan/api';
import { applyWebhookEvent } from '@/lib/ninjavan/shipments';

// Webhook V2 NinjaVan — satu URL untuk semua event (daftar di Dashboard NinjaVan → Settings → IT Settings → Webhooks).
// NinjaVan timeout 3 saat: kerja di sini ringkas (log + kemas kini status). Signature disahkan atas RAW body.
// Respons: 200 = diterima · 401 = signature salah (tiada retry) · 500 = minta NinjaVan hantar semula.
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const rawBody = await req.text();
  if (!verifyWebhook(rawBody, req.headers.get('x-ninjavan-hmac-sha256'))) {
    console.error('[ninjavan webhook] signature tidak sah');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const out = await applyWebhookEvent(createAdminClient(), payload);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    console.error('[ninjavan webhook] gagal proses:', e.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
