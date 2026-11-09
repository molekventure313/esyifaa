// Ads Hub — terima data Meta dari Claude marketer (MCP Meta Ads rasmi → alat MCP E-Syifa sync_meta_data). Server sahaja.
// Untuk akaun tanpa token (source 'mcp'): cache meta_ads + meta_insights_daily diisi dari data yang dihantar,
// kemudian ads spend automatik (belanja × 1.08) ditulis ikut produk kempen — sama seperti sync token HQ.
import { fillAdsSpend } from './spend';
import { fillFirstDelivery } from './sync';

const MYT_MS = 8 * 3600 * 1000;
const DAY = 86400000;
const mytDate = (off = 0) => new Date(Date.now() + MYT_MS - off * DAY).toISOString().slice(0, 10);
const num = v => { const n = parseFloat(v); return Number.isFinite(n) && n >= 0 ? n : 0; };
const intv = v => Math.round(num(v));
const str = (v, max = 300) => (v === undefined || v === null || v === '' ? null : String(v).slice(0, max));
const ID = /^\d{5,25}$/;
const fail = m => Object.assign(new Error(m), { toolError: true });
const missing035 = m => /source|null value/.test(m || '');

async function upsertChunks(admin, table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin.from(table).upsert(rows.slice(i, i + 500), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

export async function syncFromMcp(admin, marketerId, input = {}) {
  const acct = String(input.ad_account_id || '').trim().replace(/^(\d)/, 'act_$1');
  if (!/^act_\d{5,25}$/.test(acct)) throw fail('ad_account_id tidak sah (contoh act_1234567890).');
  const insights = Array.isArray(input.insights) ? input.insights : [];
  const ads = Array.isArray(input.ads) ? input.ads : [];
  if (!insights.length && !ads.length) throw fail('Tiada data. Hantar insights (belanja harian setiap ad) dan/atau ads.');
  if (insights.length > 6000 || ads.length > 2000) throw fail('Terlalu banyak baris. Maksimum 6000 insights & 2000 ads setiap panggilan — pecahkan ikut julat tarikh.');

  const { data: conn0, error: cErr } = await admin.from('meta_connections').select('*').eq('marketer_id', marketerId).maybeSingle();
  if (cErr) throw new Error(missing035(cErr.message) ? 'Run migration 035 dalam Supabase dulu.' : cErr.message);
  if (conn0 && conn0.source !== 'mcp' && conn0.token_encrypted) throw fail('Akaun ini disync automatik oleh E-Syifa (token). Tak perlu hantar data.');

  // Insights: satu baris setiap ad setiap hari, 35 hari terakhir (MYT)
  const minDate = mytDate(34), maxDate = mytDate(0);
  const rows = new Map();
  for (const r of insights) {
    const ad_id = String(r.ad_id || '');
    const date = String(r.date || r.date_start || '');
    if (!ID.test(ad_id)) throw fail(`ad_id tidak sah dalam insights: ${ad_id || '(kosong)'}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < minDate || date > maxDate) throw fail(`Tarikh ${date || '(kosong)'} di luar julat ${minDate} hingga ${maxDate} (35 hari terakhir, waktu Malaysia).`);
    const k = `${ad_id}|${date}`;
    if (rows.has(k)) throw fail(`Baris berulang untuk ad ${ad_id} tarikh ${date}. Satu baris setiap ad setiap hari (level ad, time_increment 1).`);
    rows.set(k, { r, ad_id, date });
  }

  const now = new Date().toISOString();
  const full = new Map();   // dari senarai ads (status/budget lengkap)
  for (const a of ads) {
    const ad_id = String(a.ad_id || a.id || '');
    if (!ID.test(ad_id)) throw fail(`ad_id tidak sah dalam ads: ${ad_id || '(kosong)'}`);
    full.set(ad_id, {
      ad_id, marketer_id: marketerId, ad_account_id: acct,
      campaign_id: str(a.campaign_id, 30), campaign_name: str(a.campaign_name), campaign_status: str(a.campaign_status, 40),
      adset_id: str(a.adset_id, 30), adset_name: str(a.adset_name), adset_status: str(a.adset_status, 40),
      adset_daily_budget: a.adset_daily_budget === undefined || a.adset_daily_budget === null ? null : num(a.adset_daily_budget),
      name: str(a.ad_name ?? a.name), status: str(a.status ?? a.effective_status, 40) || 'ACTIVE', headline: str(a.headline),
      created_time: str(a.created_time, 40), updated_at: now,
    });
  }
  const partial = new Map();   // ad yang hanya ada dalam insights
  for (const { r, ad_id } of rows.values()) {
    if (full.has(ad_id) || partial.has(ad_id)) continue;
    partial.set(ad_id, {
      ad_id, marketer_id: marketerId, ad_account_id: acct,
      campaign_id: str(r.campaign_id, 30), campaign_name: str(r.campaign_name), adset_id: str(r.adset_id, 30), adset_name: str(r.adset_name),
      name: str(r.ad_name), updated_at: now,
    });
  }

  // Ad milik akaun lain dalam sistem → tolak (elak tulis ganti data orang lain)
  const ids = [...full.keys(), ...partial.keys()];
  const known = new Set();
  for (let i = 0; i < ids.length; i += 300) {
    const { data, error } = await admin.from('meta_ads').select('ad_id, marketer_id').in('ad_id', ids.slice(i, i + 300));
    if (error) throw new Error(error.message);
    for (const k of data || []) {
      if (k.marketer_id !== marketerId) throw fail(`Ad ${k.ad_id} milik akaun lain dalam E-Syifa. Hantar ads dari ad account anda sahaja.`);
      known.add(k.ad_id);
    }
  }
  // Ad baru dari insights sahaja: anggap ARCHIVED sehingga senarai ads dihantar; ad sedia ada: jangan ubah status/budget
  const adUpserts = [...full.values(), ...[...partial.values()].filter(a => !known.has(a.ad_id)).map(a => ({ ...a, status: 'ARCHIVED' }))];

  // Sambungan: cipta / kemas kini (tukar ad account → buang cache lama)
  const base = {
    ad_account_id: acct, ad_account_name: str(input.ad_account_name) || (conn0?.ad_account_id === acct ? conn0.ad_account_name : null),
    currency: str(input.currency, 10) || conn0?.currency || 'MYR', status: 'ok', status_message: null, checked_at: now, last_synced_at: now, updated_at: now,
  };
  if (conn0 && conn0.ad_account_id !== acct) {
    await admin.from('meta_insights_daily').delete().eq('marketer_id', marketerId);
    await admin.from('meta_ads').delete().eq('marketer_id', marketerId);
  }
  const { error: upErr } = conn0
    ? await admin.from('meta_connections').update(base).eq('marketer_id', marketerId)
    : await admin.from('meta_connections').insert({ marketer_id: marketerId, source: 'mcp', token_encrypted: null, token_last4: null, auto_ads_spend: true, ...base });
  if (upErr) throw new Error(missing035(upErr.message) ? 'Run migration 035 dalam Supabase dulu.' : upErr.message);

  await upsertChunks(admin, 'meta_ads', adUpserts, 'ad_id');
  const insightRows = [...rows.values()].map(({ r, ad_id, date }) => ({
    ad_id, date, marketer_id: marketerId, spend: num(r.spend), impressions: intv(r.impressions), reach: intv(r.reach),
    link_clicks: intv(r.link_clicks ?? r.inline_link_clicks), pixel_purchases: intv(r.purchases), pixel_value: num(r.purchase_value),
    video_3s: intv(r.video_3s), thruplays: intv(r.thruplays), updated_at: now,
  }));
  await upsertChunks(admin, 'meta_insights_daily', insightRows, 'ad_id,date');
  await fillFirstDelivery(admin, marketerId, insightRows);

  const dates = insightRows.map(r => r.date).sort();
  const { data: conn } = await admin.from('meta_connections').select('*').eq('marketer_id', marketerId).single();
  let spend = { ok: true, skipped: true };
  if (dates.length) {
    try { spend = await fillAdsSpend(admin, conn, { from: dates[0], to: dates[dates.length - 1] }); }
    catch (e) { spend = { ok: false, error: e.message }; }
  }
  const total = insightRows.reduce((t, r) => t + r.spend, 0);
  return {
    ok: true, ad_account_id: acct, ads: adUpserts.length, insight_rows: insightRows.length,
    from: dates[0] || null, to: dates[dates.length - 1] || null, meta_spend: Math.round(total * 100) / 100,
    ads_spend: conn.auto_ads_spend ? spend : { ok: true, skipped: true, note: 'Ads spend automatik dimatikan di Ads Hub → Tetapan.' },
    message: conn.auto_ads_spend
      ? 'Data disimpan. Ads spend (belanja Meta × 1.08 SST) diisi automatik ikut produk kempen untuk julat tarikh ini — rekod manual dalam julat ini diganti.'
      : 'Data disimpan.',
  };
}
