// Ads Hub — sync data Meta (ads + prestasi harian) ke Supabase (server sahaja).
import { decryptToken } from './crypto';
import { metaGetAll, isTokenError } from './meta';

const MYT_MS = 8 * 3600 * 1000;
const DAY = 86400000;
const mytDate = (offsetDays = 0) => new Date(Date.now() + MYT_MS - offsetDays * DAY).toISOString().slice(0, 10);
const num = v => parseFloat(v || 0) || 0;
const actionVal = (list, type) => num((list || []).find(a => a.action_type === type)?.value);

async function upsertChunks(admin, table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin.from(table).upsert(rows.slice(i, i + 500), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/**
 * Sync satu sambungan: senarai ads (status/budget/nama) + insights harian `days` hari terakhir.
 * Tarikh insights ikut zon waktu ad account (marketer Malaysia → MYT).
 */
export async function syncConnection(admin, conn, { days = 3 } = {}) {
  const now = new Date().toISOString();
  let token;
  try {
    token = decryptToken(conn.token_encrypted);
    const acct = conn.ad_account_id;

    const ads = await metaGetAll(`${acct}/ads`, {
      fields: 'id,name,effective_status,created_time,campaign{id,name,effective_status},'
        + 'adset{id,name,effective_status,daily_budget},creative{title,thumbnail_url}',
      limit: 200,
    }, token);

    const insights = await metaGetAll(`${acct}/insights`, {
      level: 'ad', time_increment: 1, limit: 500,
      time_range: { since: mytDate(days - 1), until: mytDate(0) },
      fields: 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,reach,inline_link_clicks,actions,action_values',
    }, token);

    const adRows = new Map(ads.map(a => [a.id, {
      ad_id: a.id, marketer_id: conn.marketer_id, ad_account_id: acct,
      campaign_id: a.campaign?.id || null, campaign_name: a.campaign?.name || null, campaign_status: a.campaign?.effective_status || null,
      adset_id: a.adset?.id || null, adset_name: a.adset?.name || null, adset_status: a.adset?.effective_status || null,
      adset_daily_budget: a.adset?.daily_budget ? num(a.adset.daily_budget) / 100 : null,
      name: a.name, status: a.effective_status,
      headline: a.creative?.title || null, thumbnail_url: a.creative?.thumbnail_url || null,
      created_time: a.created_time || null, updated_at: now,
    }]));

    // Ad yang dah diarkib/dipadam tapi masih ada belanja dalam tempoh — simpan nama dari insights
    for (const r of insights) {
      if (!adRows.has(r.ad_id)) {
        adRows.set(r.ad_id, {
          ad_id: r.ad_id, marketer_id: conn.marketer_id, ad_account_id: acct,
          campaign_id: r.campaign_id, campaign_name: r.campaign_name, adset_id: r.adset_id, adset_name: r.adset_name,
          name: r.ad_name, status: 'ARCHIVED', updated_at: now,
        });
      }
    }

    const insightRows = insights.map(r => ({
      ad_id: r.ad_id, date: r.date_start, marketer_id: conn.marketer_id,
      spend: num(r.spend), impressions: parseInt(r.impressions || 0, 10), reach: parseInt(r.reach || 0, 10),
      link_clicks: parseInt(r.inline_link_clicks || 0, 10),
      pixel_purchases: Math.round(actionVal(r.actions, 'purchase')),
      pixel_value: actionVal(r.action_values, 'purchase'),
      updated_at: now,
    }));

    // `angle` tidak disentuh — kekal tag marketer
    await upsertChunks(admin, 'meta_ads', [...adRows.values()], 'ad_id');
    await upsertChunks(admin, 'meta_insights_daily', insightRows, 'ad_id,date');
    await admin.from('meta_connections').update({
      status: 'ok', status_message: null, checked_at: now, last_synced_at: now, updated_at: now,
    }).eq('marketer_id', conn.marketer_id);
    return { ok: true, ads: adRows.size, insight_rows: insightRows.length };
  } catch (e) {
    const message = isTokenError(e)
      ? `Token tidak sah atau tiada akses lagi (${e.message}). Tampal token baru di tab Tetapan.`
      : e.message;
    await admin.from('meta_connections').update({
      status: isTokenError(e) || !token ? 'error' : conn.status, status_message: message, checked_at: now, updated_at: now,
    }).eq('marketer_id', conn.marketer_id);
    return { ok: false, error: message };
  }
}

/** Cron: sync sambungan yang paling lama tidak disync dahulu, dalam had masa function. */
export async function syncDue(admin, { budgetMs = 20000 } = {}) {
  const started = Date.now();
  const { data: conns, error } = await admin.from('meta_connections')
    .select('*').order('last_synced_at', { ascending: true, nullsFirst: true });
  if (error) throw new Error(error.message);
  const results = [];
  for (const conn of conns || []) {
    if (Date.now() - started > budgetMs) break;
    results.push({ marketer_id: conn.marketer_id, ...(await syncConnection(admin, conn, { days: 3 })) });
  }
  return { total: conns?.length || 0, synced: results.length, results };
}
