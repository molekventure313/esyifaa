import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return admin;
}

// ─── MYT helpers ──────────────────────────────────────────────────────────────
const MYT_MS = 8 * 3600 * 1000;
function toMYTStr(utcDate) {
  return new Date(new Date(utcDate).getTime() + MYT_MS).toISOString().split('T')[0];
}

// ─── Date range for period ─────────────────────────────────────────────────────
function getPeriodRange(period) {
  const nowMYT  = new Date(Date.now() + MYT_MS);
  const todayStr = nowMYT.toISOString().split('T')[0];
  const DAY = 86400000;

  if (period === 'today') {
    return { from: `${todayStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00`, spendFrom: todayStr, spendTo: todayStr };
  }
  if (period === 'yesterday') {
    const yest = new Date(nowMYT); yest.setUTCDate(nowMYT.getUTCDate() - 1);
    const yStr = yest.toISOString().split('T')[0];
    return { from: `${yStr}T00:00:00+08:00`, to: `${yStr}T23:59:59+08:00`, spendFrom: yStr, spendTo: yStr };
  }
  if (period === 'week') {
    const wStr = new Date(Date.now() - 6 * DAY).toISOString().split('T')[0];
    return { from: `${wStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00`, spendFrom: wStr, spendTo: todayStr };
  }
  if (period === 'month') {
    const mStr = `${nowMYT.getUTCFullYear()}-${String(nowMYT.getUTCMonth() + 1).padStart(2, '0')}-01`;
    return { from: `${mStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00`, spendFrom: mStr, spendTo: todayStr };
  }
  // 'all'
  return { from: null, to: null, spendFrom: null, spendTo: null };
}

// ─── Monthly calendar ranges (last 6 months) ──────────────────────────────────
function getMonthlyRanges(count = 6) {
  const now = new Date(Date.now() + MYT_MS);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now); d.setUTCMonth(d.getUTCMonth() - i);
    const yr = d.getUTCFullYear(); const mo = d.getUTCMonth() + 1;
    const pad = String(mo).padStart(2, '0');
    const lastDay = new Date(Date.UTC(yr, mo, 0)).getUTCDate();
    return {
      key: `${yr}-${pad}`,
      label: new Date(`${yr}-${pad}-01T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
      from: `${yr}-${pad}-01T00:00:00+08:00`,
      to:   `${yr}-${pad}-${String(lastDay).padStart(2,'0')}T23:59:59+08:00`,
      spendFrom: `${yr}-${pad}-01`,
      spendTo:   `${yr}-${pad}-${String(lastDay).padStart(2,'0')}`,
    };
  });
}

// ─── Compute per-marketer stats from raw data ─────────────────────────────────
function computeStats(marketers, submissions, adsSpend, avgCost) {
  // Build per-marketer submission map
  const subMap = {};
  const adsMap = {};

  for (const s of submissions) {
    const mid = s.marketer_id || '__hq__';
    if (!subMap[mid]) subMap[mid] = [];
    subMap[mid].push(s);
  }
  for (const a of adsSpend) {
    const mid = a.marketer_id || '__hq__';
    if (!adsMap[mid]) adsMap[mid] = 0;
    adsMap[mid] += parseFloat(a.amount || 0);
  }

  const rows = [];

  for (const m of marketers) {
    const subs = subMap[m.id] || [];
    const orders  = subs.length;
    const revenue = subs.reduce((s, sub) => s + parseFloat(sub.amount_paid || 0), 0);
    const sabunUnits = subs
      .filter(sub => (sub.source || '').includes('sabun'))
      .reduce((s, sub) => s + (parseInt(sub.qty) || 0), 0);
    const cogs    = parseFloat((sabunUnits * avgCost).toFixed(2));
    const ads     = parseFloat((adsMap[m.id] || 0).toFixed(2));
    const profit  = parseFloat((revenue - ads - cogs).toFixed(2));
    const commPct = parseFloat(m.marketer_commission_pct || 0);
    const komisen = parseFloat((Math.max(0, profit) * commPct / 100).toFixed(2));
    const basicSalary = parseFloat(m.marketer_basic_salary || 0);

    rows.push({
      id: m.id,
      name: m.full_name || 'Marketer',
      code: m.marketer_code || null,
      is_active: m.is_active,
      orders,
      revenue: parseFloat(revenue.toFixed(2)),
      ads,
      cogs,
      profit,
      commission_pct: commPct,
      komisen,
      basic_salary: basicSalary,
      est_gaji: parseFloat((basicSalary + komisen).toFixed(2)),
    });
  }

  // HQ row (marketer_id IS NULL)
  const hqSubs = subMap['__hq__'] || [];
  const hqOrders  = hqSubs.length;
  const hqRevenue = hqSubs.reduce((s, sub) => s + parseFloat(sub.amount_paid || 0), 0);
  const hqSabunUnits = hqSubs
    .filter(sub => (sub.source || '').includes('sabun'))
    .reduce((s, sub) => s + (parseInt(sub.qty) || 0), 0);
  const hqCogs = parseFloat((hqSabunUnits * avgCost).toFixed(2));
  const hqAds  = parseFloat((adsMap['__hq__'] || 0).toFixed(2));
  const hqProfit = parseFloat((hqRevenue - hqAds - hqCogs).toFixed(2));

  rows.push({
    id: '__hq__', name: 'HQ', code: null, is_active: true,
    orders: hqOrders, revenue: parseFloat(hqRevenue.toFixed(2)),
    ads: hqAds, cogs: hqCogs, profit: hqProfit,
    commission_pct: null, komisen: null, basic_salary: null, est_gaji: null,
  });

  // Sort: marketers by revenue desc, HQ last
  rows.sort((a, b) => {
    if (a.id === '__hq__') return 1;
    if (b.id === '__hq__') return -1;
    return b.revenue - a.revenue;
  });

  // Grand totals
  const totals = {
    orders:  rows.reduce((s, r) => s + r.orders, 0),
    revenue: parseFloat(rows.reduce((s, r) => s + r.revenue, 0).toFixed(2)),
    ads:     parseFloat(rows.reduce((s, r) => s + r.ads, 0).toFixed(2)),
    cogs:    parseFloat(rows.reduce((s, r) => s + r.cogs, 0).toFixed(2)),
    profit:  parseFloat(rows.reduce((s, r) => s + r.profit, 0).toFixed(2)),
    komisen: parseFloat(rows.filter(r => r.komisen !== null).reduce((s, r) => s + (r.komisen || 0), 0).toFixed(2)),
  };

  return { rows, totals };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchSubs(admin, from, to) {
  let q = admin.from('submissions')
    .select('marketer_id, amount_paid, source, qty')
    .eq('payment_status', 'completed')
    .in('payment_type', ['cod', 'fpx_payment']);
  if (from) q = q.gte('created_at', from);
  if (to)   q = q.lte('created_at', to);
  const { data } = await q;
  return data || [];
}

async function fetchAds(admin, spendFrom, spendTo) {
  let q = admin.from('ads_spend').select('marketer_id, amount');
  if (spendFrom) q = q.gte('spend_date', spendFrom);
  if (spendTo)   q = q.lte('spend_date', spendTo);
  const { data } = await q;
  return data || [];
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const mode   = searchParams.get('mode')   || 'period';
    const period = searchParams.get('period') || 'month';

    // Fetch marketers + avg cost in parallel
    const [mktRes, stockRes] = await Promise.all([
      admin.from('profiles')
        .select('id, full_name, marketer_code, is_active, marketer_basic_salary, marketer_commission_pct')
        .eq('role', 'marketer')
        .order('full_name'),
      admin.from('stock_summary').select('avg_cost_per_unit').eq('sku', 'SGH-200G').maybeSingle(),
    ]);

    const marketers = mktRes.data || [];
    const avgCost   = parseFloat(stockRes.data?.avg_cost_per_unit || 0);

    // ── Monthly mode ─────────────────────────────────────────────────────────
    if (mode === 'monthly') {
      const ranges = getMonthlyRanges(6);
      const months = await Promise.all(ranges.map(async r => {
        const [subs, ads] = await Promise.all([
          fetchSubs(admin, r.from, r.to),
          fetchAds(admin, r.spendFrom, r.spendTo),
        ]);
        const { rows, totals } = computeStats(marketers, subs, ads, avgCost);
        return { key: r.key, label: r.label, marketers: rows, totals };
      }));
      return NextResponse.json({ success: true, mode: 'monthly', avg_cost: avgCost, months });
    }

    // ── Period mode ───────────────────────────────────────────────────────────
    const { from, to, spendFrom, spendTo } = getPeriodRange(period);
    const [subs, ads] = await Promise.all([
      fetchSubs(admin, from, to),
      fetchAds(admin, spendFrom, spendTo),
    ]);
    const { rows, totals } = computeStats(marketers, subs, ads, avgCost);

    return NextResponse.json({
      success: true, mode: 'period', period, avg_cost: avgCost,
      marketers: rows, totals,
    });

  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
