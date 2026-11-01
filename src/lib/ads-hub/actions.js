// Ads Hub — tindakan pada akaun Meta (server sahaja).
// SEMUA perubahan (chat, jadual, auto, cadangan) melalui executeAction: semak had keselamatan,
// laksana di Meta, kemas kini cache meta_ads dan catat meta_actions_log.
import { decryptToken } from './crypto';
import { metaGet, metaPost, MetaError } from './meta';

const OBJECT_TYPES = ['ad', 'adset', 'campaign'];
const STATUS_LABEL = { ACTIVE: 'hidupkan', PAUSED: 'pause' };
const TYPE_LABEL = { ad: 'ad', adset: 'adset', campaign: 'kempen' };
const rmFmt = v => `RM${Number(v).toFixed(2).replace(/\.00$/, '')}`;

/** Ayat ringkas untuk kad pengesahan / log. */
export function describeAction(a) {
  const name = a.object_name ? `"${a.object_name}"` : a.object_id;
  if (a.action === 'set_status') return `${STATUS_LABEL[a.params?.status] === 'pause' ? 'Pause' : 'Hidupkan'} ${TYPE_LABEL[a.object_type] || ''} ${name}`;
  if (a.action === 'set_budget') return `Tukar budget harian adset ${name} → ${rmFmt(a.params?.daily_budget_rm)}`;
  if (a.action === 'duplicate_adset') return `Duplicate adset ${name}${a.params?.new_name ? ` sebagai "${a.params.new_name}"` : ''} (PAUSED)${a.params?.daily_budget_rm ? `, budget ${rmFmt(a.params.daily_budget_rm)}` : ''}`;
  return a.action;
}

async function log(admin, conn, a, { source, actorId }, status, message, before = null, after = null) {
  await admin.from('meta_actions_log').insert({
    marketer_id: conn.marketer_id, actor_id: actorId || null, source,
    action: a.action, object_type: a.object_type, object_id: a.object_id, object_name: a.object_name || before?.name || null,
    before, after, status, message,
  });
}

const reject = msg => Object.assign(new Error(msg), { rejected: true });

async function checkAutoQuota(admin, conn, source) {
  if (source !== 'auto') return;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await admin.from('meta_actions_log').select('id', { count: 'exact', head: true })
    .eq('marketer_id', conn.marketer_id).eq('source', 'auto').eq('status', 'ok').gte('created_at', since);
  if ((count || 0) >= conn.limit_auto_actions_per_day) {
    throw reject(`Had tindakan auto (${conn.limit_auto_actions_per_day} sehari) dah dicapai.`);
  }
}

async function checkBudget(admin, conn, adsetId, oldRm, newRm) {
  const max = parseFloat(conn.limit_max_budget);
  if (!(newRm > 0)) throw reject('Budget mesti lebih dari RM0.');
  if (newRm > max) throw reject(`Budget ${rmFmt(newRm)} melebihi had ${rmFmt(max)} sehari. Ubah had di tab Tetapan jika perlu.`);
  if (oldRm != null && newRm > oldRm) {
    const pct = ((newRm - oldRm) / oldRm) * 100;
    if (pct > conn.limit_max_increase_pct + 0.01) {
      throw reject(`Kenaikan ${pct.toFixed(0)}% melebihi had ${conn.limit_max_increase_pct}% sekali naik (maksimum ${rmFmt(oldRm * (1 + conn.limit_max_increase_pct / 100))}).`);
    }
    // Budget naik hanya sekali dalam 20 jam untuk adset yang sama (beri masa Meta belajar)
    const since = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    const { data } = await admin.from('meta_actions_log').select('after, before')
      .eq('marketer_id', conn.marketer_id).eq('action', 'set_budget').eq('object_id', adsetId).eq('status', 'ok').gte('created_at', since);
    if ((data || []).some(r => (r.after?.daily_budget_rm ?? 0) > (r.before?.daily_budget_rm ?? Infinity))) {
      throw reject('Budget adset ini dah dinaikkan dalam 20 jam terakhir. Tunggu esok supaya Meta sempat belajar.');
    }
  }
}

/**
 * Laksana satu tindakan. a = { action, object_type, object_id, object_name?, params }
 * ctx = { source: 'chat'|'jadual'|'auto'|'cadangan', actorId }
 * Pulangkan { ok, message, before?, after?, new_id? } — tidak melempar ralat.
 */
export async function executeAction(admin, conn, a, ctx) {
  let token, before = null;
  try {
    token = decryptToken(conn.token_encrypted);
    await checkAutoQuota(admin, conn, ctx.source);

    if (a.action === 'set_status') {
      const status = a.params?.status;
      if (!OBJECT_TYPES.includes(a.object_type) || !['ACTIVE', 'PAUSED'].includes(status)) throw reject('Tindakan status tidak sah.');
      const cur = await metaGet(a.object_id, { fields: 'name,status,effective_status' }, token);
      before = { name: cur.name, status: cur.status, effective_status: cur.effective_status };
      if (cur.status === status) {
        await log(admin, conn, a, ctx, 'ok', 'Tiada perubahan — status dah sama.', before, before);
        return { ok: true, message: `"${cur.name}" memang dah ${status === 'ACTIVE' ? 'aktif' : 'dipause'}.`, before, after: before };
      }
      await metaPost(a.object_id, { status }, token);
      const after = { name: cur.name, status };
      await updateStatusCache(admin, conn, a.object_type, a.object_id, status);
      await log(admin, conn, a, ctx, 'ok', null, before, after);
      return { ok: true, message: `${describeAction({ ...a, object_name: cur.name })} — berjaya.`, before, after };
    }

    if (a.action === 'set_budget') {
      const newRm = Math.round(parseFloat(a.params?.daily_budget_rm) * 100) / 100;
      const cur = await metaGet(a.object_id, { fields: 'name,daily_budget,lifetime_budget' }, token);
      if (!cur.daily_budget) throw reject(`Adset "${cur.name}" tiada budget harian sendiri (budget di peringkat kempen / lifetime). Ubah di Ads Manager.`);
      const oldRm = parseInt(cur.daily_budget, 10) / 100;
      before = { name: cur.name, daily_budget_rm: oldRm };
      await checkBudget(admin, conn, a.object_id, oldRm, newRm);
      await metaPost(a.object_id, { daily_budget: Math.round(newRm * 100) }, token);
      const after = { name: cur.name, daily_budget_rm: newRm };
      await admin.from('meta_ads').update({ adset_daily_budget: newRm }).eq('marketer_id', conn.marketer_id).eq('adset_id', a.object_id);
      await log(admin, conn, a, ctx, 'ok', null, before, after);
      return { ok: true, message: `Budget "${cur.name}": ${rmFmt(oldRm)} → ${rmFmt(newRm)}.`, before, after };
    }

    if (a.action === 'duplicate_adset') {
      const cur = await metaGet(a.object_id, { fields: 'name,daily_budget' }, token);
      before = { name: cur.name, daily_budget_rm: cur.daily_budget ? parseInt(cur.daily_budget, 10) / 100 : null };
      const budget = a.params?.daily_budget_rm != null ? Math.round(parseFloat(a.params.daily_budget_rm) * 100) / 100 : null;
      if (budget != null) await checkBudget(admin, conn, null, null, budget);
      const copy = await metaPost(`${a.object_id}/copies`, { deep_copy: 'true', status_option: 'PAUSED' }, token);
      const newId = copy.copied_adset_id;
      const upd = { name: (a.params?.new_name || `${cur.name} (salinan)`).slice(0, 200) };
      if (budget != null) upd.daily_budget = Math.round(budget * 100);
      await metaPost(newId, upd, token);
      const after = { name: upd.name, adset_id: newId, status: 'PAUSED', daily_budget_rm: budget ?? before.daily_budget_rm };
      await log(admin, conn, a, ctx, 'ok', null, before, after);
      return { ok: true, new_id: newId, message: `Adset "${cur.name}" diduplicate sebagai "${upd.name}" (PAUSED). Akan muncul di dashboard selepas sync.`, before, after };
    }

    throw reject(`Tindakan "${a.action}" tidak disokong.`);
  } catch (e) {
    const status = e.rejected ? 'rejected' : 'failed';
    const message = e instanceof MetaError ? `Meta tolak: ${e.message}` : e.message;
    await log(admin, conn, a, ctx, status, message, before).catch(() => {});
    return { ok: false, rejected: !!e.rejected, message };
  }
}

// Kemas kini cache segera supaya dashboard tepat sebelum sync seterusnya
async function updateStatusCache(admin, conn, type, id, status) {
  const mine = q => q.eq('marketer_id', conn.marketer_id);
  if (type === 'ad') {
    await mine(admin.from('meta_ads').update({ status }).eq('ad_id', id));
    return;
  }
  const col = type === 'adset' ? 'adset_id' : 'campaign_id';
  const parentPaused = type === 'adset' ? 'ADSET_PAUSED' : 'CAMPAIGN_PAUSED';
  await mine(admin.from('meta_ads').update({ [`${type}_status`]: status }).eq(col, id));
  // Status efektif ad anak (anggaran — sync seterusnya membetulkan)
  if (status === 'PAUSED') await mine(admin.from('meta_ads').update({ status: parentPaused }).eq(col, id).eq('status', 'ACTIVE'));
  else await mine(admin.from('meta_ads').update({ status: 'ACTIVE' }).eq(col, id).eq('status', parentPaused));
}

/** Ambil sambungan penuh (termasuk token disulitkan & had) — server sahaja. */
export async function loadConnection(admin, marketerId) {
  const { data, error } = await admin.from('meta_connections').select('*').eq('marketer_id', marketerId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
