import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseAmount, calcCOGS as calcCOGSShared } from '@/lib/marketer-calc';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role, full_name').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    // Build date range — Malaysia UTC+8
    const DAY_MS  = 86400000;
    const myNow   = new Date(Date.now() + 8 * 3600 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    let dateTo   = null;

    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
      dateTo   = `${todayStr}T23:59:59+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow.getTime() - DAY_MS);
      const yStr = yest.toISOString().split('T')[0];
      dateFrom = `${yStr}T00:00:00+08:00`;
      dateTo   = `${yStr}T23:59:59+08:00`;
    } else if (period === 'week') {
      // Last 7 days — konsisten dgn semua route lain
      const wStr = new Date(Date.now() - 6 * DAY_MS).toISOString().split('T')[0];
      dateFrom = `${wStr}T00:00:00+08:00`;
      dateTo   = `${todayStr}T23:59:59+08:00`;
    } else if (period === 'month') {
      const mStr = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01`;
      dateFrom = `${mStr}T00:00:00+08:00`;
      dateTo   = `${todayStr}T23:59:59+08:00`;
    }
    // 'all' → no date filter

    // Build queries — select all fields needed for COGS + parseAmount
    let subsQ = adminClient
      .from('submissions')
      .select('id, amount_paid, notes, problem, source, qty, payment_type, full_name, phone, payment_status, created_at')
      .eq('marketer_id', user.id)
      .in('payment_type', ['fpx_payment', 'cod'])
      .order('created_at', { ascending: false });

    let adsQ = adminClient
      .from('ads_spend')
      .select('amount, spend_date')
      .eq('marketer_id', user.id);

    if (dateFrom) { subsQ = subsQ.gte('created_at', dateFrom); adsQ = adsQ.gte('spend_date', dateFrom.split('T')[0]); }
    if (dateTo)   { subsQ = subsQ.lte('created_at', dateTo);   adsQ = adsQ.lte('spend_date', dateTo.split('T')[0]); }

    // Fetch submissions, ads, and product costs in parallel
    const [{ data: submissions }, { data: adsSpend }, stockRes] = await Promise.all([
      subsQ,
      adsQ,
      adminClient.from('stock_summary').select('sku, avg_cost_per_unit').in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']),
    ]);

    const subs = submissions || [];
    const ads  = adsSpend  || [];

    // Build cost map
    const stockMap    = {};
    (stockRes.data || []).forEach(s => { stockMap[s.sku] = parseFloat(s.avg_cost_per_unit || 0); });
    const sabunCost   = stockMap['SGH-200G'] || 0;
    const kasturiCost = stockMap['KKE-01']   || 0;
    const garamCost   = stockMap['GPM-500G'] || 0;

    // COGS calculator — sabun + kasturi + garam + postage
    const calcCOGS = (arr) => calcCOGSShared(arr, { sabunCost, kasturiCost, garamCost });

    // Completed orders only untuk calculations
    const completedSubs = subs.filter(s => s.payment_status === 'completed');
    const totalOrders   = completedSubs.length;
    const totalRevenue  = parseFloat(completedSubs.reduce((sum, s) => sum + parseAmount(s), 0).toFixed(2));
    const totalAdsSpend = parseFloat(ads.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0).toFixed(2));
    const totalCOGS     = calcCOGS(completedSubs);
    const profit        = parseFloat((totalRevenue - totalAdsSpend - totalCOGS).toFixed(2));

    // Recent orders — completed only, dengan parsed amount
    const recentOrders = completedSubs
      .slice(0, 10)
      .map(s => ({ ...s, amount: parseAmount(s) }));

    // Sales by source — guna parseAmount untuk revenue yang betul
    const sourceMap = {};
    completedSubs.forEach(s => {
      const src = s.source || 'Lain-lain';
      if (!sourceMap[src]) sourceMap[src] = { source: src, count: 0, revenue: 0 };
      sourceMap[src].count   += 1;
      sourceMap[src].revenue += parseAmount(s);
    });
    const salesBySource = Object.values(sourceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(sp => ({ ...sp, revenue: parseFloat(sp.revenue.toFixed(2)) }));

    return NextResponse.json({
      success: true,
      data: {
        profile,
        totalOrders,
        totalRevenue,
        totalAdsSpend,
        totalCOGS,
        profit,
        recentOrders,
        salesBySource,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

