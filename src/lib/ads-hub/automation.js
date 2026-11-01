// Ads Hub — tindakan berjadual, peraturan auto & amaran (server sahaja).
import { executeAction, describeAction } from './actions';
import { buildReport } from './report';

const MYT_MS = 8 * 3600 * 1000;
const DAY = 86400000;
const mytDate = (ms = Date.now()) => new Date(ms + MYT_MS).toISOString().slice(0, 10);
const r2 = n => Math.round(n * 100) / 100;

export const METRIC_LABEL = { spend: 'Belanja', orders: 'Order', revenue: 'Jualan', roas: 'ROAS', cpa: 'CPA', ctr: 'CTR link (%)' };
export const RULE_ACTION_LABEL = { pause: 'Pause ad', budget_up: 'Naikkan budget adset', budget_down: 'Turunkan budget adset', notify: 'Beri amaran sahaja' };

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

export function validateRule(r) {
  const errs = [];
  if (!r.name?.trim()) errs.push('nama');
  if (!METRIC_LABEL[r.metric]) errs.push('metrik');
  if (!['>', '>=', '<', '<='].includes(r.operator)) errs.push('operator');
  if (!Number.isFinite(Number(r.value))) errs.push('nilai');
  if (!(Number(r.window_days) >= 1 && Number(r.window_days) <= 30)) errs.push('tempoh (1–30 hari)');
  if (!RULE_ACTION_LABEL[r.action]) errs.push('tindakan');
  if (['budget_up', 'budget_down'].includes(r.action) && !(Number(r.action_value) > 0 && Number(r.action_value) <= 100)) errs.push('peratus budget (1–100)');
  if (!['suggest', 'auto'].includes(r.mode)) errs.push('mod');
  return errs.length ? `Peraturan tidak lengkap: ${errs.join(', ')}.` : null;
}

export function describeRule(r) {
  const act = r.action === 'budget_up' || r.action === 'budget_down' ? `${RULE_ACTION_LABEL[r.action]} ${Number(r.action_value)}%` : RULE_ACTION_LABEL[r.action];
  return `Jika ${METRIC_LABEL[r.metric]} ${r.operator} ${Number(r.value)} dalam ${r.window_days} hari`
    + `${Number(r.min_spend) > 0 ? ` (belanja ≥ RM${Number(r.min_spend)})` : ''} → ${act}`
    + ` · ${r.mode === 'auto' ? 'AUTO' : 'cadang sahaja'}`;
}

export async function createRule(admin, marketerId, r) {
  const err = validateRule(r);
  if (err) return { ok: false, message: err };
  const row = {
    marketer_id: marketerId, name: r.name.trim().slice(0, 80), metric: r.metric, operator: r.operator, value: Number(r.value),
    window_days: Number(r.window_days), min_spend: Number(r.min_spend) || 0, action: r.action,
    action_value: ['budget_up', 'budget_down'].includes(r.action) ? Number(r.action_value) : null, mode: r.mode, active: true,
  };
  const { data, error } = await admin.from('meta_rules').insert(row).select('id').single();
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: data.id, message: `Peraturan #${data.id} "${row.name}" dicipta: ${describeRule(row)}.` };
}

const cmp = (v, op, x) => (op === '>' ? v > x : op === '>=' ? v >= x : op === '<' ? v < x : v <= x);

async function addEvent(admin, ev) {
  // dedupe_key unik → abaikan jika dah wujud
  const { data, error } = await admin.from('meta_events').insert(ev).select('id').maybeSingle();
  if (error) return null;
  return data;
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
  for (const rule of rules || []) {
    const rep = await window(rule.window_days);
    const seenAdsets = new Set();
    for (const ad of rep.ads.filter(a => a.running)) {
      if (ad.spend < Number(rule.min_spend)) continue;
      const v = ad[rule.metric];
      if (v == null || !cmp(v, rule.operator, Number(rule.value))) continue;

      let action = null;
      let objKey = `ad:${ad.ad_id}`;
      if (rule.action === 'pause') {
        action = { action: 'set_status', object_type: 'ad', object_id: ad.ad_id, object_name: ad.name, params: { status: 'PAUSED' } };
      } else if (rule.action === 'budget_up' || rule.action === 'budget_down') {
        if (!ad.adset_id || ad.daily_budget == null || seenAdsets.has(ad.adset_id)) continue;
        seenAdsets.add(ad.adset_id);
        objKey = `adset:${ad.adset_id}`;
        const f = rule.action === 'budget_up' ? 1 + rule.action_value / 100 : 1 - rule.action_value / 100;
        const newRm = Math.max(1, Math.round(ad.daily_budget * f));
        action = { action: 'set_budget', object_type: 'adset', object_id: ad.adset_id, object_name: ad.adset_name, params: { daily_budget_rm: newRm } };
      }

      const metricTxt = rule.metric === 'roas' ? (v ?? 0).toFixed(2) : rule.metric === 'ctr' ? `${v}%` : ['spend', 'revenue', 'cpa'].includes(rule.metric) ? `RM${r2(v)}` : v;
      const ev = {
        marketer_id: conn.marketer_id, rule_id: rule.id, kind: 'suggestion', severity: rule.action === 'notify' ? 'warn' : 'info',
        object_type: action?.object_type || 'ad', object_id: action?.object_id || ad.ad_id, object_name: action?.object_name || ad.name,
        title: action ? describeAction(action) : `${ad.name}: ${METRIC_LABEL[rule.metric]} ${metricTxt}`,
        detail: `Peraturan "${rule.name}": ${METRIC_LABEL[rule.metric]} ${metricTxt} (${rule.window_days} hari, belanja RM${r2(ad.spend)}, ${ad.orders} order).`,
        action, dedupe_key: `rule:${rule.id}:${objKey}:${today}`,
      };
      const created = await addEvent(admin, ev);
      if (!created) continue;
      if (rule.mode === 'auto' && action) {
        const r = await executeAction(admin, conn, action, { source: 'auto', actorId: null });
        await admin.from('meta_events').update({
          status: r.ok ? 'executed' : 'failed', resolved_at: new Date().toISOString(), detail: `${ev.detail} → ${r.message}`,
        }).eq('id', created.id);
        if (r.ok) out.executed++;
      } else {
        out.suggestions++;
      }
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

export async function evaluateAll(admin, { budgetMs = 20000 } = {}) {
  const started = Date.now();
  const { data: conns } = await admin.from('meta_connections').select('*');
  const results = [];
  for (const conn of conns || []) {
    if (Date.now() - started > budgetMs) break;
    try { results.push({ marketer_id: conn.marketer_id, ...(await evaluateConnection(admin, conn)) }); }
    catch (e) { results.push({ marketer_id: conn.marketer_id, error: e.message }); }
  }
  return { total: conns?.length || 0, evaluated: results.length, results };
}
