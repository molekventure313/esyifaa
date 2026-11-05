// Ads Hub — Autopilot (HQ & marketer, akaun Meta sendiri): upload creative & launch ad baru dalam kempen "[AUTOPILOT]" (server sahaja).
// Dipanggil melalui MCP E-Syifa oleh Claude di PC SELEPAS draf diluluskan dalam sesi Claude.
// Had dikuatkuasa di sini: suis autopilot, bajet setiap adset, bilangan adset aktif & jumlah bajet harian.
// Launch boleh disambung (resumable): setiap panggilan buat langkah yang belum siap, simpan kemajuan
// dalam autopilot_launches, dan pulangkan status 'launching' jika masa hampir tamat (had masa Netlify).
import { decryptToken } from './crypto';
import { metaGet, metaPost, MetaError } from './meta';
import { AD_PRODUCT_KEYS, PRODUCTS, DIGITAL_AD } from '@/lib/products';
import { ownerProfile, isFighterProfile, fighterAdLink } from './fighter';

export const BUCKET = 'ads-creatives';
export const CTA_TYPES = ['LEARN_MORE', 'SHOP_NOW', 'ORDER_NOW', 'BUY_NOW', 'GET_OFFER'];
export const UTM_TAGS = 'utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.id}}';
const CAMPAIGN_NAME = '[AUTOPILOT] HQ';
const STEP_BUDGET_MS = 7000;
const MYT_MS = 8 * 3600 * 1000;
const rm = v => `RM${Number(v).toFixed(2).replace(/\.00$/, '')}`;

const fail = msg => Object.assign(new Error(msg), { toolError: true });
const metaMsg = e => (e instanceof MetaError ? `Meta tolak: ${e.message}${e.info?.error_user_title ? ` (${e.info.error_user_title})` : ''}` : e.message);

/** 06:00 pagi esok (waktu Malaysia) → ISO. */
export function nextStart(now = Date.now()) {
  const tomorrow = new Date(now + MYT_MS + 86400000).toISOString().slice(0, 10);
  return new Date(`${tomorrow}T06:00:00+08:00`).toISOString();
}

/** start 'today' = 06:00 pagi ini (MYT) jika belum lepas; lalai = 06:00 esok. */
function startFor(start, now = Date.now()) {
  if (start !== 'today') return nextStart(now);
  const today = new Date(now + MYT_MS).toISOString().slice(0, 10);
  const iso = new Date(`${today}T06:00:00+08:00`).toISOString();
  if (Date.parse(iso) <= now) throw fail('06:00 pagi ini dah lepas — guna start "tomorrow".');
  return iso;
}

/** Link mesti halaman e-syifa.com (https), tanpa UTM sedia ada — UTM ditambah oleh url_tags. */
export function checkLink(link) {
  let u;
  try { u = new URL(link); } catch { throw fail('Link tidak sah.'); }
  if (u.protocol !== 'https:' || !/(^|\.)e-syifa\.com$/.test(u.hostname)) throw fail('Link mesti halaman https://e-syifa.com/…');
  if ([...u.searchParams.keys()].some(k => k.startsWith('utm_'))) throw fail('Buang parameter utm_ dari link — UTM ditambah automatik.');
  return u.toString();
}

export async function loadHqConn(admin, marketerId) {
  const { data, error } = await admin.from('meta_connections').select('*').eq('marketer_id', marketerId).maybeSingle();
  if (error) throw fail(/autopilot_/.test(error.message) ? 'Run migration 032 dalam Supabase dulu.' : error.message);
  if (!data) throw fail('Akaun Meta belum disambung.');
  if (data.status === 'error') throw fail(`Sambungan Meta bermasalah: ${data.status_message}`);
  if (!data.token_encrypted) throw fail('Akaun ini tanpa token Meta. Cipta ad terus melalui MCP Meta Ads rasmi (url_tags dari get_account_info WAJIB), kemudian hantar belanja dengan sync_meta_data.');
  return data;
}

// Kempen autopilot: "[AUTOPILOT] HQ" (conn.autopilot_campaign_id, Sabun Garam/lalai) + satu kempen setiap produk lain,
// dikesan dari autopilot_launches. Had slot & bajet dikira merentas semua kempen ini.
export async function autopilotCampaignIds(admin, conn) {
  const { data } = await admin.from('autopilot_launches').select('campaign_id').eq('marketer_id', conn.marketer_id).not('campaign_id', 'is', null);
  return [...new Set([conn.autopilot_campaign_id, ...(data || []).map(r => r.campaign_id)].filter(Boolean))];
}

// Adset dalam kempen autopilot (live dari Meta). Aktif = status ACTIVE (termasuk yang dijadual).
async function liveAdsets(admin, conn, token) {
  const out = [];
  for (const cid of await autopilotCampaignIds(admin, conn)) {
    try {
      const r = await metaGet(`${cid}/adsets`, { fields: 'id,name,status,effective_status,daily_budget,start_time', limit: 100 }, token);
      out.push(...(r.data || []).map(a => ({
        adset_id: a.id, name: a.name, status: a.status, effective_status: a.effective_status, campaign_id: cid,
        daily_budget: a.daily_budget ? parseInt(a.daily_budget, 10) / 100 : 0, start_time: a.start_time,
      })));
    } catch (e) {
      if (!(e instanceof MetaError && e.code === 100)) throw e;   // kempen dipadam → akan dicipta semula
    }
  }
  return out;
}

export async function status(admin, marketerId) {
  const conn = await loadHqConn(admin, marketerId);
  const token = decryptToken(conn.token_encrypted);
  const adsets = await liveAdsets(admin, conn, token);
  const active = adsets.filter(a => a.status === 'ACTIVE');
  const budget = Number(conn.autopilot_adset_budget);
  const pending = await pendingLaunches(admin, marketerId, active.map(a => a.adset_id));
  const used = active.reduce((s, a) => s + a.daily_budget, 0) + pending.reduce((s, r) => s + Number(r.daily_budget || budget), 0);
  const { data: launches } = await admin.from('autopilot_launches')
    .select('id, client_ref, product, angle, status, adset_id, ad_id, start_time, error, created_at')
    .eq('marketer_id', marketerId).order('created_at', { ascending: false }).limit(10);
  const missing = [!conn.autopilot_page_id && 'Facebook Page', !conn.autopilot_template_adset_id && 'adset contoh (template)'].filter(Boolean);
  return {
    enabled: conn.autopilot_enabled,
    ready: conn.autopilot_enabled && !missing.length,
    missing_settings: missing,
    settings: {
      adset_budget: budget, max_adsets: conn.autopilot_max_adsets, daily_cap: Number(conn.autopilot_daily_cap),
      campaign_id: conn.autopilot_campaign_id, page_id: conn.autopilot_page_id, instagram_id: conn.autopilot_ig_id,
      template_adset_id: conn.autopilot_template_adset_id,
    },
    active_adsets: active.length,
    pending_launches: pending.length,
    daily_budget_used: Math.round(used * 100) / 100,
    free_slots: Math.max(0, Math.min(conn.autopilot_max_adsets - active.length - pending.length,Math.floor((Number(conn.autopilot_daily_cap) - used + 1e-9) / budget))),
    adsets,
    next_start_time: nextStart(),
    recent_launches: launches || [],
  };
}

// ---------- Upload creative ----------

export async function requestUpload(admin, marketerId, { kind, filename }) {
  const ext = kind === 'video' ? 'mp4' : kind === 'image' ? (/\.png$/i.test(filename || '') ? 'png' : 'jpg') : null;
  if (!ext) throw fail('kind mesti "video" atau "image".');
  const safe = String(filename || kind).replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || kind;
  const path = `${marketerId}/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safe}.${ext}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw fail(/not found/i.test(error.message) ? 'Bucket ads-creatives tiada — run migration 032.' : error.message);
  const type = ext === 'mp4' ? 'video/mp4' : ext === 'png' ? 'image/png' : 'image/jpeg';
  return {
    path,
    upload_url: data.signedUrl,
    how: `curl -X PUT -H "Content-Type: ${type}" --data-binary @<fail> "<upload_url>"  (sah 2 jam)`,
  };
}

const signedUrl = async (admin, path) => {
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) throw fail(`Fail tidak dijumpai dalam storan: ${path}`);
  return data.signedUrl;
};
const ownPath = (marketerId, path) => {
  if (typeof path !== 'string' || !path.startsWith(`${marketerId}/`)) throw fail('path tidak sah — guna path dari request_upload.');
  return path;
};

export async function uploadVideo(admin, marketerId, { path, name }) {
  const conn = await loadHqConn(admin, marketerId);
  if (!conn.autopilot_enabled) throw fail('Autopilot dimatikan (suis di Ads Hub → Tetapan).');
  const token = decryptToken(conn.token_encrypted);
  const fileUrl = await signedUrl(admin, ownPath(marketerId, path));
  try {
    const r = await metaPost(`${conn.ad_account_id}/advideos`, { file_url: fileUrl, name: String(name || path.split('/').pop()).slice(0, 100) }, token);
    return { video_id: r.id, note: 'Meta sedang proses video. Semak dengan video_status sehingga "ready" sebelum launch_ad.' };
  } catch (e) { throw fail(metaMsg(e)); }
}

export async function videoStatus(admin, marketerId, { video_id }) {
  const conn = await loadHqConn(admin, marketerId);
  const token = decryptToken(conn.token_encrypted);
  try {
    const v = await metaGet(String(video_id), { fields: 'status,length,title' }, token);
    return { video_id, status: v.status?.video_status || 'unknown', processing_progress: v.status?.processing_progress ?? null, length_sec: v.length ?? null, error: v.status?.error || null };
  } catch (e) { throw fail(metaMsg(e)); }
}

// ---------- Launch ----------

// Fighter: link dipaksa ke SP fighter (/f/<slug>?f=<kod> / SP Generator sendiri) supaya order tak masuk HQ
async function ownerLink(admin, marketerId, link) {
  const p = await ownerProfile(admin, marketerId);
  if (!isFighterProfile(p)) return link;
  try { return await fighterAdLink(admin, p, link); } catch (e) { throw fail(e.message); }
}

function validateLaunch(p) {
  const need = ['client_ref', 'angle', 'headline', 'primary_text', 'link', 'video_id'];
  const miss = need.filter(k => !String(p[k] ?? '').trim());
  if (miss.length) throw fail(`Diperlukan: ${miss.join(', ')}.`);
  if (p.product && !AD_PRODUCT_KEYS.includes(p.product)) throw fail(`Produk tidak dikenali. Pilihan: ${AD_PRODUCT_KEYS.join(', ')}`);
  const cta = p.cta || 'LEARN_MORE';
  if (!CTA_TYPES.includes(cta)) throw fail(`cta mesti salah satu: ${CTA_TYPES.join(', ')}`);
  return {
    client_ref: String(p.client_ref).slice(0, 80), product: p.product || null, angle: String(p.angle).trim().slice(0, 80),
    headline: String(p.headline).trim().slice(0, 255), primary_text: String(p.primary_text).trim().slice(0, 5000),
    description: p.description ? String(p.description).trim().slice(0, 255) : null,
    link: checkLink(p.link), video_id: String(p.video_id), thumbnail_path: p.thumbnail_path || null, cta,
    start: p.start === 'today' ? 'today' : 'tomorrow',
  };
}

async function log(admin, marketerId, actorId, action, objectType, objectId, objectName, status, message, after = null) {
  await admin.from('meta_actions_log').insert({
    marketer_id: marketerId, actor_id: actorId || null, source: 'autopilot', action,
    object_type: objectType, object_id: objectId, object_name: objectName, after, status, message,
  }).then(() => {}, () => {});
}

const aliveCampaign = async (id, token) => {
  try {
    const c = await metaGet(id, { fields: 'id,effective_status' }, token);
    return c.effective_status !== 'DELETED' && c.effective_status !== 'ARCHIVED';
  } catch (e) { if (e instanceof MetaError && e.code === 100) return false; throw e; }
};

// Sabun Garam (dan launch tanpa produk) guna kempen utama (conn.autopilot_campaign_id); produk lain dapat kempen sendiri "[AUTOPILOT] <Produk>".
async function ensureCampaign(admin, conn, token, product) {
  if (product && product !== 'sabun-garam') {
    const { data } = await admin.from('autopilot_launches').select('campaign_id').eq('marketer_id', conn.marketer_id)
      .eq('product', product).not('campaign_id', 'is', null).order('created_at', { ascending: false }).limit(1);
    if (data?.[0] && await aliveCampaign(data[0].campaign_id, token)) return data[0].campaign_id;
    const label = [...PRODUCTS, DIGITAL_AD].find(x => x.key === product)?.label || product;
    const c = await metaPost(`${conn.ad_account_id}/campaigns`, {
      name: `[AUTOPILOT] ${label}`, objective: 'OUTCOME_SALES', status: 'ACTIVE', buying_type: 'AUCTION',
      special_ad_categories: [], is_adset_budget_sharing_enabled: false,
    }, token);
    return c.id;
  }
  if (conn.autopilot_campaign_id) {
    try {
      const c = await metaGet(conn.autopilot_campaign_id, { fields: 'id,status,effective_status' }, token);
      if (c.effective_status !== 'DELETED' && c.effective_status !== 'ARCHIVED') return c.id;
    } catch (e) { if (!(e instanceof MetaError && e.code === 100)) throw e; }
  }
  // HQ kekal "[AUTOPILOT] HQ"; marketer: "[AUTOPILOT] Sabun Garam" dalam akaun Meta sendiri
  const { data: owner } = await admin.from('profiles').select('role').eq('id', conn.marketer_id).maybeSingle();
  const sabun = PRODUCTS.find(x => x.key === 'sabun-garam')?.label || 'Sabun Garam';
  const c = await metaPost(`${conn.ad_account_id}/campaigns`, {
    name: owner?.role === 'super_admin' ? CAMPAIGN_NAME : `[AUTOPILOT] ${sabun}`, objective: 'OUTCOME_SALES', status: 'ACTIVE', buying_type: 'AUCTION',
    special_ad_categories: [], is_adset_budget_sharing_enabled: false,   // ABO: bajet di setiap adset
  }, token);
  await admin.from('meta_connections').update({ autopilot_campaign_id: c.id }).eq('marketer_id', conn.marketer_id);
  conn.autopilot_campaign_id = c.id;
  return c.id;
}

async function templateOf(conn, token) {
  const t = await metaGet(conn.autopilot_template_adset_id, {
    fields: 'targeting,promoted_object,optimization_goal,billing_event,bid_strategy,bid_amount,attribution_spec,destination_type,regional_regulated_categories,regional_regulation_identities',
  }, token);
  const out = {
    targeting: t.targeting, promoted_object: t.promoted_object, optimization_goal: t.optimization_goal,
    billing_event: t.billing_event || 'IMPRESSIONS', bid_strategy: t.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
  };
  if (t.bid_amount) out.bid_amount = t.bid_amount;
  if (t.attribution_spec) out.attribution_spec = t.attribution_spec;
  if (t.destination_type && t.destination_type !== 'UNDEFINED') out.destination_type = t.destination_type;
  // Pengiklan disahkan (wajib untuk sasaran Malaysia): salin beneficiary/payer dari adset contoh
  if (t.regional_regulated_categories?.length) out.regional_regulated_categories = t.regional_regulated_categories;
  if (t.regional_regulation_identities) out.regional_regulation_identities = t.regional_regulation_identities;
  return out;
}

// Launch yang adsetnya dah dicipta (PAUSED) tapi ad belum siap — dikira sebagai slot supaya prepare_launch tak melepasi had.
async function pendingLaunches(admin, marketerId, excludeAdsetIds = []) {
  const { data } = await admin.from('autopilot_launches').select('adset_id, daily_budget')
    .eq('marketer_id', marketerId).eq('status', 'launching').not('adset_id', 'is', null).is('ad_id', null);
  return (data || []).filter(r => !excludeAdsetIds.includes(r.adset_id));
}

// Had keselamatan — disemak sebelum adset dicipta / diaktifkan. skipAdsetId = adset launch ini sendiri.
async function checkLimits(admin, conn, token, marketerId, skipAdsetId = null) {
  const budget = Number(conn.autopilot_adset_budget);
  if (budget > Number(conn.limit_max_budget)) throw fail(`Bajet adset autopilot ${rm(budget)} melebihi had adset ${rm(conn.limit_max_budget)} (Tetapan → Had keselamatan).`);
  const active = (await liveAdsets(admin, conn, token)).filter(a => a.status === 'ACTIVE' && a.adset_id !== skipAdsetId);
  const pending = await pendingLaunches(admin, marketerId, [...active.map(a => a.adset_id), skipAdsetId]);
  const count = active.length + pending.length;
  const used = active.reduce((s, a) => s + a.daily_budget, 0) + pending.reduce((s, r) => s + Number(r.daily_budget || budget), 0);
  if (count >= conn.autopilot_max_adsets) throw fail(`Slot penuh: ${count}/${conn.autopilot_max_adsets} adset aktif/menunggu dalam kempen autopilot.`);
  if (used + budget > Number(conn.autopilot_daily_cap) + 1e-9) throw fail(`Melebihi had bajet harian: ${rm(used)} + ${rm(budget)} > ${rm(conn.autopilot_daily_cap)}.`);
}

async function insertRow(admin, marketerId, p, budget) {
  const { data, error } = await admin.from('autopilot_launches').insert({
    marketer_id: marketerId, client_ref: p.client_ref, product: p.product, angle: p.angle, headline: p.headline,
    primary_text: p.primary_text, link: p.link, video_id: p.video_id, daily_budget: budget, start_time: startFor(p.start),
  }).select('*').single();
  if (error) throw fail(error.message);
  return data;
}

async function createAdset(admin, conn, token, row, p, status, save, actorId) {
  const budget = Number(row.daily_budget);
  const campaignId = await ensureCampaign(admin, conn, token, p.product);
  const tpl = await templateOf(conn, token);
  const day = new Date(Date.now() + MYT_MS).toISOString().slice(5, 10).replace('-', '/');
  const name = `${p.product ? `${p.product} | ` : ''}${p.angle} | ${day}`.slice(0, 200);
  const adset = await metaPost(`${conn.ad_account_id}/adsets`, {
    ...tpl, name, campaign_id: campaignId, daily_budget: Math.round(budget * 100), status, start_time: row.start_time,
  }, token);
  await save({ campaign_id: campaignId, adset_id: adset.id });
  await log(admin, row.marketer_id, actorId, 'create_adset', 'adset', adset.id, name, 'ok', `Adset ${rm(budget)}/hari (${status}), mula ${row.start_time}`, { daily_budget_rm: budget, start_time: row.start_time, status });
}

/**
 * Launch satu ad (resumable). p = { client_ref, product?, angle, headline, primary_text, description?, link, cta?, video_id, thumbnail_path? }
 * Pulangkan { status: 'scheduled'|'launching'|'failed', launch_id, ... }.
 */
export async function launchAd(admin, marketerId, actorId, input) {
  const started = Date.now();
  const p = validateLaunch(input);
  p.link = await ownerLink(admin, marketerId, p.link);
  const conn = await loadHqConn(admin, marketerId);
  if (!conn.autopilot_enabled) throw fail('Autopilot dimatikan (suis di Ads Hub → Tetapan). Launch ditolak.');
  if (!conn.autopilot_page_id || !conn.autopilot_template_adset_id) throw fail('Tetapan autopilot belum lengkap: Facebook Page & adset contoh (Ads Hub → Tetapan).');
  const token = decryptToken(conn.token_encrypted);

  // Rekod / sambung semula ikut client_ref
  let { data: row } = await admin.from('autopilot_launches').select('*').eq('marketer_id', marketerId).eq('client_ref', p.client_ref).maybeSingle();
  if (row && ['scheduled', 'cancelled'].includes(row.status)) return summary(row, `Launch ini dah ${row.status === 'scheduled' ? 'dijadualkan' : 'dibatalkan'}.`);
  if (row?.status === 'failed') return summary(row, 'Launch ini gagal sebelum ini. Guna client_ref baru untuk cuba semula.');

  const save = async patch => {
    const { data } = await admin.from('autopilot_launches').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id).select('*').single();
    row = data;
  };
  const timeUp = () => Date.now() - started > STEP_BUDGET_MS;

  try {
    if (!row?.adset_id) {
      await checkLimits(admin, conn, token, marketerId);
      row = row || await insertRow(admin, marketerId, p, Number(conn.autopilot_adset_budget));
      await createAdset(admin, conn, token, row, p, 'ACTIVE', save, actorId);
      if (timeUp()) return summary(row, 'Adset dicipta. Panggil launch_ad sekali lagi dengan client_ref sama untuk sambung.', true);
    }

    if (!row.creative_id) {
      const v = await metaGet(row.video_id, { fields: 'status' }, token);
      const vs = v.status?.video_status;
      if (vs !== 'ready') {
        if (vs === 'error') throw fail('Meta gagal proses video ini. Upload semula video.');
        return summary(row, `Video masih diproses Meta (${vs || 'unknown'}). Tunggu sebentar, kemudian panggil launch_ad semula dengan client_ref sama.`, true);
      }
      let imageUrl = p.thumbnail_path ? await signedUrl(admin, ownPath(marketerId, p.thumbnail_path)) : null;
      if (!imageUrl) {
        const th = await metaGet(`${row.video_id}/thumbnails`, {}, token);
        imageUrl = (th.data || []).find(x => x.is_preferred)?.uri || th.data?.[0]?.uri;
        if (!imageUrl) throw fail('Tiada thumbnail video. Upload thumbnail (request_upload kind=image) dan beri thumbnail_path.');
      }
      const videoData = {
        video_id: row.video_id, image_url: imageUrl, title: p.headline, message: p.primary_text,
        call_to_action: { type: p.cta, value: { link: p.link } },
      };
      if (p.description) videoData.link_description = p.description;
      const story = { page_id: conn.autopilot_page_id, video_data: videoData };
      if (conn.autopilot_ig_id) story.instagram_user_id = conn.autopilot_ig_id;
      const creative = await metaPost(`${conn.ad_account_id}/adcreatives`, {
        name: `${p.angle} — creative`.slice(0, 100), object_story_spec: story, url_tags: UTM_TAGS,
      }, token);
      await save({ creative_id: creative.id });
      if (timeUp()) return summary(row, 'Creative dicipta. Panggil launch_ad sekali lagi dengan client_ref sama untuk sambung.', true);
    }

    if (!row.ad_id) {
      const ad = await metaPost(`${conn.ad_account_id}/ads`, {
        name: p.angle.slice(0, 100), adset_id: row.adset_id, creative: { creative_id: row.creative_id }, status: 'ACTIVE',
      }, token);
      await save({ ad_id: ad.id, status: 'scheduled', error: null });
      await log(admin, marketerId, actorId, 'launch_ad', 'ad', ad.id, p.angle, 'ok', `Dijadual mula ${row.start_time}`, { adset_id: row.adset_id, link: p.link });
    }
    return summary(row, `Ad dijadualkan: mula ${fmtMyt(row.start_time)} MYT, ${rm(row.daily_budget)}/hari.`);
  } catch (e) {
    const msg = e.toolError ? e.message : metaMsg(e);
    if (row?.id) {
      // Adset tanpa ad: pause supaya tiada yang tergantung, dan tandakan gagal
      if (row.adset_id && !row.ad_id) await metaPost(row.adset_id, { status: 'PAUSED' }, token).catch(() => {});
      await save({ status: 'failed', error: msg }).catch(() => {});
      await log(admin, marketerId, actorId, 'launch_ad', 'adset', row.adset_id || null, p.angle, e.toolError ? 'rejected' : 'failed', msg);
    }
    throw fail(msg);
  }
}

// ---------- Launch hibrid: adset oleh E-Syifa, ad oleh MCP Meta Ads rasmi ----------
// App Meta E-Syifa (mod Development) boleh cipta adset tapi Meta tolak creative/post daripadanya. prepare_launch cipta
// adset PAUSED dengan had yang sama; Claude cipta ad melalui MCP Meta (mcp.facebook.com/ads) ikut ad_spec; complete_launch
// sahkan ad (adset & UTM) dan aktifkan adset — dijadual mula 06:00 macam launch_ad.

export async function prepareLaunch(admin, marketerId, actorId, input) {
  const p = validateLaunch(input);
  p.link = await ownerLink(admin, marketerId, p.link);
  const conn = await loadHqConn(admin, marketerId);
  if (!conn.autopilot_enabled) throw fail('Autopilot dimatikan (suis di Ads Hub → Tetapan). Launch ditolak.');
  if (!conn.autopilot_page_id || !conn.autopilot_template_adset_id) throw fail('Tetapan autopilot belum lengkap: Facebook Page & adset contoh (Ads Hub → Tetapan).');
  const token = decryptToken(conn.token_encrypted);

  let { data: row } = await admin.from('autopilot_launches').select('*').eq('marketer_id', marketerId).eq('client_ref', p.client_ref).maybeSingle();
  if (row && ['scheduled', 'cancelled'].includes(row.status)) return summary(row, `Launch ini dah ${row.status === 'scheduled' ? 'dijadualkan' : 'dibatalkan'}.`);
  if (row?.status === 'failed') return summary(row, 'Launch ini gagal sebelum ini. Guna client_ref baru untuk cuba semula.');
  const save = async patch => {
    const { data } = await admin.from('autopilot_launches').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id).select('*').single();
    row = data;
  };

  try {
    if (!row?.adset_id) {
      await checkLimits(admin, conn, token, marketerId);
      row = row || await insertRow(admin, marketerId, p, Number(conn.autopilot_adset_budget));
      await createAdset(admin, conn, token, row, p, 'PAUSED', save, actorId);
    }
  } catch (e) {
    const msg = e.toolError ? e.message : metaMsg(e);
    if (row?.id) await save({ status: 'failed', error: msg }).catch(() => {});
    throw fail(msg);
  }

  const thumbnail_url = p.thumbnail_path ? (await admin.storage.from(BUCKET).createSignedUrl(ownPath(marketerId, p.thumbnail_path), 86400)).data?.signedUrl : null;
  return {
    ...summary(row, 'Adset dicipta (PAUSED). Cipta ad melalui MCP Meta Ads ikut ad_spec, kemudian panggil complete_launch dengan launch_id & ad_id.', true),
    ad_spec: {
      ad_account_id: conn.ad_account_id, adset_id: row.adset_id, page_id: conn.autopilot_page_id,
      instagram_user_id: conn.autopilot_ig_id || null, video_id: row.video_id, thumbnail_url,
      headline: p.headline, primary_text: p.primary_text, description: p.description, link: p.link, cta: p.cta,
      url_tags: UTM_TAGS, ad_name: p.angle.slice(0, 100), ad_status: 'ACTIVE',
      note: 'url_tags WAJIB tepat (utm_content={{ad.id}}) — tanpanya order tak dipadankan dan complete_launch akan tolak.',
    },
  };
}

export async function completeLaunch(admin, marketerId, actorId, { launch_id, ad_id }) {
  if (!ad_id) throw fail('ad_id diperlukan.');
  const { data: row0 } = await admin.from('autopilot_launches').select('*').eq('marketer_id', marketerId).eq('id', launch_id).maybeSingle();
  if (!row0) throw fail('Launch tidak dijumpai.');
  let row = row0;
  if (row.status === 'scheduled') return summary(row, 'Launch ini dah dijadualkan.');
  if (row.status !== 'launching' || !row.adset_id) throw fail(`Launch berstatus "${row.status}" — tak boleh dilengkapkan.`);
  const conn = await loadHqConn(admin, marketerId);
  if (!conn.autopilot_enabled) throw fail('Autopilot dimatikan (suis di Ads Hub → Tetapan). Launch ditolak.');
  const token = decryptToken(conn.token_encrypted);

  try {
    const ad = await metaGet(String(ad_id), { fields: 'id,adset_id,status,creative{id,url_tags}' }, token);
    if (ad.adset_id !== row.adset_id) throw fail(`Ad ${ad_id} bukan dalam adset launch ini (${row.adset_id}).`);
    if (!String(ad.creative?.url_tags || '').includes('utm_content={{ad.id}}')) {
      throw fail(`Creative ad ${ad_id} tiada url_tags dengan utm_content={{ad.id}}. Padam ad itu dan cipta semula dengan url_tags dari ad_spec.`);
    }
    await checkLimits(admin, conn, token, marketerId, row.adset_id);
    if (ad.status !== 'ACTIVE') await metaPost(ad.id, { status: 'ACTIVE' }, token);
    await metaPost(row.adset_id, { status: 'ACTIVE' }, token);
    const { data } = await admin.from('autopilot_launches').update({
      ad_id: ad.id, creative_id: ad.creative?.id || null, status: 'scheduled', error: null, updated_at: new Date().toISOString(),
    }).eq('id', row.id).select('*').single();
    row = data;
    await log(admin, marketerId, actorId, 'launch_ad', 'ad', ad.id, row.angle, 'ok', `Dijadual mula ${row.start_time} (ad melalui MCP Meta)`, { adset_id: row.adset_id, link: row.link });
    return summary(row, `Ad dijadualkan: mula ${fmtMyt(row.start_time)} MYT, ${rm(row.daily_budget)}/hari.`);
  } catch (e) {
    throw fail(e.toolError ? e.message : metaMsg(e));
  }
}

const fmtMyt = iso => new Date(new Date(iso).getTime() + MYT_MS).toISOString().slice(0, 16).replace('T', ' ');

function summary(row, message, pending = false) {
  return {
    status: pending ? 'launching' : row.status, message, launch_id: row.id, client_ref: row.client_ref,
    campaign_id: row.campaign_id, adset_id: row.adset_id, creative_id: row.creative_id, ad_id: row.ad_id,
    daily_budget: row.daily_budget, start_time_myt: row.start_time ? fmtMyt(row.start_time) : null, error: row.error,
  };
}

/** Batal launch: pause adset (sebelum atau selepas mula). */
export async function cancelLaunch(admin, marketerId, actorId, { launch_id }) {
  const { data: row } = await admin.from('autopilot_launches').select('*').eq('marketer_id', marketerId).eq('id', launch_id).maybeSingle();
  if (!row) throw fail('Launch tidak dijumpai.');
  if (row.status === 'cancelled') return summary(row, 'Dah dibatalkan.');
  const conn = await loadHqConn(admin, marketerId);
  if (row.adset_id) {
    try { await metaPost(row.adset_id, { status: 'PAUSED' }, decryptToken(conn.token_encrypted)); }
    catch (e) { throw fail(metaMsg(e)); }
  }
  const { data } = await admin.from('autopilot_launches').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', row.id).select('*').single();
  await log(admin, marketerId, actorId, 'set_status', 'adset', row.adset_id, row.angle, 'ok', 'Launch autopilot dibatalkan (adset dipause).', { status: 'PAUSED' });
  return summary(data, 'Launch dibatalkan — adset dipause.');
}
