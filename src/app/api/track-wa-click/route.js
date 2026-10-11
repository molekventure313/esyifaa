import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productOf } from '@/lib/products';
import { sendAttributedCAPIEvent } from '@/lib/tracking/attributed';

/**
 * POST /api/track-wa-click — public
 * Rekod klik butang WhatsApp di SP + UTM, dan hantar Meta `Lead` melalui Conversions API
 * (pixel marketer untuk link marketer, pixel HQ untuk SP HQ). event_id sama dgn pixel browser → dedup.
 * Dihantar guna navigator.sendBeacon — fail silently, jangan ganggu SP.
 *
 * Body: { source, marketer_code, utm_*, fbclid, event_id, content_name, page_url, fbp, fbc }
 */
const str = (v, max = 300) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

export async function POST(req) {
  try {
    let body = {};
    try { body = JSON.parse(await req.text()); } catch (_) { /* body kosong / tak sah */ }

    const adminClient = createAdminClient();

    let marketerId = null;
    const code = str(body.marketer_code, 64)?.toLowerCase();
    if (code) {
      const { data } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('marketer_code', code)
        .eq('role', 'marketer')
        .maybeSingle();
      marketerId = data?.id || null;
    }

    const source = str(body.source, 64);
    const { error } = await adminClient.from('wa_clicks').insert({
      marketer_id:  marketerId,
      source,
      product:      productOf(source),
      utm_source:   str(body.utm_source),
      utm_medium:   str(body.utm_medium),
      utm_campaign: str(body.utm_campaign),
      utm_content:  str(body.utm_content),
      utm_term:     str(body.utm_term),
      fbclid:       str(body.fbclid, 500),
      ip_address:   req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null,
      user_agent:   str(req.headers.get('user-agent'), 500),
    });
    if (error) console.warn('[track-wa-click] insert error:', error.message);

    // Lead melalui CAPI — tak bergantung pada pixel browser (telefon terus buka WhatsApp)
    const eventId = str(body.event_id, 100);
    if (eventId) {
      const fbclid = str(body.fbclid, 500);
      try {
        await sendAttributedCAPIEvent({
          supabase: adminClient, marketerId, hqPixel: 'main',
          event: {
            eventName: 'Lead',
            eventId,
            sourceUrl: str(body.page_url, 1000) || req.headers.get('referer') || undefined,
            clientIpAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined,
            clientUserAgent: req.headers.get('user-agent') || undefined,
            fbp: str(body.fbp, 200) || undefined,
            fbc: str(body.fbc, 500) || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
            customData: { content_name: str(body.content_name, 120) || 'WhatsApp' },
          },
        });
      } catch (e) {
        console.warn('[track-wa-click] CAPI Lead error:', e.message);
      }
    }
    return NextResponse.json({ success: !error });
  } catch (err) {
    console.error('[track-wa-click] error:', err.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
