import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertDailyAds } from '@/lib/products';

// Ads HQ (marketer_id NULL) ikut produk — diisi dari page Kos Ads HQ (/dashboard/admin/ads).
// Data paparan: /api/admin/ads-spend/hq-daily

// PUT — ads HQ SATU hari untuk SATU produk (jadual harian page Kos Ads HQ)
// Body: { spend_date, product, amount }. amount kosong/0 → padam.
export async function PUT(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { spend_date, product, amount } = await req.json();
    try {
      const data = await upsertDailyAds(adminClient, { marketerId: null, spendDate: spend_date, product, amount, userId: user.id });
      return NextResponse.json({ success: true, data });
    } catch (e) {
      return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
  } catch (error) {
    console.error('PUT ads-spend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
