// Ringkasan Pos & COD (status parcel + floating COD) — dikongsi oleh dashboard HQ & Portal Fighter.
import { periodRange } from '@/lib/products';
import { NV_ENV } from './api';
import { statusGroupOf } from './shipments';

export const GROUPS = ['pending_pickup', 'in_transit', 'exception', 'delivered', 'returned', 'cancelled', 'failed'];
const round2 = n => Math.round(n * 100) / 100;

/**
 * scope: 'hq' (parcel order HQ sahaja) | 'fighter' (semua parcel fighter) | { fighterId } (parcel seorang fighter)
 * Floating COD = COD parcel Delivered yang belum ditanda diterima dari NinjaVan (cod_remitted_at kosong).
 */
export async function buildNvSummary(db, { period = 'month', scope = 'hq' } = {}) {
  const range = periodRange(period);
  const fighterScope = scope !== 'hq';
  const rows = [];
  for (let from = 0; ; from += 1000) {
    let q = db.from('ninjavan_shipments')
      .select(`id, submission_id, fighter_order_id, fighter_id, tracking_number, status, event, cod_amount, is_test, last_event_at, delivered_at, returned_at, cod_remitted_at, waybill_printed_at, created_at,
        ${fighterScope ? 'fighter_order:fighter_orders(full_name, phone, source)' : 'submission:submissions(full_name, phone, source)'}`)
      .eq('env', NV_ENV)
      .order('created_at', { ascending: false })
      .range(from, from + 999);
    if (scope === 'hq') q = q.is('fighter_order_id', null);
    else if (scope === 'fighter') q = q.not('fighter_order_id', 'is', null);
    else q = q.eq('fighter_id', scope.fighterId);
    if (range) q = q.gte('created_at', range.from).lte('created_at', range.to);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  // Nama fighter (tab Fighter di HQ)
  let fighterName = {};
  if (scope === 'fighter') {
    const ids = [...new Set(rows.map(r => r.fighter_id).filter(Boolean))];
    if (ids.length) {
      const { data: people } = await db.from('profiles').select('id, full_name, marketer_code').in('id', ids);
      fighterName = Object.fromEntries((people || []).map(p => [p.id, `${p.full_name} (${p.marketer_code})`]));
    }
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
    const who = fighterScope ? r.fighter_order : r.submission;
    return {
      id: r.id, submission_id: r.submission_id, fighter_order_id: r.fighter_order_id, tracking_number: r.tracking_number, status: r.status, event: r.event,
      group, cod_amount: amt, is_test: r.is_test, last_event_at: r.last_event_at, delivered_at: r.delivered_at,
      returned_at: r.returned_at, cod_remitted_at: r.cod_remitted_at, printed_at: r.waybill_printed_at, created_at: r.created_at,
      name: who?.full_name || (r.is_test ? 'Order ujian' : '—'), phone: who?.phone || '', source: who?.source || '',
      fighter_name: fighterName[r.fighter_id] || null,
    };
  });

  const finished = counts.delivered + counts.returned;
  const active = rows.length - counts.cancelled - counts.failed;
  return {
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
  };
}
