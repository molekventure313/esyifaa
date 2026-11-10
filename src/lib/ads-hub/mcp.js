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
import { syncFromMcp } from './mcp-sync';
import { createRule, describeRule, ruleTemplates, applyRuleTemplates } from './automation';
import { fighterOrderRows, fighterCosts, FIGHTER_SLUGS } from './fighter';

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
  const { data: p } = await admin.from('profiles').select('id, role, full_name, team_leader_id, is_active, marketer_code').eq('id', k.marketer_id).maybeSingle();
  if (!p || p.is_active === false || !['marketer', 'super_admin', 'independent'].includes(p.role) || p.team_leader_id) return null;
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

const RULE_METRICS = ['spend', 'orders', 'revenue', 'roas', 'cpa', 'ctr', 'cpm', 'frequency', 'age_days', 'hook_rate'];
const BASIS = 'Jualan & order datang dari order sebenar dalam sistem E-Syifa (completed, bukan return, FPX/COD), bukan pixel. Kos ads = belanja Meta + SST 8%. Profit lepas ads = jualan − kos produk & postage − kos ads. ROI = profit lepas ads ÷ kos ads. ROAS = jualan ÷ belanja Meta (tanpa SST).';

export const TOOLS = [
  {
    name: 'get_account_info',
    description: 'Maklumat akaun Ads Hub: ad account Meta yang disambung, mata wang, sync terakhir, produk yang ada, dan cara tag UTM supaya order baru dipadankan dengan ad. Panggil dahulu sebelum cipta ads baru.',
    inputSchema: obj({}),
  },
  {
    name: 'get_overview',
    description: `Ringkasan prestasi untuk satu tempoh: belanja, order, jualan, ROAS sebenar, profit lepas ads, ROI, CPA; trend harian; prestasi ikut kempen dan angle. Ringkasan & trend kira SEMUA order akaun (organik/WhatsApp pun datang kesan ads); summary.ad_* = order yang dipadankan terus dengan ad melalui UTM. returns = kadar return COD (tempoh, matang 15–44 hari) + roas_adjusted_est (ROAS selepas tolak anggaran return tertunda) — guna untuk keputusan pada data terkini. ${BASIS}`,
    inputSchema: obj({ ...RANGE, product: PRODUCT }),
  },
  {
    name: 'get_ads',
    description: 'Prestasi setiap ad untuk satu tempoh (hanya ad yang ada belanja/order atau sedang berjalan): status, adset, budget harian, angle, headline, umur ad (age_days, hari ke-N sejak impression pertama), belanja, order & jualan yang dipadankan melalui UTM, ROAS, profit, ROI, CPA, CTR, CPM, frequency 7 hari, hook rate & hold rate video, ROAS pixel. Guna untuk cari ad/hook/angle yang menang, kalah atau letih.',
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
  {
    name: 'sync_meta_data',
    description: 'Untuk akaun TANPA token (marketer yang guna MCP Meta Ads rasmi): hantar data Meta ke E-Syifa supaya Ads Hub, get_ads/get_overview dan ads spend automatik (belanja × 1.08 SST, ikut produk kempen) terisi. Ambil dahulu dari MCP Meta Ads: insights level ad, time_increment 1 (satu baris setiap ad setiap hari, termasuk ad yang dah dipause/padam yang ada belanja) dan senarai ads (status, adset, budget). Hantar SEMUA ads akaun untuk setiap tarikh dalam julat — ads spend untuk julat itu diganti sepenuhnya. Maksimum 35 hari ke belakang. Cadangan: jalankan setiap pagi untuk semalam & hari ini.',
    inputSchema: obj({
      ad_account_id: str('ID ad account Meta, contoh act_1234567890'),
      ad_account_name: str('Nama ad account (pilihan)'),
      currency: str('Mata wang ad account, lalai MYR'),
      insights: { type: 'array', description: 'Belanja harian setiap ad', items: obj({
        ad_id: str('ID ad'), date: str('YYYY-MM-DD (date_start)'), spend: { type: 'number', description: 'Belanja (tanpa SST)' },
        impressions: int('Impressions'), reach: int('Reach'), link_clicks: int('inline_link_clicks'),
        video_3s: int('3-second video views (actions video_view, pilihan — untuk hook rate)'), thruplays: int('ThruPlay (video_thruplay_watched_actions, pilihan)'),
        purchases: int('Purchase pixel (pilihan)'), purchase_value: { type: 'number', description: 'Nilai purchase pixel (pilihan)' },
        ad_name: str('Nama ad'), adset_id: str('ID adset'), adset_name: str('Nama adset'), campaign_id: str('ID kempen'), campaign_name: str('Nama kempen'),
      }, ['ad_id', 'date', 'spend']) },
      ads: { type: 'array', description: 'Senarai ads semasa akaun (status & budget)', items: obj({
        ad_id: str('ID ad'), ad_name: str('Nama ad'), status: str('effective_status ad, cth ACTIVE / PAUSED'),
        adset_id: str('ID adset'), adset_name: str('Nama adset'), adset_status: str('effective_status adset'),
        adset_daily_budget: { type: 'number', description: 'Budget harian adset dalam RM (bukan sen)' },
        campaign_id: str('ID kempen'), campaign_name: str('Nama kempen'), campaign_status: str('effective_status kempen'),
        headline: str('Headline creative'), created_time: str('Masa cipta ad (ISO)'),
      }, ['ad_id']) },
    }, ['ad_account_id']),
  },
  {
    name: 'list_rules',
    description: 'Senarai peraturan auto Ads Hub akaun anda (ID, nama, aktif, mod, ringkasan syarat → tindakan, kali terakhir dijalankan).',
    inputSchema: obj({}),
  },
  {
    name: 'create_rule',
    description: `Cipta peraturan auto Ads Hub (sama seperti Ads Hub → Tetapan → Peraturan). HANYA selepas pengguna setuju dengan ringkasan peraturan dalam perbualan.
Dua jenis:
1) Ikut syarat (dinilai setiap jam, data order sebenar): metric/operator/value + conditions tambahan (DAN, maks 3), window_days, min_spend. level 'ad' (setiap ad) atau 'adset' (metrik dijumlahkan ikut adset, kempen aktif sahaja). frequency 'hourly' = tindakan boleh berulang setiap jam (cth scale 30% sejam).
2) Ikut jam: run_at_time 'HH:mm' (waktu Malaysia) → tindakan pada semua adset dalam kempen aktif sekali sehari; action hanya pause_adset / activate_adset / budget_set; syarat diabaikan.
Tindakan: pause (ad), pause_adset, activate_adset, budget_up / budget_down (action_value = peratus 1–100, action_max = had budget RM untuk budget_up), budget_set (action_value = budget baru RM, peringkat adset), notify (amaran sahaja).
mode 'suggest' = cadangan di dashboard untuk disahkan; 'auto' = terus dilaksana (tertakluk had keselamatan akaun). scope 'autopilot' = hanya kempen [AUTOPILOT].
Metrik: spend, orders, revenue, roas (nisbah), cpa (RM), ctr (%), cpm (RM), frequency (7 hari sebenar dari Meta, tidak ikut window_days), age_days (hari ke-N sejak impression pertama, hari pertama = 1; cth age_days >= 3 = beri peluang 2 hari dulu), hook_rate (% 3-saat video views ÷ impressions).`,
    inputSchema: obj({
      name: str('Nama peraturan (maks 80 aksara)'),
      metric: enm(RULE_METRICS, 'Metrik syarat utama (abaikan untuk run_at_time)'),
      operator: enm(['>', '>=', '<', '<=', '='], 'Operator'),
      value: { type: 'number', description: 'Nilai ambang' },
      conditions: { type: 'array', description: 'Syarat tambahan (DAN), maks 3', items: obj({
        metric: enm(RULE_METRICS, 'Metrik'), operator: enm(['>', '>=', '<', '<=', '='], 'Operator'), value: { type: 'number', description: 'Nilai' },
      }, ['metric', 'operator', 'value']) },
      window_days: int('Tempoh penilaian 1–30 hari (1 = hari ini)'),
      min_spend: { type: 'number', description: 'Nilai hanya jika belanja tempoh ≥ RM ini (0 = tiada)' },
      level: enm(['ad', 'adset'], 'Peringkat (lalai ad)'),
      frequency: enm(['daily', 'hourly'], 'daily (lalai) atau hourly (boleh berulang setiap jam)'),
      run_at_time: str('HH:mm waktu Malaysia untuk peraturan ikut jam (kosongkan untuk peraturan ikut syarat)'),
      action: enm(['pause', 'pause_adset', 'activate_adset', 'budget_up', 'budget_down', 'budget_set', 'notify'], 'Tindakan'),
      action_value: { type: 'number', description: 'Peratus untuk budget_up/budget_down; RM untuk budget_set' },
      action_max: { type: 'number', description: 'Had budget maksimum RM untuk budget_up (pilihan)' },
      mode: enm(['suggest', 'auto'], 'suggest atau auto'),
      scope: enm(['all', 'autopilot'], 'all (lalai) atau autopilot sahaja'),
      product: enm(['sabun-garam', 'garam-pengasihan', 'kasturi-kijang', 'pengisian'], 'Hanya kempen produk ini (produk kempen ikut tetapan kad Ads Spend). Kosong = semua produk. Produk yang ada peraturan ikut-syarat sendiri tidak dinilai oleh peraturan ikut-syarat umum; peraturan ikut jam umum tetap terpakai.'),
    }, ['name', 'action', 'mode']),
  },
  {
    name: 'list_rule_templates',
    description: 'Templat peraturan = peraturan yang sedang digunakan akaun HQ (key, nama, ringkasan, semua nilai). Guna untuk cadang peraturan kepada marketer; salin dengan apply_rule_templates atau ubah nilai dan cipta dengan create_rule.',
    inputSchema: obj({}),
  },
  {
    name: 'apply_rule_templates',
    description: 'Salin templat peraturan HQ ke akaun anda (nama yang dah wujud dilangkau). keys kosong = semua. HANYA selepas pengguna setuju — terangkan dulu peraturan mod auto yang akan terus berjalan (budget, masa).',
    inputSchema: obj({ keys: { type: 'array', items: { type: 'integer' }, description: 'key templat dari list_rule_templates; kosong = semua' } }),
  },
  {
    name: 'update_rule',
    description: 'Hidupkan/matikan peraturan atau tukar mod suggest/auto. HANYA selepas pengguna setuju. Untuk ubah syarat: padam (delete_rule) dan cipta semula.',
    inputSchema: obj({ rule_id: int('ID peraturan'), active: bool('true = aktif'), mode: enm(['suggest', 'auto'], 'Mod baru') }, ['rule_id']),
  },
  {
    name: 'delete_rule',
    description: 'Padam satu peraturan. HANYA selepas pengguna setuju secara jelas.',
    inputSchema: obj({ rule_id: int('ID peraturan') }, ['rule_id']),
  },
];

// Alat tulis autopilot — setiap key (HQ atau marketer) hanya ke akaun Meta pemilik key. Had dikuatkuasa di server (lib/ads-hub/autopilot).
export const AUTOPILOT_TOOLS = [
  {
    name: 'autopilot_status',
    description: 'Status autopilot akaun anda: suis ON/OFF, MOD (manual/shadow/veto/auto) + "approval" (peraturan kelulusan yang WAJIB diikut), templat strategi (SOP penuh + had) dan arahan khusus akaun, launch hari ini / had sehari, tetapan (bajet setiap adset, maks adset, had bajet harian, Page, adset contoh), adset dalam kempen [AUTOPILOT] (live dari Meta), slot kosong, masa mula seterusnya (06:00 esok) dan launch terkini. Panggil dahulu — buat draf hanya jika free_slots > 0.',
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
    description: `Kelulusan ikut MOD akaun (autopilot_status.approval): manual = HANYA selepas draf (angle, ad copy, skrip VO, storyboard) diluluskan pengguna; shadow/veto/auto = ikut SOP templat strategi tanpa tunggu kelulusan (shadow hanya merekod cadangan, tiada apa dicipta di Meta; veto sentiasa mula 06:00 esok). Cipta adset baru dalam kempen [AUTOPILOT] (satu kempen "[AUTOPILOT] <Produk>" setiap produk; HQ Sabun Garam: "[AUTOPILOT] HQ") (bajet ikut tetapan, targeting/pixel disalin dari adset contoh) + ad video dengan UTM automatik, dijadual mula 06:00 pagi esok (MYT), atau 06:00 pagi ini dengan start="today". Server tolak jika autopilot OFF, slot penuh, melebihi had bajet harian atau had launch sehari. Resumable: jika status "launching", panggil semula dengan client_ref & parameter yang SAMA sehingga "scheduled".`,
    inputSchema: obj({
      client_ref: str('ID unik draf ini (cth "2026-11-04-saka-1") — elak launch berganda'),
      product: { type: 'string', enum: AD_PRODUCT_KEYS, description: 'Produk' },
      angle: str('Nama angle (jadi nama adset & ad)'),
      headline: str('Headline ad'),
      primary_text: str('Primary text / ad copy'),
      description: str('Penerangan link (pilihan)'),
      link: str('Halaman jualan https://e-syifa.com/... tanpa utm_'),
      cta: { type: 'string', enum: autopilot.CTA_TYPES, description: 'Butang CTA (lalai LEARN_MORE)' },
      video_id: str('video_id dari upload_video (status ready) — untuk ad video'),
      image_path: str('path gambar dari request_upload kind=image — untuk ad GAMBAR (ganti video_id)'),
      thumbnail_path: str('path thumbnail dari request_upload (pilihan; lalai thumbnail Meta)'),
      own_campaign: { type: 'boolean', description: 'true = struktur 1-1-1: kempen baru "[1-1-1] <Produk> · <angle>" khas untuk ad ini' },
      start: { type: 'string', enum: ['tomorrow', 'today'], description: 'Bila mula: "tomorrow" = 06:00 esok (lalai), "today" = 06:00 pagi ini jika belum lepas' },
    }, ['client_ref', 'product', 'angle', 'headline', 'primary_text', 'link']),
  },
  {
    name: 'prepare_launch',
    description: `Launch HIBRID (guna bila launch_ad ditolak kerana app Meta E-Syifa dalam mod Development). Kelulusan ikut MOD akaun seperti launch_ad (shadow: hanya rekod cadangan). Semak had yang sama, cipta adset PAUSED dalam kempen [AUTOPILOT] (mula 06:00 esok) dan pulangkan ad_spec. Kemudian cipta ad video dalam adset itu melalui MCP Meta Ads rasmi ikut ad_spec (url_tags WAJIB tepat), dan panggil complete_launch.`,
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
    name: 'set_ad_status',
    description: `Ejen: pause atau hidupkan semula ad / adset dalam kempen autopilot ([AUTOPILOT] / [1-1-1]) akaun ini — untuk kill ad kalah atau hidupkan semula ikut SOP. Server buat panggilan Meta (token tak didedahkan). Kelulusan ikut MOD akaun: manual = HANYA selepas pengguna setuju; shadow = direkod sahaja (tiada perubahan di Meta); veto/auto = terus ikut SOP. Had server: objek di luar kempen autopilot ditolak; suis autopilot OFF = pause sahaja; hidupkan adset ikut slot & had bajet harian; maksimum 20 perubahan sehari. reason WAJIB (data + rujukan SOP) — direkod dalam Log Ads Hub. Untuk kill satu angle penuh, pause adset; untuk buang satu creative dalam adset, pause ad.`,
    inputSchema: obj({
      object_type: enm(['ad', 'adset'], 'ad atau adset'),
      object_id: str('ID ad / adset Meta (dari get_ads / get_account_structure / autopilot_status)'),
      status: enm(['PAUSED', 'ACTIVE'], 'PAUSED = kill/pause, ACTIVE = hidupkan semula'),
      reason: str('Sebab berdasarkan data + peraturan SOP, cth "Hari ke-3: ROAS 3 hari 1.1, belanja RM130, 1 order — SOP A2 kill"'),
    }, ['object_type', 'object_id', 'status', 'reason']),
  },
  {
    name: 'cancel_launch',
    description: 'Batal launch autopilot: pause adsetnya (boleh sebelum atau selepas 06:00).',
    inputSchema: obj({ launch_id: int('launch_id dari launch_ad / autopilot_status') }, ['launch_id']),
  },
];
const AUTOPILOT_NAMES = new Set(AUTOPILOT_TOOLS.map(t => t.name));

// HQ (super_admin) boleh bertindak bagi pihak akaun marketer/fighter: parameter "marketer" pada setiap alat.
// Tetapan, had & suis autopilot akaun sasaran tetap dikuatkuasa; log aktiviti rekod HQ sebagai pelaku.
const MARKETER_ARG = str('HQ sahaja: kod marketer (cth "faiz") untuk guna akaun Ads Hub marketer itu. Kosong = akaun HQ. Senarai: list_accounts.');
const HQ_TOOLS = [{
  name: 'list_accounts',
  description: 'HQ sahaja: senarai akaun Ads Hub marketer/fighter yang disambung (kod, nama, ad account Meta, jenis sambungan, suis autopilot). Guna kod dalam parameter "marketer" alat lain.',
  inputSchema: obj({}),
}];
const withMarketer = t => ({ ...t, inputSchema: { ...t.inputSchema, properties: { ...t.inputSchema.properties, marketer: MARKETER_ARG } } });
export const toolsFor = profile => profile?.role === 'super_admin'
  ? [...HQ_TOOLS, ...[...TOOLS, ...AUTOPILOT_TOOLS].map(withMarketer)]
  : [...TOOLS, ...AUTOPILOT_TOOLS];

async function listAccounts(admin) {
  const { data: conns, error } = await admin.from('meta_connections')
    .select('*');
  if (error) throw new Error(error.message);
  const { data: sts } = await admin.from('autopilot_strategies').select('id, name').then(r => r, () => ({ data: [] }));
  const stName = Object.fromEntries((sts || []).map(x => [x.id, x.name]));
  const { data: ps } = await admin.from('profiles').select('id, full_name, role, marketer_code, is_active').in('id', (conns || []).map(c => c.marketer_id));
  const byId = Object.fromEntries((ps || []).map(p => [p.id, p]));
  return {
    accounts: (conns || []).map(c => {
      const p = byId[c.marketer_id] || {};
      return {
        marketer: p.role === 'super_admin' ? null : p.marketer_code, name: p.role === 'super_admin' ? 'HQ' : p.full_name,
        type: p.role === 'independent' ? 'fighter' : p.role === 'super_admin' ? 'hq' : 'marketer', active: p.is_active !== false,
        ad_account_id: c.ad_account_id, ad_account_name: c.ad_account_name, connection: c.source || 'token', status: c.status,
        autopilot: {
          enabled: !!c.autopilot_enabled, mode: autopilot.modeOf(c), strategy: stName[c.autopilot_strategy_id] || null,
          adset_budget: c.autopilot_adset_budget, max_adsets: c.autopilot_max_adsets, max_launches_day: c.autopilot_max_launches_day ?? null,
        },
      };
    }),
  };
}

// HQ → profil akaun sasaran (ikut kod marketer). Peraturan sama seperti pemilik key MCP.
async function targetProfile(admin, profile, code) {
  if (profile.role !== 'super_admin') throw fail('Parameter "marketer" hanya untuk akaun HQ.');
  const { data: p } = await admin.from('profiles').select('id, role, full_name, team_leader_id, is_active, marketer_code')
    .ilike('marketer_code', String(code).trim()).maybeSingle();
  if (!p) throw fail(`Marketer "${code}" tidak dijumpai. Semak dengan list_accounts.`);
  if (p.is_active === false || !['marketer', 'independent'].includes(p.role) || p.team_leader_id) throw fail(`Akaun "${code}" tidak layak (tidak aktif / bukan marketer atau fighter).`);
  return p;
}

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
    .select('marketer_id, ad_account_id, ad_account_name, currency, status, status_message, last_synced_at, default_product, source')
    .eq('marketer_id', mid).maybeSingle();
  return data;
}

export async function callTool(admin, keyProfile, name, rawInput = {}) {
  if (name === 'list_accounts') {
    if (keyProfile.role !== 'super_admin') throw fail('list_accounts hanya untuk akaun HQ.');
    return listAccounts(admin);
  }
  const { marketer, ...input } = rawInput || {};
  const profile = marketer ? await targetProfile(admin, keyProfile, marketer) : keyProfile;
  const mid = profile.id;
  const actor = keyProfile.id;
  if (AUTOPILOT_NAMES.has(name)) {
    if (name === 'autopilot_status') return autopilot.status(admin, mid);
    if (name === 'request_upload') return autopilot.requestUpload(admin, mid, input);
    if (name === 'upload_video') return autopilot.uploadVideo(admin, mid, input);
    if (name === 'video_status') return autopilot.videoStatus(admin, mid, input);
    if (name === 'launch_ad') return autopilot.launchAd(admin, mid, actor, input);
    if (name === 'prepare_launch') return autopilot.prepareLaunch(admin, mid, actor, input);
    if (name === 'complete_launch') return autopilot.completeLaunch(admin, mid, actor, input);
    if (name === 'cancel_launch') return autopilot.cancelLaunch(admin, mid, actor, input);
    if (name === 'set_ad_status') return autopilot.setAdStatus(admin, mid, actor, input);
  }
  const needConn = async () => {
    const c = await connectionOf(admin, mid);
    if (!c) throw fail('Akaun Meta belum disambung. Sambung token di Ads Hub → Tetapan, atau hantar data dari MCP Meta Ads dengan sync_meta_data.');
    return c;
  };

  if (name === 'sync_meta_data') return syncFromMcp(admin, mid, input);

  if (name === 'list_rules') {
    const { data, error } = await admin.from('meta_rules').select('*').eq('marketer_id', mid).order('id');
    if (error) throw new Error(error.message);
    return { rules: (data || []).map(r => ({ id: r.id, name: r.name, active: r.active, mode: r.mode, rule: describeRule(r), last_run_at: r.last_run_at })) };
  }
  if (name === 'create_rule') {
    const c = await needConn();
    if (input.mode === 'auto' && c.source === 'mcp') throw fail('Akaun tanpa token: peraturan hanya boleh mod "suggest" (E-Syifa tak boleh ubah ads dalam Meta untuk akaun ini).');
    const r = await createRule(admin, mid, { window_days: 1, min_spend: 0, ...input, run_at_time: input.run_at_time || null });
    if (!r.ok) throw fail(r.message);
    return r;
  }
  if (name === 'list_rule_templates') {
    return { templates: (await ruleTemplates(admin)).map(t => ({ key: t.key, name: t.name, rule: t.summary, mode: t.mode, values: pick(t, ['metric', 'operator', 'value', 'conditions', 'window_days', 'min_spend', 'level', 'frequency', 'run_at_time', 'action', 'action_value', 'action_max', 'scope']) })) };
  }
  if (name === 'apply_rule_templates') {
    const c = await needConn();
    return applyRuleTemplates(admin, mid, { keys: input.keys, forceSuggest: c.source === 'mcp' });
  }
  if (name === 'update_rule') {
    const upd = {};
    if (typeof input.active === 'boolean') upd.active = input.active;
    if (['suggest', 'auto'].includes(input.mode)) upd.mode = input.mode;
    if (!Object.keys(upd).length) throw fail('Tiada perubahan (active / mode).');
    if (upd.mode === 'auto' && (await connectionOf(admin, mid))?.source === 'mcp') throw fail('Akaun tanpa token: peraturan hanya boleh mod "suggest".');
    const { data, error } = await admin.from('meta_rules').update(upd).eq('id', input.rule_id).eq('marketer_id', mid).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw fail('Peraturan tidak dijumpai.');
    return { ok: true, id: data.id, name: data.name, active: data.active, mode: data.mode, rule: describeRule(data) };
  }
  if (name === 'delete_rule') {
    const { data, error } = await admin.from('meta_rules').delete().eq('id', input.rule_id).eq('marketer_id', mid).select('id, name').maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw fail('Peraturan tidak dijumpai.');
    return { ok: true, message: `Peraturan #${data.id} "${data.name}" dipadam.` };
  }

  if (name === 'get_account_info') {
    const c = await connectionOf(admin, mid);
    return {
      account: profile.role === 'super_admin' ? 'HQ' : profile.full_name,
      ...(profile.role === 'independent' ? {
        account_type: 'fighter',
        fighter_links: {
          rule: `Akaun FIGHTER (penjual bebas): link setiap ad MESTI SP fighter sendiri supaya order & bayaran masuk ke akaun fighter — https://e-syifa.com/f/<slug>?f=${profile.marketer_code} atau SP Generator milik fighter (/s/<slug>). Link HQ (/<slug>) ditukar automatik ke /f/<slug>?f=${profile.marketer_code} oleh launch_ad / prepare_launch.`,
          slugs: FIGHTER_SLUGS,
          example: `https://e-syifa.com/f/sabun-garam?f=${profile.marketer_code}`,
        },
      } : {}),
      meta: c ? pick(c, ['ad_account_id', 'ad_account_name', 'currency', 'status', 'status_message', 'last_synced_at', 'default_product', 'source']) : null,
      products: [...PRODUCTS, DIGITAL_AD].map(p => ({ key: p.key, label: p.label })),
      sst_rate: SST_RATE,
      basis: BASIS,
      utm: {
        rule: 'Order dipadankan dengan ad melalui utm_content = ID ad Meta. Setiap ad baru MESTI ada URL parameters (url_tags) ini, jika tidak order tak akan dipadankan dengan ad itu.',
        url_tags: 'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.id}}',
      },
      note: c?.source === 'token' || (c && !c.source) ? 'Akaun disambung dengan token: data Meta disync automatik setiap jam. Alat autopilot (autopilot_status, launch_ad, …) launch ad ke akaun Meta ini ikut suis & had di Ads Hub → Tetapan → Autopilot.' : 'Akaun tanpa token: cipta & urus ads melalui MCP Meta Ads rasmi (url_tags di atas WAJIB), dan hantar belanja harian dengan sync_meta_data (cadangan setiap pagi) supaya Ads Hub & ads spend terisi automatik. Alat launch autopilot E-Syifa tidak digunakan untuk akaun tanpa token.',
    };
  }

  if (name === 'get_overview') {
    await needConn();
    const r = await buildReport(admin, mid, { ...range(input), product: productArg(input.product) });
    return {
      period: r.period, from: r.from, to: r.to, product: r.product,
      summary: r.summary,
      returns: await returnStats(admin, profile, r).catch(e => ({ error: e.message })),
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
      note: 'age_days = hari ke-N sejak impression pertama (1 = hari pertama). frequency/reach_7d = 7 hari terakhir dari Meta (bukan ikut tempoh). hook_rate = 3-saat views ÷ impressions (%), hold_rate = ThruPlay ÷ 3-saat views (%) — video sahaja.',
      ads: ads.map(a => pick(a, ['ad_id', 'name', 'headline', 'status', 'campaign_name', 'adset_id', 'adset_name', 'daily_budget', 'angle',
        'first_delivery_date', 'age_days', ...METRIC_KEYS, 'ctr', 'cpm', 'frequency', 'reach_7d', 'hook_rate', 'hold_rate',
        'impressions', 'link_clicks', 'pixel_purchases', 'pixel_roas'])),
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

// Kadar return COD: order baru belum sempat return, jadi ROAS tempoh terkini terlebih anggar.
// Kadar "matang" = order 15–44 hari lalu (return dah selesai). Anggaran return tertunda = order COD < 15 hari × kadar matang − yang dah return.
const RETURN_MATURE_DAYS = 15;
async function returnStats(admin, profile, rep) {
  if (profile.role === 'independent') return { note: 'Kadar return untuk akaun fighter belum disokong di sini.' };
  const owner = await resolveOwner(admin, profile.role === 'super_admin' ? 'hq' : profile.id);
  const DAYMS = 86400000;
  const d = ms => new Date(ms + 8 * 3600000).toISOString().slice(0, 10);
  const matureTo = d(Date.now() - RETURN_MATURE_DAYS * DAYMS);
  const matureFrom = d(Date.now() - (RETURN_MATURE_DAYS + 29) * DAYMS);
  const from = rep.from < matureFrom ? rep.from : matureFrom;
  const rows = await fetchAll(() => applyOwner(admin.from('submissions').select('id, source, payment_type, created_at, returned_at'), owner)
    .eq('payment_status', 'completed').in('payment_type', ['fpx_payment', 'cod'])
    .gte('created_at', `${from}T00:00:00+08:00`).lte('created_at', `${rep.to}T23:59:59+08:00`).order('created_at'));
  const prod = s => productOf(s.source) || DIGITAL_AD.key;
  const mine = rows.filter(s => !rep.product || prod(s) === rep.product);
  const day = s => d(new Date(s.created_at).getTime());
  const rate = list => (list.length ? r2((list.filter(s => s.returned_at).length / list.length) * 100) : null);
  const inPeriod = mine.filter(s => day(s) >= rep.from && day(s) <= rep.to);
  const mature = mine.filter(s => day(s) >= matureFrom && day(s) <= matureTo);
  const matureCod = mature.filter(s => s.payment_type === 'cod');
  const codRate = matureCod.length ? matureCod.filter(s => s.returned_at).length / matureCod.length : 0;
  const young = inPeriod.filter(s => s.payment_type === 'cod' && day(s) > matureTo);
  const pending = Math.max(0, Math.round(young.length * codRate - young.filter(s => s.returned_at).length));
  const sm = rep.summary;
  const revAdj = Math.max(0, (sm.revenue || 0) - pending * (sm.aov || 0));
  return {
    period_orders_incl_returned: inPeriod.length,
    period_returned: inPeriod.filter(s => s.returned_at).length,
    period_return_rate_pct: rate(inPeriod),
    mature_window: { from: matureFrom, to: matureTo },
    mature_return_rate_pct: rate(mature), mature_cod_return_rate_pct: rate(matureCod), mature_cod_orders: matureCod.length,
    young_cod_orders: young.length, expected_pending_returns: pending,
    revenue_adjusted_est: r2(revAdj), roas_adjusted_est: sm.spend > 0 ? r2(revAdj / sm.spend) : null,
    note: `Order COD < ${RETURN_MATURE_DAYS} hari belum tentu sampai/dibayar. roas_adjusted_est = ROAS selepas tolak anggaran return tertunda (kadar return COD matang). Guna ini untuk keputusan scale/kill pada data 1–14 hari terakhir.`,
  };
}

async function ordersSummary(admin, profile, { period, from, to }, product) {
  const isFighter = profile.role === 'independent';   // fighter: fighter_orders + harga stok HQ kepada fighter
  const owner = isFighter ? null : await resolveOwner(admin, profile.role === 'super_admin' ? 'hq' : profile.id);
  const [subs, costs] = await Promise.all([
    isFighter ? fighterOrderRows(admin, profile.id, { from, to }) : fetchAll(() => applyOwner(admin.from('submissions')
      .select('id, amount_paid, notes, problem, source, qty, created_at, utm_content, payment_type'), owner)
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', `${from}T00:00:00+08:00`)
      .lte('created_at', `${to}T23:59:59+08:00`)
      .order('created_at')),
    isFighter ? fighterCosts(admin, profile.id) : fetchProductCosts(admin),
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
Akaun TANPA token (meta.source 'mcp' atau belum disambung — kebanyakan marketer): cipta & urus ads melalui MCP Meta Ads rasmi dengan url_tags dari get_account_info (WAJIB utm_content={{ad.id}}), dan hantar belanja harian dari MCP Meta Ads ke sync_meta_data (cadangan setiap pagi: semalam & hari ini) supaya Ads Hub & ads spend terisi automatik.
Peraturan auto Ads Hub: list_rules, list_rule_templates, apply_rule_templates, create_rule, update_rule, delete_rule — terangkan peraturan dalam bahasa mudah (syarat → tindakan, mod) dan dapatkan persetujuan pengguna sebelum cipta/ubah/padam.
Akaun dengan token (HQ) ada alat autopilot (autopilot_status, request_upload, upload_video, video_status, launch_ad, prepare_launch, complete_launch, cancel_launch, set_ad_status untuk pause/hidupkan ad dalam kempen autopilot). Suis & had autopilot ditetapkan di Ads Hub → Tetapan. Kelulusan ikut MOD setiap akaun (autopilot_status.mode & approval, ditetapkan HQ): manual = launch_ad / prepare_launch HANYA selepas pengguna meluluskan draf angle, ad copy, skrip VO dan storyboard; shadow / veto / auto = jalankan kitaran penuh ikut SOP templat strategi + arahan khusus akaun TANPA tunggu kelulusan (shadow: launch_ad hanya merekod cadangan), dan laporkan setiap tindakan. Jangan langgar SOP; berhenti & tanya pengguna bila SOP kata begitu atau server menolak. Jika launch_ad ditolak kerana app Meta dalam mod Development, guna prepare_launch → cipta ad melalui MCP Meta Ads rasmi → complete_launch.`;
