// Ads Hub — gabung prestasi Meta (cache) dengan order sebenar (submissions) → ROAS sebenar. Server sahaja.
import { parseAmount, calcCOGS } from '@/lib/marketer-calc';
import { fetchProductCosts, productOf, DIGITAL_AD } from '@/lib/products';
import { resolveOwner, applyOwner } from '@/lib/team';
import { campaignProducts } from './spend';

// SST 8% atas belanja Meta — kos ads sebenar (sama dengan rekod ads_spend)
export const SST_RATE = 0.08;

const MYT_MS = 8 * 3600 * 1000;
const DAY = 86400000;
const r2 = n => Math.round((n || 0) * 100) / 100;
const div = (a, b) => (b > 0 ? r2(a / b) : null);
const mytDate = (ms = Date.now()) => new Date(ms + MYT_MS).toISOString().slice(0, 10);
const toMyt = iso => mytDate(new Date(iso).getTime());

export const PERIODS = {
  today:     { label: 'Hari Ini', days: 1 },
  yesterday: { label: 'Semalam',  days: 1, offset: 1 },
  '7d':      { label: '7 Hari',   days: 7 },
  '30d':     { label: '30 Hari',  days: 30 },
  month:     { label: 'Bulan Ini' },
  last_month: { label: 'Bulan Lepas' },
};

export function periodRange(period) {
  const p = PERIODS[period] || PERIODS['7d'];
  const today = mytDate();
  if (period === 'month') return { from: `${today.slice(0, 8)}01`, to: today };
  if (period === 'last_month') {
    const [y, m] = today.split('-').map(Number);
    const last = new Date(Date.UTC(y, m - 1, 0)).toISOString().slice(0, 10);   // hari terakhir bulan lepas
    return { from: `${last.slice(0, 8)}01`, to: last };
  }
  const end = mytDate(Date.now() - (p.offset || 0) * DAY);
  const start = mytDate(Date.now() - ((p.offset || 0) + p.days - 1) * DAY);
  return { from: start, to: end };
}

function datesBetween(from, to) {
  const out = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d = new Date(d.getTime() + DAY)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

// Profit lepas ads = jualan − COGS (kos produk + postage) − belanja ads (+SST). ROI = profit lepas ads ÷ kos ads.
function metrics(m) {
  const adsCost = m.spend * (1 + SST_RATE);
  const profit = m.revenue - m.cogs - adsCost;
  return {
    spend: r2(m.spend), orders: m.orders, revenue: r2(m.revenue),
    cogs: r2(m.cogs), ads_cost: r2(adsCost), profit: r2(profit), roi: div(profit, adsCost),
    roas: div(m.revenue, m.spend), cpa: m.orders ? div(m.spend, m.orders) : null, aov: div(m.revenue, m.orders),
    impressions: m.impressions, link_clicks: m.link_clicks,
    ctr: m.impressions ? r2((m.link_clicks / m.impressions) * 100) : null,
    cpm: m.impressions ? r2((m.spend / m.impressions) * 1000) : null,
    pixel_purchases: m.pixel_purchases, pixel_roas: div(m.pixel_value, m.spend),
  };
}
const blank = () => ({ spend: 0, orders: 0, revenue: 0, cogs: 0, impressions: 0, link_clicks: 0, pixel_purchases: 0, pixel_value: 0 });
const addInto = (t, m) => { for (const k of Object.keys(blank())) t[k] += m[k]; };

// Supabase pulangkan maksimum 1000 baris setiap query — ambil berperingkat
export async function fetchAll(build) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) return rows;
  }
}

/**
 * Laporan Ads Hub seorang marketer untuk satu tempoh.
 * Order dikira jika: completed, bukan return, FPX/COD, milik marketer (termasuk teamsale).
 * Ringkasan & trend harian = SEMUA order (organik/WhatsApp/tiada UTM pun datang kesan ads).
 * Jadual kempen/angle/ad = order yang dipadankan dengan ad (utm_content = ID ad akaun ini) sahaja.
 * Sambungan super_admin = akaun HQ → padan order HQ (marketer_id kosong).
 */
export function buildOverview(admin, marketerId, period, { product } = {}) {
  return buildReport(admin, marketerId, { period, ...periodRange(period), product });
}

// Produk order: produk fizikal ikut source, selain itu Pengisian / Digital
const orderProduct = s => productOf(s.source) || DIGITAL_AD.key;

// adId (pilihan) → hadkan kepada satu ad sahaja (sejarah ad).
// product (pilihan) → hanya ads dalam kempen produk itu (tetapan kad Ads Spend) + order tak padan produk itu.
export async function buildReport(admin, marketerId, { period, from, to, adId, product }) {
  const { data: who } = await admin.from('profiles').select('role').eq('id', marketerId).maybeSingle();
  const owner = await resolveOwner(admin, who?.role === 'super_admin' ? 'hq' : marketerId);
  const oneAd = q => (adId ? q.eq('ad_id', adId) : q);
  const oneAdOrders = q => (adId ? q.eq('utm_content', adId) : q);

  const [{ data: conn, error: connErr }, allAds, allIns, subs, costs] = await Promise.all([
    admin.from('meta_connections')
      .select('ad_account_id, ad_account_name, currency, status, status_message, last_synced_at, token_last4, default_product')
      .eq('marketer_id', marketerId).maybeSingle(),
    fetchAll(() => oneAd(admin.from('meta_ads').select('*').eq('marketer_id', marketerId)).order('ad_id')),
    fetchAll(() => oneAd(admin.from('meta_insights_daily').select('*').eq('marketer_id', marketerId))
      .gte('date', from).lte('date', to).order('ad_id').order('date')),
    fetchAll(() => applyOwner(oneAdOrders(admin.from('submissions')
      .select('id, amount_paid, notes, problem, source, qty, created_at, utm_content, payment_type')), owner)
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', `${from}T00:00:00+08:00`)
      .lte('created_at', `${to}T23:59:59+08:00`)
      .order('created_at')),
    fetchProductCosts(admin),
  ]);
  if (connErr) throw new Error(connErr.message);

  let ads = allAds;
  if (product) {
    const camps = await campaignProducts(admin, { marketer_id: marketerId, default_product: conn?.default_product });
    const prodOf = new Map(camps.map(c => [c.campaign_id, c.product]));
    ads = allAds.filter(a => prodOf.get(a.campaign_id) === product);
  }
  const adMap = new Map(ads.map(a => [a.ad_id, a]));
  const allAdIds = new Set(allAds.map(a => a.ad_id));
  const ins = product ? allIns.filter(r => adMap.has(r.ad_id)) : allIns;
  const perAd = new Map();
  const bucket = id => (perAd.has(id) ? perAd.get(id) : perAd.set(id, blank()).get(id));
  const days = new Map(datesBetween(from, to).map(d => [d, blank()]));

  for (const r of ins) {
    const m = bucket(r.ad_id);
    const d = days.get(r.date) || blank();
    for (const t of [m, d]) {
      t.spend += parseFloat(r.spend) || 0;
      t.impressions += r.impressions || 0;
      t.link_clicks += r.link_clicks || 0;
      t.pixel_purchases += r.pixel_purchases || 0;
      t.pixel_value += parseFloat(r.pixel_value) || 0;
    }
  }

  const unmatched = { orders: 0, revenue: 0, cogs: 0 };
  for (const s of subs) {
    const amount = parseAmount(s);
    if (s.utm_content && adMap.has(s.utm_content)) {
      const cogs = calcCOGS([s], costs);
      const m = bucket(s.utm_content);
      m.orders++; m.revenue += amount; m.cogs += cogs;
      const d = days.get(toMyt(s.created_at));
      if (d) { d.orders++; d.revenue += amount; d.cogs += cogs; }
    } else if (!product || (!allAdIds.has(s.utm_content) && orderProduct(s) === product)) {
      const cogs = calcCOGS([s], costs);
      unmatched.orders++; unmatched.revenue += amount; unmatched.cogs += cogs;
      const d = days.get(toMyt(s.created_at));
      if (d) { d.orders++; d.revenue += amount; d.cogs += cogs; }
    }
  }

  // Jadual: ads yang ada belanja/order dalam tempoh, atau sedang berjalan. Angle & kempen dijumlahkan serentak.
  const rows = [];
  const angleMap = new Map();
  const campMap = new Map();
  for (const a of ads) {
    const m = perAd.get(a.ad_id);
    const running = a.status === 'ACTIVE';
    if (!m && !running) continue;
    const angle = a.angle || a.adset_name || '(tiada angle)';
    rows.push({
      ad_id: a.ad_id, name: a.name, headline: a.headline, thumbnail_url: a.thumbnail_url,
      campaign_id: a.campaign_id, campaign_name: a.campaign_name, adset_name: a.adset_name, adset_id: a.adset_id,
      angle, angle_custom: !!a.angle,
      status: a.status, running, daily_budget: a.adset_daily_budget != null ? parseFloat(a.adset_daily_budget) : null,
      ...metrics(m || blank()),
    });
    const g = angleMap.get(angle) || { ...blank(), ads: 0, running: 0 };
    if (m) addInto(g, m);
    g.ads++; if (running) g.running++;
    angleMap.set(angle, g);
    const ck = a.campaign_id || a.campaign_name || '(tiada kempen)';
    const c = campMap.get(ck) || { ...blank(), name: a.campaign_name || '(tiada kempen)', ads: 0, running: 0 };
    if (m) addInto(c, m);
    c.ads++; if (running) c.running++;
    campMap.set(ck, c);
  }
  rows.sort((x, y) => (y.running - x.running) || (y.spend - x.spend));

  const total = blank();
  for (const m of perAd.values()) addInto(total, m);
  const adOnly = metrics(total);
  const all = { ...total, orders: total.orders + unmatched.orders, revenue: total.revenue + unmatched.revenue, cogs: total.cogs + unmatched.cogs };
  const angles = [...angleMap.entries()]
    .map(([angle, g]) => ({ angle, ads: g.ads, running: g.running, ...metrics(g) }))
    .sort((x, y) => y.revenue - x.revenue || y.spend - x.spend);
  const campaigns = [...campMap.entries()]
    .map(([id, c]) => ({ campaign_id: id, campaign_name: c.name, ads: c.ads, running: c.running, ...metrics(c) }))
    .sort((x, y) => y.spend - x.spend || y.revenue - x.revenue);

  return {
    period, from, to, product: product || null,
    connection: conn || null,
    summary: {
      ...metrics(all),   // semua order
      running_ads: rows.filter(r => r.running).length,
      // order yang dipadankan dengan ad sahaja (rujukan)
      ad_orders: adOnly.orders, ad_revenue: adOnly.revenue, ad_roas: adOnly.roas, ad_profit: adOnly.profit, ad_roi: adOnly.roi,
      unmatched_orders: unmatched.orders, unmatched_revenue: r2(unmatched.revenue),
    },
    daily: [...days.entries()].map(([date, d]) => ({ date, ...metrics(d) })),
    angles,
    campaigns,
    ads: rows,
  };
}
