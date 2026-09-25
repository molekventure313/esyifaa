import { parseAmount } from '@/lib/marketer-calc';

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
