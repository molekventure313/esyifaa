import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRODUCTS, PRODUCT_KEYS, productOf } from '@/lib/products';
import { parseAmount } from '@/lib/marketer-calc';

// GET /api/admin/ads-spend/hq-daily?month=YYYY-MM
// Jadual harian HQ (marketer_id NULL): sales produk fizikal + ads ikut produk, 1hb → hujung bulan.
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

    const todayMY = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
    const monthParam = new URL(req.url).searchParams.get('month') || todayMY.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json({ success: false, error: 'Bulan tidak sah' }, { status: 400 });
    }
    const [year, month] = monthParam.split('-');
    const lastDayNum = new Date(Date.UTC(parseInt(year), parseInt(month), 0)).getUTCDate();
    const firstStr = `${year}-${month}-01`;
    const lastStr  = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`;

    const [{ data: subs }, { data: ads }] = await Promise.all([
      adminClient.from('submissions')
        .select('amount_paid, notes, source, created_at')
        .is('marketer_id', null)
        .eq('payment_status', 'completed')
        .in('payment_type', ['fpx_payment', 'cod'])
        .gte('created_at', `${firstStr}T00:00:00+08:00`)
        .lte('created_at', `${lastStr}T23:59:59+08:00`),
      adminClient.from('ads_spend')
        .select('amount, spend_date, product')
        .is('marketer_id', null)
        .gte('spend_date', firstStr)
        .lte('spend_date', lastStr),
    ]);

    const days = [];
    for (let i = 1; i <= lastDayNum; i++) {
      const date = `${year}-${month}-${String(i).padStart(2, '0')}`;
      const daySubs = (subs || []).filter(s =>
        productOf(s.source) &&
        new Date(new Date(s.created_at).getTime() + 8 * 3600 * 1000).toISOString().split('T')[0] === date
      );
      const adsByProduct = Object.fromEntries(PRODUCT_KEYS.map(k => [k, 0]));
      (ads || []).filter(a => a.spend_date === date).forEach(a => {
        const k = PRODUCT_KEYS.includes(a.product) ? a.product : 'sabun-garam';
        adsByProduct[k] += parseFloat(a.amount) || 0;
      });
      days.push({
        date,
        orders: daySubs.length,
        sales: parseFloat(daySubs.reduce((t, s) => t + parseAmount(s), 0).toFixed(2)),
        adsByProduct,
        ads: parseFloat(Object.values(adsByProduct).reduce((t, v) => t + v, 0).toFixed(2)),
        isFuture: date > todayMY,
        isToday: date === todayMY,
      });
    }

    return NextResponse.json({ success: true, month: monthParam, products: PRODUCTS, days });
  } catch (error) {
    console.error('GET hq-daily error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
