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
    case 'month': {
      // 1hb bulan semasa MYT → hari ini (calendar month, bukan rolling 30 hari)
      const startOfMonthMYT = new Date(Date.UTC(nowMYT.getUTCFullYear(), nowMYT.getUTCMonth(), 1));
      const startOfMonthUTC = new Date(startOfMonthMYT.getTime() - MYT_OFFSET_MS);
      // Previous = bulan lepas
      const startOfPrevMYT = new Date(Date.UTC(nowMYT.getUTCFullYear(), nowMYT.getUTCMonth() - 1, 1));
      const startOfPrevUTC = new Date(startOfPrevMYT.getTime() - MYT_OFFSET_MS);
      current  = { from: startOfMonthUTC, to: nowUTC };
      previous = { from: startOfPrevUTC, to: startOfMonthUTC };
      break;
    }
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
  'sabun-garam':    '🧂 Sabun Garam (Base)',
  'sabun-garam-1':  '👻 SP1 — Saka / Sihir / Santau',
  'sabun-garam-2':  '💪 SP2 — Lenguh Badan',
  'sabun-garam-3':  '🏥 SP3 — Sakit Misteri',
  'sabun-garam-4':  '🌙 SP4 — Bisikan & Emosi',
  'sabun-garam-5':  '👶 SP5 — Anak Meracau',
  'garam-pengasihan': '🧂 Garam Pengasihan Masakan',
  'kasturi-kijang':   '🦌 Minyak Kasturi Kijang',
  'fsp-checkout':   '✨ Pengisian ESyifaa (FPX)',
  'pengisian':      '✨ Pengisian ESyifaa',
};

function spLabel(source) {
  return SP_LABELS[source] || `📄 ${source || 'Tidak Diketahui'}`;
}

// ─── Query Helper ────────────────────────────────────────────────────────────
async function queryOrders(adminClient, { from, to }, marketer_id) {
  let q = adminClient
    .from('submissions')
    .select('id, full_name, phone, source, payment_type, payment_status, amount_paid, notes, problem, qty, created_at')
    .in('payment_type', ['fpx_payment', 'cod'])
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false });

  if (marketer_id === 'hq') q = q.is('marketer_id', null);
  else if (marketer_id) q = q.eq('marketer_id', marketer_id);

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
    const marketer_id = searchParams.get('marketer_id');

    const { current, previous } = getMYTBounds(period);

    let recentQ = adminClient
      .from('submissions')
      .select('id, full_name, phone, source, payment_type, amount_paid, notes, created_at, marketer_id')
      .in('payment_type', ['fpx_payment', 'cod'])
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (marketer_id === 'hq') recentQ = recentQ.is('marketer_id', null);
    else if (marketer_id) recentQ = recentQ.eq('marketer_id', marketer_id);

    // Fetch current + previous period + last 10 recent + product costs (SGH-200G, KKE-01, GPM-500G)
    const [currentOrders, previousOrders, allRecentRes, stockRes] = await Promise.all([
      queryOrders(adminClient, current, marketer_id),
      queryOrders(adminClient, previous, marketer_id),
      recentQ,
      adminClient.from('stock_summary').select('sku, avg_cost_per_unit').in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']),
    ]);

    const totals   = aggregate(currentOrders);
    const prevAgg  = aggregate(previousOrders);

    // ── Gross PNL calculation — COGS + Postage ───────────────────────────────
    const stockMap     = {};
    (stockRes.data || []).forEach(s => { stockMap[s.sku] = parseFloat(s.avg_cost_per_unit || 0); });
    const sabun_cost   = stockMap['SGH-200G'] || 0;
    const kasturi_cost = stockMap['KKE-01']   || 0;
    const garam_cost   = stockMap['GPM-500G'] || 0;

    // Sabun — unit dari qty field
    const units_sold = currentOrders
      .filter(o => (o.source || '').includes('sabun'))
      .reduce((s, o) => s + (parseInt(o.qty) || 0), 0);
    const sabun_cogs = parseFloat((units_sold * sabun_cost).toFixed(2));

    // Kasturi add-on — embedded dalam sabun orders (notes=COD, problem=FPX)
    const kasturi_count = currentOrders.filter(o =>
      /\[ADD-ON: Kasturi Kijang/i.test(o.notes || '') ||
      /Add-On:\s*Kasturi Kijang/i.test(o.problem || '')
    ).length;
    const kasturi_cogs = parseFloat((kasturi_count * kasturi_cost).toFixed(2));

    // Garam Pengasihan — standalone orders + add-on embedded dalam sabun orders
    const garam_units = currentOrders
      .filter(o => o.source === 'garam-pengasihan')
      .reduce((s, o) => s + (parseInt(o.qty) || 1), 0);
    const garam_addon_count = currentOrders.filter(o =>
      /\[ADD-ON: Garam Pengasihan/i.test(o.notes || '') ||
      /Add-On:\s*Garam Pengasihan/i.test(o.problem || '')
    ).length;
    const garam_cogs = parseFloat(((garam_units + garam_addon_count) * garam_cost).toFixed(2));

    const total_cogs = parseFloat((sabun_cogs + kasturi_cogs + garam_cogs).toFixed(2));

    // Postage — physical orders sahaja (sabun, garam-pengasihan, kasturi-kijang)
    const isPhysical = o => ['sabun', 'garam-pengasihan', 'kasturi-kijang'].some(p => (o.source || '').includes(p));
    const fpx_physical = currentOrders.filter(o => isPhysical(o) && o.payment_type === 'fpx_payment').length;
    const cod_physical = currentOrders.filter(o => isPhysical(o) && o.payment_type === 'cod').length;
    const postage_total = parseFloat((fpx_physical * 4 + cod_physical * 6).toFixed(2));

    const gross_pnl    = parseFloat((totals.revenue - total_cogs - postage_total).toFixed(2));
    const gross_margin = totals.revenue > 0
      ? parseFloat(((gross_pnl / totals.revenue) * 100).toFixed(1))
      : 0;
    const cost_configured = (sabun_cost > 0 || kasturi_cost > 0 || garam_cost > 0);
    const avg_cost = sabun_cost; // backward compat

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
      marketer_id: s.marketer_id,
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
          // Sabun
          units_sold, avg_cost: sabun_cost, sabun_cogs,
          // Kasturi add-on
          kasturi_count, kasturi_cost, kasturi_cogs,
          // Garam Pengasihan
          garam_units, garam_addon_count, garam_cost, garam_cogs,
          // Postage
          fpx_physical, cod_physical, postage_total,
          // Totals
          total_cogs,
          cogs: total_cogs,      // backward compat untuk UI
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
