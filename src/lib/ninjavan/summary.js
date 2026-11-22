// Ringkasan Pos & COD (status parcel + floating COD) — dikongsi oleh dashboard HQ & Portal Fighter.
import { periodRange, productOf, PRODUCTS, isPhysicalOrder } from '@/lib/products';
import { parseAmount } from '@/lib/marketer-calc';
import { NV_ENV } from './api';
import { latestShipmentsBy, statusGroupOf } from './shipments';

export const GROUPS = ['pending_pickup', 'in_transit', 'exception', 'delivered', 'returned', 'cancelled', 'failed'];
const round2 = n => Math.round(n * 100) / 100;

/**
 * scope: 'hq' (parcel order HQ sahaja) | 'fighter' (semua parcel fighter) | { fighterId } (parcel seorang fighter)
 * product: 'all' | key produk (PRODUCTS) | 'lain' (parcel tanpa produk fizikal dikenali, cth ujian)
 * Floating COD = COD parcel Delivered yang belum ditanda diterima dari NinjaVan (cod_remitted_at kosong).
 * Kiraan status & COD dikira selepas tapis produk; product_counts = bilangan parcel setiap produk (sebelum tapis).
 */
export async function buildNvSummary(db, { period = 'month', scope = 'hq', product = 'all' } = {}) {
  const range = periodRange(period);
  const fighterScope = scope !== 'hq';
  const all = [];
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
    all.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  // Tapis produk (ikut source order HQ / fighter)
  const productKeyOf = r => productOf((fighterScope ? r.fighter_order : r.submission)?.source) || 'lain';
  const productCounts = { all: all.length };
  for (const r of all) { const k = productKeyOf(r); productCounts[k] = (productCounts[k] || 0) + 1; }
  const rows = product && product !== 'all' ? all.filter(r => productKeyOf(r) === product) : all;

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
      product: productKeyOf(r),
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
    product: product || 'all',
    products: [
      ...PRODUCTS.map(p => ({ key: p.key, label: p.label, count: productCounts[p.key] || 0 })),
      ...(productCounts.lain ? [{ key: 'lain', label: 'Lain-lain', count: productCounts.lain }] : []),
    ],
    product_total: productCounts.all,
    parcels,
    ...(fighterScope && scope !== 'fighter' ? {} : { unpushed: await unpushedSummary(db, { scope, product }) }),
  };
}

async function fetchAll(build) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

/**
 * Order SELESAI (FPX dibayar / COD dihantar) yang belum dihantar ke NinjaVan — SEMUA tarikh (backlog, tidak ikut penapis tempoh) & tapis produk.
 * HQ: submissions fizikal, belum return, tiada parcel aktif (syarat sama dengan amaran 'unpushed').
 * Fighter: fighter_orders ship_status 'new' bagi fighter yang guna akaun NinjaVan HQ (courier 'own' diabaikan).
 * Order pending / belum bayar tidak dikira.
 */
async function unpushedSummary(db, { scope, product }) {
  let rows = [];
  if (scope === 'hq') {
    const subs = (await fetchAll(() => (db.from('submissions')
      .select('id, source, payment_type, amount_paid, notes, created_at')
      .eq('payment_status', 'completed').is('returned_at', null).is('ninjavan_exported_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .order('created_at', { ascending: true })))).filter(isPhysicalOrder);
    const nv = subs.length ? await latestShipmentsBy(db, 'submission_id', subs.map(o => o.id)) : {};
    rows = subs
      .filter(o => ['none', 'cancelled', 'failed'].includes(statusGroupOf(nv[o.id])))
      .map(o => ({ source: o.source, cod: o.payment_type === 'cod', amount: parseAmount(o), created_at: o.created_at }));
  } else {
    const orders = await fetchAll(() => (db.from('fighter_orders')
      .select('id, fighter_id, source, payment_type, amount, created_at')
      .eq('payment_status', 'completed').eq('ship_status', 'new')
      .order('created_at', { ascending: true })));
    const fids = [...new Set(orders.map(o => o.fighter_id).filter(Boolean))];
    const { data: st } = fids.length ? await db.from('fighter_settings').select('fighter_id, courier').in('fighter_id', fids) : { data: [] };
    const own = new Set((st || []).filter(r => r.courier === 'own').map(r => r.fighter_id));
    rows = orders
      .filter(o => !own.has(o.fighter_id))
      .map(o => ({ source: o.source, cod: o.payment_type === 'cod', amount: Number(o.amount) || 0, created_at: o.created_at }));
  }
  if (product && product !== 'all') rows = rows.filter(r => (productOf(r.source) || 'lain') === product);

  const old = Date.now() - 3 * 864e5;
  const sum = arr => round2(arr.reduce((n, r) => n + r.amount, 0));
  const cod = rows.filter(r => r.cod), fpx = rows.filter(r => !r.cod);
  return {
    count: rows.length, amount: sum(rows),
    cod_count: cod.length, cod_amount: sum(cod), fpx_count: fpx.length, fpx_amount: sum(fpx),
    over_3_days: rows.filter(r => new Date(r.created_at).getTime() < old).length,
  };
}
