import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // Build date range for filtering (Malaysia UTC+8)
    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    let dateTo = null;
    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      const yStr = yest.toISOString().split('T')[0];
      dateFrom = `${yStr}T00:00:00+08:00`;
      dateTo = `${yStr}T23:59:59+08:00`;
    } else if (period === 'week') {
      const dow = myNow.getUTCDay();
      const startOfWeek = new Date(myNow);
      startOfWeek.setUTCDate(myNow.getUTCDate() - dow);
      dateFrom = `${startOfWeek.toISOString().split('T')[0]}T00:00:00+08:00`;
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00+08:00`;
    }

    let submissionsQuery = adminClient.from('submissions').select('id, amount_paid, source, full_name, phone, payment_status, created_at').eq('marketer_id', user.id);
    let adsQuery = adminClient.from('ads_spend').select('amount, spend_date').eq('marketer_id', user.id);

    if (dateFrom) {
      submissionsQuery = submissionsQuery.gte('created_at', dateFrom);
      adsQuery = adsQuery.gte('spend_date', dateFrom.split('T')[0]);
    }
    if (dateTo) {
      submissionsQuery = submissionsQuery.lte('created_at', dateTo);
      adsQuery = adsQuery.lte('spend_date', dateTo.split('T')[0]);
    }

    const [{ data: submissions }, { data: adsSpend }] = await Promise.all([
      submissionsQuery,
      adsQuery
    ]);

    const subs = submissions || [];
    const ads = adsSpend || [];

    const completedSubs = subs.filter(s => s.payment_status === 'completed');
    const totalOrders = completedSubs.length;
    const totalRevenue = completedSubs.reduce((sum, s) => sum + (parseFloat(s.amount_paid) || 0), 0);
    const totalAdsSpend = ads.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const profit = totalRevenue - totalAdsSpend;

    const recentOrders = [...subs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const sourceMap = {};
    completedSubs.forEach(s => {
      const src = s.source || 'Lain-lain';
      if (!sourceMap[src]) sourceMap[src] = { source: src, count: 0, revenue: 0 };
      sourceMap[src].count += 1;
      sourceMap[src].revenue += parseFloat(s.amount_paid) || 0;
    });
    const salesBySource = Object.values(sourceMap).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        totalOrders,
        totalRevenue,
        totalAdsSpend,
        profit,
        recentOrders,
        salesBySource
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
