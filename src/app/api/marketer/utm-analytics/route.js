import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCampaignTree, summarizeClicks } from '@/lib/utm';

const MYT_MS = 8 * 3600 * 1000;

function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
}

function getPeriodRange(period) {
  const nowMYT   = new Date(Date.now() + MYT_MS);
  const todayStr = nowMYT.toISOString().split('T')[0];
  const DAY      = 86400000;
  if (period === 'today')
    return { from: `${todayStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00` };
  if (period === 'yesterday') {
    const y = new Date(nowMYT); y.setUTCDate(nowMYT.getUTCDate() - 1);
    const yStr = y.toISOString().split('T')[0];
    return { from: `${yStr}T00:00:00+08:00`, to: `${yStr}T23:59:59+08:00` };
  }
  if (period === 'week') {
    const wStr = new Date(Date.now() - 6 * DAY).toISOString().split('T')[0];
    return { from: `${wStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00` };
  }
  if (period === 'month') {
    const mStr = `${nowMYT.getUTCFullYear()}-${String(nowMYT.getUTCMonth() + 1).padStart(2, '0')}-01`;
    return { from: `${mStr}T00:00:00+08:00`, to: `${todayStr}T23:59:59+08:00` };
  }
  return { from: null, to: null };
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'marketer')
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';
    const { from, to } = getPeriodRange(period);

    const SP_LABELS = {
      'sabun-garam-1': 'SP1 Saka/Sihir', 'sabun-garam-2': 'SP2 Lenguh',
      'sabun-garam-3': 'SP3 Sakit Misteri', 'sabun-garam-4': 'SP4 Bisikan',
      'sabun-garam-5': 'SP5 Anak Meracau', 'fsp-checkout': 'Pengisian (FPX)',
      'pengisian': 'Pengisian', 'garam-pengasihan': 'Garam Pengasihan', 'kasturi-kijang': 'Kasturi Kijang',
    };

    let q = admin.from('submissions')
      .select('id, full_name, source, amount_paid, notes, payment_type, created_at, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .eq('marketer_id', user.id)   // ← filter marketer sendiri
      .order('created_at', { ascending: false });

    if (from) q = q.gte('created_at', from);
    if (to)   q = q.lte('created_at', to);

    const { data: subs, error } = await q;
    if (error) throw error;

    // Klik WhatsApp (section SP) — marketer sendiri, tempoh sama
    let cq = admin.from('wa_clicks')
      .select('id, created_at, ip_address, utm_source, utm_medium, utm_campaign, utm_content')
      .eq('marketer_id', user.id);
    if (from) cq = cq.gte('created_at', from);
    if (to)   cq = cq.lte('created_at', to);
    const { data: clicks } = await cq;

    const orders = (subs || []).map(s => ({
      id: s.id, created_at: s.created_at,
      full_name: s.full_name || '—',
      source: s.source, source_label: SP_LABELS[s.source] || s.source || '—',
      amount: parseAmount(s), payment_type: s.payment_type,
      utm_source: s.utm_source || null, utm_campaign: s.utm_campaign || null,
      utm_medium: s.utm_medium || null, utm_content: s.utm_content || null,
      utm_term: s.utm_term || null,
      has_utm: !!(s.utm_source || s.utm_campaign || s.utm_medium || s.utm_content),
    }));

    const total_orders    = orders.length;
    const total_revenue   = parseFloat(orders.reduce((s, o) => s + o.amount, 0).toFixed(2));
    const utm_orders      = orders.filter(o => o.has_utm);
    const non_utm_orders  = orders.filter(o => !o.has_utm);
    const utm_revenue     = parseFloat(utm_orders.reduce((s, o) => s + o.amount, 0).toFixed(2));
    const non_utm_revenue = parseFloat(non_utm_orders.reduce((s, o) => s + o.amount, 0).toFixed(2));

    return NextResponse.json({
      success: true, period,
      summary: {
        total_orders, total_revenue,
        utm_orders: utm_orders.length, non_utm_orders: non_utm_orders.length,
        utm_revenue, non_utm_revenue,
        utm_pct: total_orders > 0 ? parseFloat(((utm_orders.length / total_orders) * 100).toFixed(1)) : 0,
        ...summarizeClicks(clicks || []),
      },
      campaigns: buildCampaignTree(orders, clicks || []),
      orders,
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
