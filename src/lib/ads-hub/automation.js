// Ads Hub — tindakan berjadual, peraturan auto & amaran (server sahaja).
import { executeAction, describeAction } from './actions';
import { buildReport, fetchAll } from './report';
import { autopilotCampaignIds } from './autopilot';
import { campaignProducts } from './spend';
import { PRODUCTS, DIGITAL_AD, AD_PRODUCT_KEYS } from '@/lib/products';

const MYT_MS = 8 * 3600 * 1000;
const DAY = 86400000;
const mytDate = (ms = Date.now()) => new Date(ms + MYT_MS).toISOString().slice(0, 10);
const r2 = n => Math.round(n * 100) / 100;

export const METRIC_LABEL = {
  spend: 'Belanja', orders: 'Order', revenue: 'Jualan', roas: 'ROAS', cpa: 'CPA', ctr: 'CTR link (%)',
  cpm: 'CPM (RM)', frequency: 'Frequency 7 hari', age_days: 'Umur ad (hari)', hook_rate: 'Hook rate (%)',
};
export const RULE_ACTION_LABEL = { pause: 'Pause ad', pause_adset: 'Pause adset', activate_adset: 'Hidupkan adset', budget_up: 'Naikkan budget adset', budget_down: 'Turunkan budget adset', budget_set: 'Set budget adset', notify: 'Beri amaran sahaja' };

// ---------- Tindakan berjadual ----------

/** "YYYY-MM-DD HH:mm" waktu Malaysia → ISO UTC. */
export function parseMyt(s) {
  const m = String(s || '').trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:${m[3]}:00+08:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createSchedule(admin, marketerId, actorId, s) {
  const runAt = parseMyt(s.run_at_myt);
  if (!runAt) return { ok: false, message: 'Masa tidak sah. Format: YYYY-MM-DD HH:mm (waktu Malaysia).' };
  if (new Date(runAt).getTime() < Date.now() - 60000) return { ok: false, message: 'Masa itu dah lepas.' };
  if (new Date(runAt).getTime() > Date.now() + 60 * DAY) return { ok: false, message: 'Jadual maksimum 60 hari ke depan.' };
  const { data, error } = await admin.from('meta_scheduled_actions').insert({
    marketer_id: marketerId, run_at: runAt, action: s.action, object_type: s.object_type, object_id: s.object_id,
    object_name: s.object_name || null, params: s.params || {}, created_by: actorId,
  }).select('id').single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data.id, message: `Dijadualkan (#${data.id}) pada ${s.run_at_myt} MYT: ${describeAction(s)}.` };
}

export async function cancelSchedule(admin, marketerId, id) {
  const { data } = await admin.from('meta_scheduled_actions').update({ status: 'cancelled' })
    .eq('id', id).eq('marketer_id', marketerId).eq('status', 'pending').select('id').maybeSingle();
  return data ? { ok: true, message: `Jadual #${id} dibatalkan.` } : { ok: false, message: `Jadual #${id} tidak dijumpai atau dah dijalankan.` };
}

/** Cron: laksana jadual yang dah sampai masa. */
export async function runDueSchedules(admin, { budgetMs = 20000 } = {}) {
  const started = Date.now();
  const { data: due } = await admin.from('meta_scheduled_actions').select('*')
    .eq('status', 'pending').lte('run_at', new Date().toISOString()).order('run_at').limit(20);
  const conns = new Map();
  const results = [];
  for (const s of due || []) {
    if (Date.now() - started > budgetMs) break;
    // Kunci baris supaya tidak dijalankan dua kali
    const { data: claimed } = await admin.from('meta_scheduled_actions').update({ status: 'running' })
      .eq('id', s.id).eq('status', 'pending').select('id').maybeSingle();
    if (!claimed) continue;
    if (!conns.has(s.marketer_id)) {
      const { data } = await admin.from('meta_connections').select('*').eq('marketer_id', s.marketer_id).maybeSingle();
      conns.set(s.marketer_id, data);
    }
    const conn = conns.get(s.marketer_id);
    const r = conn
      ? await executeAction(admin, conn, s, { source: 'jadual', actorId: s.created_by })
      : { ok: false, message: 'Sambungan Meta tiada.' };
    await admin.from('meta_scheduled_actions').update({
      status: r.ok ? 'done' : 'failed', result: r.message, executed_at: new Date().toISOString(),
    }).eq('id', s.id);
    results.push({ id: s.id, ok: r.ok });
  }
  return { due: due?.length || 0, ran: results.length, results };
}

// ---------- Peraturan auto ----------
// level 'ad'    = metrik setiap ad (asal). level 'adset' = metrik dijumlahkan ikut adset, hanya kempen ACTIVE.
// run_at_time   = peraturan ikut jam (runTimeRules, cron 10 minit) pada semua adset dalam kempen aktif.

const OPERATORS = ['>', '>=', '<', '<=', '='];
const ADSET_ONLY = ['activate_adset', 'budget_set'];
const TIME_ACTIONS = ['pause_adset', 'activate_adset', 'budget_set'];
const isBudgetPct = a => a === 'budget_up' || a === 'budget_down';
const SCALE_CUTOFF_HOUR = 21;   // MYT

export function validateRule(r) {
  const errs = [];
  if (!r.name?.trim()) errs.push('nama');
  if (!RULE_ACTION_LABEL[r.action]) errs.push('tindakan');
  if (!['suggest', 'auto'].includes(r.mode)) errs.push('mod');
  if (r.scope && !['all', 'autopilot'].includes(r.scope)) errs.push('skop');
  if (r.product && !AD_PRODUCT_KEYS.includes(r.product)) errs.push('produk');
  if (r.action === 'budget_set' && !(Number(r.action_value) >= 1 && Number(r.action_value) <= 100000)) errs.push('budget baru (RM)');
  if (r.action_max != null && r.action_max !== '' && !(Number(r.action_max) >= 1)) errs.push('had budget maksimum');
  if (r.run_at_time) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.run_at_time)) errs.push('masa (HH:mm)');
    if (!TIME_ACTIONS.includes(r.action)) errs.push('tindakan ikut jam (pause / hidupkan / set budget adset sahaja)');
    return errs.length ? `Peraturan tidak lengkap: ${errs.join(', ')}.` : null;
  }
  const conds = [{ metric: r.metric, operator: r.operator, value: r.value }, ...(r.conditions || [])];
  if (conds.length > 4) errs.push('syarat (maksimum 4)');
  conds.forEach((c, i) => {
    const n = i ? ` ${i + 1}` : '';
    if (!METRIC_LABEL[c.metric]) errs.push(`metrik${n}`);
    if (!OPERATORS.includes(c.operator)) errs.push(`operator${n}`);
    if (c.value === '' || c.value == null || !Number.isFinite(Number(c.value))) errs.push(`nilai${n}`);
  });
  if (!(Number(r.window_days) >= 1 && Number(r.window_days) <= 30)) errs.push('tempoh (1–30 hari)');
  if (r.level && !['ad', 'adset'].includes(r.level)) errs.push('peringkat');
  if (ADSET_ONLY.includes(r.action) && r.level !== 'adset') errs.push('tindakan ini perlukan peringkat adset');
  if (r.frequency && !['daily', 'hourly'].includes(r.frequency)) errs.push('kekerapan');
  if (isBudgetPct(r.action) && !(Number(r.action_value) > 0 && Number(r.action_value) <= 100)) errs.push('peratus budget (1–100)');
  return errs.length ? `Peraturan tidak lengkap: ${errs.join(', ')}.` : null;
}

const condText = c => `${METRIC_LABEL[c.metric]} ${c.operator} ${Number(c.value)}`;
function actionText(r) {
  if (isBudgetPct(r.action)) return `${RULE_ACTION_LABEL[r.action]} ${Number(r.action_value)}%${Number(r.action_max) > 0 ? ` (maks RM${Number(r.action_max)})` : ''}`;
  if (r.action === 'budget_set') return `Set budget adset RM${Number(r.action_value)}`;
  return RULE_ACTION_LABEL[r.action];
}

const productLabel = k => [...PRODUCTS, DIGITAL_AD].find(p => p.key === k)?.label || k;

export function describeRule(r) {
  const tail = ` · ${r.mode === 'auto' ? 'AUTO' : 'cadang sahaja'}` + (r.scope === 'autopilot' ? ' · kempen autopilot sahaja' : '')
    + (r.product ? ` · ${productLabel(r.product)} sahaja` : '');
  if (r.run_at_time) return `Setiap hari ${r.run_at_time} → ${actionText(r)} (semua adset dalam kempen aktif)${tail}`;
  const conds = [{ metric: r.metric, operator: r.operator, value: r.value }, ...(r.conditions || [])].map(condText).join(' dan ');
  const win = Number(r.window_days) === 1 ? 'hari ini' : `dalam ${r.window_days} hari`;
  return `Jika ${conds} ${win}${Number(r.min_spend) > 0 ? ` (belanja ≥ RM${Number(r.min_spend)})` : ''}`
    + `${r.level === 'adset' ? ', ikut adset (kempen aktif)' : ''} → ${actionText(r)}`
    + `${r.frequency === 'hourly' ? ' · boleh berulang setiap jam' : ''}${tail}`;
}

// Baris DB dari input peraturan (sudah disahkan). full = tulis semua kolum (untuk kemas kini; nilai lalai eksplisit).
function ruleRow(r, full = false) {
  const timed = !!r.run_at_time;
  const row = {
    name: r.name.trim().slice(0, 80),
    metric: timed ? 'spend' : r.metric, operator: timed ? '>=' : r.operator, value: timed ? 0 : Number(r.value),
    window_days: timed ? 1 : Number(r.window_days), min_spend: timed ? 0 : Number(r.min_spend) || 0, action: r.action,
    action_value: isBudgetPct(r.action) || r.action === 'budget_set' ? Number(r.action_value) : null, mode: r.mode,
  };
  // Kolum migration 033/034 — semasa cipta hanya dihantar bila bukan nilai lalai
  const scope = r.scope === 'autopilot' ? 'autopilot' : 'all';
  const level = timed || r.level === 'adset' ? 'adset' : 'ad';
  const conditions = !timed && r.conditions?.length ? r.conditions.map(c => ({ metric: c.metric, operator: c.operator, value: Number(c.value) })) : [];
  const frequency = !timed && r.frequency === 'hourly' ? 'hourly' : 'daily';
  const action_max = r.action === 'budget_up' && Number(r.action_max) > 0 ? Number(r.action_max) : null;
  const product = AD_PRODUCT_KEYS.includes(r.product) ? r.product : null;   // migration 041
  if (full || scope !== 'all') row.scope = scope;
  if (full || product) row.product = product;
  if (full || timed) row.run_at_time = timed ? r.run_at_time : null;
  if (full || level !== 'ad') row.level = level;
  if (full || conditions.length) row.conditions = conditions;
  if (full || frequency !== 'daily') row.frequency = frequency;
  if (full || action_max) row.action_max = action_max;
  return row;
}

export async function createRule(admin, marketerId, r) {
  const err = validateRule(r);
  if (err) return { ok: false, message: err };
  const row = { marketer_id: marketerId, ...ruleRow(r), active: r.active === false ? false : true };
  const { data, error } = await admin.from('meta_rules').insert(row).select('id').single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data.id, message: `Peraturan #${data.id} "${row.name}" dicipta: ${describeRule(row)}.` };
}

/** Ubah keseluruhan peraturan (syarat, tindakan, mod…) — ID & sejarah kekal. */
export async function updateRule(admin, marketerId, id, r) {
  const err = validateRule(r);
  if (err) return { ok: false, message: err };
  const row = ruleRow(r, true);
  if (typeof r.active === 'boolean') row.active = r.active;
  const { data, error } = await admin.from('meta_rules').update(row).eq('id', id).eq('marketer_id', marketerId).select('*').maybeSingle();
  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: 'Peraturan tidak dijumpai.' };
  return { ok: true, id: data.id, message: `Peraturan #${data.id} "${data.name}" dikemas kini: ${describeRule(data)}.` };
}

// ---------- Templat peraturan = peraturan akaun HQ (super_admin) ----------
const TEMPLATE_KEYS = ['name', 'metric', 'operator', 'value', 'conditions', 'window_days', 'min_spend', 'level', 'frequency', 'run_at_time', 'action', 'action_value', 'action_max', 'mode', 'scope', 'product'];
export async function ruleTemplates(admin) {
  const { data: hq } = await admin.from('profiles').select('id').eq('role', 'super_admin');
  const ids = (hq || []).map(p => p.id);
  if (!ids.length) return [];
  const { data, error } = await admin.from('meta_rules').select('*').in('marketer_id', ids).eq('active', true).order('id');
  if (error) throw new Error(error.message);
  const seen = new Set();
  return (data || []).filter(r => !seen.has(r.name) && seen.add(r.name)).map(r => {
    const t = Object.fromEntries(TEMPLATE_KEYS.map(k => [k, r[k] ?? null]));
    return {
      ...t, key: r.id, conditions: r.conditions || [], run_at_time: r.run_at_time || '', level: r.level || 'ad',
      frequency: r.frequency || 'daily', scope: r.scope || 'all', summary: describeRule(r),
    };
  });
}

/** Salin templat HQ ke akaun marketer. keys kosong = semua. Nama yang dah wujud dilangkau. forceSuggest untuk akaun tanpa token. */
export async function applyRuleTemplates(admin, marketerId, { keys, forceSuggest = false } = {}) {
  const all = await ruleTemplates(admin);
  const pick = keys?.length ? all.filter(t => keys.map(Number).includes(Number(t.key))) : all;
  const { data: existing } = await admin.from('meta_rules').select('name').eq('marketer_id', marketerId);
  const have = new Set((existing || []).map(r => r.name));
  const created = [], skipped = [];
  for (const t of pick) {
    if (have.has(t.name)) { skipped.push(t.name); continue; }
    const r = await createRule(admin, marketerId, { ...t, mode: forceSuggest ? 'suggest' : t.mode });
    if (r.ok) created.push({ id: r.id, name: t.name }); else skipped.push(`${t.name} (${r.message})`);
  }
  return { ok: true, created, skipped, message: `${created.length} peraturan dicipta dari templat HQ${skipped.length ? `; ${skipped.length} dilangkau (nama dah wujud atau ralat)` : ''}.` };
}

const cmp = (v, op, x) => (op === '>' ? v > x : op === '>=' ? v >= x : op === '<' ? v < x : op === '=' ? v === x : v <= x);

async function addEvent(admin, ev) {
  // dedupe_key unik → abaikan jika dah wujud
  const { data, error } = await admin.from('meta_events').insert(ev).select('id').maybeSingle();
  if (error) return null;
  return data;
}

/** Cipta cadangan (dedupe) dan, untuk mod auto, terus laksana. */
async function fireRule(admin, conn, rule, ev, action, out) {
  const created = await addEvent(admin, ev);
  if (!created) return false;
  if (rule.mode === 'auto' && action) {
    // Peraturan setiap jam boleh naikkan budget berulang (langkau had sekali/20 jam);
    // set budget (reset ikut jam / tangga scale) langkau had % kenaikan — had RM maksimum tetap terpakai.
    const r = await executeAction(admin, conn, action, {
      source: 'auto', actorId: null, repeatRaise: rule.frequency === 'hourly' || !!rule.run_at_time,
      anyIncrease: !!rule.run_at_time || rule.action === 'budget_set',
    });
    await admin.from('meta_events').update({
      status: r.ok ? 'executed' : 'failed', resolved_at: new Date().toISOString(), detail: `${ev.detail} → ${r.message}`,
    }).eq('id', created.id);
    if (r.ok) out.executed++;
    return r.ok;
  } else {
    out.suggestions++;
    return false;
  }
}

/** Adset akaun (dari cache meta_ads): status adset & kempen, budget harian. */
async function adsetIndex(admin, marketerId) {
  const rows = await fetchAll(() => admin.from('meta_ads')
    .select('adset_id, adset_name, adset_status, adset_daily_budget, campaign_id, campaign_status')
    .eq('marketer_id', marketerId).not('adset_id', 'is', null).order('ad_id'));
  const map = new Map();
  for (const a of rows) {
    if (map.has(a.adset_id)) continue;
    map.set(a.adset_id, { ...a, daily_budget: a.adset_daily_budget != null ? parseFloat(a.adset_daily_budget) : null });
  }
  return map;
}

/** Adset autopilot yang belum siap / dibatalkan — jangan dihidupkan oleh peraturan. */
async function blockedAdsets(admin, marketerId) {
  const { data } = await admin.from('autopilot_launches').select('adset_id')
    .eq('marketer_id', marketerId).in('status', ['launching', 'failed', 'cancelled']).not('adset_id', 'is', null);
  return new Set((data || []).map(r => r.adset_id));
}

// Skop autopilot = semua kempen [AUTOPILOT] akaun ini (kempen utama + kempen setiap produk); conn.apCampaigns diisi oleh withApCampaigns
const inScope = (rule, conn, s) => s.campaign_status === 'ACTIVE'
  && (rule.scope !== 'autopilot' || !!conn.apCampaigns?.has(s.campaign_id))
  && productOk(rule, conn, s.campaign_id);

/** Produk setiap kempen (conn.campProd) + produk yang ada peraturan ikut-syarat sendiri (conn.ownProducts). */
async function withProducts(admin, conn, rules) {
  if (conn.campProd) return conn;
  conn.ownProducts = new Set(rules.filter(r => r.product && !r.run_at_time).map(r => r.product));
  conn.campProd = new Map();
  if (rules.some(r => r.product)) for (const c of await campaignProducts(admin, conn)) conn.campProd.set(c.campaign_id, c.product);
  return conn;
}

// Peraturan produk → kempen produk itu sahaja. Peraturan ikut-syarat umum → langkau produk yang ada peraturan sendiri
// (peraturan ikut jam umum — reset budget, tutup/hidup semua — tetap terpakai pada semua produk).
const productOk = (rule, conn, campaignId) => {
  const p = conn.campProd?.get(campaignId);
  if (rule.product) return p === rule.product;
  return !!rule.run_at_time || !p || !conn.ownProducts?.has(p);
};
async function withApCampaigns(admin, conn) {
  if (!conn.apCampaigns) conn.apCampaigns = new Set(await autopilotCampaignIds(admin, conn));
  return conn;
}

/** Tindakan Meta untuk satu adset, atau null jika tiada perubahan diperlukan. */
function adsetAction(rule, s) {
  const base = { object_type: 'adset', object_id: s.adset_id, object_name: s.adset_name };
  if (rule.action === 'pause_adset') return s.adset_status === 'ACTIVE' ? { ...base, action: 'set_status', params: { status: 'PAUSED' } } : null;
  if (rule.action === 'activate_adset') return s.adset_status === 'PAUSED' ? { ...base, action: 'set_status', params: { status: 'ACTIVE' } } : null;
  if (s.daily_budget == null) return null;   // budget di peringkat kempen
  let newRm = null;
  if (rule.action === 'budget_set') {
    newRm = Number(rule.action_value);
    // Bersyarat (tangga scale): naik sahaja, tak pernah turunkan. Reset ikut jam boleh turunkan.
    if (!rule.run_at_time && newRm <= s.daily_budget) return null;
  }
  if (isBudgetPct(rule.action)) {
    const up = rule.action === 'budget_up';
    newRm = Math.max(1, (up ? Math.floor : Math.round)(s.daily_budget * (up ? 1 + rule.action_value / 100 : 1 - rule.action_value / 100)));   // floor: elak lebih had % (373×1.3=484.9)
    if (up && Number(rule.action_max) > 0) newRm = Math.min(newRm, Number(rule.action_max));
    if (up ? newRm <= s.daily_budget : newRm >= s.daily_budget) return null;
  }
  if (newRm == null || newRm === s.daily_budget) return null;
  return { ...base, action: 'set_budget', params: { daily_budget_rm: newRm } };
}

const fmtMetric = (metric, v) => (v == null ? '—' : ['roas', 'frequency'].includes(metric) ? v.toFixed(2) : ['ctr', 'hook_rate'].includes(metric) ? `${v}%`
  : ['spend', 'revenue', 'cpa', 'cpm'].includes(metric) ? `RM${r2(v)}` : metric === 'age_days' ? `hari ke-${v}` : v);

/** Adakah budget adset ini dah dinaikkan oleh peraturan auto sejak awal jam semasa (waktu Malaysia)? */
async function raisedThisHour(admin, marketerId, adsetId) {
  const hourStart = new Date(Math.floor((Date.now() + MYT_MS) / 3600000) * 3600000 - MYT_MS).toISOString();
  const { data } = await admin.from('meta_actions_log').select('before, after')
    .eq('marketer_id', marketerId).eq('object_id', adsetId).eq('action', 'set_budget').eq('source', 'auto').eq('status', 'ok')
    .gte('created_at', hourStart).limit(20);
  return (data || []).some(r => Number(r.after?.daily_budget_rm) > Number(r.before?.daily_budget_rm));
}

/** Peraturan peringkat adset: jumlahkan metrik ad ikut adset, semua syarat mesti benar. */
async function evaluateAdsetRule(admin, conn, rule, rep, ctx, out) {
  const agg = new Map();
  for (const a of rep.ads) {
    if (!a.adset_id) continue;
    const g = agg.get(a.adset_id) || { spend: 0, orders: 0, revenue: 0, impressions: 0, link_clicks: 0, video_3s: 0, reach7: 0, imp7: 0, age: null };
    g.spend += a.spend || 0; g.orders += a.orders || 0; g.revenue += a.revenue || 0;
    g.impressions += a.impressions || 0; g.link_clicks += a.link_clicks || 0; g.video_3s += a.video_3s || 0;
    if (a.reach_7d && a.frequency) { g.reach7 += a.reach_7d; g.imp7 += a.reach_7d * a.frequency; }
    if (a.age_days != null) g.age = Math.max(g.age ?? 0, a.age_days);   // umur adset = ad paling lama
    agg.set(a.adset_id, g);
  }
  const conds = [{ metric: rule.metric, operator: rule.operator, value: rule.value }, ...(rule.conditions || [])];
  const stamp = rule.frequency === 'hourly' ? `${ctx.today}:${ctx.hour}` : ctx.today;
  for (const [id, g] of agg) {
    const s = ctx.adsets.get(id);
    if (!s || !inScope(rule, conn, s)) continue;
    if (rule.action === 'activate_adset' ? s.adset_status !== 'PAUSED' || ctx.blocked.has(id) : s.adset_status !== 'ACTIVE') continue;
    if (g.spend < Number(rule.min_spend)) continue;
    const m = {
      spend: r2(g.spend), orders: g.orders, revenue: r2(g.revenue),
      roas: g.spend > 0 ? r2(g.revenue / g.spend) : null, cpa: g.orders ? r2(g.spend / g.orders) : null,
      ctr: g.impressions ? r2((g.link_clicks / g.impressions) * 100) : null,
      cpm: g.impressions ? r2((g.spend / g.impressions) * 1000) : null,
      frequency: g.reach7 ? r2(g.imp7 / g.reach7) : null, age_days: g.age,
      hook_rate: g.video_3s && g.impressions ? r2((g.video_3s / g.impressions) * 100) : null,
    };
    if (!conds.every(c => m[c.metric] != null && cmp(m[c.metric], c.operator, Number(c.value)))) continue;
    const action = rule.action === 'notify' ? null : adsetAction(rule, s);
    if (rule.action !== 'notify' && !action) continue;
    const raise = action?.action === 'set_budget' && action.params.daily_budget_rm > s.daily_budget;
    // Jangan naikkan budget selepas 9 malam (budget direset 23:30)
    if (raise && ctx.hour >= SCALE_CUTOFF_HOUR) continue;
    // Tangga scale: naik satu anak tangga sahaja setiap larian (jam) — tiada lompat RM60 → RM150
    if (raise && (ctx.raised.has(id) || ctx.ladderFor(s.campaign_id).some(v => v > s.daily_budget && v < action.params.daily_budget_rm))) continue;
    // Pengawal DB: jika cron dicetuskan dua kali dalam jam yang sama (ctx berasingan), jangan naik anak tangga kedua
    if (raise && await raisedThisHour(admin, conn.marketer_id, id)) { ctx.raised.add(id); continue; }
    const win = Number(rule.window_days) === 1 ? 'hari ini' : `${rule.window_days} hari`;
    const ok = await fireRule(admin, conn, rule, {
      marketer_id: conn.marketer_id, rule_id: rule.id, kind: 'suggestion', severity: action ? 'info' : 'warn',
      object_type: 'adset', object_id: id, object_name: s.adset_name,
      title: action ? describeAction(action) : `${s.adset_name}: ${conds.map(c => `${METRIC_LABEL[c.metric]} ${fmtMetric(c.metric, m[c.metric])}`).join(', ')}`,
      detail: `Peraturan "${rule.name}" (${win}): belanja RM${m.spend}, ${m.orders} order, jualan RM${m.revenue}, ROAS ${fmtMetric('roas', m.roas)}.`,
      action, dedupe_key: `rule:${rule.id}:adset:${id}:${stamp}`,
    }, action, out);
    // Kemas kini cache supaya langkah tangga lain dalam larian sama tak turunkan budget
    if (ok && action?.action === 'set_budget') s.daily_budget = action.params.daily_budget_rm;
    if (ok && raise) ctx.raised.add(id);
  }
}

/** Cron 10 minit: peraturan ikut jam (run_at_time) — sekali sehari, dalam 2 jam selepas masa jadual. */
export async function runTimeRules(admin, { budgetMs = 15000 } = {}) {
  const started = Date.now();
  const { data: rules } = await admin.from('meta_rules').select('*').eq('active', true).not('run_at_time', 'is', null);
  const today = mytDate();
  const results = [];
  for (const rule of rules || []) {
    const at = new Date(`${today}T${rule.run_at_time}:00+08:00`).getTime();
    if (Date.now() < at || Date.now() > at + 2 * 3600 * 1000) continue;
    if (rule.last_run_at && new Date(rule.last_run_at).getTime() >= at) continue;   // dah selesai hari ini
    if (Date.now() - started > budgetMs) break;
    const { data: conn } = await admin.from('meta_connections').select('*').eq('marketer_id', rule.marketer_id).maybeSingle();
    if (!conn || conn.status === 'error') continue;
    await withProducts(admin, conn, [rule]);
    // Skop autopilot perlukan senarai kempen autopilot — tanpanya inScope() langkau SEMUA adset tanpa ralat
    // (punca reset 23:30 tidak berjalan sejak 5/11).
    if (rule.scope === 'autopilot') await withApCampaigns(admin, conn);
    const [adsets, blocked] = await Promise.all([adsetIndex(admin, rule.marketer_id), blockedAdsets(admin, rule.marketer_id)]);
    const out = { suggestions: 0, executed: 0 };
    let done = true;
    for (const s of adsets.values()) {
      if (Date.now() - started > budgetMs) { done = false; break; }   // sambung pada cron seterusnya (dedupe elak ulang)
      if (!inScope(rule, conn, s) || (rule.action === 'activate_adset' && blocked.has(s.adset_id))) continue;
      const action = adsetAction(rule, s);
      if (!action) continue;
      await fireRule(admin, conn, rule, {
        marketer_id: conn.marketer_id, rule_id: rule.id, kind: 'suggestion', severity: 'info',
        object_type: 'adset', object_id: s.adset_id, object_name: s.adset_name, title: describeAction(action),
        detail: `Peraturan "${rule.name}" (setiap hari ${rule.run_at_time}).`, action,
        dedupe_key: `rule:${rule.id}:adset:${s.adset_id}:${today}`,
      }, action, out);
    }
    if (done) await admin.from('meta_rules').update({ last_run_at: new Date().toISOString() }).eq('id', rule.id);
    results.push({ rule_id: rule.id, done, ...out });
  }
  return { rules: results };
}

/** Nilai semua peraturan + amaran sistem untuk satu marketer. */
export async function evaluateConnection(admin, conn) {
  const today = mytDate();
  const reports = new Map();
  const window = async days => {
    if (!reports.has(days)) {
      reports.set(days, await buildReport(admin, conn.marketer_id, { period: `${days}d`, from: mytDate(Date.now() - (days - 1) * DAY), to: today }));
    }
    return reports.get(days);
  };
  const out = { suggestions: 0, executed: 0, alerts: 0 };

  if (conn.status === 'error') {
    if (await addEvent(admin, {
      marketer_id: conn.marketer_id, kind: 'alert', severity: 'critical', title: 'Sambungan Meta bermasalah',
      detail: conn.status_message, dedupe_key: `alert:conn:${conn.marketer_id}:${today}`,
    })) out.alerts++;
    return out;
  }

  const { data: rules } = await admin.from('meta_rules').select('*').eq('marketer_id', conn.marketer_id).eq('active', true);
  await withProducts(admin, conn, rules || []);
  // Muat kempen autopilot SEBELUM peraturan peringkat adset (tangga, kecemasan) — jika tidak, peraturan berskop
  // autopilot hanya berfungsi bila kebetulan peraturan peringkat ad dinilai dahulu.
  if ((rules || []).some(r => r.scope === 'autopilot')) await withApCampaigns(admin, conn);
  let adsetCtx = null;
  for (const rule of rules || []) {
    if (rule.run_at_time) continue;   // dijalankan oleh runTimeRules
    const rep = await window(rule.window_days);
    if (rule.level === 'adset') {
      if (!adsetCtx) {
        const [adsets, blocked] = await Promise.all([adsetIndex(admin, conn.marketer_id), blockedAdsets(admin, conn.marketer_id)]);
        // Anak tangga = peraturan bersyarat "set budget RMx" peringkat adset yang aktif & terpakai pada produk kempen itu
        const steps = rules.filter(r => r.level === 'adset' && r.action === 'budget_set' && !r.run_at_time);
        const ladderFor = cid => steps.filter(r => productOk(r, conn, cid)).map(r => Number(r.action_value));
        adsetCtx = { adsets, blocked, today, hour: new Date(Date.now() + MYT_MS).getUTCHours(), ladderFor, raised: new Set() };
      }
      await evaluateAdsetRule(admin, conn, rule, rep, adsetCtx, out);
      await admin.from('meta_rules').update({ last_run_at: new Date().toISOString() }).eq('id', rule.id);
      continue;
    }
    const seenAdsets = new Set();
    // Skop autopilot: hanya ads dalam kempen [AUTOPILOT]; bajet dihadkan oleh had harian kempen
    const autopilot = rule.scope === 'autopilot';
    if (autopilot) await withApCampaigns(admin, conn);
    if (autopilot && !conn.apCampaigns.size) continue;
    const inRuleScope = a => (!autopilot || conn.apCampaigns.has(a.campaign_id)) && productOk(rule, conn, a.campaign_id);
    const apBudgets = new Map();
    if (autopilot) for (const a of rep.ads) if (a.running && inRuleScope(a) && a.daily_budget != null) apBudgets.set(a.adset_id, a.daily_budget);
    for (const ad of rep.ads.filter(a => a.running && inRuleScope(a))) {
      if (ad.spend < Number(rule.min_spend)) continue;
      const v = ad[rule.metric];
      if (v == null || !cmp(v, rule.operator, Number(rule.value))) continue;
      if (!(rule.conditions || []).every(c => ad[c.metric] != null && cmp(ad[c.metric], c.operator, Number(c.value)))) continue;

      let action = null;
      let objKey = `ad:${ad.ad_id}`;
      if (rule.action === 'pause') {
        action = { action: 'set_status', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name, params: { status: 'PAUSED' } };
      } else if (rule.action === 'pause_adset') {
        if (!ad.adset_id || seenAdsets.has(ad.adset_id)) continue;
        seenAdsets.add(ad.adset_id);
        objKey = `adset:${ad.adset_id}`;
        action = { action: 'set_status', object_type: 'adset', object_id: ad.adset_id, object_name: ad.adset_name, params: { status: 'PAUSED' } };
      } else if (isBudgetPct(rule.action)) {
        if (!ad.adset_id || ad.daily_budget == null || seenAdsets.has(ad.adset_id)) continue;
        seenAdsets.add(ad.adset_id);
        objKey = `adset:${ad.adset_id}`;
        const f = rule.action === 'budget_up' ? 1 + rule.action_value / 100 : 1 - rule.action_value / 100;
        let newRm = Math.max(1, (rule.action === 'budget_up' ? Math.floor : Math.round)(ad.daily_budget * f));
        if (rule.action === 'budget_up' && Number(rule.action_max) > 0) newRm = Math.min(newRm, Number(rule.action_max));
        if (autopilot && rule.action === 'budget_up') {
          const used = [...apBudgets.values()].reduce((s, v) => s + v, 0);
          const room = Number(conn.autopilot_daily_cap) - (used - ad.daily_budget);
          newRm = Math.min(newRm, Math.floor(room));
          if (newRm <= ad.daily_budget) continue;   // had harian kempen autopilot dah penuh
          apBudgets.set(ad.adset_id, newRm);
        }
        if (rule.action === 'budget_up' && newRm <= ad.daily_budget) continue;   // had budget maksimum dah dicapai
        action = { action: 'set_budget', object_type: 'adset', object_id: ad.adset_id, object_name: ad.adset_name, params: { daily_budget_rm: newRm } };
      }

      const stamp = rule.frequency === 'hourly' ? `${today}:${new Date(Date.now() + MYT_MS).getUTCHours()}` : today;
      await fireRule(admin, conn, rule, {
        marketer_id: conn.marketer_id, rule_id: rule.id, kind: 'suggestion', severity: rule.action === 'notify' ? 'warn' : 'info',
        object_type: action?.object_type || 'ad', object_id: action?.object_id || ad.ad_id, object_name: action?.object_name || ad.name,
        title: action ? describeAction(action) : `${ad.name}: ${METRIC_LABEL[rule.metric]} ${fmtMetric(rule.metric, v)}`,
        detail: `Peraturan "${rule.name}": ${METRIC_LABEL[rule.metric]} ${fmtMetric(rule.metric, v)} (${rule.window_days} hari, belanja RM${r2(ad.spend)}, ${ad.orders} order).`,
        action, dedupe_key: `rule:${rule.id}:${objKey}:${stamp}`,
      }, action, out);
    }
    await admin.from('meta_rules').update({ last_run_at: new Date().toISOString() }).eq('id', rule.id);
  }

  // Amaran sistem
  const rep3 = await window(3);
  const rep7 = await window(7);
  const repToday = await window(1);
  const cpm7 = new Map(rep7.ads.map(a => [a.ad_id, a.cpm]));
  for (const ad of rep3.ads) {
    if (['DISAPPROVED', 'WITH_ISSUES'].includes(ad.status)) {
      if (await addEvent(admin, {
        marketer_id: conn.marketer_id, kind: 'alert', severity: 'critical', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name,
        title: `${ad.name}: ${ad.status === 'DISAPPROVED' ? 'ditolak Meta' : 'ada isu'}`, detail: 'Semak ad ini di Ads Manager.',
        dedupe_key: `alert:status:${ad.ad_id}:${ad.status}`,
      })) out.alerts++;
    }
    if (ad.running && ad.spend >= 60 && ad.orders === 0) {
      if (await addEvent(admin, {
        marketer_id: conn.marketer_id, kind: 'alert', severity: 'warn', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name,
        title: `${ad.name}: RM${r2(ad.spend)} dibelanja 3 hari tanpa order`,
        detail: `CTR ${ad.ctr ?? '—'}%, ${ad.link_clicks} klik. Pertimbangkan pause atau tukar creative.`,
        action: { action: 'set_status', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name, params: { status: 'PAUSED' } },
        dedupe_key: `alert:noorder:${ad.ad_id}:${today}`,
      })) out.alerts++;
    }
  }
  for (const ad of repToday.ads) {
    const base = cpm7.get(ad.ad_id);
    if (ad.running && ad.impressions >= 1000 && base && ad.cpm > base * 2) {
      if (await addEvent(admin, {
        marketer_id: conn.marketer_id, kind: 'alert', severity: 'warn', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name,
        title: `${ad.name}: CPM melonjak ke RM${ad.cpm}`, detail: `Purata 7 hari RM${base}. Mungkin audience tepu atau persaingan tinggi.`,
        dedupe_key: `alert:cpm:${ad.ad_id}:${today}`,
      })) out.alerts++;
    }
  }
  return out;
}

// Semua akaun dinilai SERENTAK — dulu satu demi satu dengan had 20s, akaun di hujung senarai (cth HQ) tertinggal berjam-jam.
// budgetMs = had masa menunggu; akaun yang lambat dilaporkan tanpa menghalang akaun lain.
export async function evaluateAll(admin, { budgetMs = 20000 } = {}) {
  const { data: conns } = await admin.from('meta_connections').select('*');
  let timer;
  const timeout = new Promise(res => { timer = setTimeout(() => res('timeout'), budgetMs); });
  const results = await Promise.all((conns || []).map(async conn => {
    const run = evaluateConnection(admin, conn).then(
      out => ({ marketer_id: conn.marketer_id, ...out }),
      e => ({ marketer_id: conn.marketer_id, error: e.message }),
    );
    const r = await Promise.race([run, timeout]);
    return r === 'timeout' ? { marketer_id: conn.marketer_id, error: `melebihi ${budgetMs / 1000}s` } : r;
  }));
  clearTimeout(timer);
  return { total: conns?.length || 0, evaluated: results.filter(r => !r.error).length, results };
}
