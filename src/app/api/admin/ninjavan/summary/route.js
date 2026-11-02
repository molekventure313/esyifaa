import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';
import { periodRange } from '@/lib/products';
import { NV_ENV } from '@/lib/ninjavan/api';
import { statusGroupOf } from '@/lib/ninjavan/shipments';

// GET ?period=today|yesterday|month|year|all — Dashboard Pos & COD (parcel dicipta dalam tempoh).
// Floating COD = COD parcel Delivered yang belum ditanda diterima dari NinjaVan (cod_remitted_at kosong).
export const dynamic = 'force-dynamic';

const GROUPS = ['pending_pickup', 'in_transit', 'exception', 'delivered', 'returned', 'cancelled', 'failed'];
const round2 = n => Math.round(n * 100) / 100;

export async function GET(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  const range = periodRange(new URL(req.url).searchParams.get('period') || 'month');

  const rows = [];
  for (let from = 0; ; from += 1000) {
    let q = g.admin.from('ninjavan_shipments')
      .select('id, submission_id, tracking_number, status, event, cod_amount, is_test, last_event_at, delivered_at, returned_at, cod_remitted_at, created_at, submission:submissions(full_name, phone, source)')
      .eq('env', NV_ENV)
      .order('created_at', { ascending: false })
      .range(from, from + 999);
    if (range) q = q.gte('created_at', range.from).lte('created_at', range.to);
    const { data, error } = await q;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  const counts = Object.fromEntries(GROUPS.map(k => [k, 0]));
  const cod = Object.fromEntries(GROUPS.map(k => [k, 0]));
  let floating = 0, floatingCount = 0, remitted = 0;
  const parcels = rows.map(r => {
    const group = statusGroupOf(r);
    const amt = parseFloat(r.cod_amount || 0);
    counts[group]++;
    cod[group] += amt;
    if (group === 'delivered' && amt > 0) {
      if (r.cod_remitted_at) remitted += amt;
      else { floating += amt; floatingCount++; }
    }
    return {
      id: r.id, submission_id: r.submission_id, tracking_number: r.tracking_number, status: r.status, event: r.event,
      group, cod_amount: amt, is_test: r.is_test, last_event_at: r.last_event_at, delivered_at: r.delivered_at,
      returned_at: r.returned_at, cod_remitted_at: r.cod_remitted_at, created_at: r.created_at,
      name: r.submission?.full_name || (r.is_test ? 'Order ujian' : '—'), phone: r.submission?.phone || '', source: r.submission?.source || '',
    };
  });

  const finished = counts.delivered + counts.returned;
  const active = rows.length - counts.cancelled - counts.failed;
  return NextResponse.json({
    success: true,
    env: NV_ENV,
    counts,
    cod: {
      ...Object.fromEntries(Object.entries(cod).map(([k, v]) => [k, round2(v)])),
      total: round2(GROUPS.filter(k => !['cancelled', 'failed'].includes(k)).reduce((s, k) => s + cod[k], 0)),
      floating: round2(floating), floating_count: floatingCount, remitted: round2(remitted),
      on_the_way: round2(cod.pending_pickup + cod.in_transit + cod.exception),
    },
    rates: {
      delivered_pct: finished ? round2((counts.delivered / finished) * 100) : null,
      returned_pct: finished ? round2((counts.returned / finished) * 100) : null,
    },
    total: rows.length,
    active,
    parcels,
  });
}
