import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseAmount, calcCOGS } from '@/lib/marketer-calc';
import { monthRange, fetchProductCosts, buildMonthlyBreakdown } from '@/lib/products';

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

    const range = monthRange(new URL(req.url).searchParams.get('month'));

    const basic_salary = parseFloat(profile.marketer_basic_salary) || 0;
    const commission_pct = parseFloat(profile.marketer_commission_pct) || 0;

    // Sales (sama filter dgn dashboard stats) + ads + kos produk
    const [{ data: submissions }, { data: adsSpend }, costs] = await Promise.all([
      adminClient
        .from('submissions')
        .select('id, amount_paid, notes, problem, source, qty, payment_type, created_at')
        .eq('marketer_id', user.id)
        .eq('payment_status', 'completed')
        .in('payment_type', ['fpx_payment', 'cod'])
        .gte('created_at', range.from)
        .lte('created_at', range.to),
      adminClient
        .from('ads_spend')
        .select('amount, spend_date, product')
        .eq('marketer_id', user.id)
        .gte('spend_date', range.firstDay)
        .lte('spend_date', range.lastDay),
      fetchProductCosts(adminClient),
    ]);

    const subs = submissions || [];
    const ads  = adsSpend || [];

    const totalSales = subs.reduce((sum, s) => sum + parseAmount(s), 0);
    const totalAds   = ads.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const totalCOGS  = calcCOGS(subs, costs); // unit × kos + postage

    const profit    = totalSales - totalAds - totalCOGS;
    const komisen   = Math.max(0, profit * (commission_pct / 100));
    const totalGaji = basic_salary + komisen;

    // Jadual harian 1hb → hujung bulan, setiap hari ada pecahan ikut produk
    const { days, productSummary } = buildMonthlyBreakdown({ subs, ads, range, costs, commissionPct: commission_pct });

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
        month: range.month,
        productSummary,
        dailyBreakdown: days,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
