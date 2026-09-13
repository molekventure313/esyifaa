import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── Auth Helper ─────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return { user, adminClient };
}

// ─── MYT Helpers ─────────────────────────────────────────────────────────────
const MYT = 8 * 3600 * 1000;

function nowMYT() {
  return new Date(Date.now() + MYT);
}

function toMYTDateStr(utcDate) {
  // Given a UTC date string/obj, return the MYT calendar date (YYYY-MM-DD)
  const myt = new Date(new Date(utcDate).getTime() + MYT);
  return myt.toISOString().split('T')[0];
}

function getMYTToday() {
  return nowMYT().toISOString().split('T')[0];
}

// ─── Date Ranges ─────────────────────────────────────────────────────────────
function getDailyRange(period) {
  const todayMYT = getMYTToday();
  const nowUTC   = new Date();
  const DAY      = 86400000;

  if (period === 'week') {
    const from = new Date(nowUTC - 6 * DAY);
    return { fromUTC: from.toISOString(), toUTC: nowUTC.toISOString() };
  }
  // default: month (last 30 days)
  const from = new Date(nowUTC - 29 * DAY);
  return { fromUTC: from.toISOString(), toUTC: nowUTC.toISOString() };
}

function getMonthlyRanges(count = 6) {
  // Returns last N calendar months as { year, month, label, fromISO, toISO }
  const today = nowMYT();
  const months = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i);
    const year  = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1; // 1-12
    const fromMYT = `${year}-${String(month).padStart(2,'0')}-01`;
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const toMYT   = `${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
    // Convert MYT dates to UTC boundaries for DB queries
    const fromUTC = new Date(`${fromMYT}T00:00:00+08:00`).toISOString();
    const toUTC   = new Date(`${toMYT}T23:59:59+08:00`).toISOString();
    months.push({
      year, month,
      key: `${year}-${String(month).padStart(2,'0')}`,
      label: new Date(`${fromMYT}T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' }),
      fromUTC, toUTC,
    });
  }
  return months;
}

// ─── Qty Parser ───────────────────────────────────────────────────────────────
function parseQty(row) {
  // Priority: qty column → notes [QTY: X unit] → problem "Pakej: X Unit"
  if (row.qty && row.qty > 0) return row.qty;
  const notesMatch = (row.notes || '').match(/\[QTY:\s*(\d+)\s*unit\]/i);
  if (notesMatch) return parseInt(notesMatch[1]);
  const probMatch = (row.problem || '').match(/Pakej:\s*(\d+)\s*Unit/i);
  if (probMatch) return parseInt(probMatch[1]);
  return 1; // default
}

// ─── Order Fetcher ────────────────────────────────────────────────────────────
async function fetchOrders(adminClient, fromUTC, toUTC) {
  let q = adminClient
    .from('submissions')
    .select('id, source, payment_type, amount_paid, notes, problem, qty, created_at')
    .in('payment_type', ['fpx_payment', 'cod'])
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: true });

  if (fromUTC) q = q.gte('created_at', fromUTC);
  if (toUTC)   q = q.lte('created_at', toUTC);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).filter(s =>
    s.source?.includes('sabun') ||
    s.payment_type === 'cod' // COD orders are all sabun
  );
}

// ─── Ads Fetcher ──────────────────────────────────────────────────────────────
async function fetchAds(adminClient, fromDate, toDate) {
  // fromDate/toDate are YYYY-MM-DD strings
  let q = adminClient.from('ads_spend').select('*').order('spend_date', { ascending: true });
  if (fromDate) q = q.gte('spend_date', fromDate);
  if (toDate)   q = q.lte('spend_date', toDate);
  const { data } = await q;
  return data || [];
}

// ─── Amount Parser ────────────────────────────────────────────────────────────
function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)?\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
}

// ─── Aggregate Orders by Date ─────────────────────────────────────────────────
function aggregateByDate(orders) {
  const map = {};
  for (const s of orders) {
    const date = toMYTDateStr(s.created_at);
    if (!map[date]) map[date] = { date, orders: 0, revenue: 0, pkg: { 1: 0, 2: 0, 3: 0 } };
    const qty = parseQty(s);
    const amt = parseAmount(s);
    map[date].orders++;
    map[date].revenue += amt;
    const pkgKey = Math.min(Math.max(qty, 1), 3);
    map[date].pkg[pkgKey] = (map[date].pkg[pkgKey] || 0) + 1;
  }
  return map;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const { adminClient } = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const mode   = searchParams.get('mode') || 'daily'; // 'daily' | 'monthly'
    const period = searchParams.get('period') || 'month'; // 'week' | 'month' (for daily mode)

    // Fetch avg cost for COGS calculation
    const stockSumRes = await adminClient.from('stock_summary').select('avg_cost_per_unit').limit(1).single();
    const avgCost = parseFloat(stockSumRes.data?.avg_cost_per_unit || 0);

    if (mode === 'monthly') {
      // ── Monthly Calendar Mode ─────────────────────────────────────────────
      const months = getMonthlyRanges(6);

      const monthData = await Promise.all(months.map(async (m) => {
        const [orders, ads] = await Promise.all([
          fetchOrders(adminClient, m.fromUTC, m.toUTC),
          fetchAds(adminClient, m.key + '-01', m.key + '-31'),
        ]);

        const revenue = orders.reduce((s, o) => s + parseAmount(o), 0);
        const units_sold = orders.reduce((s, o) => s + parseQty(o), 0);
        const total_ads = ads.reduce((s, a) => s + parseFloat(a.amount || 0), 0);
        const cogs = parseFloat((units_sold * avgCost).toFixed(2));
        const gross_pnl = parseFloat((revenue - cogs).toFixed(2));
        const net_pnl = parseFloat((gross_pnl - total_ads).toFixed(2));
        const roas = total_ads > 0 ? parseFloat((revenue / total_ads).toFixed(2)) : null;

        const pkg = { 1: 0, 2: 0, 3: 0 };
        orders.forEach(o => {
          const k = Math.min(Math.max(parseQty(o), 1), 3);
          pkg[k] = (pkg[k] || 0) + 1;
        });

        return {
          ...m,
          orders: orders.length,
          revenue: parseFloat(revenue.toFixed(2)),
          units_sold,
          pkg,
          total_ads: parseFloat(total_ads.toFixed(2)),
          cogs,
          gross_pnl,
          net_pnl,
          roas,
        };
      }));

      return NextResponse.json({ success: true, mode: 'monthly', data: monthData });
    }

    // ── Daily Mode ──────────────────────────────────────────────────────────
    const { fromUTC, toUTC } = getDailyRange(period);

    // Date strings for ads_spend query (MYT)
    const fromDateStr = toMYTDateStr(fromUTC);
    const toDateStr   = toMYTDateStr(toUTC);

    const [orders, ads] = await Promise.all([
      fetchOrders(adminClient, fromUTC, toUTC),
      fetchAds(adminClient, fromDateStr, toDateStr),
    ]);

    // Build ads map by date
    const adsMap = {};
    ads.forEach(a => { adsMap[a.spend_date] = a; });

    // Aggregate orders by MYT date
    const ordersByDate = aggregateByDate(orders);

    // Build full date range (fill in missing dates)
    const allDates = new Set([
      ...Object.keys(ordersByDate),
      ...Object.keys(adsMap),
    ]);

    const daily = Array.from(allDates).sort((a, b) => b.localeCompare(a)).map(date => {
      const d   = ordersByDate[date] || { date, orders: 0, revenue: 0, pkg: { 1: 0, 2: 0, 3: 0 } };
      const ad  = adsMap[date] || null;
      const units_sold = Object.entries(d.pkg).reduce((s, [k, v]) => s + k * v, 0);
      const cogs       = parseFloat((units_sold * avgCost).toFixed(2));
      const gross_pnl  = parseFloat((d.revenue - cogs).toFixed(2));
      const ads_cost   = ad ? parseFloat(ad.amount) : null;
      const net_pnl    = ads_cost !== null ? parseFloat((gross_pnl - ads_cost).toFixed(2)) : null;

      return {
        date,
        orders:     d.orders,
        revenue:    parseFloat(d.revenue.toFixed(2)),
        pkg:        d.pkg,
        units_sold,
        ads_cost,
        ads_id:     ad?.id || null,
        ads_notes:  ad?.notes || null,
        cogs,
        gross_pnl,
        net_pnl,
      };
    });

    // Summary totals
    const totalRevenue   = daily.reduce((s, d) => s + d.revenue, 0);
    const totalUnits     = daily.reduce((s, d) => s + d.units_sold, 0);
    const totalAds       = daily.reduce((s, d) => s + (d.ads_cost || 0), 0);
    const totalCogs      = daily.reduce((s, d) => s + d.cogs, 0);
    const totalGrossPnl  = parseFloat((totalRevenue - totalCogs).toFixed(2));
    const totalNetPnl    = parseFloat((totalGrossPnl - totalAds).toFixed(2));
    const roas           = totalAds > 0 ? parseFloat((totalRevenue / totalAds).toFixed(2)) : null;
    const netMargin      = totalRevenue > 0 ? parseFloat(((totalNetPnl / totalRevenue) * 100).toFixed(1)) : 0;
    const totalPkg       = { 1: 0, 2: 0, 3: 0 };
    daily.forEach(d => { [1, 2, 3].forEach(k => { totalPkg[k] += (d.pkg[k] || 0); }); });

    return NextResponse.json({
      success: true,
      mode: 'daily',
      period,
      avg_cost_per_unit: avgCost,
      summary: {
        total_revenue:  parseFloat(totalRevenue.toFixed(2)),
        total_orders:   daily.reduce((s, d) => s + d.orders, 0),
        total_units:    totalUnits,
        total_pkg:      totalPkg,
        total_ads:      parseFloat(totalAds.toFixed(2)),
        total_cogs:     parseFloat(totalCogs.toFixed(2)),
        gross_pnl:      totalGrossPnl,
        net_pnl:        totalNetPnl,
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

// ─── POST — tambah/kemaskini ads cost (proxy ke ads_spend) ────────────────────
export async function POST(req) {
  try {
    const { adminClient } = await requireAdmin();
    const { spend_date, amount, notes, id } = await req.json();

    if (!spend_date || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Tarikh dan jumlah diperlukan' }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      return NextResponse.json({ success: false, error: 'Jumlah tidak sah' }, { status: 400 });
    }

    if (id) {
      // Update existing
      const { data, error } = await adminClient
        .from('ads_spend')
        .update({ amount: amt, notes: notes || null, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, data, action: 'updated' });
    } else {
      // Insert new — upsert by spend_date
      const { data, error } = await adminClient
        .from('ads_spend')
        .upsert({ spend_date, amount: amt, notes: notes || null }, { onConflict: 'spend_date' })
        .select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, data, action: 'created' });
    }
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
