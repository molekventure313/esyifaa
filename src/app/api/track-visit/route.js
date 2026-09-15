import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/track-visit
 * Record page view untuk salespage. Dipanggil dari setiap salespage layout.
 * Fail silently — jangan crash salespage jika tracking gagal.
 *
 * Body: { slug: 'sihir' }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { slug, marketer_code } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug required' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    const adminClient = createAdminClient();

    let marketerId = null;
    if (marketer_code) {
      const { data: marketer } = await adminClient
        .from('profiles')
        .select('id')
        .eq('marketer_code', marketer_code)
        .eq('role', 'marketer')
        .maybeSingle();
      
      if (marketer) {
        marketerId = marketer.id;
      }
    }

    const { error } = await adminClient.from('page_views').insert({
      salespage_slug: slug,
      ip_address:     ip,
      user_agent:     userAgent,
      marketer_id:    marketerId,
    });

    if (error) {
      // Table mungkin belum wujud — log tapi jangan crash
      console.warn('[track-visit] Insert error (table exists?):', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[track-visit] Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
