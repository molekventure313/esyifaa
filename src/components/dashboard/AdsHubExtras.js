'use client';
// Ads Hub — panel tambahan: amaran & cadangan, laporan pagi, log, peraturan & jadual, had keselamatan, Chat Ads.
import { useState, useEffect, useCallback, useRef } from 'react';
import { theme, useLightMode, Card, Spinner, btn, th, td, ago } from './AdsHub';

// marketerId kosong = akaun pemanggil sendiri (marketer, atau HQ bagi super_admin)
const q = marketerId => (marketerId ? `?marketer=${marketerId}` : '');
const qa = marketerId => (marketerId ? `&marketer=${marketerId}` : '');
const getJson = url => fetch(url).then(r => r.json()).catch(() => ({ success: false, error: 'Gagal hubungi server.' }));
const sendJson = (url, method, body) => fetch(url, {
  method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
}).then(r => r.json()).catch(() => ({ success: false, error: 'Gagal hubungi server.' }));

const fmtMyt = iso => {
  if (!iso) return '—';
  const d = new Date(new Date(iso).getTime() + 8 * 3600000);
  return `${d.toISOString().slice(8, 10)}/${d.toISOString().slice(5, 7)} ${d.toISOString().slice(11, 16)}`;
};

// Teks laporan/chat: kekalkan baris, **tebal** → <strong>
function RichText({ text, t }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.86rem', color: t.text, overflowWrap: 'anywhere' }}>
      {String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part.replace(/^#{1,4}\s*/gm, '')}</span>))}
    </div>
  );
}

const SEV = {
  critical: { icon: '⛔', color: t => t.bad },
  warn: { icon: '⚠️', color: t => t.warn },
  info: { icon: '💡', color: t => t.accent },
};

// ---------- Amaran & cadangan ----------
export function AlertsPanel({ marketerId, canEdit, onChanged }) {
  const t = theme(useLightMode());
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const j = await getJson(`/api/ads-hub/events${q(marketerId)}`);
    setItems(j.success ? j.open : []);
  }, [marketerId]);
  useEffect(() => { load(); }, [load]);

  const decide = async (ev, decision) => {
    setBusy(ev.id); setMsg('');
    const j = await sendJson(`/api/ads-hub/events/${ev.id}${q(marketerId)}`, 'POST', { decision });
    setBusy(null);
    setMsg(j.message || j.error || '');
    await load();
    if (decision === 'approve' && j.success) onChanged?.();
  };

  if (!items?.length) return null;
  return (
    <Card t={t} title={`Amaran & cadangan (${items.length})`} sub="Dari peraturan auto anda dan semakan sistem setiap jam" pad={false}>
      {msg && <div style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', color: t.text2, borderBottom: t.border }}>{msg}</div>}
      {items.map(ev => {
        const s = SEV[ev.severity] || SEV.info;
        return (
          <div key={ev.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.8rem 1.25rem', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', lineHeight: 1.3 }}>{s.icon}</span>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: s.color(t) }}>{ev.title}</div>
              {ev.detail && <div style={{ fontSize: '0.78rem', color: t.text2, marginTop: 2 }}>{ev.detail}</div>}
              <div style={{ fontSize: '0.7rem', color: t.muted, marginTop: 2 }}>{ev.kind === 'alert' ? 'Amaran sistem' : 'Cadangan peraturan'} · {ago(ev.created_at)}</div>
            </div>
            {canEdit && (
              <div style={{ display: 'flex', gap: 6 }}>
                {ev.action && <button onClick={() => decide(ev, 'approve')} disabled={busy === ev.id} style={btn(t, true)}>{busy === ev.id ? '...' : 'Laksana'}</button>}
                <button onClick={() => decide(ev, 'dismiss')} disabled={busy === ev.id} style={btn(t)}>Abaikan</button>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

// ---------- Laporan pagi ----------
export function LatestReport({ marketerId, canEdit }) {
  const t = theme(useLightMode());
  const [report, setReport] = useState(undefined);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const j = await getJson(`/api/ads-hub/reports${q(marketerId)}`);
    setReport(j.success ? j.reports[0] || null : null);
  }, [marketerId]);
  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setBusy(true); setErr('');
    const j = await sendJson(`/api/ads-hub/reports${q(marketerId)}`, 'POST');
    setBusy(false);
    if (!j.success) setErr(j.error || 'Gagal jana laporan.');
    await load();
  };

  if (report === undefined) return null;
  const today = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  return (
    <Card t={t} title={report ? `☀️ Laporan pagi · ${report.report_date === today ? 'hari ini' : report.report_date}` : '☀️ Laporan pagi'}
      sub="Ditulis AI setiap pagi pukul 9 berdasarkan order sebenar semalam & 7 hari"
      right={(
        <div style={{ display: 'flex', gap: 6 }}>
          {canEdit && <button onClick={generate} disabled={busy} style={btn(t)}>{busy ? 'Menulis...' : report?.report_date === today ? 'Tulis semula' : 'Jana sekarang'}</button>}
          {report && <button onClick={() => setOpen(o => !o)} style={btn(t)}>{open ? 'Tutup' : 'Buka'}</button>}
        </div>
      )}>
      {err && <div style={{ color: t.bad, fontSize: '0.8rem', marginBottom: 8 }}>{err}</div>}
      {report ? (open && <RichText t={t} text={report.body} />)
        : <div style={{ fontSize: '0.84rem', color: t.text2 }}>Belum ada laporan. Laporan pertama akan ditulis esok pukul 9 pagi{canEdit ? ', atau tekan Jana sekarang' : ''}.</div>}
    </Card>
  );
}

export function ReportsTab({ marketerId }) {
  const t = theme(useLightMode());
  const [reports, setReports] = useState(null);
  const [sel, setSel] = useState(0);
  useEffect(() => { getJson(`/api/ads-hub/reports${q(marketerId)}`).then(j => setReports(j.success ? j.reports : [])); }, [marketerId]);
  if (!reports) return <Spinner t={t} text="Memuatkan laporan..." />;
  if (!reports.length) return <Card t={t}><div style={{ color: t.text2, fontSize: '0.85rem' }}>Belum ada laporan pagi.</div></Card>;
  const r = reports[sel];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 200px) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
      <Card t={t} pad={false}>
        {reports.map((x, i) => (
          <button key={x.report_date} onClick={() => setSel(i)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', border: 'none', borderBottom: t.rowBorder, cursor: 'pointer',
            background: i === sel ? t.accentBg : 'transparent', color: i === sel ? t.accent : t.text2, fontWeight: i === sel ? 700 : 500, fontSize: '0.82rem', fontFamily: t.ff,
          }}>
            {x.report_date}
            {x.summary?.yesterday?.roas != null && <span style={{ float: 'right', color: t.muted }}>ROAS {Number(x.summary.yesterday.roas).toFixed(2)}</span>}
          </button>
        ))}
      </Card>
      <Card t={t} title={`Laporan ${r.report_date}`} sub={`Ditulis ${fmtMyt(r.created_at)}`}><RichText t={t} text={r.body} /></Card>
    </div>
  );
}

// ---------- Log tindakan ----------
const SOURCE_LABEL = { chat: '💬 Chat', jadual: '⏰ Jadual', auto: '🤖 Auto', cadangan: '💡 Cadangan', autopilot: '🚀 Autopilot' };
const STATUS_STYLE = { ok: ['Berjaya', 'good'], failed: ['Gagal', 'bad'], rejected: ['Ditolak had', 'warn'] };
const changeText = (a, b) => {
  if (!a && !b) return '';
  if (b?.daily_budget_rm != null && a?.daily_budget_rm != null) return `RM${a.daily_budget_rm} → RM${b.daily_budget_rm}`;
  if (b?.status) return `${a?.status || '—'} → ${b.status}`;
  if (b?.adset_id) return `Adset baru ${b.adset_id}`;
  return '';
};

export function LogTab({ marketerId }) {
  const t = theme(useLightMode());
  const [log, setLog] = useState(null);
  useEffect(() => { getJson(`/api/ads-hub/log${q(marketerId)}`).then(j => setLog(j.success ? j.log : [])); }, [marketerId]);
  if (!log) return <Spinner t={t} text="Memuatkan log..." />;
  return (
    <Card t={t} title="Log tindakan" sub="Semua perubahan pada akaun Meta melalui Ads Hub — chat, jadual, auto dan cadangan" pad={false}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead><tr style={{ background: t.headBg }}>
            {['Masa', 'Sumber', 'Tindakan', 'Objek', 'Perubahan', 'Status'].map((h, i) => <th key={h} style={{ ...th(t), textAlign: 'left' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {log.map(l => {
              const [label, tone] = STATUS_STYLE[l.status] || [l.status, 'text2'];
              return (
                <tr key={l.id} style={{ borderBottom: t.rowBorder }}>
                  <td style={{ ...td(t, 'left'), whiteSpace: 'nowrap', color: t.text2 }}>{fmtMyt(l.created_at)}</td>
                  <td style={{ ...td(t, 'left'), whiteSpace: 'nowrap' }}>{SOURCE_LABEL[l.source] || l.source}</td>
                  <td style={td(t, 'left')}>{{ set_status: 'Status', set_budget: 'Budget', duplicate_adset: 'Duplicate' }[l.action] || l.action}</td>
                  <td style={td(t, 'left')}>{l.object_name || '—'}</td>
                  <td style={{ ...td(t, 'left'), whiteSpace: 'nowrap' }}>{changeText(l.before, l.after)}</td>
                  <td style={td(t, 'left')}>
                    <span style={{ color: t[tone], fontWeight: 700 }}>{label}</span>
                    {l.message && <div style={{ fontSize: '0.72rem', color: t.muted }}>{l.message}</div>}
                  </td>
                </tr>
              );
            })}
            {!log.length && <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: t.muted }}>Belum ada tindakan.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------- Peraturan & jadual ----------
const METRICS = { roas: 'ROAS', cpa: 'CPA (RM)', spend: 'Belanja (RM)', orders: 'Order', revenue: 'Jualan (RM)', ctr: 'CTR link (%)' };
const ACTIONS = { pause: 'Pause ad', pause_adset: 'Pause adset', activate_adset: 'Hidupkan adset', budget_up: 'Naikkan budget adset %', budget_down: 'Turunkan budget adset %', budget_set: 'Set budget adset (RM)', notify: 'Amaran sahaja' };
const TIME_ACTIONS = ['pause_adset', 'activate_adset', 'budget_set'];
const OPS = ['<', '<=', '>', '>=', '='];
const PRESETS = [
  { name: 'Pause ad rugi', metric: 'roas', operator: '<', value: 1, window_days: 3, min_spend: 60, action: 'pause', action_value: 0, mode: 'suggest' },
  { name: 'Scale ad menang', metric: 'roas', operator: '>=', value: 2.5, window_days: 3, min_spend: 80, action: 'budget_up', action_value: 20, mode: 'suggest' },
  { name: 'CPA terlalu tinggi', metric: 'cpa', operator: '>', value: 60, window_days: 3, min_spend: 60, action: 'notify', action_value: 0, mode: 'suggest' },
];

export function RulesTab({ marketerId, canEdit, autopilot }) {
  const t = theme(useLightMode());
  const [rules, setRules] = useState(null);
  const [sched, setSched] = useState(null);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => {
    const [r, s] = await Promise.all([getJson(`/api/ads-hub/rules${q(marketerId)}`), getJson(`/api/ads-hub/schedules${q(marketerId)}`)]);
    setRules(r.success ? r.rules : []); setSched(s.success ? s : { pending: [], done: [] });
  }, [marketerId]);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, body) => { const j = await sendJson(`/api/ads-hub/rules/${id}${q(marketerId)}`, 'PATCH', body); if (!j.success) setMsg(j.error); await load(); };
  const remove = async id => { await sendJson(`/api/ads-hub/rules/${id}${q(marketerId)}`, 'DELETE'); await load(); };
  const cancel = async id => { const j = await sendJson(`/api/ads-hub/schedules/${id}${q(marketerId)}`, 'DELETE'); setMsg(j.message || j.error || ''); await load(); };
  const save = async () => {
    const j = await sendJson(`/api/ads-hub/rules${q(marketerId)}`, 'POST', form);
    setMsg(j.message || j.error || '');
    if (j.success) { setForm(null); await load(); }
  };

  if (!rules || !sched) return <Spinner t={t} text="Memuatkan peraturan..." />;
  const field = { padding: '0.4rem 0.55rem', borderRadius: 6, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.8rem', fontFamily: t.ff };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCond = (i, k, v) => setForm(f => ({ ...f, conditions: f.conditions.map((c, j) => (j === i ? { ...c, [k]: v } : c)) }));

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      {msg && <div style={{ padding: '0.7rem 1rem', borderRadius: 8, border: t.border, fontSize: '0.82rem', marginBottom: '1rem', color: t.text2 }}>{msg}</div>}

      <Card t={t} title="Peraturan auto" sub="Peraturan ikut syarat dinilai setiap jam guna order sebenar (peringkat adset: kempen aktif sahaja); peraturan ikut jam dijalankan sekali sehari pada masa ditetapkan. Mod cadang = muncul di dashboard untuk anda Laksana; mod auto = terus dilaksana (tertakluk had di Tetapan)."
        right={canEdit && !form && <button onClick={() => setForm({ ...PRESETS[0] })} style={btn(t, true)}>+ Peraturan baru</button>} pad={false}>
        {form && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: t.border, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: '0.75rem', color: t.muted, alignItems: 'center' }}>
              Templat: {PRESETS.map(p => <button key={p.name} onClick={() => setForm({ ...p })} style={btn(t)}>{p.name}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              <input id="rule-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nama peraturan" style={{ ...field, minWidth: 180 }} />
              <select id="rule-kind" value={form.run_at_time ? 'time' : 'cond'} onChange={e => setForm(f => ({ ...f, run_at_time: e.target.value === 'time' ? '06:00' : '', action: e.target.value === 'time' ? 'pause_adset' : f.action }))} style={field}>
                <option value="cond">Ikut syarat</option><option value="time">Ikut jam (setiap hari)</option>
              </select>
              {form.run_at_time && <>pada <input id="rule-time" type="time" value={form.run_at_time} onChange={e => set('run_at_time', e.target.value)} style={field} /> waktu Malaysia, semua adset dalam kempen aktif</>}
            </div>
            {!form.run_at_time && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              Jika
              <select id="rule-metric" value={form.metric} onChange={e => set('metric', e.target.value)} style={field}>{Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <select id="rule-op" value={form.operator} onChange={e => set('operator', e.target.value)} style={field}>{OPS.map(o => <option key={o}>{o}</option>)}</select>
              <input id="rule-value" type="number" step="0.1" value={form.value} onChange={e => set('value', e.target.value)} style={{ ...field, width: 80 }} />
              {(form.conditions || []).map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  dan
                  <select aria-label={`Metrik syarat ${i + 2}`} value={c.metric} onChange={e => setCond(i, 'metric', e.target.value)} style={field}>{Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                  <select aria-label={`Operator syarat ${i + 2}`} value={c.operator} onChange={e => setCond(i, 'operator', e.target.value)} style={field}>{OPS.map(o => <option key={o}>{o}</option>)}</select>
                  <input aria-label={`Nilai syarat ${i + 2}`} type="number" step="0.1" value={c.value} onChange={e => setCond(i, 'value', e.target.value)} style={{ ...field, width: 70 }} />
                  <button onClick={() => set('conditions', form.conditions.filter((_, j) => j !== i))} style={btn(t)} aria-label="Buang syarat">✕</button>
                </span>
              ))}
              {(form.conditions || []).length < 3 && <button onClick={() => set('conditions', [...(form.conditions || []), { metric: 'orders', operator: '>', value: 0 }])} style={btn(t)}>+ syarat</button>}
              dalam
              <input id="rule-window" type="number" min="1" max="30" value={form.window_days} onChange={e => set('window_days', e.target.value)} style={{ ...field, width: 60 }} /> hari{Number(form.window_days) === 1 ? ' (hari ini)' : ''},
              belanja ≥ RM
              <input id="rule-minspend" type="number" min="0" value={form.min_spend} onChange={e => set('min_spend', e.target.value)} style={{ ...field, width: 70 }} />
              <select id="rule-level" value={form.level || 'ad'} onChange={e => set('level', e.target.value)} style={field}>
                <option value="ad">Nilai setiap ad</option><option value="adset">Nilai ikut adset (kempen aktif)</option>
              </select>
            </div>)}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              →
              <select id="rule-action" value={form.action} onChange={e => set('action', e.target.value)} style={field}>{Object.entries(ACTIONS).filter(([k]) => !form.run_at_time || TIME_ACTIONS.includes(k)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              {['budget_up', 'budget_down'].includes(form.action) && (
                <><input id="rule-pct" type="number" min="1" max="100" value={form.action_value} onChange={e => set('action_value', e.target.value)} style={{ ...field, width: 60 }} />%</>
              )}
              {form.action === 'budget_up' && (
                <>maks RM<input id="rule-max" type="number" min="1" value={form.action_max ?? ''} onChange={e => set('action_max', e.target.value)} placeholder="tiada" style={{ ...field, width: 80 }} /></>
              )}
              {form.action === 'budget_set' && (
                <>RM<input id="rule-setrm" type="number" min="1" value={form.action_value} onChange={e => set('action_value', e.target.value)} style={{ ...field, width: 80 }} /></>
              )}
              {!form.run_at_time && (
                <label htmlFor="rule-hourly" style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                  <input id="rule-hourly" type="checkbox" checked={form.frequency === 'hourly'} onChange={e => set('frequency', e.target.checked ? 'hourly' : 'daily')} /> berulang setiap jam
                </label>
              )}
              {autopilot && (
                <select id="rule-scope" value={form.scope || 'all'} onChange={e => set('scope', e.target.value)} style={field}>
                  <option value="all">Semua kempen</option><option value="autopilot">Kempen autopilot sahaja</option>
                </select>
              )}
              <select id="rule-mode" value={form.mode} onChange={e => set('mode', e.target.value)} style={field}>
                <option value="suggest">Cadang sahaja</option><option value="auto">Auto laksana</option>
              </select>
              <button onClick={save} style={btn(t, true)}>Simpan</button>
              <button onClick={() => setForm(null)} style={btn(t)}>Batal</button>
            </div>
          </div>
        )}
        {rules.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: t.rowBorder, flexWrap: 'wrap', opacity: r.active ? 1 : 0.6 }}>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.name} {!r.active && <span style={{ color: t.muted, fontWeight: 500 }}>(tidak aktif)</span>}</div>
              <div style={{ fontSize: '0.78rem', color: t.text2 }}>{r.summary}</div>
              <div style={{ fontSize: '0.7rem', color: t.muted }}>Dinilai {ago(r.last_run_at)}</div>
            </div>
            {canEdit && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => patch(r.id, { mode: r.mode === 'auto' ? 'suggest' : 'auto' })} style={btn(t)}>{r.mode === 'auto' ? 'Tukar ke cadang' : 'Tukar ke auto'}</button>
                <button onClick={() => patch(r.id, { active: !r.active })} style={btn(t)}>{r.active ? 'Nyahaktif' : 'Aktifkan'}</button>
                <button onClick={() => remove(r.id)} style={{ ...btn(t), color: t.bad }}>Padam</button>
              </div>
            )}
          </div>
        ))}
        {!rules.length && !form && <div style={{ padding: '1.5rem 1.25rem', color: t.muted, fontSize: '0.84rem' }}>Belum ada peraturan. Cipta di sini atau minta dalam chat, contoh: "pause ad yang ROAS bawah 1 selepas belanja RM60".</div>}
      </Card>

      <Card t={t} title="Tindakan berjadual" sub="Dicipta melalui chat, contoh: &quot;hidupkan adset Lebam Jumaat 8 malam&quot;. Dijalankan setiap 10 minit." pad={false}>
        {sched.pending.map(s => (
          <div key={s.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.7rem 1.25rem', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', fontSize: '0.84rem' }}><b>{fmtMyt(s.run_at)}</b> · {s.label}</div>
            {canEdit && s.status === 'pending' && <button onClick={() => cancel(s.id)} style={{ ...btn(t), color: t.bad }}>Batalkan</button>}
          </div>
        ))}
        {!sched.pending.length && <div style={{ padding: '1rem 1.25rem', color: t.muted, fontSize: '0.84rem' }}>Tiada jadual menunggu.</div>}
        {sched.done.length > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', borderTop: t.border }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Selesai</div>
            {sched.done.map(s => (
              <div key={s.id} style={{ fontSize: '0.78rem', color: t.text2, padding: '2px 0' }}>
                {fmtMyt(s.run_at)} · {s.label} · <span style={{ color: s.status === 'done' ? t.good : s.status === 'failed' ? t.bad : t.muted }}>{{ done: 'berjaya', failed: 'gagal', cancelled: 'dibatalkan' }[s.status]}</span>
                {s.result && s.status === 'failed' && <span style={{ color: t.muted }}> — {s.result}</span>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Had keselamatan (tab Tetapan) ----------
export function LimitsCard({ marketerId }) {
  const t = theme(useLightMode());
  const [c, setC] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { getJson(`/api/ads-hub/connection${q(marketerId)}`).then(j => j.success && j.connection && setC(j.connection)); }, [marketerId]);
  if (!c) return null;
  const save = async () => {
    const j = await sendJson(`/api/ads-hub/connection${q(marketerId)}`, 'PATCH', {
      limit_max_budget: c.limit_max_budget, limit_max_increase_pct: c.limit_max_increase_pct,
      limit_auto_actions_per_day: c.limit_auto_actions_per_day, report_enabled: c.report_enabled,
    });
    setMsg(j.success ? 'Disimpan.' : j.error);
    if (j.success) setC(j.connection);
  };
  const field = { width: 110, padding: '0.45rem 0.6rem', borderRadius: 6, border: t.border, background: t.headBg, color: t.text, fontSize: '0.85rem' };
  const row = (id, label, hint, input) => (
    <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
      <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>{hint}</span></span>
      {input}
    </label>
  );
  return (
    <Card t={t} title="Had keselamatan & laporan" sub="Dikuatkuasa pada semua perubahan: chat, jadual, cadangan dan peraturan auto">
      {row('lim-budget', 'Budget harian maksimum satu adset (RM)', 'Perubahan melebihi had ini ditolak.',
        <input id="lim-budget" type="number" min="1" value={c.limit_max_budget} onChange={e => setC({ ...c, limit_max_budget: e.target.value })} style={field} />)}
      {row('lim-pct', 'Kenaikan budget maksimum sekali naik (%)', 'Budget juga hanya boleh naik sekali dalam 20 jam bagi setiap adset.',
        <input id="lim-pct" type="number" min="1" max="100" value={c.limit_max_increase_pct} onChange={e => setC({ ...c, limit_max_increase_pct: e.target.value })} style={field} />)}
      {row('lim-auto', 'Tindakan auto maksimum sehari', 'Untuk peraturan mod auto. 0 = matikan semua tindakan auto.',
        <input id="lim-auto" type="number" min="0" max="1000" value={c.limit_auto_actions_per_day} onChange={e => setC({ ...c, limit_auto_actions_per_day: e.target.value })} style={field} />)}
      {row('lim-report', 'Laporan pagi automatik', 'AI tulis laporan setiap pagi pukul 9.',
        <input id="lim-report" type="checkbox" checked={!!c.report_enabled} onChange={e => setC({ ...c, report_enabled: e.target.checked })} style={{ width: 18, height: 18 }} />)}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '0.9rem' }}>
        <button onClick={save} style={btn(t, true)}>Simpan had</button>
        {msg && <span style={{ fontSize: '0.8rem', color: t.text2 }}>{msg}</span>}
      </div>
    </Card>
  );
}

// ---------- Chat Ads ----------
const STARTERS = [
  'Analisis 7 hari: angle mana menang, ad mana patut pause?',
  'Ad mana yang patut saya scale hari ni?',
  'Banding prestasi semalam dengan purata 7 hari',
  'Cipta peraturan: pause ad yang ROAS bawah 1 selepas belanja RM60 dalam 3 hari',
];

export function ChatPanel({ marketerId, open, onClose, onChanged }) {
  const t = theme(useLightMode());
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [approve, setApprove] = useState({});
  const endRef = useRef(null);

  const loadThreads = useCallback(async () => {
    const j = await getJson(`/api/ads-hub/chat${q(marketerId)}`);
    if (j.success) setThreads(j.threads);
    else setError(j.error);
  }, [marketerId]);
  useEffect(() => { if (open) loadThreads(); }, [open, loadThreads]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread, busy]);
  useEffect(() => {
    if (thread?.pending) setApprove(Object.fromEntries(thread.pending.map(p => [p.tool_use_id, true])));
  }, [thread?.pending]);

  const openThread = async id => {
    setError('');
    const j = await getJson(`/api/ads-hub/chat?thread_id=${id}${qa(marketerId)}`);
    if (j.success) setThread(j.thread); else setError(j.error);
  };

  // Teruskan langkah selagi server kata 'continue' (setiap langkah = satu panggilan AI)
  const drive = async first => {
    let j = first;
    let changed = false;
    for (let i = 0; i < 12; i++) {
      if (!j.success) { setError(j.error || 'Ralat.'); break; }
      setThread(j.thread);
      if (j.outcomes) changed = changed || Object.values(j.outcomes).some(o => o.ok);
      if (j.status === 'error') { setError(j.error); break; }
      if (j.status !== 'continue') break;
      setStatus('AI sedang semak data...');
      j = await sendJson(`/api/ads-hub/chat/step${q(marketerId)}`, 'POST', { thread_id: j.thread.id });
    }
    setStatus('');
    if (changed) onChanged?.();
    loadThreads();
  };

  const send = async text => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setBusy(true); setError(''); setInput(''); setStatus('AI sedang berfikir...');
    setThread(th => (th ? { ...th, items: [...th.items, { type: 'user', text: msg }] } : { id: null, items: [{ type: 'user', text: msg }], pending: null }));
    const j = await sendJson(`/api/ads-hub/chat${q(marketerId)}`, 'POST', { thread_id: thread?.id || undefined, message: msg });
    await drive(j);
    setBusy(false);
  };

  const decide = async all => {
    setBusy(true); setError(''); setStatus('Melaksanakan...');
    const decisions = Object.fromEntries(thread.pending.map(p => [p.tool_use_id, all === false ? 'reject' : approve[p.tool_use_id] ? 'approve' : 'reject']));
    const j = await sendJson(`/api/ads-hub/chat/confirm${q(marketerId)}`, 'POST', { thread_id: thread.id, decisions });
    await drive(j);
    setBusy(false);
  };

  if (!open) return null;
  const bubble = (mine) => ({
    alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '0.6rem 0.8rem', borderRadius: 12,
    background: mine ? '#10B981' : t.headBg, color: mine ? '#fff' : t.text, border: mine ? 'none' : t.border, fontSize: '0.85rem',
  });

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 100vw)', zIndex: 60, background: t.cardBg, borderLeft: t.border, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 24px rgba(0,0,0,0.25)', fontFamily: t.ff, color: t.text }}>
      <div style={{ padding: '0.85rem 1rem', borderBottom: t.border, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontWeight: 800, flex: 1 }}>💬 Chat Ads</div>
        <select id="chat-thread" value={thread?.id || ''} onChange={e => (e.target.value ? openThread(e.target.value) : setThread(null))}
          style={{ maxWidth: 170, padding: '0.3rem', borderRadius: 6, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.75rem' }}>
          <option value="">+ Perbualan baru</option>
          {threads.map(x => <option key={x.id} value={x.id}>{x.pending ? '⏳ ' : ''}{(x.title || 'Perbualan').slice(0, 40)}</option>)}
        </select>
        <button onClick={onClose} aria-label="Tutup chat" style={{ border: 'none', background: 'none', color: t.text2, fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {!thread && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.84rem', color: t.text2, marginBottom: 4 }}>Tanya tentang prestasi ads, atau suruh ubah: pause, budget, duplicate, jadual dan peraturan auto. Setiap perubahan perlu anda Sahkan.</div>
            {STARTERS.map(s => <button key={s} onClick={() => send(s)} disabled={busy} style={{ ...btn(t), textAlign: 'left', fontWeight: 500 }}>{s}</button>)}
          </div>
        )}
        {thread?.items.map((it, i) => {
          if (it.type === 'user') return <div key={i} style={bubble(true)}>{it.text}</div>;
          if (it.type === 'assistant') return <div key={i} style={bubble(false)}><RichText t={t} text={it.text} /></div>;
          if (it.type === 'tool') return <div key={i} style={{ fontSize: '0.72rem', color: t.muted, paddingLeft: 4 }}>🔎 {it.label}</div>;
          if (it.type === 'action_result') {
            const c = !it.approved ? t.muted : it.ok ? t.good : t.bad;
            return <div key={i} style={{ fontSize: '0.8rem', color: c, border: `1px solid ${c}`, borderRadius: 8, padding: '0.45rem 0.65rem' }}>{!it.approved ? '✖' : it.ok ? '✅' : '⚠️'} {it.text}</div>;
          }
          return null;
        })}
        {thread?.pending && (
          <div style={{ border: `1px dashed ${t.warn}`, borderRadius: 10, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Sahkan perubahan</div>
            {thread.pending.map(p => (
              <label key={p.tool_use_id} htmlFor={`ap-${p.tool_use_id}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input id={`ap-${p.tool_use_id}`} type="checkbox" checked={!!approve[p.tool_use_id]} onChange={e => setApprove(a => ({ ...a, [p.tool_use_id]: e.target.checked }))} style={{ marginTop: 3 }} />
                <span><b>{p.label}</b>{p.reason && <span style={{ color: t.text2 }}> — {p.reason}</span>}</span>
              </label>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => decide(true)} disabled={busy} style={btn(t, true)}>Sahkan yang ditanda</button>
              <button onClick={() => decide(false)} disabled={busy} style={btn(t)}>Batal semua</button>
            </div>
          </div>
        )}
        {status && <div style={{ fontSize: '0.78rem', color: t.text2 }}>⏳ {status}</div>}
        {error && <div style={{ fontSize: '0.8rem', color: t.bad }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '0.75rem', borderTop: t.border, display: 'flex', gap: 8 }}>
        <textarea id="chat-input" value={input} onChange={e => setInput(e.target.value)} rows={2} disabled={busy || !!thread?.pending}
          placeholder={thread?.pending ? 'Sahkan atau batal dulu...' : 'Tanya atau beri arahan...'}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{ flex: 1, resize: 'none', padding: '0.55rem 0.7rem', borderRadius: 8, border: t.border, background: t.headBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff }} />
        <button onClick={() => send()} disabled={busy || !input.trim() || !!thread?.pending} style={btn(t, true)}>Hantar</button>
      </div>
    </div>
  );
}


// ---------- Ads spend automatik (tab Tetapan) ----------
const PRODUCT_SOURCE = { manual: 'ditetapkan', teka: 'teka dari nama', default: 'produk default' };

export function SpendCard({ marketerId, isAgent }) {
  const t = theme(useLightMode());
  const [c, setC] = useState(null);
  const [camps, setCamps] = useState(null);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const loadCamps = useCallback(async () => {
    const j = await getJson(`/api/ads-hub/campaign-products${q(marketerId)}`);
    if (j.success) { setCamps(j.campaigns); setProducts(j.products); } else setMsg(j.error);
  }, [marketerId]);
  useEffect(() => {
    getJson(`/api/ads-hub/connection${q(marketerId)}`).then(j => j.success && j.connection && setC(j.connection));
    loadCamps();
  }, [marketerId, loadCamps]);
  if (!c) return null;

  const spendMsg = j => (j.spend && !j.spend.skipped
    ? (j.spend.ok ? `Ads spend dikemas kini (${j.spend.inserted} baru, ${j.spend.updated} dikemas kini, ${j.spend.deleted} dibuang).` : `Ads spend gagal dikemas kini: ${j.spend.error}`)
    : 'Disimpan.');
  const patch = async body => {
    setBusy('conn'); setMsg('');
    const j = await sendJson(`/api/ads-hub/connection${q(marketerId)}`, 'PATCH', body);
    setBusy('');
    if (!j.success) return setMsg(j.error);
    setC(j.connection); setMsg(spendMsg(j)); loadCamps();
  };
  const setProduct = async (campaign_id, product) => {
    setBusy(campaign_id); setMsg('');
    const j = await sendJson(`/api/ads-hub/campaign-products${q(marketerId)}`, 'PUT', { campaign_id, product });
    setBusy('');
    setMsg(j.success ? spendMsg(j) : j.error);
    loadCamps();
  };
  const field = { padding: '0.4rem 0.55rem', borderRadius: 6, border: t.border, background: t.headBg, color: t.text, fontSize: '0.8rem', fontFamily: t.ff };

  return (
    <Card t={t} title="Ads spend automatik" sub="Belanja Meta + SST 8% ditulis ke rekod ads spend setiap jam, ikut produk. Untung harian & bulanan keluar di Laporan Marketer dan P&L.">
      <label htmlFor="auto-spend" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.4rem 0 0.7rem', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
        <span>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Isi ads spend automatik dari Meta</span><br />
          <span style={{ fontSize: '0.75rem', color: t.muted }}>
            {isAgent ? 'Sentiasa hidup untuk ejen AI.' : 'Bila hidup, rekod ads spend dari 1 Nov 2026 (hingga 35 hari terakhir) digantikan dengan angka Meta. Isian manual untuk tarikh itu akan ditimpa; rekod sebelum 1 Nov tidak disentuh.'}
          </span>
        </span>
        <input id="auto-spend" type="checkbox" checked={!!c.auto_ads_spend} disabled={busy === 'conn' || (isAgent && c.auto_ads_spend)}
          onChange={e => patch({ auto_ads_spend: e.target.checked })} style={{ width: 18, height: 18 }} />
      </label>
      <label htmlFor="default-product" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.7rem 0', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
        <span>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Produk default</span><br />
          <span style={{ fontSize: '0.75rem', color: t.muted }}>Untuk campaign yang namanya tak sebut produk.</span>
        </span>
        <select id="default-product" value={c.default_product || 'sabun-garam'} disabled={busy === 'conn'} onChange={e => patch({ default_product: e.target.value })} style={field}>
          {products.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </label>
      {msg && <div style={{ fontSize: '0.8rem', color: t.text2, padding: '0.6rem 0' }}>{msg}</div>}
      <div style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0.9rem 0 0.4rem' }}>Produk setiap campaign</div>
      {!camps ? <Spinner t={t} text="Memuatkan campaign..." />
        : !camps.length ? <div style={{ fontSize: '0.8rem', color: t.muted }}>Belum ada campaign. Sync dulu.</div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead><tr style={{ background: t.headBg }}>
                  <th style={{ ...th(t), textAlign: 'left' }}>Campaign</th><th style={{ ...th(t), textAlign: 'left' }}>Status</th>
                  <th style={{ ...th(t), textAlign: 'left' }}>Produk</th><th style={{ ...th(t), textAlign: 'left' }}>Sumber</th>
                </tr></thead>
                <tbody>
                  {camps.map(x => (
                    <tr key={x.campaign_id} style={{ borderBottom: t.rowBorder }}>
                      <td style={td(t, 'left')}>{x.campaign_name || x.campaign_id}</td>
                      <td style={{ ...td(t, 'left'), color: x.status === 'ACTIVE' ? t.good : t.muted, fontSize: '0.72rem' }}>{x.status === 'ACTIVE' ? '● Aktif' : (x.status || '—').toLowerCase()}</td>
                      <td style={td(t, 'left')}>
                        <select aria-label={`Produk ${x.campaign_name}`} value={x.product} disabled={busy === x.campaign_id}
                          onChange={e => setProduct(x.campaign_id, e.target.value)} style={field}>
                          {products.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                        </select>
                      </td>
                      <td style={{ ...td(t, 'left'), color: t.muted, fontSize: '0.72rem' }}>
                        {PRODUCT_SOURCE[x.source]}
                        {x.source === 'manual' && <button onClick={() => setProduct(x.campaign_id, '')} style={{ marginLeft: 6, border: 'none', background: 'none', color: t.accent, cursor: 'pointer', fontSize: '0.72rem' }}>teka semula</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
    </Card>
  );
}

// ---------- Maklumat ejen AI: kod SP & pixel (tab Tetapan, super_admin) ----------
export function AgentCard({ marketerId }) {
  const t = theme(useLightMode());
  const [a, setA] = useState(null);
  const [pixel, setPixel] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    getJson(`/api/ads-hub/agents${q(marketerId)}`).then(j => {
      if (!j.success) return setMsg(j.error);
      setA(j.agent); setPixel(j.agent.meta_pixel_id);
    });
  }, [marketerId]);
  if (!a) return msg ? <div style={{ color: t.bad, fontSize: '0.8rem' }}>{msg}</div> : null;

  const save = async body => {
    setBusy(true); setMsg('');
    const j = await sendJson(`/api/ads-hub/agents${q(marketerId)}`, 'PATCH', body);
    setBusy(false);
    if (!j.success) return setMsg(j.error);
    setA(j.agent); setPixel(j.agent.meta_pixel_id); setToken(''); setMsg('Disimpan.');
  };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const field = { padding: '0.45rem 0.6rem', borderRadius: 6, border: t.border, background: t.headBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff };
  const row = { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: t.rowBorder, flexWrap: 'wrap' };

  return (
    <Card t={t} title={`🤖 ${a.name}`} sub="Ejen tiada login. Pixel dan link SP ejen diurus di sini.">
      <div style={row}>
        <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Kod ejen</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>Order dari link dengan kod ini dikira milik ejen.</span></span>
        <code style={{ fontWeight: 700 }}>{a.code}</code>
      </div>
      <div style={row}>
        <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Contoh link SP</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>Guna link SP mana-mana produk, tambah <code>?m={a.code}</code>.</span></span>
        <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{origin}/sabun-garam?m={a.code}</code>
      </div>
      <label htmlFor="agent-pixel" style={row}>
        <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Meta Pixel ID</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>Pixel ejen sendiri, dipasang pada SP bila link ada kod ejen.</span></span>
        <input id="agent-pixel" value={pixel} onChange={e => setPixel(e.target.value.replace(/\D/g, ''))} placeholder="cth: 1234567890" style={{ ...field, width: 190 }} />
      </label>
      <label htmlFor="agent-capi" style={row}>
        <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Token Conversions API</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>{a.has_capi_token ? 'Dah tersimpan. Isi untuk ganti.' : 'Pilihan. Untuk hantar event purchase dari server.'}</span></span>
        <input id="agent-capi" type="password" value={token} onChange={e => setToken(e.target.value.trim())} placeholder={a.has_capi_token ? '•••••••• tersimpan' : 'Tampal token'} style={{ ...field, width: 190 }} />
      </label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '0.9rem', flexWrap: 'wrap' }}>
        <button onClick={() => save({ meta_pixel_id: pixel, ...(token ? { meta_access_token: token } : {}) })} disabled={busy} style={btn(t, true)}>{busy ? 'Menyimpan...' : 'Simpan pixel'}</button>
        {a.has_capi_token && <button onClick={() => save({ meta_access_token: '-' })} disabled={busy} style={btn(t)}>Buang token CAPI</button>}
        {msg && <span style={{ fontSize: '0.8rem', color: t.text2 }}>{msg}</span>}
      </div>
    </Card>
  );
}

// ---------- Sambung Claude (MCP E-Syifa, baca sahaja) ----------
export function ClaudeKeyCard({ marketerId }) {
  const t = theme(useLightMode());
  const [keys, setKeys] = useState(null);
  const [fresh, setFresh] = useState(null);   // key penuh — ditunjuk sekali sahaja
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const load = useCallback(async () => {
    const j = await getJson(`/api/ads-hub/mcp-keys${q(marketerId)}`);
    if (j.success) setKeys(j.keys); else { setKeys([]); setMsg(j.error); }
  }, [marketerId]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy(true); setMsg(''); setCopied(false);
    const j = await sendJson(`/api/ads-hub/mcp-keys${q(marketerId)}`, 'POST', { name: 'Claude' });
    setBusy(false);
    if (!j.success) return setMsg(j.error);
    setFresh(j.key); load();
  };
  const revoke = async id => {
    if (!confirm('Batalkan key ini? Claude yang guna key ini tak boleh baca data lagi.')) return;
    const j = await sendJson(`/api/ads-hub/mcp-keys?id=${id}${qa(marketerId)}`, 'DELETE');
    if (!j.success) setMsg(j.error);
    load();
  };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cmd = fresh ? `claude mcp add --transport http esyifa ${origin}/api/mcp --header "Authorization: Bearer ${fresh}"` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(cmd); setCopied(true); } catch { setMsg('Gagal salin — salin secara manual.'); } };
  const code = { display: 'block', padding: '0.7rem 0.8rem', borderRadius: 8, background: t.headBg, border: t.border, fontSize: '0.75rem', fontFamily: 'ui-monospace, Consolas, monospace', wordBreak: 'break-all', color: t.text };

  return (
    <Card t={t} title="Sambung Claude (MCP E-Syifa)" sub="Claude Code di PC anda boleh baca prestasi ads & order sebenar akaun ini (baca sahaja, tiada data pelanggan). Cipta ads tetap guna Meta API anda sendiri.">
      {fresh && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Jalankan arahan ini sekali di terminal PC anda (key hanya ditunjuk SEKALI ini):</div>
          <code style={code}>{cmd}</code>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
            <button onClick={copy} style={btn(t, true)}>{copied ? 'Disalin ✓' : 'Salin arahan'}</button>
            <button onClick={() => setFresh(null)} style={btn(t)}>Tutup</button>
          </div>
          <div style={{ fontSize: '0.75rem', color: t.muted, marginTop: 8, lineHeight: 1.6 }}>
            Lepas itu buka Claude Code dan tanya, contohnya: "guna esyifa, analisis ads 7 hari — angle mana menang ikut order sebenar?". Jangan kongsi key ini dengan sesiapa.
          </div>
        </div>
      )}
      {keys == null ? <Spinner t={t} text="Memuatkan…" /> : keys.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: t.muted, padding: '0.3rem 0 0.6rem' }}>Belum ada key.</div>
      ) : keys.map(k => (
        <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.55rem 0', borderBottom: t.rowBorder, fontSize: '0.8rem', flexWrap: 'wrap' }}>
          <span><strong>{k.name}</strong> · esk_…{k.key_last4}<br />
            <span style={{ color: t.muted, fontSize: '0.72rem' }}>Dijana {fmtMyt(k.created_at)} · Guna terakhir {k.last_used_at ? ago(k.last_used_at) : 'belum pernah'}</span></span>
          <button onClick={() => revoke(k.id)} style={btn(t)}>Batalkan</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '0.9rem' }}>
        <button onClick={create} disabled={busy} style={btn(t, true)}>{busy ? 'Menjana…' : 'Jana key baru'}</button>
        {msg && <span style={{ fontSize: '0.8rem', color: t.text2 }}>{msg}</span>}
      </div>
    </Card>
  );
}

// ---------- Autopilot (tetapan + suis kecemasan; setiap akaun Meta sendiri) ----------
export function AutopilotCard({ marketerId } = {}) {
  const t = theme(useLightMode());
  const [s, setS] = useState(null);
  const [opts, setOpts] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setS(null); setMsg('');
    getJson(`/api/ads-hub/autopilot${q(marketerId)}`).then(j => {
      if (j.success) { setS(j.settings); setOpts(j.options); } else setMsg(j.error);
    });
  }, [marketerId]);
  const patch = async body => {
    setBusy(true); setMsg('');
    const j = await sendJson(`/api/ads-hub/autopilot${q(marketerId)}`, 'PATCH', body);
    setBusy(false);
    if (!j.success) return setMsg(j.error);
    setS(j.settings); setMsg('Disimpan.');
  };
  if (!s) return msg ? <Card t={t} title="🚀 Autopilot"><span style={{ fontSize: '0.8rem', color: t.text2 }}>{msg}</span></Card> : null;

  const field = { padding: '0.45rem 0.6rem', borderRadius: 6, border: t.border, background: t.headBg, color: t.text, fontSize: '0.82rem', fontFamily: t.ff };
  const row = (id, label, hint, input) => (
    <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
      <span><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span><br /><span style={{ fontSize: '0.75rem', color: t.muted }}>{hint}</span></span>
      {input}
    </label>
  );
  const select = (id, key, list, empty) => (
    <select id={id} value={s[key] || ''} onChange={e => setS({ ...s, [key]: e.target.value || null })} style={{ ...field, maxWidth: 320 }}>
      <option value="">{empty}</option>
      {list.map(o => <option key={o.id} value={o.id}>{o.name}{o.status ? ` · ${o.status}` : ''}{o.campaign ? ` (${o.campaign})` : ''}</option>)}
      {s[key] && !list.some(o => o.id === s[key]) && <option value={s[key]}>{s[key]}</option>}
    </select>
  );
  const save = () => patch({
    autopilot_adset_budget: s.autopilot_adset_budget, autopilot_max_adsets: s.autopilot_max_adsets, autopilot_daily_cap: s.autopilot_daily_cap,
    autopilot_page_id: s.autopilot_page_id, autopilot_ig_id: s.autopilot_ig_id, autopilot_template_adset_id: s.autopilot_template_adset_id,
  });
  const on = s.autopilot_enabled;

  return (
    <Card t={t} title="🚀 Autopilot" sub="Claude di PC launch ad baru melalui MCP selepas anda luluskan draf. Ad masuk kempen [AUTOPILOT] &lt;Produk&gt; dalam akaun Meta ini dan dijadual mula 06:00 pagi.">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.4rem 0 0.8rem', borderBottom: t.rowBorder, flexWrap: 'wrap' }}>
        <span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: on ? t.good : t.bad }}>{on ? '● Autopilot HIDUP' : '● Autopilot MATI'}</span><br />
          <span style={{ fontSize: '0.75rem', color: t.muted }}>Suis kecemasan: bila MATI, semua launch baru ditolak serta-merta. Ads yang dah berjalan tidak disentuh.</span>
        </span>
        <button disabled={busy} onClick={() => patch({ autopilot_enabled: !on })} style={btn(t, !on)}>{on ? 'Matikan autopilot' : 'Hidupkan autopilot'}</button>
      </div>
      {row('ap-budget', 'Bajet setiap adset baru (RM/hari)', `Mesti ≤ had adset di kad Had keselamatan (RM${Number(s.limit_max_budget)}).`,
        <input id="ap-budget" type="number" min="1" value={s.autopilot_adset_budget} onChange={e => setS({ ...s, autopilot_adset_budget: e.target.value })} style={{ ...field, width: 110 }} />)}
      {row('ap-max', 'Adset aktif maksimum', 'Dalam kempen [AUTOPILOT]. Draf baru hanya bila ada slot kosong.',
        <input id="ap-max" type="number" min="1" max="50" value={s.autopilot_max_adsets} onChange={e => setS({ ...s, autopilot_max_adsets: e.target.value })} style={{ ...field, width: 110 }} />)}
      {row('ap-cap', 'Had bajet harian kempen (RM)', 'Jumlah bajet semua adset aktif autopilot (termasuk selepas scale).',
        <input id="ap-cap" type="number" min="1" value={s.autopilot_daily_cap} onChange={e => setS({ ...s, autopilot_daily_cap: e.target.value })} style={{ ...field, width: 110 }} />)}
      {row('ap-page', 'Facebook Page', 'Page yang menjalankan ads.', select('ap-page', 'autopilot_page_id', opts?.pages || [], '— Pilih Page —'))}
      {row('ap-ig', 'Akaun Instagram (pilihan)', 'Kosong = guna Page sahaja.', select('ap-ig', 'autopilot_ig_id', opts?.instagram || [], '— Tiada —'))}
      {row('ap-tpl', 'Adset contoh', 'Targeting, pixel & optimization adset baru disalin dari adset ini.', select('ap-tpl', 'autopilot_template_adset_id', opts?.adsets || [], '— Pilih adset —'))}
      <div style={{ fontSize: '0.75rem', color: t.muted, marginTop: '0.7rem' }}>
        Kempen autopilot: {s.autopilot_campaign_id || 'belum dicipta (dicipta automatik semasa launch pertama)'}
        {opts?.warning ? ` · ${opts.warning}` : ''}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '0.9rem' }}>
        <button onClick={save} disabled={busy} style={btn(t, true)}>Simpan tetapan</button>
        {msg && <span style={{ fontSize: '0.8rem', color: t.text2 }}>{msg}</span>}
      </div>
    </Card>
  );
}
