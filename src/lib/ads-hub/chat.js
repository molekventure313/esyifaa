// Ads Hub — Chat Ads (server sahaja).
// Setiap permintaan HTTP = SATU panggilan Claude (had masa Netlify). Browser sambung langkah seterusnya.
// Alat baca dijalankan terus; alat tulis menunggu marketer tekan Sahkan/Batal.
// Mesej disimpan persis seperti dihantar/diterima (append-only) — jangan ubah mesej lama.
import { callClaude, nowMyt, CHAT_QUOTA_MONTH } from './ai';
import { buildOverview, buildReport, PERIODS } from './report';
import { executeAction, describeAction } from './actions';
import { createSchedule, cancelSchedule, createRule, describeRule, METRIC_LABEL } from './automation';

const MAX_THREAD_MESSAGES = 80;

const obj = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const str = description => ({ type: 'string', description });
const num = description => ({ type: 'number', description });
const int = description => ({ type: 'integer', description });
const enm = (values, description) => ({ type: 'string', enum: values, description });
const PERIOD_ENUM = Object.keys(PERIODS);

export const TOOLS = [
  {
    name: 'get_performance',
    description: 'Prestasi akaun untuk satu tempoh: ringkasan, trend harian, prestasi ikut angle, dan setiap ad (status, budget adset, belanja, order sebenar, jualan, ROAS sebenar, CPA, CTR, ROAS pixel). Order sebenar = order dalam sistem E-Syifa yang dipadankan dengan ID ad melalui UTM.',
    input_schema: obj({ period: enm(PERIOD_ENUM, 'today, yesterday, 7d, 30d atau month (bulan ini)') }),
  },
  {
    name: 'get_ad_history',
    description: 'Prestasi harian satu ad untuk N hari terakhir (belanja, order sebenar, jualan, ROAS, CTR). Guna untuk lihat trend sebelum scale atau pause.',
    input_schema: obj({ ad_id: str('ID ad Meta'), days: int('Bilangan hari, 1–30') }),
  },
  {
    name: 'get_account_structure',
    description: 'Struktur akaun dari cache: kempen → adset → ad, dengan ID, status dan budget harian adset. Termasuk yang dipause. Guna untuk dapatkan ID sebelum buat perubahan.',
    input_schema: obj({}),
  },
  {
    name: 'get_activity',
    description: 'Aktiviti terkini: log tindakan, tindakan berjadual yang belum jalan, peraturan auto, dan amaran/cadangan yang masih terbuka.',
    input_schema: obj({}),
  },
  {
    name: 'set_status',
    description: 'Pause atau hidupkan ad, adset atau kempen. Marketer akan sahkan dulu sebelum dilaksanakan.',
    input_schema: obj({
      object_type: enm(['ad', 'adset', 'campaign'], 'Jenis objek'), object_id: str('ID objek Meta'),
      status: enm(['ACTIVE', 'PAUSED'], 'Status baru'), reason: str('Sebab ringkas berdasarkan data'),
    }),
  },
  {
    name: 'set_budget',
    description: 'Tukar budget harian satu adset (RM). Had keselamatan marketer dikuatkuasa (budget maksimum, kenaikan maksimum %, naik sekali sehari). Marketer akan sahkan dulu.',
    input_schema: obj({ adset_id: str('ID adset'), daily_budget_rm: num('Budget harian baru dalam RM'), reason: str('Sebab ringkas berdasarkan data') }),
  },
  {
    name: 'duplicate_adset',
    description: 'Duplicate adset (termasuk ads di dalamnya) sebagai adset baru berstatus PAUSED. daily_budget_rm 0 = kekalkan budget asal. Marketer akan sahkan dulu.',
    input_schema: obj({ adset_id: str('ID adset sumber'), new_name: str('Nama adset baru'), daily_budget_rm: num('Budget harian adset baru (RM), 0 = sama seperti asal'), reason: str('Sebab ringkas') }),
  },
  {
    name: 'schedule_action',
    description: 'Jadualkan pause/hidupkan atau tukar budget pada masa akan datang (waktu Malaysia). Untuk set_status isi status dan letak daily_budget_rm 0; untuk set_budget isi daily_budget_rm dan letak status NONE. Marketer akan sahkan dulu.',
    input_schema: obj({
      run_at_myt: str('Masa dalam waktu Malaysia, format YYYY-MM-DD HH:mm'),
      action: enm(['set_status', 'set_budget'], 'Jenis tindakan'),
      object_type: enm(['ad', 'adset', 'campaign'], 'Jenis objek (set_budget mesti adset)'), object_id: str('ID objek'),
      status: enm(['ACTIVE', 'PAUSED', 'NONE'], 'Status baru untuk set_status, NONE untuk set_budget'),
      daily_budget_rm: num('Budget baru untuk set_budget, 0 untuk set_status'), reason: str('Sebab ringkas'),
    }),
  },
  {
    name: 'cancel_schedule',
    description: 'Batalkan tindakan berjadual yang belum dijalankan. Marketer akan sahkan dulu.',
    input_schema: obj({ schedule_id: int('ID jadual'), reason: str('Sebab ringkas') }),
  },
  {
    name: 'create_rule',
    description: 'Cipta peraturan auto yang dinilai setiap jam pada ads yang sedang berjalan, guna data order sebenar. mode suggest = hanya cadang di dashboard; auto = terus laksana (tertakluk had keselamatan). action_value = peratus untuk budget_up/budget_down, 0 untuk lain. Marketer akan sahkan dulu.',
    input_schema: obj({
      name: str('Nama peraturan'), metric: enm(Object.keys(METRIC_LABEL), 'Metrik'), operator: enm(['>', '>=', '<', '<='], 'Operator'),
      value: num('Nilai ambang (ROAS dalam nisbah, CPA/belanja/jualan dalam RM, CTR dalam %)'),
      window_days: int('Tempoh penilaian dalam hari, 1–30'), min_spend: num('Nilai hanya jika belanja tempoh ≥ RM ini (0 = tiada syarat)'),
      action: enm(['pause', 'budget_up', 'budget_down', 'notify'], 'Tindakan'), action_value: num('Peratus budget (1–100) untuk budget_up/down, 0 untuk lain'),
      mode: enm(['suggest', 'auto'], 'suggest atau auto'),
    }),
  },
  {
    name: 'set_rule_active',
    description: 'Aktifkan atau nyahaktifkan peraturan auto. Marketer akan sahkan dulu.',
    input_schema: obj({ rule_id: int('ID peraturan'), active: { type: 'boolean', description: 'true = aktif' } }),
  },
].map(t => ({ ...t, strict: true }));

export const WRITE_TOOLS = new Set(['set_status', 'set_budget', 'duplicate_adset', 'schedule_action', 'cancel_schedule', 'create_rule', 'set_rule_active']);
const READ_LABEL = {
  get_performance: i => `Semak prestasi (${PERIODS[i.period]?.label || i.period})`,
  get_ad_history: i => `Semak sejarah ad ${i.days} hari`,
  get_account_structure: () => 'Semak struktur akaun',
  get_activity: () => 'Semak log & jadual',
};

function systemPrompt(conn, profile) {
  return [{
    type: 'text',
    text: `Anda ialah penganalisis iklan Meta untuk marketer E-Syifa (${profile.full_name || 'marketer'}). E-Syifa menjual produk rawatan Islam seperti Sabun Garam Himalaya Pengisian, Pengisian Item, Garam Pengasihan dan Kasturi Kijang melalui salespage dengan COD/FPX.
Ad account: ${conn.ad_account_name || conn.ad_account_id} (${conn.currency || 'MYR'}).

Data:
- "Order sebenar" dan "ROAS sebenar" datang dari order dalam sistem E-Syifa (completed, bukan return) yang dipadankan dengan ID ad melalui UTM. Ini sumber kebenaran. ROAS pixel hanya rujukan.
- Belanja dan metrik iklan datang dari Meta, disync setiap jam. Tarikh ikut waktu Malaysia.
- Sampel kecil (1–3 order) tidak cukup untuk kesimpulan kukuh; nyatakan bila data nipis.

Cara bekerja:
- Sentiasa ambil data dengan alat sebelum memberi analisis atau cadangan. Jangan reka nombor atau ID.
- Untuk ubah sesuatu, terus panggil alat tulis (set_status, set_budget, duplicate_adset, schedule_action, cancel_schedule, create_rule, set_rule_active). Sistem akan tunjuk kad Sahkan/Batal kepada marketer — jangan minta pengesahan dalam teks dahulu. Jika marketer hanya minta pendapat, beri cadangan dan biar dia putuskan.
- Guna get_account_structure untuk dapatkan ID dari nama.
- Had keselamatan marketer: budget adset maksimum RM${Number(conn.limit_max_budget)}, kenaikan maksimum ${conn.limit_max_increase_pct}% sekali naik, budget hanya naik sekali dalam 20 jam. Cadangan scale biasanya +20–30%.
- Anda tidak boleh cipta ads baru atau upload creative. Untuk itu marketer guna Kit Creative dalam Claude.
- Jawab dalam Bahasa Melayu yang santai dan jelas, ringkas, guna RM. Utamakan tindakan yang jelas.`,
  }];
}

// ---------- Alat baca ----------

const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));
const AD_KEYS = ['ad_id', 'name', 'status', 'adset_id', 'adset_name', 'campaign_name', 'angle', 'daily_budget', 'spend', 'orders', 'revenue', 'roas', 'cpa', 'aov', 'ctr', 'cpm', 'pixel_roas'];

async function runReadTool(admin, conn, name, input) {
  const id = conn.marketer_id;
  if (name === 'get_performance') {
    const r = await buildOverview(admin, id, PERIOD_ENUM.includes(input.period) ? input.period : '7d');
    return { period: r.period, from: r.from, to: r.to, summary: r.summary, daily: r.daily.map(d => pick(d, ['date', 'spend', 'orders', 'revenue', 'roas'])), angles: r.angles.map(a => pick(a, ['angle', 'ads', 'running', 'spend', 'orders', 'revenue', 'roas', 'cpa'])), ads: r.ads.map(a => pick(a, AD_KEYS)) };
  }
  if (name === 'get_ad_history') {
    const days = Math.min(30, Math.max(1, input.days | 0));
    const { data: ad } = await admin.from('meta_ads').select('ad_id, name, status, adset_id, adset_name, adset_daily_budget').eq('ad_id', input.ad_id).eq('marketer_id', id).maybeSingle();
    if (!ad) return { error: 'Ad tidak dijumpai dalam akaun ini.' };
    const d = ms => new Date(ms + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const r = await buildReport(admin, id, { period: 'history', from: d(Date.now() - (days - 1) * 86400000), to: d(Date.now()), adId: input.ad_id });
    return { ad, daily: r.daily.map(x => pick(x, ['date', 'spend', 'orders', 'revenue', 'roas', 'ctr', 'cpm'])) };
  }
  if (name === 'get_account_structure') {
    const { data } = await admin.from('meta_ads').select('ad_id, name, status, adset_id, adset_name, adset_status, adset_daily_budget, campaign_id, campaign_name, campaign_status')
      .eq('marketer_id', id).neq('status', 'ARCHIVED').order('campaign_name');
    const camps = {};
    for (const a of data || []) {
      const c = (camps[a.campaign_id] ??= { campaign_id: a.campaign_id, name: a.campaign_name, status: a.campaign_status, adsets: {} });
      const s = (c.adsets[a.adset_id] ??= { adset_id: a.adset_id, name: a.adset_name, status: a.adset_status, daily_budget_rm: a.adset_daily_budget, ads: [] });
      s.ads.push({ ad_id: a.ad_id, name: a.name, status: a.status });
    }
    return { campaigns: Object.values(camps).map(c => ({ ...c, adsets: Object.values(c.adsets) })) };
  }
  if (name === 'get_activity') {
    const [log, sched, rules, events] = await Promise.all([
      admin.from('meta_actions_log').select('created_at, source, action, object_name, status, message, before, after').eq('marketer_id', id).order('created_at', { ascending: false }).limit(15),
      admin.from('meta_scheduled_actions').select('id, run_at, action, object_type, object_name, params').eq('marketer_id', id).eq('status', 'pending').order('run_at'),
      admin.from('meta_rules').select('*').eq('marketer_id', id).order('id'),
      admin.from('meta_events').select('created_at, kind, severity, title, detail').eq('marketer_id', id).eq('status', 'open').order('created_at', { ascending: false }).limit(15),
    ]);
    return {
      recent_actions: log.data || [],
      pending_schedules: (sched.data || []).map(s => ({ ...s, run_at_myt: new Date(new Date(s.run_at).getTime() + 8 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' ') })),
      rules: (rules.data || []).map(r => ({ id: r.id, name: r.name, active: r.active, mode: r.mode, rule: describeRule(r) })),
      open_alerts: events.data || [],
    };
  }
  return { error: `Alat tidak dikenali: ${name}` };
}

// ---------- Alat tulis: sediakan kad, laksana selepas Sahkan ----------

async function nameOf(admin, conn, type, id) {
  const col = type === 'ad' ? 'ad_id' : type === 'adset' ? 'adset_id' : 'campaign_id';
  const nameCol = type === 'ad' ? 'name' : type === 'adset' ? 'adset_name' : 'campaign_name';
  const { data } = await admin.from('meta_ads').select(nameCol).eq(col, id).eq('marketer_id', conn.marketer_id).limit(1);
  return data?.[0]?.[nameCol] || null;
}

/** Tukar input alat tulis kepada { kind, action?, schedule?, rule?, ..., label } untuk kad pengesahan. */
async function prepareWrite(admin, conn, name, input) {
  if (name === 'set_status') {
    const a = { action: 'set_status', object_type: input.object_type, object_id: input.object_id, params: { status: input.status } };
    a.object_name = await nameOf(admin, conn, a.object_type, a.object_id);
    return { kind: 'action', action: a, label: describeAction(a), reason: input.reason };
  }
  if (name === 'set_budget') {
    const a = { action: 'set_budget', object_type: 'adset', object_id: input.adset_id, params: { daily_budget_rm: input.daily_budget_rm } };
    a.object_name = await nameOf(admin, conn, 'adset', a.object_id);
    const { data } = await admin.from('meta_ads').select('adset_daily_budget').eq('adset_id', input.adset_id).eq('marketer_id', conn.marketer_id).limit(1);
    const cur = data?.[0]?.adset_daily_budget;
    return { kind: 'action', action: a, label: `${describeAction(a)}${cur != null ? ` (sekarang RM${Number(cur)})` : ''}`, reason: input.reason };
  }
  if (name === 'duplicate_adset') {
    const a = { action: 'duplicate_adset', object_type: 'adset', object_id: input.adset_id, params: { new_name: input.new_name, daily_budget_rm: input.daily_budget_rm > 0 ? input.daily_budget_rm : null } };
    a.object_name = await nameOf(admin, conn, 'adset', a.object_id);
    return { kind: 'action', action: a, label: describeAction(a), reason: input.reason };
  }
  if (name === 'schedule_action') {
    const params = input.action === 'set_status' ? { status: input.status } : { daily_budget_rm: input.daily_budget_rm };
    const s = { run_at_myt: input.run_at_myt, action: input.action, object_type: input.action === 'set_budget' ? 'adset' : input.object_type, object_id: input.object_id, params };
    s.object_name = await nameOf(admin, conn, s.object_type, s.object_id);
    return { kind: 'schedule', schedule: s, label: `Jadual ${input.run_at_myt} MYT: ${describeAction(s)}`, reason: input.reason };
  }
  if (name === 'cancel_schedule') return { kind: 'cancel_schedule', schedule_id: input.schedule_id, label: `Batalkan jadual #${input.schedule_id}`, reason: input.reason };
  if (name === 'create_rule') return { kind: 'rule', rule: input, label: `Peraturan baru "${input.name}": ${describeRule(input)}` };
  if (name === 'set_rule_active') return { kind: 'rule_active', rule_id: input.rule_id, active: input.active, label: `${input.active ? 'Aktifkan' : 'Nyahaktifkan'} peraturan #${input.rule_id}` };
  return { kind: 'unknown', label: name };
}

async function executeWrite(admin, conn, actorId, p) {
  if (p.kind === 'action') return executeAction(admin, conn, p.action, { source: 'chat', actorId });
  if (p.kind === 'schedule') return createSchedule(admin, conn.marketer_id, actorId, p.schedule);
  if (p.kind === 'cancel_schedule') return cancelSchedule(admin, conn.marketer_id, p.schedule_id);
  if (p.kind === 'rule') return createRule(admin, conn.marketer_id, p.rule);
  if (p.kind === 'rule_active') {
    const { data } = await admin.from('meta_rules').update({ active: p.active }).eq('id', p.rule_id).eq('marketer_id', conn.marketer_id).select('name').maybeSingle();
    return data ? { ok: true, message: `Peraturan "${data.name}" ${p.active ? 'diaktifkan' : 'dinyahaktifkan'}.` } : { ok: false, message: 'Peraturan tidak dijumpai.' };
  }
  return { ok: false, message: 'Tindakan tidak disokong.' };
}

// ---------- Thread ----------

export async function loadThread(admin, marketerId, threadId) {
  const { data: thread } = await admin.from('ads_chat_threads').select('*').eq('id', threadId).eq('marketer_id', marketerId).maybeSingle();
  if (!thread) return null;
  const { data: msgs } = await admin.from('ads_chat_messages').select('id, role, content, created_at').eq('thread_id', threadId).order('id');
  return { thread, messages: msgs || [] };
}

async function appendMessage(admin, thread, role, content, usage = null) {
  const { error } = await admin.from('ads_chat_messages').insert({ thread_id: thread.id, marketer_id: thread.marketer_id, role, content, usage });
  if (error) throw new Error(error.message);
}

async function quotaUsed(admin, marketerId) {
  const myt = new Date(Date.now() + 8 * 3600 * 1000);
  const start = new Date(`${myt.toISOString().slice(0, 7)}-01T00:00:00+08:00`).toISOString();
  const { count } = await admin.from('ads_chat_messages').select('id', { count: 'exact', head: true })
    .eq('marketer_id', marketerId).eq('role', 'assistant').gte('created_at', start);
  return count || 0;
}

export async function startThread(admin, marketerId, text) {
  const { data, error } = await admin.from('ads_chat_threads')
    .insert({ marketer_id: marketerId, title: text.slice(0, 80) }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addUserMessage(admin, thread, text) {
  if (thread.pending) throw Object.assign(new Error('Sahkan atau batalkan tindakan yang menunggu dulu.'), { status: 409 });
  // Masa semasa disertakan dalam mesej (bukan system prompt) supaya sejarah kekal append-only
  await appendMessage(admin, thread, 'user', [{ type: 'text', text: `[Masa sekarang: ${nowMyt()} MYT]\n${text}` }]);
  await admin.from('ads_chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', thread.id);
}

/**
 * Satu langkah: panggil Claude dengan sejarah penuh, simpan jawapan, jalankan alat baca.
 * Pulangkan status: 'done' | 'continue' (browser panggil langkah lagi) | 'confirm' (tunggu Sahkan/Batal)
 */
export async function step(admin, conn, profile, threadId) {
  const loaded = await loadThread(admin, conn.marketer_id, threadId);
  if (!loaded) throw Object.assign(new Error('Perbualan tidak dijumpai.'), { status: 404 });
  const { thread, messages } = loaded;
  if (thread.pending) return { status: 'confirm' };
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') return { status: 'done' };
  if (messages.length > MAX_THREAD_MESSAGES) {
    throw Object.assign(new Error('Perbualan ini dah terlalu panjang. Mulakan perbualan baru.'), { status: 409 });
  }
  if (await quotaUsed(admin, conn.marketer_id) >= CHAT_QUOTA_MONTH) {
    throw Object.assign(new Error(`Kuota chat bulan ini (${CHAT_QUOTA_MONTH} langkah) dah habis.`), { status: 429 });
  }

  const res = await callClaude({
    system: systemPrompt(conn, profile),
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    tools: TOOLS,
    maxTokens: 8000,
  });
  // Simpan content persis (termasuk thinking) — wajib dihantar semula tanpa diubah
  await appendMessage(admin, thread, 'assistant', res.content, res.usage);
  await admin.from('ads_chat_threads').update({ updated_at: new Date().toISOString() }).eq('id', thread.id);

  if (res.stop_reason === 'refusal') return { status: 'done', refusal: true };
  const toolUses = res.content.filter(b => b.type === 'tool_use');
  if (!toolUses.length) return { status: 'done' };
  if (res.stop_reason === 'max_tokens') {
    await appendMessage(admin, thread, 'user', toolUses.map(t => ({ type: 'tool_result', tool_use_id: t.id, is_error: true, content: 'Input alat terpotong (had token). Cuba semula dengan permintaan lebih kecil.' })));
    return { status: 'continue' };
  }

  const results = {};
  const writes = [];
  for (const t of toolUses) {
    if (WRITE_TOOLS.has(t.name)) {
      writes.push({ tool_use_id: t.id, tool: t.name, ...(await prepareWrite(admin, conn, t.name, t.input)) });
    } else {
      try { results[t.id] = JSON.stringify(await runReadTool(admin, conn, t.name, t.input)); }
      catch (e) { results[t.id] = JSON.stringify({ error: e.message }); }
    }
  }

  if (writes.length) {
    await admin.from('ads_chat_threads').update({ pending: { order: toolUses.map(t => t.id), results, writes } }).eq('id', thread.id);
    return { status: 'confirm' };
  }
  await appendMessage(admin, thread, 'user', toolUses.map(t => ({ type: 'tool_result', tool_use_id: t.id, content: results[t.id] })));
  return { status: 'continue' };
}

/** Marketer tekan Sahkan/Batal. decisions = { [tool_use_id]: 'approve' | 'reject' } */
export async function confirm(admin, conn, actorId, threadId, decisions) {
  const { data: thread } = await admin.from('ads_chat_threads').select('*').eq('id', threadId).eq('marketer_id', conn.marketer_id).maybeSingle();
  if (!thread?.pending) throw Object.assign(new Error('Tiada tindakan menunggu.'), { status: 409 });
  const { order, results, writes } = structuredClone(thread.pending);
  // Kunci: kosongkan pending dulu supaya tidak dilaksana dua kali
  const { data: claimed } = await admin.from('ads_chat_threads').update({ pending: null }).eq('id', threadId).not('pending', 'is', null).select('id').maybeSingle();
  if (!claimed) throw Object.assign(new Error('Tindakan dah diproses.'), { status: 409 });
  const outcomes = {};
  for (const w of writes) {
    if (decisions?.[w.tool_use_id] === 'approve') {
      const r = await executeWrite(admin, conn, actorId, w);
      outcomes[w.tool_use_id] = { approved: true, ...r };
      results[w.tool_use_id] = JSON.stringify({ approved_by_marketer: true, ok: r.ok, message: r.message });
    } else {
      outcomes[w.tool_use_id] = { approved: false, ok: false, message: 'Dibatalkan oleh marketer.' };
      results[w.tool_use_id] = JSON.stringify({ approved_by_marketer: false, message: 'Marketer batalkan tindakan ini. Jangan cuba semula kecuali diminta.' });
    }
  }
  await appendMessage(admin, thread, 'user', order.map(id => ({
    type: 'tool_result', tool_use_id: id, content: results[id], ...(outcomes[id] && !outcomes[id].ok && outcomes[id].approved ? { is_error: true } : {}),
  })));
  return { status: 'continue', outcomes };
}

/** Tukar mesej tersimpan kepada item paparan UI (tiada thinking / JSON mentah). */
export function renderThread(thread, messages) {
  const items = [];
  const writeMeta = {};
  for (const m of messages) {
    const blocks = typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : m.content;
    if (m.role === 'assistant') {
      for (const b of blocks) {
        if (b.type === 'text' && b.text.trim()) items.push({ type: 'assistant', text: b.text });
        if (b.type === 'tool_use') {
          if (WRITE_TOOLS.has(b.name)) writeMeta[b.id] = b;
          else items.push({ type: 'tool', label: (READ_LABEL[b.name] || (() => b.name))(b.input || {}) });
        }
      }
    } else {
      for (const b of blocks) {
        if (b.type === 'text') items.push({ type: 'user', text: b.text.replace(/^\[Masa sekarang:[^\]]*\]\n/, ''), at: m.created_at });
        if (b.type === 'tool_result' && writeMeta[b.tool_use_id]) {
          let r = {};
          try { r = JSON.parse(b.content); } catch (_) {}
          items.push({ type: 'action_result', approved: !!r.approved_by_marketer, ok: !!r.ok, text: r.message || '' });
        }
      }
    }
  }
  const pending = thread.pending?.writes?.map(w => ({ tool_use_id: w.tool_use_id, label: w.label, reason: w.reason || null })) || null;
  return { id: thread.id, title: thread.title, items, pending };
}
