// Ringkasan & sejarah stok untuk page Stok (server sahaja).
// "Baki" = baki sistem (stock_summary). Order HQ menolak stok bila order masuk, jadi barang order yang belum
// dipack masih berada di rak → "di rak" = baki + menunggu pack (HQ). Order fighter menolak stok bila HQ pack,
// jadi order fighter yang belum dipack ditolak dari "stok bebas" (belum ditolak dari baki).
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { statusGroupOf, isActiveShipment } from '@/lib/ninjavan/shipments';
import { kindOf, deltaOf, isPackaging, round2, KIND_KEYS } from '@/lib/stock-kinds';

const MYT = 8 * 3600e3;
const UUID = /^[0-9a-f-]{36}$/i;
export const dayOf = iso => new Date(new Date(iso).getTime() + MYT).toISOString().slice(0, 10);
const startOf = d => new Date(`${d}T00:00:00+08:00`).toISOString();
const endOf = d => new Date(`${d}T23:59:59.999+08:00`).toISOString();
export const todayMYT = () => dayOf(new Date().toISOString());
const addDays = (d, n) => new Date(new Date(`${d}T00:00:00Z`).getTime() + n * 864e5).toISOString().slice(0, 10);

// Query `.in()` dalam ketulan (had URL), 6 serentak
async function inChunks(ids, size, fn) {
  const chunks = [];
  for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));
  const out = [];
  for (let i = 0; i < chunks.length; i += 6) {
    const res = await Promise.all(chunks.slice(i, i + 6).map(fn));
    for (const r of res) out.push(...(r || []));
  }
  return out;
}

// Parcel terkini (live) setiap order → order dikira "dah keluar rak" bila kurier dah ambil
async function latestLiveShipments(admin, col, ids) {
  const rows = await inChunks(ids, 200, async chunk => {
    const { data, error } = await admin.from('ninjavan_shipments')
      .select(`id, ${col}, status, event, tracking_number, created_at`).eq('env', 'live').eq('is_test', false).in(col, chunk);
    if (error) throw error;
    return data;
  });
  const by = {};
  for (const s of rows) {
    const k = s[col];
    const cur = by[k];
    const better = !cur || (isActiveShipment(s) && !isActiveShipment(cur)) || (isActiveShipment(s) === isActiveShipment(cur) && s.created_at > cur.created_at);
    if (better) by[k] = s;
  }
  return { by, rows };
}

export async function stockOverview(admin) {
  const now = new Date();
  const since60 = new Date(now.getTime() - 35 * 864e5).toISOString();   // order belum dipack > 35 hari dianggap tiada
  const since7 = new Date(now.getTime() - 7 * 864e5).toISOString();

  const [{ data: products, error: pe }, { data: summary, error: se }, recent, { data: fighterOpen }] = await Promise.all([
    admin.from('products').select('*').order('created_at'),
    admin.from('stock_summary').select('id, current_stock, avg_cost_per_unit'),
    fetchAllRows(() => admin.from('stock_movements').select('product_id, movement_type, reference_type, reference_id, qty, created_at, notes')
      .gte('created_at', since60).in('movement_type', ['out', 'return'])),
    admin.from('fighter_orders').select('id, items, ship_status, payment_status').in('ship_status', ['new', 'ready']),
  ]);
  if (pe || se) throw (pe || se);
  const sum = Object.fromEntries((summary || []).map(s => [s.id, s]));
  const skuOf = Object.fromEntries((products || []).map(p => [p.id, p.sku]));

  // ── Order HQ: bersih (keluar − return) setiap order & produk ──
  const netBy = {};   // ref → { product_id: qty }
  for (const m of recent) {
    if (m.reference_type !== 'order' && m.reference_type !== 'return') continue;
    const ref = m.reference_id || '';
    const k = (netBy[ref] ||= {});
    k[m.product_id] = (k[m.product_id] || 0) + (m.movement_type === 'out' ? m.qty : -m.qty);
  }
  const hqIds = Object.keys(netBy).filter(r => UUID.test(r));
  const subs = await inChunks(hqIds, 200, async chunk => {
    const { data, error } = await admin.from('submissions').select('id, payment_status, returned_at, ninjavan_exported_at').in('id', chunk);
    if (error) throw error;
    return data;
  });
  const { by: shipOf } = await latestLiveShipments(admin, 'submission_id', subs.map(s => s.id));
  const pendingHq = {}, pendingHqOrders = {};
  for (const s of subs) {
    if (s.payment_status !== 'completed' || s.returned_at) continue;
    const sh = shipOf[s.id];
    const waiting = !s.ninjavan_exported_at || (sh && isActiveShipment(sh) && statusGroupOf(sh) === 'pending_pickup');
    if (!waiting) continue;
    for (const [pid, q] of Object.entries(netBy[s.id] || {})) {
      if (q <= 0) continue;
      pendingHq[pid] = (pendingHq[pid] || 0) + q;
      pendingHqOrders[pid] = (pendingHqOrders[pid] || 0) + 1;
    }
  }

  // ── Kotak packaging: ditolak bila push → yang parcelnya belum diambil kurier masih di rak ──
  const boxRefs = Object.keys(netBy).filter(r => r.startsWith('nv:'));
  if (boxRefs.length) {
    const ships = await inChunks(boxRefs.map(r => r.slice(3)), 200, async chunk => {
      const { data, error } = await admin.from('ninjavan_shipments').select('id, status, event, tracking_number').in('id', chunk);
      if (error) throw error;
      return data;
    });
    for (const sh of ships) {
      if (!isActiveShipment(sh) || statusGroupOf(sh) !== 'pending_pickup') continue;
      for (const [pid, q] of Object.entries(netBy[`nv:${sh.id}`] || {})) {
        if (q <= 0) continue;
        pendingHq[pid] = (pendingHq[pid] || 0) + q;
        pendingHqOrders[pid] = (pendingHqOrders[pid] || 0) + 1;
      }
    }
  }

  // ── Order fighter belum dipack (stok belum ditolak) ──
  const pendingFighter = {};
  const pidOfSku = Object.fromEntries((products || []).map(p => [p.sku, p.id]));
  for (const o of fighterOpen || []) {
    if (['cancelled', 'failed'].includes(o.payment_status)) continue;
    for (const it of Array.isArray(o.items) ? o.items : []) {
      const pid = pidOfSku[it?.sku];
      if (pid && Number(it.qty) > 0) pendingFighter[pid] = (pendingFighter[pid] || 0) + Number(it.qty);
    }
  }

  // ── Purata keluar 7 hari (order sahaja) ──
  const out7 = {};
  for (const m of recent) if (m.created_at >= since7 && kindOf(m) === 'keluar') out7[m.product_id] = (out7[m.product_id] || 0) + m.qty;

  const items = (products || []).map(p => {
    const s = sum[p.id] || {};
    const balance = s.current_stock || 0;
    const hq = pendingHq[p.id] || 0, fighter = pendingFighter[p.id] || 0;
    const free = balance - fighter;
    const perDay = round2((out7[p.id] || 0) / 7);
    const threshold = p.low_stock_threshold ?? 10;
    const status = free < 0 ? 'oversold' : free === 0 ? 'habis' : free <= threshold ? 'rendah' : 'ok';
    return {
      id: p.id, sku: p.sku, name: p.name, unit: p.unit, is_active: p.is_active, packaging: isPackaging(p.sku),
      cost_price: Number(p.cost_price || 0), selling_price: Number(p.selling_price || 0), low_stock_threshold: threshold,
      avg_cost: round2(s.avg_cost_per_unit ?? p.cost_price ?? 0),
      balance, free, on_shelf: balance + hq,
      pending_hq: hq, pending_hq_orders: pendingHqOrders[p.id] || 0, pending_fighter: fighter,
      out_per_day: perDay, days_cover: perDay > 0 && free > 0 ? Math.floor(free / perDay) : null,
      stock_value: round2(Math.max(0, balance + hq) * Number(s.avg_cost_per_unit ?? p.cost_price ?? 0)),
      status,
    };
  });
  return { products: items, total_value: round2(items.filter(i => i.is_active).reduce((t, i) => t + i.stock_value, 0)), generated_at: now.toISOString(), sku_of: skuOf };
}

/**
 * Sejarah pergerakan dalam julat tarikh (MYT).
 * opts: { sku, kinds[], from, to, q, group } — group = himpun "keluar (order)" ikut hari & produk.
 */
export async function stockActivity(admin, { sku = null, kinds = [], from, to, q = '', group = true } = {}) {
  const today = todayMYT();
  to = /^\d{4}-\d{2}-\d{2}$/.test(to || '') ? to : today;
  from = /^\d{4}-\d{2}-\d{2}$/.test(from || '') ? from : addDays(to, -29);
  if (from > to) [from, to] = [to, from];
  if (addDays(from, 366) < to) from = addDays(to, -366);

  const { data: products, error: pe } = await admin.from('products').select('id, sku, name, unit, cost_price');
  if (pe) throw pe;
  const prodById = Object.fromEntries((products || []).map(p => [p.id, p]));
  const product = sku ? (products || []).find(p => p.sku.toLowerCase() === String(sku).toLowerCase()) : null;
  if (sku && !product) throw new Error(`SKU ${sku} tidak dijumpai.`);

  const all = await fetchAllRows(() => {
    let qy = admin.from('stock_movements')
      .select('id, product_id, movement_type, qty, cost_per_unit, reference_type, reference_id, notes, created_at, created_by')
      .gte('created_at', startOf(from)).lte('created_at', endOf(to));
    if (product) qy = qy.eq('product_id', product.id);
    return qy;
  });
  all.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
  for (const m of all) m.kind = kindOf(m);

  // Baki berjalan (satu produk): baki semasa − pergerakan selepas setiap baris
  let running = null;
  if (product) {
    const [{ data: s }, after] = await Promise.all([
      admin.from('stock_summary').select('current_stock').eq('id', product.id).maybeSingle(),
      fetchAllRows(() => admin.from('stock_movements').select('id, movement_type, qty').eq('product_id', product.id).gt('created_at', endOf(to))),
    ]);
    running = (s?.current_stock || 0) - after.reduce((t, m) => t + deltaOf(m), 0);
    for (const m of all) { m.balance_after = running; running -= deltaOf(m); }
  }

  // Jumlah tempoh (sebelum tapisan jenis / carian)
  const totals = Object.fromEntries(KIND_KEYS.map(k => [k, 0]));
  const byProduct = {};
  for (const m of all) {
    totals[m.kind] += m.qty;
    const b = (byProduct[m.product_id] ||= Object.fromEntries(KIND_KEYS.map(k => [k, 0])));
    b[m.kind] += m.qty;
  }
  const keluarOrders = new Set(all.filter(m => m.kind === 'keluar').map(m => m.reference_id)).size;

  // Siri harian (graf) — ikut produk dipilih atau semua produk bukan packaging
  const daily = {};
  for (let d = from; d <= to; d = addDays(d, 1)) daily[d] = { date: d, in: 0, out: 0 };
  for (const m of all) {
    if (!product && isPackaging(prodById[m.product_id]?.sku)) continue;
    const row = daily[dayOf(m.created_at)];
    if (!row) continue;
    const d = deltaOf(m);
    if (d > 0) row.in += d; else row.out -= d;
  }
  if (product) {
    let bal = running;   // baki sebelum julat
    for (const d of Object.keys(daily).sort()) { bal += daily[d].in - daily[d].out; daily[d].balance = bal; }
  }

  // Tapisan jenis & carian
  const ql = String(q || '').trim().toLowerCase();
  let rows = all.filter(m => (!kinds.length || kinds.includes(m.kind)) && (!ql || (m.notes || '').toLowerCase().includes(ql) || String(m.reference_id || '').toLowerCase().includes(ql)));

  // Nama pelanggan untuk keluar/return (tak dihimpun) & nama pelaku untuk rekod manual
  const names = {};
  const needNames = group ? [] : rows.filter(m => ['keluar', 'return', 'rosak'].includes(m.kind)).slice(0, 1500);
  const hq = [...new Set(needNames.map(m => m.reference_id).filter(r => UUID.test(r || '')))];
  const fo = [...new Set(needNames.map(m => m.reference_id).filter(r => (r || '').startsWith('fighter:')).map(r => r.slice(8)))];
  const [subRows, foRows] = await Promise.all([
    inChunks(hq, 200, async c => (await admin.from('submissions').select('id, full_name, payment_type').in('id', c)).data),
    inChunks(fo, 200, async c => (await admin.from('fighter_orders').select('id, full_name').in('id', c)).data),
  ]);
  for (const s of subRows) names[s.id] = { name: s.full_name, payment: s.payment_type };
  for (const f of foRows) names[`fighter:${f.id}`] = { name: f.full_name, payment: 'fighter' };
  const actorIds = [...new Set(rows.filter(m => m.created_by).map(m => m.created_by))];
  const actors = actorIds.length ? Object.fromEntries(((await admin.from('profiles').select('id, full_name').in('id', actorIds)).data || []).map(p => [p.id, p.full_name])) : {};

  const shape = m => {
    const p = prodById[m.product_id] || {};
    return {
      id: m.id, at: m.created_at, kind: m.kind, sku: p.sku, product: p.name, unit: p.unit, qty: m.qty,
      cost_per_unit: m.cost_per_unit, notes: m.notes, ref: m.reference_id, balance_after: m.balance_after ?? null,
      customer: names[m.reference_id]?.name || null, payment: names[m.reference_id]?.payment || null,
      by: m.created_by ? actors[m.created_by] || null : null,
      manual: ['masuk', 'tambah'].includes(m.kind) || (m.kind === 'tolak'),
    };
  };

  let out;
  if (group) {
    const groups = {};
    out = [];
    for (const m of rows) {
      if (m.kind !== 'keluar') { out.push(shape(m)); continue; }
      const key = `${dayOf(m.created_at)}|${m.product_id}`;
      let g = groups[key];
      if (!g) {
        const p = prodById[m.product_id] || {};
        g = groups[key] = { id: `g:${key}`, group: true, at: m.created_at, date: dayOf(m.created_at), kind: 'keluar', sku: p.sku, product: p.name, unit: p.unit, qty: 0, orders: new Set(), balance_after: m.balance_after ?? null };
        out.push(g);
      }
      g.qty += m.qty;
      g.orders.add(m.reference_id);
    }
    for (const g of Object.values(groups)) g.orders = g.orders.size;
  } else {
    out = rows.map(shape);
  }

  // Senarai pembelian (batch) produk dipilih — sepanjang masa
  let batches = null;
  if (product) {
    const { data } = await admin.from('stock_movements').select('id, qty, cost_per_unit, notes, created_at, created_by')
      .eq('product_id', product.id).eq('movement_type', 'in').eq('reference_type', 'batch').order('created_at', { ascending: false }).limit(100);
    batches = (data || []).map(b => ({ ...b, total: round2(b.qty * Number(b.cost_per_unit || 0)) }));
  }

  return {
    from, to, sku: product?.sku || null, totals, keluar_orders: keluarOrders,
    by_product: Object.entries(byProduct).map(([pid, t]) => ({ sku: prodById[pid]?.sku, name: prodById[pid]?.name, unit: prodById[pid]?.unit, ...t })),
    daily: Object.values(daily), rows: out, total_rows: out.length, batches,
  };
}
