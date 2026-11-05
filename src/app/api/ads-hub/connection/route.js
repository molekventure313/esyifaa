import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, writeTarget, tableMissing, MIGRATION_MSG } from '@/lib/ads-hub/guard';
import { inspectToken, MetaError } from '@/lib/ads-hub/meta';
import { encryptToken } from '@/lib/ads-hub/crypto';
import { syncConnection } from '@/lib/ads-hub/sync';
import { fillAdsSpend, cacheRange } from '@/lib/ads-hub/spend';
import { AD_PRODUCT_KEYS } from '@/lib/products';

// Sambungan Meta marketer.
//  GET                         → sambungan semasa (token disembunyikan).
//  super_admin: ?marketer=<id> untuk urus marketer itu (semua kaedah); tanpa = akaun HQ sendiri
//  POST { action:'test', token }                  → semak token, senaraikan ad account
//  POST { action:'save', token, ad_account_id }   → simpan (disulitkan) + sync pertama 35 hari
//  DELETE                      → putuskan sambungan & buang data cache
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

const PUBLIC_FIELDS = 'marketer_id, token_last4, ad_account_id, ad_account_name, currency, status, status_message, checked_at, last_synced_at, limit_max_budget, limit_max_increase_pct, limit_auto_actions_per_day, report_enabled, auto_ads_spend, default_product, source';
const bad = (msg, status = 400) => NextResponse.json({ success: false, error: msg }, { status });

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const { data, error } = await g.admin.from('meta_connections').select(PUBLIC_FIELDS).eq('marketer_id', t.id).maybeSingle();
  if (error) return bad(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
  return NextResponse.json({ success: true, connection: data || null });
}

export async function POST(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = await writeTarget(g, req);
  if (t.error) return t.error;

  const body = await req.json().catch(() => ({}));
  const token = String(body.token || '').trim();
  if (token.length < 50 || /\s/.test(token)) return bad('Token tidak sah. Salin semula token penuh dari Business Settings.');

  let info;
  try {
    info = await inspectToken(token);
  } catch (e) {
    const msg = e instanceof MetaError ? e.message : 'Tidak dapat hubungi Meta.';
    return bad(`Meta tolak token ini: ${msg}`);
  }
  if (info.missing_permissions.length) {
    return bad(`Token tiada permission: ${info.missing_permissions.join(', ')}. Generate semula token dan tanda permission itu.`);
  }
  if (!info.ad_accounts.length) return bad('Token ini tiada akses ke mana-mana ad account. Assign ad account kepada System User dulu.');

  if (body.action === 'test') return NextResponse.json({ success: true, ...info });
  if (body.action !== 'save') return bad('Tindakan tidak dikenali.');

  const acct = info.ad_accounts.find(a => a.id === body.ad_account_id);
  if (!acct) return bad('Ad account itu tiada dalam akses token ini.');

  const now = new Date().toISOString();
  let row;
  try {
    row = {
      marketer_id: t.id, token_encrypted: encryptToken(token), token_last4: token.slice(-4), source: 'token',
      ad_account_id: acct.id, ad_account_name: acct.name, currency: acct.currency,
      status: 'ok', status_message: null, checked_at: now, updated_at: now,
      // Ejen AI: ads spend sentiasa automatik dari Meta
      ...(t.profile?.is_ai_agent ? { auto_ads_spend: true } : {}),
    };
  } catch (e) {
    return bad(e.message, 500);
  }

  // Tukar ad account → buang cache akaun lama
  const { data: prev, error: prevErr } = await g.admin.from('meta_connections').select('ad_account_id').eq('marketer_id', t.id).maybeSingle();
  if (prevErr) return bad(tableMissing(prevErr) ? MIGRATION_MSG : prevErr.message, 500);
  if (prev && prev.ad_account_id !== acct.id) {
    await g.admin.from('meta_insights_daily').delete().eq('marketer_id', t.id);
    await g.admin.from('meta_ads').delete().eq('marketer_id', t.id);
  }

  const { error } = await g.admin.from('meta_connections').upsert(row, { onConflict: 'marketer_id' });
  if (error) return bad(error.message, 500);

  const { data: saved } = await g.admin.from('meta_connections').select('*').eq('marketer_id', t.id).single();
  const sync = await syncConnection(g.admin, saved, { days: 35 });
  const { data } = await g.admin.from('meta_connections').select(PUBLIC_FIELDS).eq('marketer_id', t.id).maybeSingle();
  return NextResponse.json({ success: true, connection: data, sync });
}

// Had keselamatan, laporan pagi & ads spend automatik.
// Body: { limit_max_budget, limit_max_increase_pct, limit_auto_actions_per_day, report_enabled, auto_ads_spend, default_product }
export async function PATCH(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = await writeTarget(g, req);
  if (t.error) return t.error;
  const body = await req.json().catch(() => ({}));
  const upd = {};
  const n = v => Number(v);
  if (body.limit_max_budget !== undefined) {
    if (!(n(body.limit_max_budget) >= 1 && n(body.limit_max_budget) <= 100000)) return bad('Budget maksimum mesti antara RM1 dan RM100,000.');
    upd.limit_max_budget = n(body.limit_max_budget);
  }
  if (body.limit_max_increase_pct !== undefined) {
    if (!(n(body.limit_max_increase_pct) >= 1 && n(body.limit_max_increase_pct) <= 100)) return bad('Kenaikan maksimum mesti 1–100%.');
    upd.limit_max_increase_pct = Math.round(n(body.limit_max_increase_pct));
  }
  if (body.limit_auto_actions_per_day !== undefined) {
    if (!(n(body.limit_auto_actions_per_day) >= 0 && n(body.limit_auto_actions_per_day) <= 1000)) return bad('Had tindakan auto mesti 0–1000.');
    upd.limit_auto_actions_per_day = Math.round(n(body.limit_auto_actions_per_day));
  }
  if (typeof body.report_enabled === 'boolean') upd.report_enabled = body.report_enabled;
  if (typeof body.auto_ads_spend === 'boolean') upd.auto_ads_spend = body.auto_ads_spend;
  if (body.default_product !== undefined) {
    if (!AD_PRODUCT_KEYS.includes(body.default_product)) return bad('Produk tidak sah.');
    upd.default_product = body.default_product;
  }
  if (!Object.keys(upd).length) return bad('Tiada perubahan.');
  const { data: full, error } = await g.admin.from('meta_connections').update({ ...upd, updated_at: new Date().toISOString() })
    .eq('marketer_id', t.id).select('*').maybeSingle();
  if (error) return bad(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
  if (!full) return bad('Sambung akaun Meta dulu.');
  // Ads spend automatik dihidupkan / produk default bertukar → isi semula dari cache 35 hari
  let spend = null;
  if (full.auto_ads_spend && ('auto_ads_spend' in upd || 'default_product' in upd)) {
    try { spend = await fillAdsSpend(g.admin, full, cacheRange()); } catch (e) { spend = { ok: false, error: e.message }; }
  }
  const connection = Object.fromEntries(PUBLIC_FIELDS.split(', ').map(k => [k, full[k]]));
  return NextResponse.json({ success: true, connection, spend });
}

export async function DELETE(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = await writeTarget(g, req);
  if (t.error) return t.error;
  await g.admin.from('meta_insights_daily').delete().eq('marketer_id', t.id);
  await g.admin.from('meta_ads').delete().eq('marketer_id', t.id);
  const { error } = await g.admin.from('meta_connections').delete().eq('marketer_id', t.id);
  if (error) return bad(error.message, 500);
  return NextResponse.json({ success: true });
}
