import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/public/marketer-contact?m=<kod>
// Public — pulangkan no. WhatsApp SP untuk SATU marketer sahaja (null kalau belum isi / kod tak wujud).
// Dipakai section "Nak order melalui WhatsApp?" & butang WhatsApp terapung di SP marketer.
const CDN_CACHE = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET(req) {
  const code = (new URL(req.url).searchParams.get('m') || '').toLowerCase().trim();
  if (!code) return NextResponse.json({ whatsapp: null }, { headers: CDN_CACHE });

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('profiles')
      .select('marketer_whatsapp')
      .ilike('marketer_code', code)
      .eq('role', 'marketer')
      .maybeSingle();

    return NextResponse.json({ whatsapp: data?.marketer_whatsapp || null }, { headers: CDN_CACHE });
  } catch (e) {
    console.error('GET /api/public/marketer-contact error:', e.message);
    // Ralat → anggap tiada nombor (section disembunyikan, bukan fallback ke HQ)
    return NextResponse.json({ whatsapp: null }, { status: 500 });
  }
}
