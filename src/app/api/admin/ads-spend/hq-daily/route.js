import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { monthRange, fetchProductCosts, buildMonthlyBreakdown } from '@/lib/products';

// GET /api/admin/ads-spend/hq-daily?month=YYYY-MM
// Page Kos Ads HQ: order HQ (marketer_id NULL) + ads HQ ikut produk, harian 1hb → hujung bulan.
export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const range = monthRange(new URL(req.url).searchParams.get('month'));

    const [{ data: subs }, { data: ads }, costs] = await Promise.all([
      adminClient.from('submissions')
        .select('amount_paid, notes, problem, source, qty, payment_type, created_at')
        .is('marketer_id', null)
        .eq('payment_status', 'completed')
        .in('payment_type', ['fpx_payment', 'cod'])
        .gte('created_at', range.from)
        .lte('created_at', range.to),
      adminClient.from('ads_spend')
        .select('amount, spend_date, product')
        .is('marketer_id', null)
        .gte('spend_date', range.firstDay)
        .lte('spend_date', range.lastDay),
      fetchProductCosts(adminClient),
    ]);

    const { days, productSummary } = buildMonthlyBreakdown({ subs: subs || [], ads: ads || [], range, costs });

    const sum = k => parseFloat(days.reduce((t, d) => t + d[k], 0).toFixed(2));
    const totals = { orders: sum('orders'), sales: sum('sales'), ads: sum('ads'), cogs: sum('cogs'), profit: sum('profit') };
    totals.roas = totals.ads > 0 ? parseFloat((totals.sales / totals.ads).toFixed(2)) : null;

    return NextResponse.json({ success: true, month: range.month, totals, productSummary, days });
  } catch (error) {
    console.error('GET hq-daily error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
