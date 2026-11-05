// MCP E-Syifa — Claude Code/Desktop baca data Ads Hub & order sendiri, dan launch ad autopilot ke akaun Meta sendiri. Server sahaja.
// Auth: header "Authorization: Bearer esk_…" (jadual mcp_api_keys, hash SHA-256). Skop = akaun Ads Hub pemilik key.
// Tiada data pelanggan (nama/telefon/alamat) didedahkan — hanya agregat & prestasi ads.
import crypto from 'node:crypto';
import { parseAmount, calcCOGS } from '@/lib/marketer-calc';
import { fetchProductCosts, productOf, PRODUCTS, DIGITAL_AD, AD_PRODUCT_KEYS } from '@/lib/products';
import { resolveOwner, applyOwner } from '@/lib/team';
import { buildReport, periodRange, fetchAll, PERIODS, SST_RATE } from './report';
import { runReadTool } from './chat';
import * as autopilot from './autopilot';

export const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const SERVER_INFO = { name: 'esyifa', title: 'E-Syifa Ads Hub', version: '1.0.0' };

// ---------- API key ----------

const hashKey = key => crypto.createHash('sha256').update(key).digest('hex');

export function newApiKey() {
  const key = `esk_${crypto.randomBytes(24).toString('base64url')}`;
  return { key, key_hash: hashKey(key), key_last4: key.slice(-4) };
}

// Pulangkan { key, profile } atau null. Key dibatalkan / akaun tidak aktif → null.
export async function authKey(admin, header) {
  const m = /^Bearer\s+(esk_[\w-]{20,})$/.exec(header || '');
  if (!m) return null;
  const { data: k } = await admin.from('mcp_api_keys').select('id, marketer_id, revoked_at, last_used_at')
    .eq('key_hash', hashKey(m[1])).maybeSingle();
  if (!k || k.revoked_at) return null;
  const { data: p } = await admin.from('profiles').select('id, role, full_name, team_leader_id, is_active').eq('id', k.marketer_id).maybeSingle();
  if (!p || p.is_active === false || !['marketer', 'super_admin'].includes(p.role) || p.team_leader_id) return null;
  if (!k.last_used_at || Date.now() - new Date(k.last_used_at).getTime() > 5 * 60000) {
    await admin.from('mcp_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', k.id);
  }
  return { key: k, profile: p };
}

// ---------- Tools ----------

const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const str = description => ({ type: 'string', description });
const int = description => ({ type: 'integer', description });
const bool = description => ({ type: 'boolean', description });
const enm = (values, description) => ({ type: 'string', enum: values, description });

const RANGE = {
  period: enm(Object.keys(PERIODS), 'Tempoh siap: today, yesterday, 7d, 30d, month (bulan ini), last_month (bulan lepas). Abaikan jika guna from/to.'),
  from: str('Tarikh mula YYYY-MM-DD (waktu Malaysia). Guna bersama "to"; maksimum 92 hari.'),
  to: str('Tarikh akhir YYYY-MM-DD (waktu Malaysia).'),
};
const PRODUCT = enm(AD_PRODUCT_KEYS, 'Tapis ikut produk (produk kempen ikut tetapan kad Ads Spend). Kosong = semua produk.');

const BASIS = 'Jualan & order datang dari order sebenar dalam sistem E-Syifa (completed, bukan return, FPX/COD), bukan pixel. Kos ads = belanja Meta + SST 8%. Profit lepas ads = jualan − kos produk & postage − kos ads. ROI = profit lepas ads ÷ kos ads. ROAS = jualan ÷ belanja Meta (tanpa SST).';

export const TOOLS = [
  {
    name: 'get_account_info',
    description: 'Maklumat akaun Ads Hub: ad account Meta yang disambung, mata wang, sync terakhir, produk yang ada, dan cara tag UTM supaya order baru dipadankan dengan ad. Panggil dahulu sebelum cipta ads baru.',
    inputSchema: obj({}),
  },
  {
    name: 'get_overview',
    description: `Ringkasan prestasi untuk satu tempoh: belanja, order, jualan, ROAS sebenar, profit lepas ads, ROI, CPA; trend harian; prestasi ikut kempen dan angle. Ringkasan & trend kira SEMUA order akaun (organik/WhatsApp pun datang kesan ads); summary.ad_* = order yang dipadankan terus dengan ad melalui UTM. ${BASIS}`,
    inputSchema: obj({ ...RANGE, product: PRODUCT }),
  },
  {
    name: 'get_ads',
    description: 'Prestasi setiap ad untuk satu tempoh (hanya ad yang ada belanja/order atau sedang berjalan): status, adset, budget harian, angle, headline, belanja, order & jualan yang dipadankan melalui UTM, ROAS, profit, ROI, CPA, CTR, CPM, ROAS pixel. Guna untuk cari ad/hook/angle yang menang atau kalah.',
    inputSchema: obj({ ...RANGE, product: PRODUCT, only_running: bool('true = ad yang sedang ACTIVE sahaja'), limit: int('Bilangan ad maksimum (lalai 50, maks 200), disusun ikut belanja') }),
  },
  {
    name: 'get_ad_history',
    description: 'Prestasi harian satu ad untuk N hari terakhir (belanja, order sebenar, jualan, ROAS, CTR, CPM). Guna untuk lihat trend sebelum scale atau pause.',
    inputSchema: obj({ ad_id: str('ID ad Meta'), days: int('Bilangan hari, 1–30') }, ['ad_id']),
  },
  {
    name: 'get_account_structure',
    description: 'Struktur akaun dari cache Ads Hub: kempen → adset → ad, dengan ID, status dan budget harian adset (termasuk yang dipause).',
    inputSchema: obj({}),
  },
  {
    name: 'get_orders_summary',
    description: 'Agregat order sebenar akaun (tanpa data pelanggan) untuk satu tempoh, dipecah ikut hari, produk, kaedah bayaran, halaman jualan (source) dan sama ada order ada UTM ad. Termasuk jualan, kos produk & postage. Guna untuk faham dari mana jualan datang.',
    inputSchema: obj({ ...RANGE, product: PRODUCT }),
  },
  {
    name: 'get_activity',
    description: 'Aktiviti Ads Hub terkini: log tindakan, tindakan berjadual, peraturan auto, dan amaran/cadangan yang masih terbuka.',
    inputSchema: obj({}),
  },
];

// Alat tulis autopilot — setiap key (HQ atau marketer) hanya ke akaun Meta pemilik key. Had dikuatkuasa di server (lib/ads-hub/autopilot).
export const AUTOPILOT_TOOLS = [
  {
    name: 'autopilot_status',
    description: 'Status autopilot akaun anda: suis ON/OFF, tetapan (bajet setiap adset, maks adset, had bajet harian, Page, adset contoh), adset dalam kempen [AUTOPILOT] (live dari Meta), slot kosong, masa mula seterusnya (06:00 esok) dan launch terkini. Panggil dahulu — buat draf hanya jika free_slots > 0.',
    inputSchema: obj({}),
  },
  {
    name: 'request_upload',
    description: 'Dapatkan URL upload bertandatangan (sah 2 jam) untuk video MP4 atau thumbnail. Upload fail dengan HTTP PUT (lihat medan "how"), kemudian guna "path" dalam upload_video / launch_ad.',
    inputSchema: obj({ kind: { type: 'string', enum: ['video', 'image'], description: 'video (mp4) atau image (thumbnail jpg/png)' }, filename: str('Nama fail asal') }, ['kind']),
  },
  {
    name: 'upload_video',
    description: 'Hantar video yang dah diupload (path dari request_upload) ke ad account Meta. Pulangkan video_id. Meta proses video secara async — semak video_status sehingga "ready".',
    inputSchema: obj({ path: str('path dari request_upload'), name: str('Nama video di Meta') }, ['path']),
  },
  {
    name: 'video_status',
    description: 'Status pemprosesan video di Meta: processing / ready / error.',
    inputSchema: obj({ video_id: str('ID video Meta') }, ['video_id']),
  },
  {
    name: 'launch_ad',
    description: `HANYA selepas draf (angle, ad copy, skrip VO, storyboard) diluluskan oleh pengguna. Cipta adset baru dalam kempen [AUTOPILOT] (satu kempen "[AUTOPILOT] <Produk>" setiap produk; HQ Sabun Garam: "[AUTOPILOT] HQ") (bajet ikut tetapan, targeting/pixel disalin dari adset contoh) + ad video dengan UTM automatik, dijadual mula 06:00 pagi esok (MYT), atau 06:00 pagi ini dengan start="today". Server tolak jika autopilot OFF, slot penuh atau melebihi had bajet harian. Resumable: jika status "launching", panggil semula dengan client_ref & parameter yang SAMA sehingga "scheduled".`,
    inputSchema: obj({
      client_ref: str('ID unik draf ini (cth "2026-11-04-saka-1") — elak launch berganda'),
      product: { type: 'string', enum: AD_PRODUCT_KEYS, description: 'Produk' },
      angle: str('Nama angle (jadi nama adset & ad)'),
      headline: str('Headline ad'),
      primary_text: str('Primary text / ad copy'),
      description: str('Penerangan link (pilihan)'),
      link: str('Halaman jualan https://e-syifa.com/... tanpa utm_'),
      cta: { type: 'string', enum: autopilot.CTA_TYPES, description: 'Butang CTA (lalai LEARN_MORE)' },
      video_id: str('video_id dari upload_video (status ready)'),
      thumbnail_path: str('path thumbnail dari request_upload (pilihan; lalai thumbnail Meta)'),
      start: { type: 'string', enum: ['tomorrow', 'today'], description: 'Bila mula: "tomorrow" = 06:00 esok (lalai), "today" = 06:00 pagi ini jika belum lepas' },
    }, ['client_ref', 'product', 'angle', 'headline', 'primary_text', 'link', 'video_id']),
  },
  {
    name: 'prepare_launch',
    description: `Launch HIBRID (guna bila launch_ad ditolak kerana app Meta E-Syifa dalam mod Development). HANYA selepas draf diluluskan pengguna. Semak had yang sama, cipta adset PAUSED dalam kempen [AUTOPILOT] (mula 06:00 esok) dan pulangkan ad_spec. Kemudian cipta ad video dalam adset itu melalui MCP Meta Ads rasmi ikut ad_spec (url_tags WAJIB tepat), dan panggil complete_launch.`,
    inputSchema: obj({
      client_ref: str('ID unik draf ini — elak launch berganda'),
      product: { type: 'string', enum: AD_PRODUCT_KEYS, description: 'Produk' },
      angle: str('Nama angle (jadi nama adset & ad)'),
      headline: str('Headline ad'),
      primary_text: str('Primary text / ad copy'),
      description: str('Penerangan link (pilihan)'),
      link: str('Halaman jualan https://e-syifa.com/... tanpa utm_'),
      cta: { type: 'string', enum: autopilot.CTA_TYPES, description: 'Butang CTA (lalai LEARN_MORE)' },
      video_id: str('video_id dari upload_video (status ready)'),
      thumbnail_path: str('path thumbnail dari request_upload (pilihan)'),
      start: { type: 'string', enum: ['tomorrow', 'today'], description: 'Bila mula: "tomorrow" = 06:00 esok (lalai), "today" = 06:00 pagi ini jika belum lepas' },
    }, ['client_ref', 'product', 'angle', 'headline', 'primary_text', 'link', 'video_id']),
  },
  {
    name: 'complete_launch',
    description: 'Lengkapkan launch hibrid selepas ad dicipta melalui MCP Meta Ads: sahkan ad berada dalam adset launch ini & creative ada url_tags utm_content={{ad.id}}, semak had sekali lagi, kemudian aktifkan adset (dijadual 06:00). Status jadi "scheduled".',
    inputSchema: obj({ launch_id: int('launch_id dari prepare_launch'), ad_id: str('ID ad yang dicipta melalui MCP Meta Ads') }, ['launch_id', 'ad_id']),
  },
  {
    name: 'cancel_launch',
    description: 'Batal launch autopilot: pause adsetnya (boleh sebelum atau selepas 06:00).',
    inputSchema: obj({ launch_id: int('launch_id dari launch_ad / autopilot_status') }, ['launch_id']),
  },
];
const AUTOPILOT_NAMES = new Set(AUTOPILOT_TOOLS.map(t => t.name));
export const toolsFor = () => [...TOOLS, ...AUTOPILOT_TOOLS];

const fail = msg => Object.assign(new Error(msg), { toolError: true });
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function range(input) {
  if (input.from || input.to) {
    const { from, to } = input;
    if (!DATE.test(from || '') || !DATE.test(to || '')) throw fail('from dan to mesti format YYYY-MM-DD.');
    const days = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000 + 1;
    if (!(days >= 1)) throw fail('"from" mesti sebelum atau sama dengan "to".');
    if (days > 92) throw fail('Julat maksimum 92 hari.');
    return { period: 'custom', from, to };
  }
  const period = PERIODS[input.period] ? input.period : '7d';
  return { period, ...periodRange(period) };
}
const productArg = p => {
  if (!p) return null;
  if (!AD_PRODUCT_KEYS.includes(p)) throw fail(`Produk tidak dikenali. Pilihan: ${AD_PRODUCT_KEYS.join(', ')}`);
  return p;
};
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));
const r2 = n => Math.round((n || 0) * 100) / 100;
const PRODUCT_LABEL = Object.fromEntries([...PRODUCTS, DIGITAL_AD].map(p => [p.key, p.label]));
const METRIC_KEYS = ['spend', 'ads_cost', 'orders', 'revenue', 'cogs', 'profit', 'roi', 'roas', 'cpa', 'aov'];

async function connectionOf(admin, mid) {
  const { data } = await admin.from('meta_connections')
    .select('marketer_id, ad_account_id, ad_account_name, currency, status, status_message, last_synced_at, default_product')
    .eq('marketer_id', mid).maybeSingle();
  return data;
}

export async function callTool(admin, profile, name, input = {}) {
  const mid = profile.id;
  if (AUTOPILOT_NAMES.has(name)) {
    if (name === 'autopilot_status') return autopilot.status(admin, mid);
    if (name === 'request_upload') return autopilot.requestUpload(admin, mid, input);
    if (name === 'upload_video') return autopilot.uploadVideo(admin, mid, input);
    if (name === 'video_status') return autopilot.videoStatus(admin, mid, input);
    if (name === 'launch_ad') return autopilot.launchAd(admin, mid, mid, input);
    if (name === 'prepare_launch') return autopilot.prepareLaunch(admin, mid, mid, input);
    if (name === 'complete_launch') return autopilot.completeLaunch(admin, mid, mid, input);
    if (name === 'cancel_launch') return autopilot.cancelLaunch(admin, mid, mid, input);
  }
  const needConn = async () => {
    const c = await connectionOf(admin, mid);
    if (!c) throw fail('Akaun Meta belum disambung di Ads Hub → Tetapan.');
    return c;
  };

  if (name === 'get_account_info') {
    const c = await connectionOf(admin, mid);
    return {
      account: profile.role === 'super_admin' ? 'HQ' : profile.full_name,
      meta: c ? pick(c, ['ad_account_id', 'ad_account_name', 'currency', 'status', 'status_message', 'last_synced_at', 'default_product']) : null,
      products: [...PRODUCTS, DIGITAL_AD].map(p => ({ key: p.key, label: p.label })),
      sst_rate: SST_RATE,
      basis: BASIS,
      utm: {
        rule: 'Order dipadankan dengan ad melalui utm_content = ID ad Meta. Setiap ad baru MESTI ada URL parameters (url_tags) ini, jika tidak order tak akan dipadankan dengan ad itu.',
        url_tags: 'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.id}}',
      },
      note: 'Alat get_* baca data. Alat autopilot (autopilot_status, launch_ad, …) launch ad ke akaun Meta anda sendiri, ikut suis & had di Ads Hub → Tetapan → Autopilot. Data Ads Hub disync setiap jam.',
    };
  }

  if (name === 'get_overview') {
    await needConn();
    const r = await buildReport(admin, mid, { ...range(input), product: productArg(input.product) });
    return {
      period: r.period, from: r.from, to: r.to, product: r.product,
      summary: r.summary,
      daily: r.daily.map(d => pick(d, ['date', ...METRIC_KEYS])),
      campaigns: r.campaigns.map(c => pick(c, ['campaign_id', 'campaign_name', 'ads', 'running', ...METRIC_KEYS])),
      angles: r.angles.map(a => pick(a, ['angle', 'ads', 'running', ...METRIC_KEYS])),
    };
  }

  if (name === 'get_ads') {
    await needConn();
    const r = await buildReport(admin, mid, { ...range(input), product: productArg(input.product) });
    const limit = Math.min(200, Math.max(1, input.limit | 0 || 50));
    const ads = (input.only_running ? r.ads.filter(a => a.running) : r.ads).slice(0, limit);
    return {
      period: r.period, from: r.from, to: r.to, product: r.product, total_ads: r.ads.length,
      ads: ads.map(a => pick(a, ['ad_id', 'name', 'headline', 'status', 'campaign_name', 'adset_id', 'adset_name', 'daily_budget', 'angle',
        ...METRIC_KEYS, 'ctr', 'cpm', 'impressions', 'link_clicks', 'pixel_purchases', 'pixel_roas'])),
    };
  }

  if (['get_ad_history', 'get_account_structure', 'get_activity'].includes(name)) {
    const conn = await needConn();
    if (name === 'get_ad_history' && !input.ad_id) throw fail('ad_id diperlukan.');
    const out = await runReadTool(admin, conn, name, name === 'get_ad_history' ? { ad_id: String(input.ad_id), days: input.days || 14 } : {});
    if (out?.error) throw fail(out.error);
    return out;
  }

  if (name === 'get_orders_summary') return ordersSummary(admin, profile, range(input), productArg(input.product));

  throw fail(`Alat tidak dikenali: ${name}`);
}

async function ordersSummary(admin, profile, { period, from, to }, product) {
  const owner = await resolveOwner(admin, profile.role === 'super_admin' ? 'hq' : profile.id);
  const [subs, costs] = await Promise.all([
    fetchAll(() => applyOwner(admin.from('submissions')
      .select('id, amount_paid, notes, problem, source, qty, created_at, utm_content, payment_type'), owner)
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', `${from}T00:00:00+08:00`)
      .lte('created_at', `${to}T23:59:59+08:00`)
      .order('created_at')),
    fetchProductCosts(admin),
  ]);

  const groups = { by_day: {}, by_product: {}, by_payment: {}, by_source: {}, by_utm: {} };
  const total = { orders: 0, revenue: 0, cogs: 0 };
  const add = (g, k, amount, cogs) => {
    const b = (g[k] ??= { orders: 0, revenue: 0, cogs: 0 });
    b.orders++; b.revenue += amount; b.cogs += cogs;
  };
  for (const s of subs) {
    const prod = productOf(s.source) || DIGITAL_AD.key;
    if (product && prod !== product) continue;
    const amount = parseAmount(s);
    const cogs = calcCOGS([s], costs);
    total.orders++; total.revenue += amount; total.cogs += cogs;
    add(groups.by_day, new Date(new Date(s.created_at).getTime() + 8 * 3600000).toISOString().slice(0, 10), amount, cogs);
    add(groups.by_product, PRODUCT_LABEL[prod] || prod, amount, cogs);
    add(groups.by_payment, s.payment_type === 'cod' ? 'COD' : 'FPX', amount, cogs);
    add(groups.by_source, s.source || '(tiada)', amount, cogs);
    add(groups.by_utm, s.utm_content ? 'ada utm_content (dari ad)' : 'tiada UTM (organik/WhatsApp/lain)', amount, cogs);
  }
  const rows = (g, key, sort = (a, b) => b.revenue - a.revenue) => Object.entries(g)
    .map(([k, b]) => ({ [key]: k, orders: b.orders, revenue: r2(b.revenue), cogs: r2(b.cogs), aov: b.orders ? r2(b.revenue / b.orders) : null }))
    .sort(sort);
  return {
    period, from, to, product,
    note: 'Agregat sahaja, tiada data pelanggan. Kos ads tidak termasuk di sini — guna get_overview untuk profit lepas ads.',
    total: { orders: total.orders, revenue: r2(total.revenue), cogs: r2(total.cogs), aov: total.orders ? r2(total.revenue / total.orders) : null },
    by_day: rows(groups.by_day, 'date', (a, b) => a.date.localeCompare(b.date)),
    by_product: rows(groups.by_product, 'product'),
    by_payment: rows(groups.by_payment, 'payment'),
    by_source: rows(groups.by_source, 'source').slice(0, 30),
    by_utm: rows(groups.by_utm, 'type'),
  };
}

export const INSTRUCTIONS = `Pelayan MCP E-Syifa: data Ads Hub & order sebenar akaun anda. ${BASIS}
Mula dengan get_account_info. Untuk keputusan ads, percaya ROAS/profit dari order sebenar (get_overview, get_ads), bukan ROAS pixel.
Setiap akaun (HQ & marketer) ada alat autopilot ke akaun Meta sendiri (autopilot_status, request_upload, upload_video, video_status, launch_ad, prepare_launch, complete_launch, cancel_launch). Suis & had autopilot ditetapkan di Ads Hub → Tetapan. launch_ad / prepare_launch HANYA selepas pengguna meluluskan draf angle, ad copy, skrip VO dan storyboard. Jika launch_ad ditolak kerana app Meta dalam mod Development, guna prepare_launch → cipta ad melalui MCP Meta Ads rasmi → complete_launch.`;
