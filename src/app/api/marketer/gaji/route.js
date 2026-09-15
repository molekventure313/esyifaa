import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
    
    // Get last day of the month
    const nextMonth = new Date(year, parseInt(month), 1);
    nextMonth.setHours(nextMonth.getHours() + 8); // shift timezone just in case
    const lastDay = new Date(nextMonth.getTime() - 1);
    const endDate = `${lastDay.toISOString().split('T')[0]}T23:59:59+08:00`;

    const basic_salary = parseFloat(profile.marketer_basic_salary) || 0;
    const commission_pct = parseFloat(profile.marketer_commission_pct) || 0;

    // Fetch total sales
    const { data: submissions } = await adminClient
      .from('submissions')
      .select('id, amount_paid, source, created_at')
      .eq('marketer_id', user.id)
      .eq('payment_status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const subs = submissions || [];
    const totalSales = subs.reduce((sum, s) => sum + (parseFloat(s.amount_paid) || 0), 0);

    // Fetch ads spend
    const { data: adsSpend } = await adminClient
      .from('ads_spend')
      .select('amount, spend_date')
      .eq('marketer_id', user.id)
      .gte('spend_date', `${year}-${month}-01`)
      .lte('spend_date', lastDay.toISOString().split('T')[0]);

    const ads = adsSpend || [];
    const totalAds = ads.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    // Fetch COGS
    let avgCost = 0;
    try {
      const { data: stock } = await adminClient
        .from('stock_summary')
        .select('avg_cost_per_unit')
        .eq('product_code', 'SGH-200G')
        .single();
      if (stock) {
        avgCost = parseFloat(stock.avg_cost_per_unit) || 0;
      }
    } catch (e) {
      // Ignore stock error
    }

    const sabunCount = subs.filter(s => s.source && s.source.toLowerCase().includes('sabun')).length;
    const totalCOGS = sabunCount * avgCost;

    const profit = totalSales - totalAds - totalCOGS;
    const komisen = Math.max(0, profit * (commission_pct / 100));
    const totalGaji = basic_salary + komisen;

    // Daily breakdown
    const dailyBreakdown = [];
    const daysInMonth = lastDay.getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
      
      
      // Date check with UTC+8 conversion
      const daySalesArr = subs.filter(s => {
          const sDate = new Date(s.created_at);
          // convert to UTC+8
          const mytDate = new Date(sDate.getTime() + 8 * 3600 * 1000);
          return mytDate.toISOString().split('T')[0] === dateStr;
      });

      const daySales = daySalesArr.reduce((sum, s) => sum + (parseFloat(s.amount_paid) || 0), 0);
      const daySabunCount = daySalesArr.filter(s => s.source && s.source.toLowerCase().includes('sabun')).length;
      
      const dayAdsArr = ads.filter(a => a.spend_date === dateStr);
      const dayAds = dayAdsArr.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

      const dayCOGS = daySabunCount * avgCost;
      const dayProfit = daySales - dayAds - dayCOGS;
      const dayKomisen = Math.max(0, dayProfit * (commission_pct / 100));

      if (daySales > 0 || dayAds > 0 || dayCOGS > 0) {
        dailyBreakdown.push({
          date: dateStr,
          sales: daySales,
          ads: dayAds,
          cogs: dayCOGS,
          profit: dayProfit,
          komisen: dayKomisen
        });
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
