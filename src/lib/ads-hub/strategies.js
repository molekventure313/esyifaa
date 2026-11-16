// Templat strategi autopilot — templat HQ (owner_id NULL) & versi sendiri akaun (owner_id = marketer/fighter).
// Macam peraturan: akaun "guna" templat HQ → disalin jadi versi sendiri yang boleh diedit pemilik.
// Server sahaja. Dipakai oleh /api/ads-hub/strategies dan alat MCP (lib/ads-hub/mcp.js).

export const MIGRATION_044 = 'Run migration 044 dalam Supabase dulu (versi strategi sendiri).';
export const missing044 = e => /owner_id|source_id/.test(e?.message || '');

const NUM = { adset_budget: [1, 1000], max_adsets: [1, 50], daily_cap: [1, 10000], max_launches_day: [1, 20], kpi_roas: [0.1, 20] };
const LIST = ['products', 'creative'];
// Had yang disalin dari templat ke tetapan akaun. max_launches_day = had keras HQ: pemilik tak boleh ubah.
const LIMIT_COLS = [['adset_budget', 'autopilot_adset_budget'], ['max_adsets', 'autopilot_max_adsets'], ['daily_cap', 'autopilot_daily_cap'], ['max_launches_day', 'autopilot_max_launches_day']];
const HQ_ONLY_PARAMS = ['max_launches_day'];
const COLS = 'id, name, description, sop, params, owner_id, source_id, updated_at';

const err = (msg, status = 400) => Object.assign(new Error(msg), { status, toolError: true });

/** Bersihkan input templat. partial = PATCH. hq = false → param had keras HQ dibuang. */
export function cleanStrategy(b, { partial = false, hq = true } = {}) {
  const row = {};
  if (!partial || 'name' in b) {
    const name = String(b.name || '').trim().slice(0, 80);
    if (!name) throw err('Nama templat diperlukan.');
    row.name = name;
  }
  if ('description' in b) row.description = b.description ? String(b.description).trim().slice(0, 300) : null;
  if ('sop' in b) row.sop = String(b.sop || '').slice(0, 20000);
  if ('params' in b) {
    const p = b.params || {};
    const out = {};
    for (const [k, [min, max]] of Object.entries(NUM)) {
      if (!hq && HQ_ONLY_PARAMS.includes(k)) continue;
      if (p[k] === '' || p[k] == null) continue;
      const v = Number(p[k]);
      if (!(v >= min && v <= max)) throw err(`${k} mesti antara ${min} dan ${max}.`);
      out[k] = v;
    }
    for (const k of LIST) {
      if (p[k] == null) continue;
      const arr = Array.isArray(p[k]) ? p[k] : String(p[k] || '').split(',');
      const v = arr.map(x => String(x).trim()).filter(Boolean).slice(0, 20);
      if (v.length) out[k] = v;
    }
    if (p.structure) out.structure = ['autopilot', '1-1-1'].includes(p.structure) ? p.structure : 'autopilot';
    row.params = out;
  }
  return row;
}

/** Salin had templat ke tetapan akaun. hq = false → max_launches_day tidak disentuh (kecuali dari templat HQ). */
function limitsFrom(params, { includeHqLimit }) {
  const upd = {};
  for (const [k, col] of LIMIT_COLS) {
    if (!includeHqLimit && HQ_ONLY_PARAMS.includes(k)) continue;
    const v = Number(params?.[k]);
    if (v > 0) upd[col] = col.endsWith('adsets') || col.endsWith('day') ? Math.round(v) : v;
  }
  return upd;
}

async function logStrategy(admin, mid, actorId, message, after) {
  await admin.from('meta_actions_log').insert({
    marketer_id: mid, actor_id: actorId, source: 'autopilot', action: 'autopilot_strategy', after, status: 'ok', message,
  }).then(() => {}, () => {});
}

async function activeId(admin, mid) {
  const { data: conn, error } = await admin.from('meta_connections').select('autopilot_strategy_id').eq('marketer_id', mid).maybeSingle();
  if (error) throw new Error(error.message);
  if (!conn) throw err('Akaun Meta belum disambung.');
  return conn.autopilot_strategy_id || null;
}

/** Templat HQ + versi sendiri akaun + yang aktif. full = sertakan SOP penuh. */
export async function listForAccount(admin, mid, { full = false } = {}) {
  const active = await activeId(admin, mid);
  const [{ data: hq, error }, { data: mine, error: e2 }] = await Promise.all([
    admin.from('autopilot_strategies').select(COLS).is('owner_id', null).order('name'),
    admin.from('autopilot_strategies').select(COLS).eq('owner_id', mid).order('name'),
  ]);
  if (error || e2) throw new Error((error || e2).message);
  const shape = s => ({
    id: s.id, name: s.name, description: s.description, params: s.params, source_id: s.source_id, updated_at: s.updated_at,
    active: s.id === active, ...(full ? { sop: s.sop } : { sop_chars: (s.sop || '').length }),
  });
  return { active_id: active, hq_templates: (hq || []).map(shape), my_versions: (mine || []).map(shape) };
}

/** Guna templat HQ: salin jadi versi sendiri (atau guna semula salinan sedia ada) dan aktifkan pada akaun. reset = tulis semula dari HQ terkini. */
export async function useTemplate(admin, mid, actorId, { template_id, reset = false }) {
  const { data: src, error } = await admin.from('autopilot_strategies').select(COLS).eq('id', Number(template_id)).maybeSingle();
  if (error) throw new Error(error.message);
  if (!src) throw err('Templat tidak dijumpai.', 404);
  if (src.owner_id && src.owner_id !== mid) throw err('Templat ini milik akaun lain.', 403);
  await activeId(admin, mid);

  // Versi sendiri sedia ada → aktifkan sahaja
  if (src.owner_id === mid) {
    await admin.from('meta_connections').update({ autopilot_strategy_id: src.id, ...limitsFrom(src.params, { includeHqLimit: false }) }).eq('marketer_id', mid);
    await logStrategy(admin, mid, actorId, `Strategi aktif ditukar ke versi sendiri "${src.name}".`, { strategy_id: src.id });
    return { ok: true, strategy_id: src.id, name: src.name, copied: false, message: `Versi "${src.name}" kini aktif.` };
  }

  const { data: existing } = await admin.from('autopilot_strategies').select(COLS).eq('owner_id', mid).eq('source_id', src.id).maybeSingle();
  let copy = existing;
  if (!copy || reset) {
    const { data: p } = await admin.from('profiles').select('marketer_code, full_name').eq('id', mid).maybeSingle();
    const row = { name: `${src.name} — versi ${p?.marketer_code || p?.full_name || 'saya'}`.slice(0, 80), description: src.description, sop: src.sop, params: src.params || {}, updated_at: new Date().toISOString() };
    const q = copy
      ? admin.from('autopilot_strategies').update(row).eq('id', copy.id)
      : admin.from('autopilot_strategies').insert({ ...row, owner_id: mid, source_id: src.id, created_by: actorId });
    const { data, error: wErr } = await q.select(COLS).single();
    if (wErr) throw missing044(wErr) ? err(MIGRATION_044, 500) : /duplicate|unique/i.test(wErr.message) ? err('Nama versi dah wujud — namakan semula versi lama dulu.') : new Error(wErr.message);
    copy = data;
  }
  // Had dari templat HQ (termasuk had launch sehari HQ)
  await admin.from('meta_connections').update({ autopilot_strategy_id: copy.id, ...limitsFrom(src.params, { includeHqLimit: true }) }).eq('marketer_id', mid);
  const what = !existing ? 'disalin' : reset ? 'ditetapkan semula ikut HQ terkini' : 'diaktifkan semula';
  await logStrategy(admin, mid, actorId, `Templat HQ "${src.name}" ${what} sebagai "${copy.name}".`, { strategy_id: copy.id, source_id: src.id });
  return { ok: true, strategy_id: copy.id, name: copy.name, copied: !existing || reset, message: `Templat "${src.name}" ${what}. Versi "${copy.name}" kini aktif dan boleh diedit.` };
}

/** Edit versi sendiri (lalai: versi yang aktif). hq = pelaku HQ (boleh ubah had launch sehari). */
export async function updateOwn(admin, mid, actorId, { strategy_id, apply_limits = true, ...input }, { hq = false } = {}) {
  const id = strategy_id ? Number(strategy_id) : await activeId(admin, mid);
  if (!id) throw err('Akaun ini belum guna templat. Guna templat HQ dulu (jadi versi sendiri).');
  const { data: cur, error } = await admin.from('autopilot_strategies').select(COLS).eq('id', id).maybeSingle();
  if (error) throw missing044(error) ? err(MIGRATION_044, 500) : new Error(error.message);
  if (!cur || cur.owner_id !== mid) throw err('Ini templat HQ / bukan versi akaun ini (tidak boleh diedit). Guna templat HQ dulu supaya disalin jadi versi sendiri.', 403);
  const row = cleanStrategy(input, { partial: true, hq });
  if ('params' in row) {
    // Gabung dengan param sedia ada; had keras HQ dikekalkan dari versi semasa
    row.params = { ...(cur.params || {}), ...row.params };
    if (!hq) for (const k of HQ_ONLY_PARAMS) { if (cur.params?.[k] != null) row.params[k] = cur.params[k]; else delete row.params[k]; }
  }
  if (!Object.keys(row).length) throw err('Tiada perubahan (name, description, sop, params).');
  const { data, error: uErr } = await admin.from('autopilot_strategies').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select(COLS).single();
  if (uErr) throw /duplicate|unique/i.test(uErr.message) ? err('Nama versi dah wujud.') : new Error(uErr.message);
  const active = (await activeId(admin, mid)) === id;
  if (active && apply_limits && 'params' in row) {
    const lim = limitsFrom(data.params, { includeHqLimit: hq });
    if (Object.keys(lim).length) await admin.from('meta_connections').update(lim).eq('marketer_id', mid);
  }
  const changed = Object.keys(row).join(', ');
  await logStrategy(admin, mid, actorId, `Versi strategi "${data.name}" dikemas kini (${changed}).`, { strategy_id: id, changed });
  return { ok: true, strategy: { id: data.id, name: data.name, description: data.description, params: data.params, sop_chars: (data.sop || '').length, active } };
}

/** Padam versi sendiri. Jika aktif, akaun kembali tanpa templat (FK ON DELETE SET NULL). */
export async function deleteOwn(admin, mid, actorId, id) {
  const { data, error } = await admin.from('autopilot_strategies').delete().eq('id', Number(id)).eq('owner_id', mid).select('id, name').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw err('Versi tidak dijumpai.', 404);
  await logStrategy(admin, mid, actorId, `Versi strategi "${data.name}" dipadam.`, { strategy_id: data.id });
  return { ok: true };
}
