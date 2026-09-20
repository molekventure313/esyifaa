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
      .select('id, amount_paid, notes, problem, source, qty, payment_type, created_at')
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
    const avgCost     = sabunCost; // backward compat

    const calcCOGS = (arr) => {
      const sabunUnits = arr.filter(s => (s.source||'').includes('sabun')).reduce((t,s)=>t+(parseInt(s.qty)||0),0);
      const kasturiN   = arr.filter(s => /\[ADD-ON: Kasturi Kijang/i.test(s.notes||'')||/Add-On:\s*Kasturi Kijang/i.test(s.problem||'')).length;
      const garamUnits = arr.filter(s => s.source==='garam-pengasihan').reduce((t,s)=>t+(parseInt(s.qty)||1),0);
      const garamAddon = arr.filter(s => /\[ADD-ON: Garam Pengasihan/i.test(s.notes||'')||/Add-On:\s*Garam Pengasihan/i.test(s.problem||'')).length;
      const isPhysical = s => ['sabun','garam-pengasihan','kasturi-kijang'].some(p=>(s.source||'').includes(p));
      const fpxPhys    = arr.filter(s => isPhysical(s) && s.payment_type==='fpx_payment').length;
      const codPhys    = arr.filter(s => isPhysical(s) && s.payment_type==='cod').length;
      return sabunUnits*sabunCost + kasturiN*kasturiCost + (garamUnits+garamAddon)*garamCost + fpxPhys*4 + codPhys*6;
    };

    // COGS total (unit × kos + postage)
    const totalCOGS = calcCOGS(subs);

    const profit = totalSales - totalAds - totalCOGS;
    const komisen = Math.max(0, profit * (commission_pct / 100));
    const totalGaji = basic_salary + komisen;

    // Daily breakdown
    const dailyBreakdown = [];
    const daysInMonth = lastDay.getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
      const daySalesArr = subs.filter(s => {
        const sDate = new Date(s.created_at);
        const mytDate = new Date(sDate.getTime() + 8 * 3600 * 1000);
        return mytDate.toISOString().split('T')[0] === dateStr;
      });

      const daySales = daySalesArr.reduce((sum, s) => sum + (parseFloat(s.amount_paid) || 0), 0);
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
