import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseAmount, calcCOGS, commissionPctFor, calcKomisen, calcLeaderPay, TEAMSALE_PCT, LEADER_OVERRIDE_PCT } from '@/lib/marketer-calc';
import { getTeam, fetchMembersMonth, memberSummary } from '@/lib/team';
import { monthRange, fetchProductCosts, buildMonthlyBreakdown } from '@/lib/products';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role, marketer_basic_salary, team_leader_id').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const range = monthRange(new URL(req.url).searchParams.get('month'));

    const isTeamsale   = !!profile.team_leader_id;
    const basic_salary = isTeamsale ? 0 : (parseFloat(profile.marketer_basic_salary) || 0);   // teamsale: tiada basic

    // Sales (sama filter dgn dashboard stats) + ads + kos produk
    const [{ data: submissions }, { data: adsSpend }, costs] = await Promise.all([
      adminClient
        .from('submissions')
        .select('id, amount_paid, notes, problem, source, qty, payment_type, order_channel, created_at')
        .eq('marketer_id', user.id)
        .eq('payment_status', 'completed')
        .is('returned_at', null)   // order return tak dikira sales
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
    // Teamsale: 30% dari profit. Marketer: berperingkat ikut profit bulanan (sendiri + team) ≥ RM10k → 10%, < RM10k → 5%
    let commission_pct, komisen, override = 0, team = [], leader = null, combined_profit = profit;
    if (isTeamsale) {
      commission_pct = TEAMSALE_PCT;
      komisen = calcKomisen(profit, commission_pct);
      const { data: l } = await adminClient.from('profiles').select('full_name').eq('id', profile.team_leader_id).maybeSingle();
      leader = l?.full_name || null;
    } else {
      const members = await getTeam(adminClient, user.id);
      if (members.length) {
        const { subs: tSubs, ads: tAds } = await fetchMembersMonth(adminClient, members.map(m => m.id), range);
        const rows = members.map(m => ({ id: m.id, name: m.full_name || 'Teamsale', is_active: m.is_active, ...memberSummary(m.id, tSubs, tAds, costs) }));
        const pay = calcLeaderPay(profit, rows);
        ({ rate: commission_pct, komisen, override, team, combined_profit } = pay);
      } else {
        commission_pct = commissionPctFor(profit);
        komisen = calcKomisen(profit, commission_pct);
      }
    }
    const totalGaji = basic_salary + komisen + override;

    // Jadual harian 1hb → hujung bulan, setiap hari ada pecahan ikut produk
    const { days, productSummary } = buildMonthlyBreakdown({ subs, ads, range, costs, commissionPct: commission_pct });

    // Sales ikut saluran — order web (borang SP) vs order WhatsApp (dimasukkan di dashboard)
    const channelOf = s => (s.order_channel === 'whatsapp' ? 'whatsapp' : 'web');
    const channelSummary = ['web', 'whatsapp'].map(ch => {
      const arr = subs.filter(s => channelOf(s) === ch);
      return { channel: ch, orders: arr.length, sales: parseFloat(arr.reduce((t, s) => t + parseAmount(s), 0).toFixed(2)) };
    });

    return NextResponse.json({
      success: true,
      data: {
        channelSummary,
        basic_salary,
        commission_pct,
        is_teamsale: isTeamsale,
        leader,
        override,
        override_pct: LEADER_OVERRIDE_PCT,
        team,
        combined_profit,
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
