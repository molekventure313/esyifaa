// Ads Hub — gabung prestasi Meta (cache) dengan order sebenar (submissions) → ROAS sebenar. Server sahaja.
import { parseAmount } from '@/lib/marketer-calc';
import { ownerScope } from '@/lib/team';

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
};

export function periodRange(period) {
  const p = PERIODS[period] || PERIODS['7d'];
  const today = mytDate();
  if (period === 'month') return { from: `${today.slice(0, 8)}01`, to: today };
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

function metrics(m) {
  return {
    spend: r2(m.spend), orders: m.orders, revenue: r2(m.revenue),
    roas: div(m.revenue, m.spend), cpa: m.orders ? div(m.spend, m.orders) : null, aov: div(m.revenue, m.orders),
    impressions: m.impressions, link_clicks: m.link_clicks,
    ctr: m.impressions ? r2((m.link_clicks / m.impressions) * 100) : null,
    cpm: m.impressions ? r2((m.spend / m.impressions) * 1000) : null,
    pixel_purchases: m.pixel_purchases, pixel_roas: div(m.pixel_value, m.spend),
  };
}
const blank = () => ({ spend: 0, orders: 0, revenue: 0, impressions: 0, link_clicks: 0, pixel_purchases: 0, pixel_value: 0 });
const addInto = (t, m) => { for (const k of Object.keys(blank())) t[k] += m[k]; };

// Supabase pulangkan maksimum 1000 baris setiap query — ambil berperingkat
async function fetchAll(build) {
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
 * Order dikira jika: completed, bukan return, FPX/COD, milik marketer (termasuk teamsale), dan utm_content = ID ad akaun ini.
 */
export function buildOverview(admin, marketerId, period) {
  return buildReport(admin, marketerId, { period, ...periodRange(period) });
}

// adId (pilihan) → hadkan kepada satu ad sahaja (sejarah ad)
export async function buildReport(admin, marketerId, { period, from, to, adId }) {
  const scope = await ownerScope(admin, marketerId);
  const oneAd = q => (adId ? q.eq('ad_id', adId) : q);
  const oneAdOrders = q => (adId ? q.eq('utm_content', adId) : q);

  const [{ data: conn, error: connErr }, ads, ins, subs] = await Promise.all([
    admin.from('meta_connections')
      .select('ad_account_id, ad_account_name, currency, status, status_message, last_synced_at, token_last4')
      .eq('marketer_id', marketerId).maybeSingle(),
    fetchAll(() => oneAd(admin.from('meta_ads').select('*').eq('marketer_id', marketerId)).order('ad_id')),
    fetchAll(() => oneAd(admin.from('meta_insights_daily').select('*').eq('marketer_id', marketerId))
      .gte('date', from).lte('date', to).order('ad_id').order('date')),
    fetchAll(() => oneAdOrders(admin.from('submissions')
      .select('id, amount_paid, notes, created_at, utm_content, payment_type'))
      .in('marketer_id', scope.ids)
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', `${from}T00:00:00+08:00`)
      .lte('created_at', `${to}T23:59:59+08:00`)
      .order('created_at')),
  ]);
  if (connErr) throw new Error(connErr.message);

  const adMap = new Map(ads.map(a => [a.ad_id, a]));
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

  const unmatched = { orders: 0, revenue: 0 };
  for (const s of subs) {
    const amount = parseAmount(s);
    if (s.utm_content && adMap.has(s.utm_content)) {
      const m = bucket(s.utm_content);
      m.orders++; m.revenue += amount;
      const d = days.get(toMyt(s.created_at));
      if (d) { d.orders++; d.revenue += amount; }
    } else {
      unmatched.orders++; unmatched.revenue += amount;
    }
  }

  // Jadual: ads yang ada belanja/order dalam tempoh, atau sedang berjalan. Angle dijumlahkan serentak.
  const rows = [];
  const angleMap = new Map();
  for (const a of ads) {
    const m = perAd.get(a.ad_id);
    const running = a.status === 'ACTIVE';
    if (!m && !running) continue;
    const angle = a.angle || a.adset_name || '(tiada angle)';
    rows.push({
      ad_id: a.ad_id, name: a.name, headline: a.headline, thumbnail_url: a.thumbnail_url,
      campaign_name: a.campaign_name, adset_name: a.adset_name, adset_id: a.adset_id,
      angle, angle_custom: !!a.angle,
      status: a.status, running, daily_budget: a.adset_daily_budget != null ? parseFloat(a.adset_daily_budget) : null,
      ...metrics(m || blank()),
    });
    const g = angleMap.get(angle) || { ...blank(), ads: 0, running: 0 };
    if (m) addInto(g, m);
    g.ads++; if (running) g.running++;
    angleMap.set(angle, g);
  }
  rows.sort((x, y) => (y.running - x.running) || (y.spend - x.spend));

  const total = blank();
  for (const m of perAd.values()) addInto(total, m);
  const angles = [...angleMap.entries()]
    .map(([angle, g]) => ({ angle, ads: g.ads, running: g.running, ...metrics(g) }))
    .sort((x, y) => y.revenue - x.revenue || y.spend - x.spend);

  return {
    period, from, to,
    connection: conn || null,
    summary: {
      ...metrics(total),
      running_ads: rows.filter(r => r.running).length,
      unmatched_orders: unmatched.orders, unmatched_revenue: r2(unmatched.revenue),
      all_orders: total.orders + unmatched.orders, all_revenue: r2(total.revenue + unmatched.revenue),
    },
    daily: [...days.entries()].map(([date, d]) => ({ date, ...metrics(d) })),
    angles,
    ads: rows,
  };
}
