// Ads Hub — ads spend automatik: belanja Meta (+SST 8%) → ads_spend ikut produk (server sahaja).
// Produk setiap campaign: tetapan manual (meta_campaign_products) → teka dari nama → default_product sambungan.
import { PRODUCTS, AD_PRODUCT_KEYS, DIGITAL_AD } from '@/lib/products';
import { fetchAll, SST_RATE } from './report';

export { SST_RATE };
// Auto ads spend hanya untuk tarikh ini ke atas — rekod sebelumnya (isian manual) tidak disentuh.
export const AUTO_SPEND_START = '2026-11-01';
const DAY = 86400000;
const round2 = n => Math.round((n || 0) * 100) / 100;

// Teka produk dari nama campaign/adset/ad. null = tak pasti.
export function guessProduct(...names) {
  const s = names.filter(Boolean).join(' ').toLowerCase();
  // Produk fizikal dulu — nama angle selalu sebut "ruqyah" (cth "Sabun Garam · Mandian Ruqyah")
  if (/pengasihan/.test(s)) return 'garam-pengasihan';
  if (/kasturi|kijang/.test(s)) return 'kasturi-kijang';
  if (/sabun/.test(s)) return 'sabun-garam';
  if (/pengisian|rawatan|ruqyah|scanning/.test(s)) return DIGITAL_AD.key;
  return null;
}

// Sambungan super_admin = HQ → ads_spend HQ (marketer_id kosong)
async function spendOwner(admin, marketerId) {
  const { data } = await admin.from('profiles').select('role').eq('id', marketerId).maybeSingle();
  return data?.role === 'super_admin' ? null : marketerId;
}

/** Senarai campaign akaun ini + produk masing-masing ({ campaign_id, campaign_name, product, source }). */
export async function campaignProducts(admin, conn) {
  const [ads, { data: manual, error }] = await Promise.all([
    fetchAll(() => admin.from('meta_ads').select('campaign_id, campaign_name, campaign_status, adset_name, name')
      .eq('marketer_id', conn.marketer_id).not('campaign_id', 'is', null).order('ad_id')),
    admin.from('meta_campaign_products').select('campaign_id, product').eq('marketer_id', conn.marketer_id),
  ]);
  if (error) throw new Error(error.message);
  const set = new Map((manual || []).map(r => [r.campaign_id, r.product]));
  const camps = new Map();
  for (const a of ads) {
    const c = camps.get(a.campaign_id) || { campaign_id: a.campaign_id, campaign_name: a.campaign_name, status: a.campaign_status, names: [] };
    c.names.push(a.adset_name, a.name);
    camps.set(a.campaign_id, c);
  }
  return [...camps.values()].map(({ names, ...c }) => {
    if (set.has(c.campaign_id)) return { ...c, product: set.get(c.campaign_id), source: 'manual' };
    const g = guessProduct(c.campaign_name, ...names);
    return { ...c, product: g || conn.default_product || 'sabun-garam', source: g ? 'teka' : 'default' };
  });
}

/**
 * Tulis ads_spend dari cache insights Meta untuk julat [from, to] (YYYY-MM-DD, termasuk; dipotong ke AUTO_SPEND_START).
 * Setiap hari × produk = belanja × 1.08. Rekod yang tiada belanja lagi dipadam (sambungan auto = sumber kebenaran).
 */
export async function fillAdsSpend(admin, conn, { from, to }) {
  if (!conn.auto_ads_spend) return { ok: true, skipped: true };
  if (from < AUTO_SPEND_START) from = AUTO_SPEND_START;
  if (from > to) return { ok: true, skipped: true };
  // Fighter berniaga sendiri — belanja ads ke fighter_ads_spend (Laporan Saya), TIDAK ke ads_spend HQ / laporan marketer
  const { data: who } = await admin.from('profiles').select('role').eq('id', conn.marketer_id).maybeSingle();
  const fighter = who?.role === 'independent';
  const owner = fighter ? null : await spendOwner(admin, conn.marketer_id);
  const table = fighter ? 'fighter_ads_spend' : 'ads_spend';
  const scope = q => (fighter ? q.eq('fighter_id', conn.marketer_id) : owner ? q.eq('marketer_id', owner) : q.is('marketer_id', null));
  const newRow = fighter ? { fighter_id: conn.marketer_id, source: 'auto' } : { marketer_id: owner };
  const changed = fighter ? { source: 'auto', updated_at: new Date().toISOString() } : {};
  const [camps, ads, ins] = await Promise.all([
    campaignProducts(admin, conn),
    fetchAll(() => admin.from('meta_ads').select('ad_id, campaign_id').eq('marketer_id', conn.marketer_id).order('ad_id')),
    fetchAll(() => admin.from('meta_insights_daily').select('ad_id, date, spend')
      .eq('marketer_id', conn.marketer_id).gte('date', from).lte('date', to).order('ad_id').order('date')),
  ]);
  const prodOfCamp = new Map(camps.map(c => [c.campaign_id, c.product]));
  const campOfAd = new Map(ads.map(a => [a.ad_id, a.campaign_id]));
  const fallback = AD_PRODUCT_KEYS.includes(conn.default_product) ? conn.default_product : 'sabun-garam';

  const want = new Map();   // `${date}|${product}` → amount
  for (const r of ins) {
    const p = prodOfCamp.get(campOfAd.get(r.ad_id)) || fallback;
    const k = `${r.date}|${AD_PRODUCT_KEYS.includes(p) ? p : fallback}`;
    want.set(k, (want.get(k) || 0) + Number(r.spend || 0));
  }

  const { data: existing, error } = await scope(admin.from(table).select('id, spend_date, product, amount')
    .gte('spend_date', from).lte('spend_date', to)).order('id');
  if (error) throw new Error(error.message);

  const have = new Map();
  const dupes = [];
  for (const r of existing || []) {
    const k = `${r.spend_date}|${r.product}`;
    if (have.has(k)) dupes.push(r.id); else have.set(k, r);
  }

  const inserts = [];
  const updates = [];
  const deletes = [...dupes];
  for (const [k, spend] of want) {
    const amount = round2(spend * (1 + SST_RATE));
    const cur = have.get(k);
    if (amount <= 0) { if (cur) deletes.push(cur.id); continue; }
    if (!cur) {
      const [spend_date, product] = k.split('|');
      inserts.push({ ...newRow, spend_date, product, amount });
    } else if (round2(cur.amount) !== amount) updates.push({ id: cur.id, amount });
  }
  for (const [k, r] of have) if (!want.has(k)) deletes.push(r.id);

  if (inserts.length) {
    const { error: e } = await admin.from(table).insert(inserts);
    if (e) throw new Error(`${table}: ${e.message}`);
  }
  for (const u of updates) {
    const { error: e } = await admin.from(table).update({ amount: u.amount, ...changed }).eq('id', u.id);
    if (e) throw new Error(`${table}: ${e.message}`);
  }
  if (deletes.length) {
    const { error: e } = await admin.from(table).delete().in('id', deletes);
    if (e) throw new Error(`${table}: ${e.message}`);
  }
  return { ok: true, inserted: inserts.length, updated: updates.length, deleted: deletes.length };
}

// Julat cache insights (35 hari terakhir, MYT) — untuk isi semula bila tetapan berubah
export function cacheRange() {
  const d = off => new Date(Date.now() + 8 * 3600000 - off * DAY).toISOString().slice(0, 10);
  return { from: d(34), to: d(0) };
}

export const PRODUCT_OPTIONS = [...PRODUCTS, DIGITAL_AD].map(p => ({ key: p.key, label: p.label }));
