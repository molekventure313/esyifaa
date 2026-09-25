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
    const { data: profile } = await adminClient.from('profiles').select('role, marketer_basic_salary, marketer_commission_pct').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthParam = searchParams.get('month') || currentMonthStr;

    // Parse month param (YYYY-MM)
    const [year, month] = monthParam.split('-');
    const startDate = `${year}-${month}-01T00:00:00+08:00`;

    // Hari terakhir bulan (tanpa bergantung pada timezone server)
    const lastDayNum = new Date(Date.UTC(parseInt(year), parseInt(month), 0)).getUTCDate();
    const lastDayStr = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`;
    const endDate = `${lastDayStr}T23:59:59+08:00`;

    const basic_salary = parseFloat(profile.marketer_basic_salary) || 0;
    const commission_pct = parseFloat(profile.marketer_commission_pct) || 0;

    // Fetch total sales — sama filter dgn dashboard stats
    const { data: submissions } = await adminClient
      .from('submissions')
      .select('id, amount_paid, notes, problem, source, qty, payment_type, created_at')
      .eq('marketer_id', user.id)
      .eq('payment_status', 'completed')
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const subs = submissions || [];
    const totalSales = subs.reduce((sum, s) => sum + parseAmount(s), 0);

    // Fetch ads spend
    const { data: adsSpend } = await adminClient
      .from('ads_spend')
      .select('amount, spend_date')
      .eq('marketer_id', user.id)
      .gte('spend_date', `${year}-${month}-01`)
      .lte('spend_date', lastDayStr);

    const ads = adsSpend || [];
    const totalAds = ads.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    // Fetch COGS — all 3 physical products
    const stockCosts = {};
    try {
      const { data: stocks } = await adminClient
        .from('stock_summary')
        .select('sku, avg_cost_per_unit')
        .in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']);
      (stocks || []).forEach(s => { stockCosts[s.sku] = parseFloat(s.avg_cost_per_unit || 0); });
    } catch (e) { /* ignore */ }
    const sabunCost   = stockCosts['SGH-200G'] || 0;
    const kasturiCost = stockCosts['KKE-01']   || 0;
    const garamCost   = stockCosts['GPM-500G'] || 0;

    const calcCOGS = (arr) => calcCOGSShared(arr, { sabunCost, kasturiCost, garamCost });

    // COGS total (unit × kos + postage)
    const totalCOGS = calcCOGS(subs);

    const profit = totalSales - totalAds - totalCOGS;
    const komisen = Math.max(0, profit * (commission_pct / 100));
    const totalGaji = basic_salary + komisen;

    // Daily breakdown
    const dailyBreakdown = [];
    for (let i = 1; i <= lastDayNum; i++) {
      const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
      const daySalesArr = subs.filter(s => {
        const sDate = new Date(s.created_at);
        const mytDate = new Date(sDate.getTime() + 8 * 3600 * 1000);
        return mytDate.toISOString().split('T')[0] === dateStr;
      });

      const daySales = daySalesArr.reduce((sum, s) => sum + parseAmount(s), 0);
      const dayAdsArr = ads.filter(a => a.spend_date === dateStr);
      const dayAds = dayAdsArr.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
      const dayCOGS = calcCOGS(daySalesArr);
      const dayProfit = daySales - dayAds - dayCOGS;
      const dayKomisen = Math.max(0, dayProfit * (commission_pct / 100));

      if (daySales > 0 || dayAds > 0 || dayCOGS > 0) {
        dailyBreakdown.push({ date: dateStr, sales: daySales, ads: dayAds, cogs: dayCOGS, profit: dayProfit, komisen: dayKomisen });
      }
    }

    dailyBreakdown.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      success: true,
      data: {
        basic_salary,
        commission_pct,
        totalSales,
        totalAds,
        totalCOGS,
        profit,
        komisen,
        totalGaji,
        month: monthParam,
        dailyBreakdown
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
