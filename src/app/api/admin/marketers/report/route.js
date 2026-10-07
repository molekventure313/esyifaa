import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { summarizeByProduct, monthRange } from '@/lib/products';
import { calcProductCOGS as calcProductCOGSShared, calcPostage as calcPostageShared, commissionPctFor, calcKomisen, calcLeaderPay, TEAMSALE_PCT, FPX_FEE } from '@/lib/marketer-calc';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!['super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return admin;
}

// ─── MYT helpers ──────────────────────────────────────────────────────────────
const MYT_MS = 8 * 3600 * 1000;
function toMYTStr(utcDate) {
  return new Date(new Date(utcDate).getTime() + MYT_MS).toISOString().split('T')[0];
}

// ─── Amount Parser (sama logic dgn sales-stats) ───────────────────────────────
// COD orders kadang simpan amount dalam notes: [AMOUNT: MYR 95.00]
function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
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
function computeStats(marketers, submissions, adsSpend, avgCost, kasturiCost, garamCost) {
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

  const costs = { sabunCost: avgCost, kasturiCost, garamCost };
  const calcProductCOGS = (arr) => calcProductCOGSShared(arr, costs);   // sabun + kasturi + garam (termasuk add-on)
  const calcPostage     = (arr) => parseFloat(calcPostageShared(arr).toFixed(2));

  const rows = [];

  for (const m of marketers) {
    const subs         = subMap[m.id] || [];
    const orders       = subs.length;
    const revenue      = subs.reduce((s, sub) => s + parseAmount(sub), 0);
    const waSubs       = subs.filter(sub => sub.order_channel === 'whatsapp');
    const product_cogs = calcProductCOGS(subs);
    const postage      = calcPostage(subs);
    const cogs         = parseFloat((product_cogs + postage).toFixed(2));
    const gross_profit = parseFloat((revenue - cogs).toFixed(2));
    const ads          = parseFloat((adsMap[m.id] || 0).toFixed(2));
    const profit       = parseFloat((gross_profit - ads).toFixed(2));
    const isTeamsale   = !!m.team_leader_id;
    const basicSalary  = isTeamsale ? 0 : parseFloat(m.marketer_basic_salary || 0);   // teamsale: tiada basic

    rows.push({
      id: m.id, name: m.full_name || 'Marketer', code: m.marketer_code || null, is_active: m.is_active,
      team_leader_id: m.team_leader_id || null,
      leader_name: isTeamsale ? (marketers.find(x => x.id === m.team_leader_id)?.full_name || null) : null,
      orders, revenue: parseFloat(revenue.toFixed(2)),
      wa_orders: waSubs.length, wa_revenue: parseFloat(waSubs.reduce((s, sub) => s + parseAmount(sub), 0).toFixed(2)),
      product_cogs, postage, cogs, gross_profit, ads, profit, basic_salary: basicSalary,
    });
  }

  // Komisen: teamsale 30% · ketua berperingkat (profit sendiri + team) + override 10% · marketer biasa berperingkat
  for (const row of rows) {
    if (row.team_leader_id) {
      row.commission_pct = TEAMSALE_PCT;
      row.komisen  = calcKomisen(row.profit, TEAMSALE_PCT);
      row.override = 0;
    } else {
      const team = rows.filter(x => x.team_leader_id === row.id);
      const pay  = calcLeaderPay(row.profit, team.map(x => ({ id: x.id, profit: x.profit })));
      row.commission_pct = pay.rate;
      row.komisen  = pay.komisen;
      row.override = pay.override;
      row.team_size = team.length;
    }
    row.est_gaji = parseFloat((row.basic_salary + row.komisen + row.override).toFixed(2));
  }

  // HQ row (marketer_id IS NULL)
  const hqSubs         = subMap['__hq__'] || [];
  const hqOrders       = hqSubs.length;
  const hqRevenue      = hqSubs.reduce((s, sub) => s + parseAmount(sub), 0);
  const hqProductCogs  = calcProductCOGS(hqSubs);
  const hqPostage      = calcPostage(hqSubs);
  const hqCogs         = parseFloat((hqProductCogs + hqPostage).toFixed(2));
  const hqGrossProfit  = parseFloat((hqRevenue - hqCogs).toFixed(2));
  const hqAds          = parseFloat((adsMap['__hq__'] || 0).toFixed(2));
  const hqProfit       = parseFloat((hqGrossProfit - hqAds).toFixed(2));

  rows.push({
    id: '__hq__', name: 'HQ', code: null, is_active: true,
    orders: hqOrders, revenue: parseFloat(hqRevenue.toFixed(2)),
    wa_orders: hqSubs.filter(sub => sub.order_channel === 'whatsapp').length,
    wa_revenue: parseFloat(hqSubs.filter(sub => sub.order_channel === 'whatsapp').reduce((s, sub) => s + parseAmount(sub), 0).toFixed(2)),
    product_cogs: hqProductCogs, postage: hqPostage, cogs: hqCogs,
    gross_profit: hqGrossProfit, ads: hqAds, profit: hqProfit,
    commission_pct: null, komisen: null, override: null, basic_salary: null, est_gaji: null,
  });

  // Sort: marketers by revenue desc (teamsale terus di bawah ketua), HQ last
  rows.sort((a, b) => {
    if (a.id === '__hq__') return 1;
    if (b.id === '__hq__') return -1;
    return b.revenue - a.revenue;
  });
  const leaders = rows.filter(x => !x.team_leader_id || !rows.some(l => l.id === x.team_leader_id));
  const grouped = leaders.flatMap(l => [l, ...rows.filter(x => x.team_leader_id === l.id)]);
  rows.splice(0, rows.length, ...grouped);

  // Sales Web = jumlah − WhatsApp (untuk column berasingan & sort)
  for (const r of rows) {
    r.web_orders  = r.orders - (r.wa_orders || 0);
    r.web_revenue = parseFloat((r.revenue - (r.wa_revenue || 0)).toFixed(2));
  }

  // Grand totals
  const totals = {
    orders:       rows.reduce((s, r) => s + r.orders, 0),
    revenue:      parseFloat(rows.reduce((s, r) => s + r.revenue, 0).toFixed(2)),
    wa_orders:    rows.reduce((s, r) => s + (r.wa_orders || 0), 0),
    wa_revenue:   parseFloat(rows.reduce((s, r) => s + (r.wa_revenue || 0), 0).toFixed(2)),
    web_orders:   rows.reduce((s, r) => s + (r.web_orders || 0), 0),
    web_revenue:  parseFloat(rows.reduce((s, r) => s + (r.web_revenue || 0), 0).toFixed(2)),
    product_cogs: parseFloat(rows.reduce((s, r) => s + r.product_cogs, 0).toFixed(2)),
    postage:      parseFloat(rows.reduce((s, r) => s + r.postage, 0).toFixed(2)),
    cogs:         parseFloat(rows.reduce((s, r) => s + r.cogs, 0).toFixed(2)),
    gross_profit: parseFloat(rows.reduce((s, r) => s + r.gross_profit, 0).toFixed(2)),
    ads:          parseFloat(rows.reduce((s, r) => s + r.ads, 0).toFixed(2)),
    profit:       parseFloat(rows.reduce((s, r) => s + r.profit, 0).toFixed(2)),
    komisen:      parseFloat(rows.filter(r => r.komisen !== null).reduce((s, r) => s + (r.komisen || 0), 0).toFixed(2)),
    override:     parseFloat(rows.reduce((s, r) => s + (r.override || 0), 0).toFixed(2)),
  };

  return { rows, totals };
}

// ─── Sales & ads ikut produk (+ pecahan setiap marketer / HQ) ─────────────────
function computeProductStats(marketers, submissions, adsSpend) {
  const owners = [...marketers.map(m => ({ id: m.id, name: m.full_name || 'Marketer' })), { id: '__hq__', name: 'HQ' }];
  const ownerOf = x => x.marketer_id || '__hq__';

  const byOwner = owners.map(o => ({
    ...o,
    stats: summarizeByProduct(submissions.filter(s => ownerOf(s) === o.id), adsSpend.filter(a => ownerOf(a) === o.id)),
  }));

  const products = summarizeByProduct(submissions, adsSpend).map(p => ({
    ...p,
    breakdown: byOwner
      .map(o => ({ id: o.id, name: o.name, ...o.stats.find(x => x.key === p.key) }))
      .filter(r => r.orders > 0 || r.ads > 0)
      .map(({ id, name, orders, sales, ads, roas }) => ({ id, name, orders, sales, ads, roas }))
      .sort((a, b) => b.sales - a.sales),
  }));

  const sum = k => parseFloat(products.reduce((t, p) => t + p[k], 0).toFixed(2));
  const totals = { orders: products.reduce((t, p) => t + p.orders, 0), sales: sum('sales'), ads: sum('ads') };
  totals.roas = totals.ads > 0 ? parseFloat((totals.sales / totals.ads).toFixed(2)) : null;
  return { products, totals };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchSubs(admin, from, to) {
  let q = admin.from('submissions')
    .select('marketer_id, amount_paid, notes, problem, source, qty, payment_type, order_channel')  // payment_type for postage calc
    .eq('payment_status', 'completed')
    .is('returned_at', null)   // order return tak dikira sales
    .in('payment_type', ['cod', 'fpx_payment']);
  if (from) q = q.gte('created_at', from);
  if (to)   q = q.lte('created_at', to);
  const { data } = await q;
  return data || [];
}

async function fetchAds(admin, spendFrom, spendTo) {
  let q = admin.from('ads_spend').select('marketer_id, amount, product');
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
    const period = searchParams.get('period') || 'today';

    // Fetch marketers + product costs in parallel
    const [mktRes, stockRes] = await Promise.all([
      admin.from('profiles')
        .select('id, full_name, marketer_code, is_active, marketer_basic_salary, team_leader_id')
        .eq('role', 'marketer')
        .order('full_name'),
      admin.from('stock_summary').select('sku, avg_cost_per_unit').in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']),
    ]);

    const marketers    = mktRes.data || [];
    const stockMap2    = {};
    (stockRes.data || []).forEach(s => { stockMap2[s.sku] = parseFloat(s.avg_cost_per_unit || 0); });
    const avgCost      = stockMap2['SGH-200G'] || 0;  // backward compat
    const kasturiCost  = stockMap2['KKE-01']   || 0;
    const garamCost    = stockMap2['GPM-500G']  || 0;

    // ── Report HQ (P&L penuh satu bulan) ─────────────────────────────────────
    if (mode === 'hq') {
      const range = monthRange(searchParams.get('month'));
      const [subs, ads, returnedRes, expRes] = await Promise.all([
        fetchSubs(admin, range.from, range.to),
        fetchAds(admin, range.firstDay, range.lastDay),
        admin.from('submissions')
          .select('source, payment_type')
          .eq('payment_status', 'completed')
          .not('returned_at', 'is', null)
          .gte('created_at', range.from)
          .lte('created_at', range.to),
        admin.from('hq_expenses').select('*').order('amount', { ascending: false }),
      ]);
      if (expRes.error) throw new Error(`Jadual hq_expenses belum wujud — run migration 019. (${expRes.error.message})`);

      const { rows, totals } = computeStats(marketers, subs, ads, avgCost, kasturiCost, garamCost);
      const r2 = n => parseFloat((n || 0).toFixed(2));
      const mktRows = rows.filter(x => x.id !== '__hq__');
      const hqRow   = rows.find(x => x.id === '__hq__');

      // Gaji: basic semua marketer AKTIF + komisen ikut profit setiap marketer
      const payroll = marketers.filter(m => m.is_active).map(m => {
        const row = mktRows.find(x => x.id === m.id) || {};
        const basic = m.team_leader_id ? 0 : parseFloat(m.marketer_basic_salary || 0);   // teamsale: tiada basic
        const kom   = r2((row.komisen || 0) + (row.override || 0));                     // komisen + override team
        return {
          id: m.id, name: m.full_name || 'Marketer', basic, profit: row.profit || 0,
          commission_pct: row.commission_pct ?? commissionPctFor(0), komisen: kom, override: row.override || 0,
          is_teamsale: !!m.team_leader_id, leader_name: row.leader_name || null, total: r2(basic + kom),
        };
      });
      // Marketer tak aktif yang masih dapat komisen bulan ni
      for (const x of mktRows) {
        const kom = r2((x.komisen || 0) + (x.override || 0));
        if (!payroll.some(p => p.id === x.id) && kom > 0) {
          payroll.push({ id: x.id, name: `${x.name} (tak aktif)`, basic: 0, profit: x.profit, commission_pct: x.commission_pct, komisen: kom, override: x.override || 0, total: kom });
        }
      }
      // Teamsale terus di bawah ketua
      const leaderOf = id => marketers.find(m => m.id === id)?.team_leader_id || null;
      const tops = payroll.filter(p => !leaderOf(p.id) || !payroll.some(x => x.id === leaderOf(p.id)));
      payroll.splice(0, payroll.length, ...tops.flatMap(l => [l, ...payroll.filter(x => leaderOf(x.id) === l.id)]));
      const basicTotal   = r2(payroll.reduce((t, p) => t + p.basic, 0));
      const komisenTotal = r2(payroll.reduce((t, p) => t + p.komisen, 0));

      // Perbelanjaan HQ yang terpakai untuk bulan ini
      const all = expRes.data || [];
      const fixed = all.filter(e => e.type === 'fixed' && e.is_active
        && (!e.start_month || e.start_month <= range.month) && (!e.end_month || e.end_month >= range.month));
      const oneOff = all.filter(e => e.type === 'one_off' && e.month === range.month);
      const fixedTotal  = r2(fixed.reduce((t, e) => t + parseFloat(e.amount || 0), 0));
      const oneOffTotal = r2(oneOff.reduce((t, e) => t + parseFloat(e.amount || 0), 0));

      // Caj FPX & kos shipping order return
      const fpxCount  = subs.filter(x => x.payment_type === 'fpx_payment').length;
      const fpxFee    = r2(fpxCount * FPX_FEE);
      const returned  = returnedRes.data || [];
      const returnPostage = calcPostageShared(returned);

      const revenue      = totals.revenue;
      const grossProfit  = r2(revenue - totals.product_cogs - totals.postage - fpxFee - returnPostage);
      const afterAds     = r2(grossProfit - totals.ads);
      const netProfit    = r2(afterAds - basicTotal - komisenTotal - fixedTotal - oneOffTotal);

      return NextResponse.json({
        success: true, mode: 'hq', month: range.month,
        sales: {
          revenue, orders: totals.orders,
          web_revenue: totals.web_revenue, web_orders: totals.web_orders,
          wa_revenue: totals.wa_revenue,   wa_orders: totals.wa_orders,
          hq_revenue: hqRow?.revenue || 0, hq_orders: hqRow?.orders || 0,
          marketer_revenue: r2(revenue - (hqRow?.revenue || 0)), marketer_orders: totals.orders - (hqRow?.orders || 0),
        },
        cogs: {
          product: totals.product_cogs, postage: totals.postage,
          fpx_fee: fpxFee, fpx_count: fpxCount, fpx_fee_each: FPX_FEE,
          return_postage: returnPostage, returned_count: returned.length,
        },
        gross_profit: grossProfit,
        ads: { total: totals.ads, hq: hqRow?.ads || 0, marketer: r2(totals.ads - (hqRow?.ads || 0)) },
        after_ads: afterAds,
        payroll: { basic: basicTotal, komisen: komisenTotal, total: r2(basicTotal + komisenTotal), rows: payroll },
        expenses: { fixed, fixed_total: fixedTotal, one_off: oneOff, one_off_total: oneOffTotal },
        net_profit: netProfit,
        total_expenses: r2(revenue - netProfit),
      });
    }

    // ── Monthly mode ─────────────────────────────────────────────────────────
    if (mode === 'monthly') {
      const ranges = getMonthlyRanges(6);
      const months = await Promise.all(ranges.map(async r => {
        const [subs, ads] = await Promise.all([
          fetchSubs(admin, r.from, r.to),
          fetchAds(admin, r.spendFrom, r.spendTo),
        ]);
    const { rows, totals } = computeStats(marketers, subs, ads, avgCost, kasturiCost, garamCost);
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
    const { rows, totals } = computeStats(marketers, subs, ads, avgCost, kasturiCost, garamCost);

    return NextResponse.json({
      success: true, mode: 'period', period, avg_cost: avgCost,
      marketers: rows, totals,
      byProduct: computeProductStats(marketers, subs, ads),
    });

  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
