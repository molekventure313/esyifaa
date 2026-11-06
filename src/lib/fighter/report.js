// Fighter — Laporan Saya: P&L bulanan + pecahan harian ikut produk (server sahaja).
//   Sales  = fighter_orders bayaran selesai (COD / FPX berbayar), bukan return / batal — sama dengan Ads Hub fighter
//   Kos    = caj sebenar lejar HQ (stok kos + markup, kredit return, pos) bila order dah dipack;
//            belum dipack → anggaran (unit × harga stok HQ semasa + pos RM4.50, +RM2 COD)
//   Return = kos parcel yang dipulangkan (pos + unit rosak) tetap ditolak, tiada sales
//   Ads    = fighter_ads_spend (auto dari Meta +SST 8% atau isian manual)
import { PRODUCTS, PRODUCT_KEYS, productOf, monthRange, todayMYT } from '@/lib/products';
import { parseAmount } from '@/lib/marketer-calc';
import { markupsFor } from '@/lib/fighter/server';
import { itemsOf } from '@/lib/fighter/orders';
import { FIGHTER_POSTAGE, FIGHTER_POSTAGE_COD_EXTRA } from '@/lib/ninjavan/shipments';

export const ADS_MIGRATION_MSG = 'Jadual ads fighter belum wujud — run migration 038 di Supabase.';
export const adsTableMissing = e => /fighter_ads_spend/.test(e?.message || '');

const OTHER = { key: 'lain-lain', label: 'Lain-lain', short: 'Lain' };
const MYT_MS = 8 * 3600 * 1000;
const toMYTDate = ts => new Date(new Date(ts).getTime() + MYT_MS).toISOString().slice(0, 10);
const r2 = n => Math.round((n || 0) * 100) / 100;
const prodKey = source => productOf(source) || OTHER.key;
const adProdKey = p => (PRODUCT_KEYS.includes(p) ? p : OTHER.key);

async function fetchPaged(build) {
  const rows = [];
  for (let off = 0; ; off += 1000) {
    const { data, error } = await build().range(off, off + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

// Harga stok HQ kepada fighter ikut SKU (kos + markup)
async function skuPrices(admin, fighterId) {
  const [{ data: products }, markups] = await Promise.all([
    admin.from('products').select('sku, cost_price'),
    markupsFor(admin, fighterId).catch(() => ({})),
  ]);
  const map = {};
  for (const p of products || []) map[p.sku] = Number(p.cost_price || 0) + Number(markups[p.sku] ?? 0);
  return map;
}

const blank = () => ({ orders: 0, sales: 0, stock: 0, postage: 0, ads: 0, returns: 0, returnCost: 0, estimated: 0 });
function finish(s) {
  const cost = s.stock + s.postage + s.returnCost;
  return {
    orders: s.orders, returns: s.returns, estimated: s.estimated,
    sales: r2(s.sales), stock: r2(s.stock), postage: r2(s.postage), returnCost: r2(s.returnCost),
    cost: r2(cost), ads: r2(s.ads), profit: r2(s.sales - cost - s.ads),
    roas: s.ads > 0 ? r2(s.sales / s.ads) : null,
  };
}

/** Laporan sebulan ('YYYY-MM') untuk seorang fighter. */
export async function fighterMonthReport(admin, fighterId, monthParam) {
  const range = monthRange(monthParam);
  const [orders, adsRes, prices, { data: conn }] = await Promise.all([
    fetchPaged(() => admin.from('fighter_orders')
      .select('id, source, amount, notes, problem, qty, payment_type, payment_status, ship_status, created_at')
      .eq('fighter_id', fighterId)
      .gte('created_at', range.from).lte('created_at', range.to)
      .order('created_at')),
    admin.from('fighter_ads_spend').select('spend_date, product, amount, source')
      .eq('fighter_id', fighterId).gte('spend_date', range.firstDay).lte('spend_date', range.lastDay),
    skuPrices(admin, fighterId),
    admin.from('meta_connections').select('auto_ads_spend, last_synced_at, status').eq('marketer_id', fighterId).maybeSingle(),
  ]);
  if (adsRes.error) throw Object.assign(new Error(adsTableMissing(adsRes.error) ? ADS_MIGRATION_MSG : adsRes.error.message), { migration: adsTableMissing(adsRes.error) });
  const ads = adsRes.data || [];

  const sold = orders.filter(o => o.payment_status === 'completed' && !['returned', 'cancelled'].includes(o.ship_status));
  const returned = orders.filter(o => o.ship_status === 'returned');
  const relevant = [...sold, ...returned];

  // Caj sebenar dari lejar HQ (bukan kredit COD — itu aliran tunai, bukan kos)
  const ledger = new Map();
  for (let i = 0; i < relevant.length; i += 200) {
    const ids = relevant.slice(i, i + 200).map(o => o.id);
    const { data, error } = await admin.from('fighter_ledger').select('order_id, kind, amount')
      .in('order_id', ids).in('kind', ['charge', 'credit', 'adjust', 'postage']);
    if (error) throw new Error(error.message);
    for (const r of data || []) {
      const l = ledger.get(r.order_id) || { stock: 0, postage: 0, hasStock: false, hasPostage: false };
      if (r.kind === 'postage') { l.postage += Number(r.amount); l.hasPostage = true; } else { l.stock += Number(r.amount); l.hasStock = true; }
      ledger.set(r.order_id, l);
    }
  }
  const estPostage = o => FIGHTER_POSTAGE + (o.payment_type === 'cod' ? FIGHTER_POSTAGE_COD_EXTRA : 0);
  const costOf = o => {
    const l = ledger.get(o.id);
    const isReturn = o.ship_status === 'returned';
    let est = false;
    let stock = l?.hasStock ? l.stock : 0;
    if (!l?.hasStock && !isReturn) { stock = itemsOf(o).reduce((t, it) => t + it.qty * (prices[it.sku] || 0), 0); est = true; }
    let postage = l?.hasPostage ? l.postage : estPostage(o);
    if (!l?.hasPostage) est = true;
    return { stock, postage, est };
  };

  const days = new Map();
  for (let i = 1; i <= range.lastDayNum; i++) {
    const date = `${range.year}-${range.mon}-${String(i).padStart(2, '0')}`;
    days.set(date, { all: blank(), prod: new Map() });
  }
  const totals = blank();
  const byProd = new Map();
  const slot = (map, k) => (map.has(k) ? map.get(k) : map.set(k, blank()).get(k));
  const addTo = (date, key, fn) => {
    const d = days.get(date);
    if (!d) return;
    for (const s of [d.all, slot(d.prod, key), totals, slot(byProd, key)]) fn(s);
  };

  for (const o of sold) {
    const c = costOf(o);
    addTo(toMYTDate(o.created_at), prodKey(o.source), s => {
      s.orders += 1; s.sales += parseAmount({ ...o, amount_paid: o.amount }); s.stock += c.stock; s.postage += c.postage; if (c.est) s.estimated += 1;
    });
  }
  for (const o of returned) {
    const c = costOf(o);
    addTo(toMYTDate(o.created_at), prodKey(o.source), s => { s.returns += 1; s.returnCost += c.stock + c.postage; });
  }
  for (const a of ads) addTo(a.spend_date, adProdKey(a.product), s => { s.ads += Number(a.amount || 0); });

  const today = todayMYT();
  const productRows = (map, { keepEmpty }) => {
    const rows = PRODUCTS.map(p => ({ key: p.key, label: p.label, short: p.short, editable: true, ...finish(map.get(p.key) || blank()) }));
    const other = map.get(OTHER.key);
    if (other && (other.orders || other.ads || other.returns)) rows.push({ ...OTHER, editable: false, ...finish(other) });
    return keepEmpty ? rows : rows.filter(r => r.orders || r.ads || r.returns || r.editable);
  };
  const dailyBreakdown = [...days.entries()].map(([date, d]) => {
    const s = finish(d.all);
    return {
      date, isToday: date === today, isFuture: date > today, ...s,
      missingAds: date <= today && s.orders > 0 && s.ads === 0,
      products: productRows(d.prod, { keepEmpty: true }),
    };
  });

  return {
    month: range.month,
    totals: finish(totals),
    productSummary: productRows(byProd, { keepEmpty: false }),
    dailyBreakdown,
    ads: {
      connected: !!conn,
      auto: !!conn?.auto_ads_spend,
      last_synced_at: conn?.last_synced_at || null,
      auto_rows: ads.filter(a => a.source === 'auto').length,
    },
  };
}

/** Simpan ads manual satu hari × satu produk. amount kosong / 0 → padam. */
export async function saveManualAds(admin, fighterId, { spend_date, product, amount }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spend_date || '')) throw new Error('Tarikh tidak sah.');
  if (!PRODUCT_KEYS.includes(product)) throw new Error('Produk tidak sah.');
  if (spend_date > todayMYT()) throw new Error('Tidak boleh isi ads untuk tarikh akan datang.');
  const value = amount === '' || amount == null ? 0 : parseFloat(amount);
  if (!Number.isFinite(value) || value < 0 || value > 1000000) throw new Error('Jumlah tidak sah.');

  const { data: conn } = await admin.from('meta_connections').select('auto_ads_spend').eq('marketer_id', fighterId).maybeSingle();
  if (conn?.auto_ads_spend) throw new Error('Ads sedang diisi automatik dari Meta. Tukar ke "Isi manual" dulu.');

  const match = q => q.eq('fighter_id', fighterId).eq('spend_date', spend_date).eq('product', product);
  if (value === 0) {
    const { error } = await match(admin.from('fighter_ads_spend').delete());
    if (error) throw Object.assign(new Error(adsTableMissing(error) ? ADS_MIGRATION_MSG : error.message), { migration: adsTableMissing(error) });
    return null;
  }
  const { data, error } = await admin.from('fighter_ads_spend')
    .upsert({ fighter_id: fighterId, spend_date, product, amount: r2(value), source: 'manual', updated_at: new Date().toISOString() },
      { onConflict: 'fighter_id,spend_date,product' })
    .select('spend_date, product, amount, source').single();
  if (error) throw Object.assign(new Error(adsTableMissing(error) ? ADS_MIGRATION_MSG : error.message), { migration: adsTableMissing(error) });
  return data;
}
