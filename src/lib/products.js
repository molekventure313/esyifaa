import { parseAmount, calcCOGS } from '@/lib/marketer-calc';

// Produk fizikal untuk kos ads + laporan sales ikut produk.
// Sales satu order dikira pada PRODUK UTAMA order (ikut source) — termasuk semua add-on
// (cth: Sabun Garam + add-on Kasturi → semua masuk Sabun Garam).
export const PRODUCTS = [
  { key: 'sabun-garam',      label: 'Sabun Garam',      short: 'Sabun' },
  { key: 'garam-pengasihan', label: 'Garam Pengasihan', short: 'Garam' },
  { key: 'kasturi-kijang',   label: 'Kasturi Kijang',   short: 'Kasturi' },
];

export const PRODUCT_KEYS = PRODUCTS.map(p => p.key);

// source order → key produk (null = bukan produk fizikal)
export function productOf(source) {
  const s = source || '';
  if (s.startsWith('sabun-garam'))      return 'sabun-garam';     // sabun-garam, sabun-garam-1 … -5
  if (s.startsWith('garam-pengasihan')) return 'garam-pengasihan';
  if (s.startsWith('kasturi-kijang'))   return 'kasturi-kijang';
  return null;
}

const round2 = n => parseFloat((n || 0).toFixed(2));

/**
 * Ringkasan ikut produk.
 * @param subs  submissions (completed) — perlu source, amount_paid, notes
 * @param ads   ads_spend rows — perlu product, amount
 * @returns [{ key, label, short, orders, sales, ads, roas }]
 */
export function summarizeByProduct(subs, ads) {
  const map = Object.fromEntries(PRODUCTS.map(p => [p.key, { ...p, orders: 0, sales: 0, ads: 0 }]));
  for (const s of subs) {
    const k = productOf(s.source);
    if (!k) continue;
    map[k].orders += 1;
    map[k].sales  += parseAmount(s);
  }
  for (const a of ads) {
    const k = PRODUCT_KEYS.includes(a.product) ? a.product : 'sabun-garam';
    map[k].ads += parseFloat(a.amount) || 0;
  }
  return PRODUCTS.map(p => {
    const r = map[p.key];
    return { ...r, sales: round2(r.sales), ads: round2(r.ads), roas: r.ads > 0 ? round2(r.sales / r.ads) : null };
  });
}

/**
 * Simpan ads SATU hari untuk satu produk (upsert). amount 0/kosong → padam.
 * marketerId null = HQ.
 */
export async function upsertDailyAds(adminClient, { marketerId, spendDate, product, amount, userId }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spendDate || '')) throw new Error('Tarikh tidak sah.');
  if (!PRODUCT_KEYS.includes(product)) throw new Error('Produk tidak sah.');
  const todayMY = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
  if (spendDate > todayMY) throw new Error('Tidak boleh isi ads untuk tarikh akan datang.');

  const value = amount === '' || amount === null || amount === undefined ? 0 : parseFloat(amount);
  if (!Number.isFinite(value) || value < 0) throw new Error('Jumlah tidak sah.');

  let q = adminClient.from('ads_spend').select('id').eq('spend_date', spendDate).eq('product', product);
  q = marketerId ? q.eq('marketer_id', marketerId) : q.is('marketer_id', null);
  const { data: existing, error: selErr } = await q.order('id');
  if (selErr) throw selErr;
  const rows = existing || [];

  // HQ (marketer_id NULL) boleh ada rekod berganda dari borang lama — satukan jadi satu
  const [keep, ...extra] = rows;
  if (extra.length) {
    const { error } = await adminClient.from('ads_spend').delete().in('id', extra.map(r => r.id));
    if (error) throw error;
  }

  if (value === 0) {
    if (keep) {
      const { error } = await adminClient.from('ads_spend').delete().eq('id', keep.id);
      if (error) throw error;
    }
    return null;
  }

  const amt = round2(value);
  const { data, error } = keep
    ? await adminClient.from('ads_spend').update({ amount: amt }).eq('id', keep.id).select().single()
    : await adminClient.from('ads_spend')
        .insert({ marketer_id: marketerId || null, spend_date: spendDate, product, amount: amt, ...(marketerId ? {} : { created_by: userId || null }) })
        .select().single();
  if (error) throw error;
  return data;
}

// ─── Jadual harian ikut produk (page Gaji marketer & page Kos Ads HQ) ─────────

const MYT_MS = 8 * 3600 * 1000;
const toMYTDate = (ts) => new Date(new Date(ts).getTime() + MYT_MS).toISOString().split('T')[0];
export const todayMYT = () => new Date(Date.now() + MYT_MS).toISOString().split('T')[0];

// 'YYYY-MM' → julat bulan (MYT). Param tak sah → bulan semasa.
export function monthRange(monthParam) {
  const m = /^\d{4}-\d{2}$/.test(monthParam || '') ? monthParam : todayMYT().slice(0, 7);
  const [year, month] = m.split('-');
  const lastDayNum = new Date(Date.UTC(parseInt(year), parseInt(month), 0)).getUTCDate();
  const firstDay = `${year}-${month}-01`;
  const lastDay  = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`;
  return { month: m, year, mon: month, lastDayNum, firstDay, lastDay, from: `${firstDay}T00:00:00+08:00`, to: `${lastDay}T23:59:59+08:00` };
}

// Kos seunit produk dari stock_summary → param untuk calcCOGS
export async function fetchProductCosts(adminClient) {
  const map = {};
  try {
    const { data } = await adminClient.from('stock_summary').select('sku, avg_cost_per_unit').in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']);
    (data || []).forEach(s => { map[s.sku] = parseFloat(s.avg_cost_per_unit || 0); });
  } catch (_) { /* ignore — COGS produk = 0 */ }
  return { sabunCost: map['SGH-200G'] || 0, kasturiCost: map['KKE-01'] || 0, garamCost: map['GPM-500G'] || 0 };
}

const OTHER = { key: 'lain-lain', label: 'Lain-lain', short: 'Lain', editable: false };

// Stat satu kumpulan order + ads → { orders, sales, ads, cogs, profit, roas }
function groupStats(subs, adsAmount, costs) {
  const sales = subs.reduce((t, s) => t + parseAmount(s), 0);
  const cogs  = calcCOGS(subs, costs);
  return {
    orders: subs.length,
    sales:  round2(sales),
    ads:    round2(adsAmount),
    cogs:   round2(cogs),
    profit: round2(sales - adsAmount - cogs),
    roas:   adsAmount > 0 ? round2(sales / adsAmount) : null,
  };
}

// Pecahan ikut produk untuk satu set order + ads. 'Lain-lain' hanya bila ada sales bukan fizikal.
function productBreakdown(subs, ads, costs) {
  const rows = PRODUCTS.map(p => {
    const pSubs = subs.filter(s => productOf(s.source) === p.key);
    const pAds  = ads.filter(a => (PRODUCT_KEYS.includes(a.product) ? a.product : 'sabun-garam') === p.key)
                     .reduce((t, a) => t + (parseFloat(a.amount) || 0), 0);
    return { ...p, editable: true, ...groupStats(pSubs, pAds, costs) };
  });
  const others = subs.filter(s => !productOf(s.source));
  if (others.length) rows.push({ ...OTHER, ...groupStats(others, 0, costs) });
  return rows;
}

/**
 * Jadual harian sebulan (1hb → hujung bulan) + ringkasan produk bulanan.
 * @param subs  submissions completed (perlu: source, amount_paid, notes, problem, qty, payment_type, created_at)
 * @param ads   ads_spend (perlu: amount, spend_date, product)
 * @param commissionPct  null = tiada komisen (HQ)
 */
export function buildMonthlyBreakdown({ subs, ads, range, costs, commissionPct = null }) {
  const today = todayMYT();
  const days = [];
  for (let i = 1; i <= range.lastDayNum; i++) {
    const date    = `${range.year}-${range.mon}-${String(i).padStart(2, '0')}`;
    const daySubs = subs.filter(s => toMYTDate(s.created_at) === date);
    const dayAds  = ads.filter(a => a.spend_date === date);
    const adsTotal = dayAds.reduce((t, a) => t + (parseFloat(a.amount) || 0), 0);
    const stats   = groupStats(daySubs, adsTotal, costs);
    const isFuture = date > today;
    days.push({
      date, isFuture, isToday: date === today,
      ...stats,
      komisen: commissionPct === null ? null : round2(Math.max(0, stats.profit * commissionPct / 100)),
      missingAds: !isFuture && stats.orders > 0 && adsTotal === 0,
      products: productBreakdown(daySubs, dayAds, costs),
    });
  }
  return { days, productSummary: productBreakdown(subs, ads, costs) };
}
