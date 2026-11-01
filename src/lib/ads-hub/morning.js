// Ads Hub — laporan pagi oleh Claude (server sahaja). Satu laporan sehari setiap marketer, tentang semalam.
import { callClaude, textOf } from './ai';
import { buildOverview } from './report';

const MYT_MS = 8 * 3600 * 1000;
const mytNow = () => new Date(Date.now() + MYT_MS);
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));
const AD_KEYS = ['name', 'status', 'adset_name', 'angle', 'daily_budget', 'spend', 'orders', 'revenue', 'roas', 'cpa', 'ctr', 'cpm', 'pixel_roas'];

const SYSTEM = [{
  type: 'text',
  text: `Anda menulis laporan pagi iklan Meta untuk marketer E-Syifa, dalam Bahasa Melayu yang santai dan jelas.
"Order sebenar" dan "ROAS sebenar" = order dalam sistem E-Syifa yang dipadankan dengan ad melalui UTM. Ini sumber kebenaran; ROAS pixel hanya rujukan.

Format (teks biasa, tiada jadual markdown, maksimum ±250 patah perkataan):
1. Satu baris ringkasan semalam: belanja, order, jualan, ROAS sebenar, dibanding purata 7 hari.
2. "Menang" — 1–3 ad/angle terbaik dengan nombor.
3. "Perlu perhatian" — ad yang rugi, belanja tanpa order, atau trend menurun.
4. "Cadangan hari ini" — 2–4 tindakan konkrit (contoh: naikkan budget adset X 20% dari RM50 ke RM60, pause ad Y). Ikut had: kenaikan budget maksimum yang diberi.
Nyatakan jika data terlalu sedikit untuk kesimpulan. Jangan reka nombor.`,
}];

export async function generateMorningReport(admin, conn, { force = false } = {}) {
  const reportDate = mytNow().toISOString().slice(0, 10);
  if (!force) {
    const { data: existing } = await admin.from('meta_reports').select('id').eq('marketer_id', conn.marketer_id).eq('report_date', reportDate).maybeSingle();
    if (existing) return { ok: true, skipped: true };
  }

  const [y, w] = await Promise.all([
    buildOverview(admin, conn.marketer_id, 'yesterday'),
    buildOverview(admin, conn.marketer_id, '7d'),
  ]);
  const { data: alerts } = await admin.from('meta_events').select('title, detail')
    .eq('marketer_id', conn.marketer_id).eq('status', 'open').order('created_at', { ascending: false }).limit(10);

  const data = {
    tarikh_semalam: y.from,
    had: { budget_maksimum_rm: Number(conn.limit_max_budget), kenaikan_maksimum_pct: conn.limit_max_increase_pct },
    semalam: { summary: y.summary, ads: y.ads.map(a => pick(a, AD_KEYS)) },
    tujuh_hari: { summary: w.summary, angles: w.angles.map(a => pick(a, ['angle', 'spend', 'orders', 'revenue', 'roas'])), daily: w.daily.map(d => pick(d, ['date', 'spend', 'orders', 'revenue', 'roas'])) },
    amaran_terbuka: alerts || [],
  };

  const res = await callClaude({
    system: SYSTEM,
    messages: [{ role: 'user', content: `Data akaun ${conn.ad_account_name || conn.ad_account_id}:\n${JSON.stringify(data)}` }],
    maxTokens: 4000,
  });
  if (res.stop_reason === 'refusal') return { ok: false, error: 'AI menolak menulis laporan.' };
  const body = textOf(res);
  if (!body) return { ok: false, error: 'Laporan kosong.' };

  const { error } = await admin.from('meta_reports').upsert({
    marketer_id: conn.marketer_id, report_date: reportDate, body,
    summary: { yesterday: y.summary, week: w.summary },
  }, { onConflict: 'marketer_id,report_date' });
  if (error) return { ok: false, error: error.message };
  return { ok: true, report_date: reportDate };
}

/** Cron: dari 9 pagi MYT, jana laporan bagi sambungan yang belum ada laporan hari ini. */
export async function runMorningReports(admin, { budgetMs = 18000 } = {}) {
  const started = Date.now();
  const now = mytNow();
  if (now.getUTCHours() < 9) return { skipped: 'belum 9 pagi MYT' };
  const today = now.toISOString().slice(0, 10);

  const [{ data: conns }, { data: done }] = await Promise.all([
    admin.from('meta_connections').select('*').eq('report_enabled', true).eq('status', 'ok'),
    admin.from('meta_reports').select('marketer_id').eq('report_date', today),
  ]);
  const doneIds = new Set((done || []).map(r => r.marketer_id));
  const results = [];
  for (const conn of (conns || []).filter(c => !doneIds.has(c.marketer_id))) {
    // Satu laporan ±10–20 saat — mula yang seterusnya hanya jika masih ada masa
    if (results.length && Date.now() - started > budgetMs / 3) break;
    try { results.push({ marketer_id: conn.marketer_id, ...(await generateMorningReport(admin, conn)) }); }
    catch (e) { results.push({ marketer_id: conn.marketer_id, ok: false, error: e.message }); }
    if (Date.now() - started > budgetMs) break;
  }
  return { pending: (conns || []).length - doneIds.size, generated: results.length, results };
}
