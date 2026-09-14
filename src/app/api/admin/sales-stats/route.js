import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── Timezone helpers (MYT = UTC+8) ────────────────────────────────────────
const MYT_OFFSET_MS = 8 * 3600 * 1000;

function getMYTBounds(period) {
  const nowUTC = new Date();
  const nowMYT = new Date(nowUTC.getTime() + MYT_OFFSET_MS);

  // Start of today in MYT → convert back to UTC
  const todayMYT = new Date(nowMYT);
  todayMYT.setUTCHours(0, 0, 0, 0);
  const startOfTodayUTC = new Date(todayMYT.getTime() - MYT_OFFSET_MS);

  const DAY = 86400000;

  let current = {};
  let previous = {};

  switch (period) {
    case 'today':
      current  = { from: startOfTodayUTC, to: nowUTC };
      previous = { from: new Date(startOfTodayUTC - DAY), to: new Date(startOfTodayUTC) };
      break;
    case 'yesterday': {
      const yStart = new Date(startOfTodayUTC - DAY);
      const yEnd   = new Date(startOfTodayUTC);
      current  = { from: yStart, to: yEnd };
      previous = { from: new Date(yStart - DAY), to: yStart };
      break;
    }
    case 'week':
      current  = { from: new Date(nowUTC - 7 * DAY), to: nowUTC };
      previous = { from: new Date(nowUTC - 14 * DAY), to: new Date(nowUTC - 7 * DAY) };
      break;
    case 'month':
      current  = { from: new Date(nowUTC - 30 * DAY), to: nowUTC };
      previous = { from: new Date(nowUTC - 60 * DAY), to: new Date(nowUTC - 30 * DAY) };
      break;
    default: // 'all'
      current  = { from: null, to: null };
      previous = { from: null, to: null };
  }

  return { current, previous };
}

// ─── Amount Parser ───────────────────────────────────────────────────────────
function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
}

// ─── SP Label Map ────────────────────────────────────────────────────────────
const SP_LABELS = {
  'sabun-garam':   '🧂 Sabun Garam (Base)',
  'sabun-garam-1': '👻 SP1 — Saka / Sihir / Santau',
  'sabun-garam-2': '💪 SP2 — Lenguh Badan',
  'sabun-garam-3': '🏥 SP3 — Sakit Misteri',
  'sabun-garam-4': '🌙 SP4 — Bisikan & Emosi',
  'sabun-garam-5': '👶 SP5 — Anak Meracau',
  'fsp-checkout':  '✨ Pengisian ESyifaa (FPX)',
  'pengisian':     '✨ Pengisian ESyifaa',
};

function spLabel(source) {
  return SP_LABELS[source] || `📄 ${source || 'Tidak Diketahui'}`;
}

// ─── Query Helper ────────────────────────────────────────────────────────────
async function queryOrders(adminClient, { from, to }) {
  let q = adminClient
    .from('submissions')
    .select('id, full_name, phone, source, payment_type, payment_status, amount_paid, notes, created_at')
    .in('payment_type', ['fpx_payment', 'cod'])
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false });

  if (from) q = q.gte('created_at', from.toISOString());
  if (to)   q = q.lte('created_at', to.toISOString());

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// ─── Aggregate ───────────────────────────────────────────────────────────────
function aggregate(orders) {
  let revenue = 0, fpx_revenue = 0, cod_revenue = 0;
  let fpx_orders = 0, cod_orders = 0;
  const bySource = {};

  for (const s of orders) {
    const amt = parseAmount(s);
    revenue += amt;

    if (s.payment_type === 'fpx_payment') {
      fpx_revenue += amt;
      fpx_orders++;
    } else {
      cod_revenue += amt;
      cod_orders++;
    }

    const src = s.source || 'unknown';
    if (!bySource[src]) bySource[src] = { source: src, label: spLabel(src), orders: 0, revenue: 0 };
    bySource[src].orders++;
    bySource[src].revenue += amt;
  }

  // Sort salespage breakdown by revenue desc
  const by_salespage = Object.values(bySource)
    .sort((a, b) => b.revenue - a.revenue)
    .map(sp => ({ ...sp, revenue: parseFloat(sp.revenue.toFixed(2)) }));

  return {
    revenue: parseFloat(revenue.toFixed(2)),
    orders: orders.length,
    fpx_revenue: parseFloat(fpx_revenue.toFixed(2)),
    fpx_orders,
    cod_revenue: parseFloat(cod_revenue.toFixed(2)),
    cod_orders,
    by_salespage,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    const { current, previous } = getMYTBounds(period);

    // ── Build stock movements query for the current period ──────────────────
    let stockMovQ = adminClient
      .from('stock_movements')
      .select('qty')
      .eq('movement_type', 'out');

    if (current.from) stockMovQ = stockMovQ.gte('created_at', current.from.toISOString());
    if (current.to)   stockMovQ = stockMovQ.lte('created_at', current.to.toISOString());

    // Fetch current + previous period + last 10 recent + stock data
    const [currentOrders, previousOrders, allRecentRes, stockMovRes, stockSumRes] = await Promise.all([
      queryOrders(adminClient, current),
      queryOrders(adminClient, previous),
      adminClient
        .from('submissions')
        .select('id, full_name, phone, source, payment_type, amount_paid, notes, created_at')
        .in('payment_type', ['fpx_payment', 'cod'])
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10),
      stockMovQ,
      adminClient.from('stock_summary').select('avg_cost_per_unit').eq('sku', 'SGH-200G').maybeSingle(),
    ]);

    const totals   = aggregate(currentOrders);
    const prevAgg  = aggregate(previousOrders);

    // ── Gross PNL calculation ────────────────────────────────────────────────
    const units_sold     = (stockMovRes.data || []).reduce((s, m) => s + (m.qty || 0), 0);
    const avg_cost       = parseFloat(stockSumRes.data?.avg_cost_per_unit || 0);
    const cogs           = parseFloat((units_sold * avg_cost).toFixed(2));
    const gross_pnl      = parseFloat((totals.revenue - cogs).toFixed(2));
    const gross_margin   = totals.revenue > 0
      ? parseFloat(((gross_pnl / totals.revenue) * 100).toFixed(1))
      : 0;
    const cost_configured = avg_cost > 0; // false = admin belum isi kos seunit

    // % change vs previous period
    const revPct = prevAgg.revenue > 0
      ? ((totals.revenue - prevAgg.revenue) / prevAgg.revenue * 100)
      : (totals.revenue > 0 ? 100 : 0);
    const ordPct = prevAgg.orders > 0
      ? ((totals.orders - prevAgg.orders) / prevAgg.orders * 100)
      : (totals.orders > 0 ? 100 : 0);

    // Format recent orders
    const recent_orders = (allRecentRes.data || []).map(s => ({
      id: s.id,
      full_name: s.full_name,
      phone: s.phone,
      source: s.source,
      source_label: spLabel(s.source),
      payment_type: s.payment_type,
      amount: parseAmount(s),
      created_at: s.created_at,
    }));

    return NextResponse.json({
      success: true,
      period,
      data: {
        totals,
        vs_previous: {
          revenue: parseFloat(revPct.toFixed(1)),
          orders: parseFloat(ordPct.toFixed(1)),
          prev_revenue: prevAgg.revenue,
          prev_orders: prevAgg.orders,
        },
        by_salespage: totals.by_salespage,
        recent_orders,
        pnl: {
          units_sold,
          avg_cost,
          cogs,
          gross_pnl,
          gross_margin,
          cost_configured,
        },
      },
    });
  } catch (error) {
    console.error('Sales Stats API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
