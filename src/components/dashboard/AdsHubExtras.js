'use client';
// Ads Hub — panel tambahan: amaran & cadangan, laporan pagi, log, peraturan & jadual, had keselamatan, Chat Ads.
import { useState, useEffect, useCallback, useRef } from 'react';
import { theme, useLightMode, Card, Spinner, btn, th, td, ago } from './AdsHub';

const q = marketerId => (marketerId ? `?marketer=${marketerId}` : '');
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
    const j = await sendJson(`/api/ads-hub/events/${ev.id}`, 'POST', { decision });
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
    const j = await sendJson('/api/ads-hub/reports', 'POST');
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
const SOURCE_LABEL = { chat: '💬 Chat', jadual: '⏰ Jadual', auto: '🤖 Auto', cadangan: '💡 Cadangan' };
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
const ACTIONS = { pause: 'Pause ad', budget_up: 'Naikkan budget adset %', budget_down: 'Turunkan budget adset %', notify: 'Amaran sahaja' };
const PRESETS = [
  { name: 'Pause ad rugi', metric: 'roas', operator: '<', value: 1, window_days: 3, min_spend: 60, action: 'pause', action_value: 0, mode: 'suggest' },
  { name: 'Scale ad menang', metric: 'roas', operator: '>=', value: 2.5, window_days: 3, min_spend: 80, action: 'budget_up', action_value: 20, mode: 'suggest' },
  { name: 'CPA terlalu tinggi', metric: 'cpa', operator: '>', value: 60, window_days: 3, min_spend: 60, action: 'notify', action_value: 0, mode: 'suggest' },
];

export function RulesTab({ marketerId, canEdit }) {
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

  const patch = async (id, body) => { const j = await sendJson(`/api/ads-hub/rules/${id}`, 'PATCH', body); if (!j.success) setMsg(j.error); await load(); };
  const remove = async id => { await sendJson(`/api/ads-hub/rules/${id}`, 'DELETE'); await load(); };
  const cancel = async id => { const j = await sendJson(`/api/ads-hub/schedules/${id}`, 'DELETE'); setMsg(j.message || j.error || ''); await load(); };
  const save = async () => {
    const j = await sendJson('/api/ads-hub/rules', 'POST', form);
    setMsg(j.message || j.error || '');
    if (j.success) { setForm(null); await load(); }
  };

  if (!rules || !sched) return <Spinner t={t} text="Memuatkan peraturan..." />;
  const field = { padding: '0.4rem 0.55rem', borderRadius: 6, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.8rem', fontFamily: t.ff };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      {msg && <div style={{ padding: '0.7rem 1rem', borderRadius: 8, border: t.border, fontSize: '0.82rem', marginBottom: '1rem', color: t.text2 }}>{msg}</div>}

      <Card t={t} title="Peraturan auto" sub="Dinilai setiap jam pada ads yang sedang berjalan, guna order sebenar. Mod cadang = muncul di dashboard untuk anda Laksana; mod auto = terus dilaksana (tertakluk had di Tetapan)."
        right={canEdit && !form && <button onClick={() => setForm({ ...PRESETS[0] })} style={btn(t, true)}>+ Peraturan baru</button>} pad={false}>
        {form && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: t.border, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: '0.75rem', color: t.muted, alignItems: 'center' }}>
              Templat: {PRESETS.map(p => <button key={p.name} onClick={() => setForm({ ...p })} style={btn(t)}>{p.name}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              <input id="rule-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nama peraturan" style={{ ...field, minWidth: 180 }} />
              Jika
              <select id="rule-metric" value={form.metric} onChange={e => set('metric', e.target.value)} style={field}>{Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <select id="rule-op" value={form.operator} onChange={e => set('operator', e.target.value)} style={field}>{['<', '<=', '>', '>='].map(o => <option key={o}>{o}</option>)}</select>
              <input id="rule-value" type="number" step="0.1" value={form.value} onChange={e => set('value', e.target.value)} style={{ ...field, width: 80 }} />
              dalam
              <input id="rule-window" type="number" min="1" max="30" value={form.window_days} onChange={e => set('window_days', e.target.value)} style={{ ...field, width: 60 }} /> hari,
              belanja ≥ RM
              <input id="rule-minspend" type="number" min="0" value={form.min_spend} onChange={e => set('min_spend', e.target.value)} style={{ ...field, width: 70 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
              →
              <select id="rule-action" value={form.action} onChange={e => set('action', e.target.value)} style={field}>{Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              {['budget_up', 'budget_down'].includes(form.action) && (
                <><input id="rule-pct" type="number" min="1" max="100" value={form.action_value} onChange={e => set('action_value', e.target.value)} style={{ ...field, width: 60 }} />%</>
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
export function LimitsCard() {
  const t = theme(useLightMode());
  const [c, setC] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { getJson('/api/ads-hub/connection').then(j => j.success && j.connection && setC(j.connection)); }, []);
  if (!c) return null;
  const save = async () => {
    const j = await sendJson('/api/ads-hub/connection', 'PATCH', {
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
        <input id="lim-auto" type="number" min="0" max="100" value={c.limit_auto_actions_per_day} onChange={e => setC({ ...c, limit_auto_actions_per_day: e.target.value })} style={field} />)}
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

export function ChatPanel({ open, onClose, onChanged }) {
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
    const j = await getJson('/api/ads-hub/chat');
    if (j.success) setThreads(j.threads);
    else setError(j.error);
  }, []);
  useEffect(() => { if (open) loadThreads(); }, [open, loadThreads]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread, busy]);
  useEffect(() => {
    if (thread?.pending) setApprove(Object.fromEntries(thread.pending.map(p => [p.tool_use_id, true])));
  }, [thread?.pending]);

  const openThread = async id => {
    setError('');
    const j = await getJson(`/api/ads-hub/chat?thread_id=${id}`);
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
      j = await sendJson('/api/ads-hub/chat/step', 'POST', { thread_id: j.thread.id });
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
    const j = await sendJson('/api/ads-hub/chat', 'POST', { thread_id: thread?.id || undefined, message: msg });
    await drive(j);
    setBusy(false);
  };

  const decide = async all => {
    setBusy(true); setError(''); setStatus('Melaksanakan...');
    const decisions = Object.fromEntries(thread.pending.map(p => [p.tool_use_id, all === false ? 'reject' : approve[p.tool_use_id] ? 'approve' : 'reject']));
    const j = await sendJson('/api/ads-hub/chat/confirm', 'POST', { thread_id: thread.id, decisions });
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

