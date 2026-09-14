import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return adminClient;
}

// ─── MYT helpers ──────────────────────────────────────────────────────────────
const MYT_MS = 8 * 3600 * 1000;

function toMYTDateStr(utcDate) {
  return new Date(new Date(utcDate).getTime() + MYT_MS).toISOString().split('T')[0];
}

function getMYTToday() {
  return new Date(Date.now() + MYT_MS).toISOString().split('T')[0];
}

// ─── Date range builder ────────────────────────────────────────────────────────
// Supports: today | yesterday | week | month | all
function getUTCRange(period) {
  const DAY     = 86400000;
  const nowMYT  = new Date(Date.now() + MYT_MS);
  const todayStr = nowMYT.toISOString().split('T')[0];

  if (period === 'today') {
    return {
      fromUTC: new Date(`${todayStr}T00:00:00+08:00`).toISOString(),
      toUTC:   new Date(`${todayStr}T23:59:59+08:00`).toISOString(),
    };
  }
  if (period === 'yesterday') {
    const yest = new Date(nowMYT);
    yest.setUTCDate(nowMYT.getUTCDate() - 1);
    const yStr = yest.toISOString().split('T')[0];
    return {
      fromUTC: new Date(`${yStr}T00:00:00+08:00`).toISOString(),
      toUTC:   new Date(`${yStr}T23:59:59+08:00`).toISOString(),
    };
  }
  if (period === 'week') {
    return { fromUTC: new Date(Date.now() - 6 * DAY).toISOString(), toUTC: new Date().toISOString() };
  }
  if (period === 'month') {
    return { fromUTC: new Date(Date.now() - 29 * DAY).toISOString(), toUTC: new Date().toISOString() };
  }
  // 'all' — no filter
  return { fromUTC: null, toUTC: null };
}

// ─── Monthly calendar ranges (last N months) ──────────────────────────────────
function getMonthlyRanges(count = 6) {
  const today = new Date(Date.now() + MYT_MS);
  return Array.from({ length: count }, (_, i) => {
    const d     = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i);
    const year  = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const pad   = String(month).padStart(2, '0');
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return {
      key:   `${year}-${pad}`,
      label: new Date(`${year}-${pad}-01T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
      fromUTC: new Date(`${year}-${pad}-01T00:00:00+08:00`).toISOString(),
      toUTC:   new Date(`${year}-${pad}-${String(lastDay).padStart(2,'0')}T23:59:59+08:00`).toISOString(),
      spendDateFrom: `${year}-${pad}-01`,
      spendDateTo:   `${year}-${pad}-${String(lastDay).padStart(2,'0')}`,
    };
  });
}

// ─── Fetch stock_movements for sabun only (type='out', SKU=SGH-200G) ──────────
async function fetchMovements(adminClient, fromUTC, toUTC) {
  const { data: sabunProd } = await adminClient
    .from('products').select('id').eq('sku', 'SGH-200G').maybeSingle();

  let q = adminClient
    .from('stock_movements')
    .select('id, qty, reference_id, reference_type, created_at')
    .eq('movement_type', 'out')
    .order('created_at', { ascending: true });

  if (sabunProd?.id) q = q.eq('product_id', sabunProd.id);
  if (fromUTC) q = q.gte('created_at', fromUTC);
  if (toUTC)   q = q.lte('created_at', toUTC);

  const { data: raw, error } = await q;
  if (error) throw error;
  const movements = raw || [];

  // Split: order-linked vs manual/other movements
  const orderMvs = movements.filter(m => m.reference_type === 'order' && m.reference_id);
  const otherMvs = movements.filter(m => m.reference_type !== 'order' || !m.reference_id);
  if (orderMvs.length === 0) return otherMvs;

  // Cross-check reference_ids — filter out orphans (deleted orders)
  const refIds = [...new Set(orderMvs.map(m => m.reference_id))];
  const { data: subs } = await adminClient.from('submissions').select('id').in('id', refIds);
  const existingIds = new Set((subs || []).map(s => s.id));

  const validMvs = orderMvs.filter(m => existingIds.has(m.reference_id));
  return [...otherMvs, ...validMvs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// ─── Count kasturi add-on orders in period ────────────────────────────────────
async function fetchKasturiCount(adminClient, fromUTC, toUTC) {
  const { data: prod } = await adminClient
    .from('products').select('id').eq('sku', 'KKE-01').maybeSingle();
  if (!prod?.id) return 0;

  let q = adminClient
    .from('stock_movements')
    .select('id, reference_id')
    .eq('movement_type', 'out')
    .eq('product_id', prod.id);

  if (fromUTC) q = q.gte('created_at', fromUTC);
  if (toUTC)   q = q.lte('created_at', toUTC);

  const { data: raw } = await q;
  const movements = raw || [];
  if (movements.length === 0) return 0;

  // Cross-check — exclude orphaned movements (deleted orders)
  const refIds = [...new Set(movements.map(m => m.reference_id).filter(Boolean))];
  if (refIds.length === 0) return movements.length;

  const { data: subs } = await adminClient.from('submissions').select('id').in('id', refIds);
  const existingIds = new Set((subs || []).map(s => s.id));

  return movements.filter(m => !m.reference_id || existingIds.has(m.reference_id)).length;
}

// ─── Batch-fetch submission amounts ───────────────────────────────────────────
async function fetchRevenues(adminClient, subIds) {
  if (!subIds.length) return {};
  const { data } = await adminClient
    .from('submissions')
    .select('id, amount_paid, notes')
    .in('id', subIds);

  const map = {};
  (data || []).forEach(s => {
    let amt = parseFloat(s.amount_paid || 0);
    if (!amt) {
      // Fallback: parse from notes "[AMOUNT: MYR 75.00]"
      const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)?\s*([0-9.]+)\]/i);
      amt = m ? parseFloat(m[1]) : 0;
    }
    map[s.id] = amt;
  });
  return map;
}

// ─── Fetch ads_spend records ──────────────────────────────────────────────────
async function fetchAds(adminClient, fromDate, toDate) {
  let q = adminClient.from('ads_spend').select('*').order('spend_date', { ascending: true });
  if (fromDate) q = q.gte('spend_date', fromDate);
  if (toDate)   q = q.lte('spend_date', toDate);
  const { data } = await q;
  return data || [];
}

// ─── Aggregate movements into daily buckets ───────────────────────────────────
function aggregateByDate(movements, revenueMap) {
  const map = {};
  const seenSubsByDate = {}; // prevent double-counting revenue if multiple movements per sub

  for (const mv of movements) {
    const date   = toMYTDateStr(mv.created_at);
    const qty    = parseInt(mv.qty) || 1;
    const pkgKey = Math.min(Math.max(qty, 1), 3);

    if (!map[date]) {
      map[date] = { date, orders: 0, units_sold: 0, revenue: 0, pkg: { 1: 0, 2: 0, 3: 0 } };
      seenSubsByDate[date] = new Set();
    }

    map[date].orders++;
    map[date].units_sold += qty;
    map[date].pkg[pkgKey]++;

    // Revenue: count once per submission (avoid double-counting)
    if (mv.reference_id && !seenSubsByDate[date].has(mv.reference_id)) {
      map[date].revenue += revenueMap[mv.reference_id] || 0;
      seenSubsByDate[date].add(mv.reference_id);
    }
  }
  return map;
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const adminClient = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const mode   = searchParams.get('mode')   || 'daily';
    const period = searchParams.get('period') || 'today';

    // Avg cost for COGS
    const stockRes = await adminClient.from('stock_summary').select('avg_cost_per_unit').eq('sku', 'SGH-200G').maybeSingle();
    const avgCost  = parseFloat(stockRes.data?.avg_cost_per_unit || 0);

    // ── Monthly calendar mode ─────────────────────────────────────────────────
    if (mode === 'monthly') {
      const months = getMonthlyRanges(6);

      const monthData = await Promise.all(months.map(async m => {
        const [movements, ads] = await Promise.all([
          fetchMovements(adminClient, m.fromUTC, m.toUTC),
          fetchAds(adminClient, m.spendDateFrom, m.spendDateTo),
        ]);

        const subIds   = [...new Set(movements.map(mv => mv.reference_id).filter(Boolean))];
        const revMap   = await fetchRevenues(adminClient, subIds);

        const pkg      = { 1: 0, 2: 0, 3: 0 };
        let units_sold = 0, revenue = 0, orders = 0;
        const seenSubs = new Set();

        movements.forEach(mv => {
          const qty    = parseInt(mv.qty) || 1;
          const pkgKey = Math.min(Math.max(qty, 1), 3);
          pkg[pkgKey]++;
          units_sold += qty;
          orders++;
          if (mv.reference_id && !seenSubs.has(mv.reference_id)) {
            revenue += revMap[mv.reference_id] || 0;
            seenSubs.add(mv.reference_id);
          }
        });

        const total_ads  = ads.reduce((s, a) => s + parseFloat(a.amount || 0), 0);
        const cogs       = parseFloat((units_sold * avgCost).toFixed(2));
        const gross_pnl  = parseFloat((revenue - cogs).toFixed(2));
        const net_pnl    = parseFloat((gross_pnl - total_ads).toFixed(2));
        const roas       = total_ads > 0 ? parseFloat((revenue / total_ads).toFixed(2)) : null;

        return {
          key: m.key, label: m.label,
          orders,
          revenue:    parseFloat(revenue.toFixed(2)),
          units_sold,
          pkg,
          total_ads:  parseFloat(total_ads.toFixed(2)),
          cogs,
          gross_pnl,
          net_pnl,
          roas,
        };
      }));

      return NextResponse.json({ success: true, mode: 'monthly', data: monthData });
    }

    // ── Daily mode ────────────────────────────────────────────────────────────
    const { fromUTC, toUTC } = getUTCRange(period);

    // Ads date range (MYT date strings)
    const adsFrom = fromUTC ? toMYTDateStr(fromUTC) : null;
    const adsTo   = toUTC   ? getMYTToday()         : null;

    const [movements, ads, kasturiOrders] = await Promise.all([
      fetchMovements(adminClient, fromUTC, toUTC),
      fetchAds(adminClient, adsFrom, adsTo),
      fetchKasturiCount(adminClient, fromUTC, toUTC),
    ]);

    // Batch-fetch revenues
    const subIds   = [...new Set(movements.map(mv => mv.reference_id).filter(Boolean))];
    const revenueMap = await fetchRevenues(adminClient, subIds);

    // Build ads map by date
    const adsMap = {};
    ads.forEach(a => { adsMap[a.spend_date] = a; });

    // Aggregate orders by MYT date
    const ordersByDate = aggregateByDate(movements, revenueMap);

    // Merge all dates (orders + ads)
    const allDates = new Set([...Object.keys(ordersByDate), ...Object.keys(adsMap)]);

    const daily = Array.from(allDates).sort((a, b) => b.localeCompare(a)).map(date => {
      const d  = ordersByDate[date] || { date, orders: 0, units_sold: 0, revenue: 0, pkg: { 1: 0, 2: 0, 3: 0 } };
      const ad = adsMap[date] || null;

      const cogs      = parseFloat((d.units_sold * avgCost).toFixed(2));
      const gross_pnl = parseFloat((d.revenue - cogs).toFixed(2));
      const ads_cost  = ad ? parseFloat(ad.amount) : null;
      const net_pnl   = ads_cost !== null ? parseFloat((gross_pnl - ads_cost).toFixed(2)) : null;

      return {
        date,
        orders:    d.orders,
        revenue:   parseFloat(d.revenue.toFixed(2)),
        units_sold: d.units_sold,
        pkg:       d.pkg,
        ads_cost,
        ads_id:    ad?.id   || null,
        ads_notes: ad?.notes || null,
        cogs,
        gross_pnl,
        net_pnl,
      };
    });

    // Summary
    const totalRevenue  = daily.reduce((s, d) => s + d.revenue, 0);
    const totalUnits    = daily.reduce((s, d) => s + d.units_sold, 0);
    const totalOrders   = daily.reduce((s, d) => s + d.orders, 0);
    const totalAds      = daily.reduce((s, d) => s + (d.ads_cost || 0), 0);
    const totalCogs     = parseFloat((totalUnits * avgCost).toFixed(2));
    const grossPnl      = parseFloat((totalRevenue - totalCogs).toFixed(2));
    const netPnl        = parseFloat((grossPnl - totalAds).toFixed(2));
    const roas          = totalAds > 0 ? parseFloat((totalRevenue / totalAds).toFixed(2)) : null;
    const netMargin     = totalRevenue > 0 ? parseFloat(((netPnl / totalRevenue) * 100).toFixed(1)) : 0;
    const totalPkg      = { 1: 0, 2: 0, 3: 0 };
    daily.forEach(d => { [1, 2, 3].forEach(k => { totalPkg[k] += (d.pkg[k] || 0); }); });

    return NextResponse.json({
      success: true,
      mode: 'daily',
      period,
      avg_cost_per_unit: avgCost,
      summary: {
        total_revenue:  parseFloat(totalRevenue.toFixed(2)),
        total_orders:   totalOrders,
        total_units:    totalUnits,
        total_pkg:      totalPkg,
        kasturi_orders: kasturiOrders,
        total_ads:      parseFloat(totalAds.toFixed(2)),
        total_cogs:     totalCogs,
        gross_pnl:      grossPnl,
        net_pnl:        netPnl,
        net_margin:     netMargin,
        roas,
      },
      daily,
    });

  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

// ─── POST — upsert ads spend for a date ──────────────────────────────────────
export async function POST(req) {
  try {
    const adminClient = await requireAdmin();
    const { spend_date, amount, notes, id } = await req.json();

    if (!spend_date || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Tarikh dan jumlah diperlukan' }, { status: 400 });
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json({ success: false, error: 'Jumlah tidak sah' }, { status: 400 });
    }

    if (id) {
      const { data, error } = await adminClient
        .from('ads_spend')
        .update({ amount: amt, notes: notes || null, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, data, action: 'updated' });
    }

    const { data, error } = await adminClient
      .from('ads_spend')
      .upsert({ spend_date, amount: amt, notes: notes || null }, { onConflict: 'spend_date' })
      .select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data, action: 'created' });

  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
