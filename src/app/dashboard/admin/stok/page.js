'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { KINDS, KIND_KEYS } from '@/lib/stock-kinds';

// ─── Tema (ikut dashboard gelap) ──────────────────────────────────────────────
const FF = 'var(--font-inter), -apple-system, sans-serif';
// Warna neutral ikut tema (pemboleh ubah CSS di .stk — mod Terang: body.light-mode). Warna aksen sama untuk dua tema.
const C = {
  bg: 'var(--s-bg)', card: 'var(--s-card)', card2: 'var(--s-card2)', border: 'var(--s-border)', border2: 'var(--s-border2)',
  text: 'var(--s-text)', muted: 'var(--s-muted)', dim: 'var(--s-dim)', green2: 'var(--s-green)', redTx: 'var(--s-redtx)',
  green: '#10B981', amber: '#F59E0B', red: '#EF4444', blue: '#60A5FA', violet: '#A78BFA',
};
const STATUS = {
  ok:       { label: 'OK',            color: C.green2, bg: 'rgba(16,185,129,0.12)' },
  rendah:   { label: 'Stok rendah',   color: C.amber,  bg: 'rgba(245,158,11,0.12)' },
  habis:    { label: 'Habis',         color: C.red,    bg: 'rgba(239,68,68,0.12)' },
  oversold: { label: 'Terlebih jual', color: 'var(--s-redtx)', bg: 'rgba(239,68,68,0.2)' },
};

const CSS = `
.stk{--s-bg:#090A0F;--s-card:#10131A;--s-card2:#161B27;--s-border:rgba(255,255,255,.08);--s-border2:rgba(255,255,255,.14);--s-text:#F9FAFB;--s-muted:#9CA3AF;--s-dim:#6B7280;--s-green:#34D399;--s-redtx:#FCA5A5;--s-hover:rgba(255,255,255,.035);--s-segon:#064E3B;--s-shadow:none}
body.light-mode .stk,[data-theme="light"] .stk{--s-bg:#F1F5F9;--s-card:#FFFFFF;--s-card2:#FFFFFF;--s-border:#E2E8F0;--s-border2:#CBD5E1;--s-text:#0F172A;--s-muted:#475569;--s-dim:#94A3B8;--s-green:#059669;--s-redtx:#DC2626;--s-hover:rgba(15,23,42,.04);--s-segon:#D1FAE5;--s-shadow:0 1px 3px rgba(15,23,42,.06)}
.stk{font-family:${FF};color:${C.text};min-width:0;max-width:100%}
.stk-x{overflow-x:auto;contain:inline-size}
.stk *{box-sizing:border-box}
.stk button{font-family:inherit}
.stk-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.6rem 1.1rem;border-radius:9px;font-size:.84rem;font-weight:700;cursor:pointer;border:1px solid transparent;white-space:nowrap}
.stk-btn:disabled{opacity:.55;cursor:default}
.stk-pri{background:#059669;color:#fff}.stk-pri:hover:not(:disabled){background:#047857}
.stk-gho{background:${C.card};color:${C.text};border-color:${C.border2}}.stk-gho:hover:not(:disabled){background:var(--s-hover)}
.stk-sm{padding:.35rem .7rem;font-size:.75rem;border-radius:7px}
.stk-in{max-width:100%;width:100%;padding:.65rem .8rem;background:${C.bg};border:1px solid ${C.border2};border-radius:8px;color:${C.text};font-size:.88rem;outline:none}
.stk-in:focus{border-color:${C.green}}
.stk-lb{display:block;font-size:.7rem;font-weight:700;color:${C.muted};margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.05em}
.stk-card{background:${C.card};border:1px solid ${C.border};border-radius:12px;box-shadow:var(--s-shadow)}
.stk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:.9rem}
.stk-pcard{padding:1.1rem 1.15rem;cursor:pointer;transition:border-color .15s,transform .15s;text-align:left;width:100%;color:inherit}
.stk-pcard:hover{border-color:rgba(16,185,129,.45);transform:translateY(-1px)}
.stk-pill{display:inline-flex;align-items:center;gap:.3rem;font-size:.68rem;font-weight:800;padding:.18rem .5rem;border-radius:999px;white-space:nowrap}
.stk-seg{max-width:100%;display:inline-flex;background:${C.bg};border:1px solid ${C.border};border-radius:9px;padding:3px;gap:2px;flex-wrap:wrap}
.stk-seg button{background:transparent;border:0;color:${C.muted};font-size:.76rem;font-weight:600;padding:.35rem .7rem;border-radius:6px;cursor:pointer}
.stk-seg button.on{background:var(--s-segon);color:${C.green2};font-weight:800}
.stk-chip{border:1px solid ${C.border2};background:transparent;color:${C.muted};font-size:.74rem;font-weight:700;padding:.3rem .65rem;border-radius:999px;cursor:pointer}
.stk-row{color:${C.text};display:grid;grid-template-columns:118px minmax(120px,1.1fr) 112px 96px minmax(160px,2fr) 84px 64px;gap:.6rem;align-items:center;padding:.6rem .9rem;border-bottom:1px solid ${C.border};font-size:.82rem}
.stk-row.hd{font-size:.66rem;font-weight:800;color:${C.muted};text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid ${C.border}}
.stk-row.nob{grid-template-columns:118px minmax(120px,1.1fr) 112px 96px minmax(160px,2fr) 64px}
.stk-row.np{grid-template-columns:104px 108px 88px minmax(140px,1fr) 70px 58px}
.stk-row.click{cursor:pointer}.stk-row.click:hover{background:var(--s-hover)}
.stk-sub{background:${C.bg};border-bottom:1px solid ${C.border};max-height:340px;overflow:auto}
.stk-sub div.r{display:grid;grid-template-columns:118px 1fr 90px 80px;gap:.6rem;padding:.4rem .9rem .4rem 1.6rem;font-size:.76rem;color:${C.muted}}
.stk-ell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stk-modal{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:9000;padding:1rem}
.stk-mbox{background:${C.card2};border:1px solid ${C.border2};border-radius:16px;width:100%;max-height:92vh;overflow:auto;padding:1.4rem}
.stk-drawer{position:fixed;inset:0;z-index:8000;display:flex;justify-content:flex-end;background:rgba(0,0,0,.55)}
.stk-dpanel{width:min(760px,100%);height:100%;overflow:auto;background:${C.bg};border-left:1px solid ${C.border2};padding:1.25rem 1.35rem 3rem}
.stk-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem}
.stk-kpi{background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:.75rem .85rem;box-shadow:var(--s-shadow)}
.stk-totals{display:grid;grid-template-columns:repeat(6,1fr);gap:.5rem}
.stk-ptable{width:100%;border-collapse:collapse;font-size:.82rem}
.stk-ptable th{font-size:.66rem;color:${C.muted};text-transform:uppercase;letter-spacing:.05em;text-align:right;padding:.5rem .6rem;border-bottom:1px solid ${C.border}}
.stk-ptable th:first-child,.stk-ptable td:first-child{text-align:left}
.stk-ptable td{text-align:right;padding:.55rem .6rem;border-bottom:1px solid ${C.border}}
.stk-ptable tr.click{cursor:pointer}.stk-ptable tr.click:hover td{background:var(--s-hover)}
@media (max-width:900px){
  .stk-row,.stk-row.nob{grid-template-columns:1fr auto;grid-template-areas:"p q" "k b" "d d";row-gap:.25rem}
  .stk-row.hd{display:none}
  .stk-row>.c-date{grid-area:k;font-size:.72rem;color:${C.muted}}
  .stk-row>.c-prod{grid-area:p}.stk-row>.c-kind{display:none}.stk-row>.c-qty{grid-area:q;text-align:right}
  .stk-row>.c-det{grid-area:d;white-space:normal}.stk-row>.c-bal{grid-area:b;text-align:right}.stk-row>.c-act{grid-area:b;justify-self:end}
  .stk-row.nob>.c-act{grid-area:b}
  .stk-row.np{grid-template-areas:"k q" "d b"}
  .stk-row.np>.c-kind{display:block;grid-area:k}.stk-row.np>.c-date{grid-area:d}
  .stk-kpis{grid-template-columns:repeat(2,1fr)}
  .stk-totals{grid-template-columns:repeat(3,1fr)}
  .stk-sub div.r{grid-template-columns:1fr auto;padding-left:1rem}
  .stk-hide-m{display:none}
}
`;

// ─── Utiliti ──────────────────────────────────────────────────────────────────
const n0 = v => Number(v || 0).toLocaleString('en-MY');
const rm = v => `RM${Number(v || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MYT = 8 * 3600e3;
const dayOf = d => new Date(new Date(d).getTime() + MYT).toISOString().slice(0, 10);
const addDays = (d, n) => new Date(new Date(`${d}T00:00:00Z`).getTime() + n * 864e5).toISOString().slice(0, 10);
const fmtDate = d => new Date(d).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDay = d => new Date(`${d}T00:00:00+08:00`).toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', day: '2-digit', month: 'short' });
const signed = (kind, q) => `${(KINDS[kind]?.sign || 1) > 0 ? '+' : '−'}${n0(q)}`;

function rangeOf(preset) {
  const t = dayOf(new Date());
  if (preset === 'today') return { from: t, to: t };
  if (preset === '7d') return { from: addDays(t, -6), to: t };
  if (preset === 'month') return { from: `${t.slice(0, 7)}-01`, to: t };
  if (preset === 'last_month') {
    const first = `${t.slice(0, 7)}-01`, lastEnd = addDays(first, -1);
    return { from: `${lastEnd.slice(0, 7)}-01`, to: lastEnd };
  }
  return { from: addDays(t, -29), to: t };
}
const PRESETS = [['today', 'Hari ini'], ['7d', '7 hari'], ['30d', '30 hari'], ['month', 'Bulan ini'], ['last_month', 'Bulan lepas'], ['custom', 'Pilih tarikh']];

async function api(url, opts) {
  const res = await fetch(url, opts && { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body && JSON.stringify(opts.body) });
  const json = await res.json().catch(() => ({ success: false, error: `Ralat ${res.status}` }));
  if (!json.success) throw new Error(json.error || 'Ralat');
  return json;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, left: 'auto', zIndex: 9999, background: type === 'error' ? '#7F1D1D' : '#065F46', border: `1px solid ${type === 'error' ? '#F87171' : C.green2}`, color: '#fff', borderRadius: 10, padding: '.8rem 1.1rem', fontSize: '.86rem', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,.45)', maxWidth: 360 }}>
      {msg}
    </div>
  );
}

function Pill({ kind, status }) {
  const cfg = kind ? KINDS[kind] : STATUS[status];
  if (!cfg) return null;
  return <span className="stk-pill" style={{ color: cfg.color, background: cfg.bg }}>{kind ? cfg.label : cfg.label}</span>;
}

function Modal({ title, sub, onClose, width = 520, children }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="stk-modal" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="stk-mbox" style={{ maxWidth: width }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{title}</h3>
            {sub && <p style={{ margin: '.25rem 0 0', fontSize: '.78rem', color: C.muted }}>{sub}</p>}
          </div>
          <button onClick={onClose} aria-label="Tutup" style={{ background: 'none', border: 0, color: C.muted, fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Kad produk ───────────────────────────────────────────────────────────────
function ProductCard({ p, onOpen }) {
  const st = STATUS[p.status];
  const big = p.status === 'oversold' ? C.red : p.status === 'habis' ? C.red : p.status === 'rendah' ? C.amber : C.green2;
  return (
    <button className="stk-card stk-pcard" onClick={() => onOpen(p)} style={{ borderColor: p.status === 'oversold' ? 'rgba(239,68,68,.45)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="stk-ell" style={{ fontWeight: 800, fontSize: '.92rem' }}>{p.name}</div>
          <div style={{ fontSize: '.7rem', color: C.dim, fontWeight: 700, marginTop: 2 }}>{p.sku}</div>
        </div>
        <span className="stk-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem', margin: '.85rem 0 .2rem' }}>
        <span style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1, color: big, letterSpacing: '-.02em' }}>{n0(p.free)}</span>
        <span style={{ fontSize: '.8rem', color: C.muted, fontWeight: 600 }}>{p.unit} {p.free < 0 ? 'terkurang' : 'bebas'}</span>
      </div>
      <div style={{ fontSize: '.74rem', color: C.muted, minHeight: '1.1em' }}>
        {p.status === 'oversold' ? `Order melebihi stok — perlu ${n0(-p.free)} ${p.unit} lagi`
          : p.days_cover != null ? `Cukup ±${p.days_cover} hari (keluar ${n0(p.out_per_day)}/hari)` : p.out_per_day > 0 ? `Keluar ${n0(p.out_per_day)}/hari` : 'Tiada pergerakan 7 hari'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.4rem', marginTop: '.85rem', paddingTop: '.75rem', borderTop: `1px solid ${C.border}` }}>
        <Mini label="Di rak" value={n0(p.on_shelf)} />
        <Mini label="Tunggu pack" value={n0(p.pending_hq + p.pending_fighter)} hint={p.pending_hq_orders ? `${n0(p.pending_hq_orders)} order${p.pending_fighter ? ` + fighter ${n0(p.pending_fighter)}` : ''}` : p.pending_fighter ? `fighter ${n0(p.pending_fighter)}` : ''} />
        <Mini label="Kos purata" value={rm(p.avg_cost)} />
      </div>
    </button>
  );
}
const Mini = ({ label, value, hint }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ fontSize: '.6rem', color: C.dim, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    <div style={{ fontSize: '.88rem', fontWeight: 800, marginTop: 2 }}>{value}</div>
    {hint ? <div className="stk-ell" style={{ fontSize: '.64rem', color: C.dim }}>{hint}</div> : null}
  </div>
);

// ─── Graf harian (SVG) ────────────────────────────────────────────────────────
function DailyChart({ daily, showBalance }) {
  const [hover, setHover] = useState(null);
  if (!daily?.length) return null;
  const W = 700, H = 190, pad = { l: 34, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...daily.map(d => Math.max(d.in, d.out)));
  const iw = W - pad.l - pad.r, mid = pad.t + (H - pad.t - pad.b) / 2, half = (H - pad.t - pad.b) / 2;
  const bw = Math.max(2, Math.min(22, iw / daily.length - 3));
  const x = i => pad.l + (iw / daily.length) * (i + 0.5);
  let line = null;
  if (showBalance) {
    const bals = daily.map(d => d.balance);
    const bmin = Math.min(...bals), bmax = Math.max(...bals), span = bmax - bmin || 1;
    const y = b => pad.t + (1 - (b - bmin) / span) * (H - pad.t - pad.b);
    line = daily.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.balance).toFixed(1)}`).join(' ');
  }
  const h = hover != null ? daily[hover] : null;
  const step = Math.ceil(daily.length / 8);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        <line x1={pad.l} x2={W - pad.r} y1={mid} y2={mid} style={{ stroke: C.border2 }} />
        <text x={pad.l - 6} y={pad.t + 8} style={{ fill: C.dim }} fontSize="10" textAnchor="end">{n0(max)}</text>
        <text x={pad.l - 6} y={H - pad.b} style={{ fill: C.dim }} fontSize="10" textAnchor="end">{n0(max)}</text>
        {daily.map((d, i) => (
          <g key={d.date} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - (iw / daily.length) / 2} y={pad.t} width={iw / daily.length} height={H - pad.t - pad.b} style={{ fill: hover === i ? 'var(--s-hover)' : 'transparent' }} />
            {d.in > 0 && <rect x={x(i) - bw / 2} y={mid - (d.in / max) * half} width={bw} height={(d.in / max) * half} rx="2" fill={C.green} />}
            {d.out > 0 && <rect x={x(i) - bw / 2} y={mid} width={bw} height={(d.out / max) * half} rx="2" fill={C.amber} />}
            {i % step === 0 && <text x={x(i)} y={H - 6} style={{ fill: C.dim }} fontSize="10" textAnchor="middle">{d.date.slice(8)}/{d.date.slice(5, 7)}</text>}
          </g>
        ))}
        {line && <path d={line} fill="none" stroke={C.blue} strokeWidth="2" />}
      </svg>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '.72rem', color: C.muted, marginTop: '.35rem', alignItems: 'center' }}>
        <Legend color={C.green} label="Masuk (atas)" /><Legend color={C.amber} label="Keluar (bawah)" />{showBalance && <Legend color={C.blue} label="Baki" line />}
        {h && <span style={{ marginLeft: 'auto', color: C.text }}>{fmtDay(h.date)} · <b style={{ color: C.green2 }}>+{n0(h.in)}</b> · <b style={{ color: C.amber }}>−{n0(h.out)}</b>{showBalance ? <> · baki <b>{n0(h.balance)}</b></> : null}</span>}
      </div>
    </div>
  );
}
const Legend = ({ color, label, line }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
    <span style={{ width: 12, height: line ? 2 : 10, borderRadius: 2, background: color, display: 'inline-block' }} />{label}
  </span>
);

// ─── Jumlah ikut jenis ────────────────────────────────────────────────────────
function KindTotals({ totals, unit, orders }) {
  return (
    <div className="stk-totals">
      {KIND_KEYS.map(k => (
        <div key={k} className="stk-kpi" style={{ padding: '.6rem .7rem' }}>
          <div style={{ fontSize: '.62rem', fontWeight: 800, color: KINDS[k].color, textTransform: 'uppercase', letterSpacing: '.04em' }}>{KINDS[k].short}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: 2 }}>{totals[k] ? signed(k, totals[k]) : '0'}</div>
          <div style={{ fontSize: '.62rem', color: C.dim }}>{k === 'keluar' && orders ? `${n0(orders)} order` : unit || ''}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Senarai aktiviti ─────────────────────────────────────────────────────────
function Ledger({ data, showBalance, showProduct = true, onEdit, onDelete, limit = 100, emptyText = 'Tiada pergerakan dalam tempoh ini.' }) {
  const [open, setOpen] = useState({});      // group id → { loading, rows }
  const [shown, setShown] = useState(limit);
  useEffect(() => { setOpen({}); setShown(limit); }, [data, limit]);
  const rows = data?.rows || [];
  if (!data) return <div style={{ padding: '2.2rem 1rem', textAlign: 'center', color: C.muted, fontSize: '.86rem' }}>Memuatkan…</div>;
  if (!rows.length) return <div style={{ padding: '2.2rem 1rem', textAlign: 'center', color: C.muted, fontSize: '.86rem' }}>{emptyText}</div>;

  const toggle = async r => {
    if (open[r.id]) { setOpen(o => { const n = { ...o }; delete n[r.id]; return n; }); return; }
    setOpen(o => ({ ...o, [r.id]: { loading: true, rows: [] } }));
    try {
      const j = await api(`/api/stock/activity?from=${r.date}&to=${r.date}&sku=${encodeURIComponent(r.sku)}&kinds=keluar&group=0`);
      setOpen(o => ({ ...o, [r.id]: { loading: false, rows: j.data.rows } }));
    } catch (e) { setOpen(o => ({ ...o, [r.id]: { loading: false, rows: [], error: e.message } })); }
  };
  const cls = showProduct ? `stk-row${showBalance ? '' : ' nob'}` : 'stk-row np';
  return (
    <div>
      <div className={`${cls} hd`}>
        <div>Tarikh</div>{showProduct && <div>Produk</div>}<div>Jenis</div><div style={{ textAlign: 'right' }}>Kuantiti</div><div>Butiran</div>{showBalance && <div style={{ textAlign: 'right' }}>Baki</div>}<div />
      </div>
      {rows.slice(0, shown).map(r => {
        const k = KINDS[r.kind] || KINDS.masuk;
        const detail = r.group ? `${n0(r.orders)} order · klik untuk lihat` : [r.customer, r.notes].filter(Boolean).join(' — ') || '—';
        return (
          <Fragment key={r.id}>
            <div className={`${cls}${r.group ? ' click' : ''}`} onClick={r.group ? () => toggle(r) : undefined}>
              <div className="c-date" style={{ color: C.muted, fontSize: '.78rem' }}>{r.group ? fmtDay(r.date) : fmtDate(r.at)}</div>
              {showProduct && <div className="c-prod stk-ell" style={{ fontWeight: 700 }}>{r.sku}<span className="stk-hide-m" style={{ color: C.dim, fontWeight: 500 }}> · {r.product}</span></div>}
              <div className="c-kind"><Pill kind={r.kind} /></div>
              <div className="c-qty" style={{ textAlign: 'right', fontWeight: 900, color: k.color }}>{signed(r.kind, r.qty)} <span style={{ fontSize: '.68rem', color: C.dim, fontWeight: 600 }}>{r.unit}</span></div>
              <div className="c-det stk-ell" style={{ color: C.muted, fontSize: '.78rem' }} title={detail}>
                {r.group && <span style={{ color: C.text, marginRight: 4 }}>{open[r.id] ? '▾' : '▸'}</span>}
                {detail}
                {r.cost_per_unit != null && r.kind === 'masuk' ? <span style={{ color: C.text }}> · {rm(r.cost_per_unit)}/{r.unit}</span> : null}
                {r.by ? <span style={{ color: C.dim }}> · {r.by}</span> : null}
              </div>
              {showBalance && <div className="c-bal" style={{ textAlign: 'right', fontWeight: 700, color: r.balance_after < 0 ? C.red : C.text }}>{r.balance_after == null ? '' : n0(r.balance_after)}</div>}
              <div className="c-act" style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                {r.manual && !r.group ? (
                  <>
                    {r.kind === 'masuk' && <button className="stk-btn stk-gho stk-sm" title="Edit" onClick={() => onEdit?.(r)}>✏️</button>}
                    <button className="stk-btn stk-gho stk-sm" title="Padam" onClick={() => onDelete?.(r)}>🗑</button>
                  </>
                ) : <span style={{ fontSize: '.62rem', color: C.dim }}>{r.group ? '' : 'Auto'}</span>}
              </div>
            </div>
            {open[r.id] && (
              <div className="stk-sub">
                {open[r.id].loading ? <div className="r">Memuatkan…</div> : open[r.id].error ? <div className="r" style={{ color: C.red }}>{open[r.id].error}</div>
                  : open[r.id].rows.map(s => (
                    <div className="r" key={s.id}>
                      <span>{fmtDate(s.at)}</span>
                      <span className="stk-ell" style={{ color: C.text }}>{s.customer || '—'} <span style={{ color: C.dim }}>· {s.notes}</span></span>
                      <span className="stk-hide-m">{s.payment === 'fpx_payment' ? 'FPX' : s.payment === 'cod' ? 'COD' : s.payment || ''}</span>
                      <span style={{ textAlign: 'right', color: C.amber, fontWeight: 800 }}>−{n0(s.qty)}</span>
                    </div>
                  ))}
              </div>
            )}
          </Fragment>
        );
      })}
      {rows.length > shown && (
        <div style={{ padding: '.9rem', textAlign: 'center' }}>
          <button className="stk-btn stk-gho stk-sm" onClick={() => setShown(s => s + 100)}>Tunjuk lagi ({n0(rows.length - shown)} baki)</button>
        </div>
      )}
    </div>
  );
}

// ─── Penapis tempoh ───────────────────────────────────────────────────────────
function PeriodPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <div className="stk-seg">
        {PRESETS.map(([k, l]) => (
          <button key={k} className={value.preset === k ? 'on' : ''} onClick={() => onChange(k === 'custom' ? { ...value, preset: 'custom' } : { preset: k, ...rangeOf(k) })}>{l}</button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
          <input type="date" className="stk-in" style={{ width: 150, padding: '.4rem .55rem', fontSize: '.8rem' }} value={value.from} max={value.to} onChange={e => e.target.value && onChange({ ...value, from: e.target.value })} />
          <span style={{ color: C.dim }}>–</span>
          <input type="date" className="stk-in" style={{ width: 150, padding: '.4rem .55rem', fontSize: '.8rem' }} value={value.to} min={value.from} onChange={e => e.target.value && onChange({ ...value, to: e.target.value })} />
        </div>
      )}
    </div>
  );
}

// ─── Borang: Stok Masuk ───────────────────────────────────────────────────────
function StockInModal({ products, initialId, onClose, onDone }) {
  const today = dayOf(new Date());
  const [f, setF] = useState({ product_id: initialId || products[0]?.id || '', qty: '', mode: 'breakdown', goods_total: '', postage: '', extra_per_unit: '', cost_per_unit: '', received_at: today, supplier: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const p = products.find(x => x.id === f.product_id);
  const qty = parseInt(f.qty, 10) || 0;
  const num = v => parseFloat(v) || 0;
  const unitCost = f.mode === 'breakdown'
    ? (qty ? Math.round(((num(f.goods_total) + num(f.postage)) / qty + num(f.extra_per_unit)) * 100) / 100 : 0)
    : Math.round(num(f.cost_per_unit) * 100) / 100;
  const total = f.mode === 'breakdown' ? num(f.goods_total) + num(f.postage) + num(f.extra_per_unit) * qty : unitCost * qty;

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const body = { product_id: f.product_id, qty, received_at: f.received_at, supplier: f.supplier, notes: f.notes };
      if (f.mode === 'breakdown') Object.assign(body, { goods_total: f.goods_total || '0', postage: f.postage, extra_per_unit: f.extra_per_unit });
      else body.cost_per_unit = f.cost_per_unit;
      await api('/api/stock/add', { method: 'POST', body });
      onDone(`Stok masuk direkod: +${n0(qty)} ${p?.unit || ''} ${p?.name || ''}`);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Stok Masuk" sub="Rekod batch baru dari pembekal. Kos seunit dikira automatik." onClose={onClose} width={560}>
      <form onSubmit={submit} style={{ display: 'grid', gap: '.9rem' }}>
        <div>
          <label className="stk-lb">Produk</label>
          <select className="stk-in" value={f.product_id} onChange={e => set('product_id', e.target.value)}>
            {products.map(x => <option key={x.id} value={x.id}>{x.name} ({x.sku}) — baki {n0(x.balance)}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div>
            <label className="stk-lb">Kuantiti ({p?.unit || 'unit'})</label>
            <input className="stk-in" type="number" min="1" inputMode="numeric" placeholder="cth 1000" value={f.qty} onChange={e => set('qty', e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="stk-lb">Tarikh terima</label>
            <input className="stk-in" type="date" max={today} value={f.received_at} onChange={e => set('received_at', e.target.value)} required />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.45rem', gap: '.5rem', flexWrap: 'wrap' }}>
            <span className="stk-lb" style={{ margin: 0 }}>Kos</span>
            <div className="stk-seg">
              <button type="button" className={f.mode === 'breakdown' ? 'on' : ''} onClick={() => set('mode', 'breakdown')}>Ikut jumlah bayar</button>
              <button type="button" className={f.mode === 'unit' ? 'on' : ''} onClick={() => set('mode', 'unit')}>Kos seunit terus</button>
            </div>
          </div>
          {f.mode === 'breakdown' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.6rem' }}>
              <div><label className="stk-lb">Harga barang (RM)</label><input className="stk-in" type="number" min="0" step="0.01" placeholder="2250" value={f.goods_total} onChange={e => set('goods_total', e.target.value)} required /></div>
              <div><label className="stk-lb">Pos / caj (RM)</label><input className="stk-in" type="number" min="0" step="0.01" placeholder="0" value={f.postage} onChange={e => set('postage', e.target.value)} /></div>
              <div><label className="stk-lb">Lain / {p?.unit || 'unit'} (RM)</label><input className="stk-in" type="number" min="0" step="0.01" placeholder="cth sticker 0.25" value={f.extra_per_unit} onChange={e => set('extra_per_unit', e.target.value)} /></div>
            </div>
          ) : (
            <input className="stk-in" type="number" min="0" step="0.01" placeholder="Kos seunit RM" value={f.cost_per_unit} onChange={e => set('cost_per_unit', e.target.value)} required />
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '.75rem .9rem' }}>
          <Mini label="Kos seunit" value={qty ? rm(unitCost) : '—'} />
          <Mini label="Jumlah batch" value={rm(total)} />
          <Mini label="Baki selepas" value={p ? `${n0(p.balance)} → ${n0(p.balance + qty)}` : '—'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div><label className="stk-lb">Pembekal / invois</label><input className="stk-in" placeholder="pilihan" value={f.supplier} onChange={e => set('supplier', e.target.value)} /></div>
          <div><label className="stk-lb">Nota</label><input className="stk-in" placeholder="pilihan" value={f.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        {err && <div style={{ color: 'var(--s-redtx)', fontSize: '.82rem' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
          <button type="button" className="stk-btn stk-gho" onClick={onClose}>Batal</button>
          <button type="submit" className="stk-btn stk-pri" disabled={busy || !qty}>{busy ? 'Menyimpan…' : `Rekod +${n0(qty)} ${p?.unit || ''}`}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Borang: Kiraan Fizikal ───────────────────────────────────────────────────
function CountModal({ products, onClose, onDone }) {
  const [counts, setCounts] = useState({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const filled = products.filter(p => counts[p.id] !== undefined && counts[p.id] !== '');
  const changes = filled.filter(p => parseInt(counts[p.id], 10) !== p.on_shelf);

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      const j = await api('/api/stock/count', { method: 'POST', body: { counts: filled.map(p => ({ product_id: p.id, counted: counts[p.id] })), note } });
      onDone(j.adjusted ? `Kiraan fizikal direkod: ${j.adjusted} produk diselaraskan` : 'Kiraan sepadan — tiada pelarasan');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal title="Kiraan Fizikal" sub="Isi jumlah sebenar di rak (termasuk barang untuk order yang belum dipack). Kosongkan produk yang tak dikira." onClose={onClose} width={640}>
      <div style={{ display: 'grid', gap: '.45rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 80px', gap: '.6rem', fontSize: '.64rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', padding: '0 .2rem' }}>
          <span>Produk</span><span style={{ textAlign: 'right' }}>Jangkaan</span><span>Dikira</span><span style={{ textAlign: 'right' }}>Beza</span>
        </div>
        {products.map(p => {
          const v = counts[p.id];
          const has = v !== undefined && v !== '';
          const diff = has ? (parseInt(v, 10) || 0) - p.on_shelf : null;
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 80px', gap: '.6rem', alignItems: 'center', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: '.5rem .65rem' }}>
              <div style={{ minWidth: 0 }}>
                <div className="stk-ell" style={{ fontWeight: 700, fontSize: '.84rem' }}>{p.name}</div>
                <div style={{ fontSize: '.66rem', color: C.dim }}>{p.sku} · baki {n0(p.balance)} + tunggu pack {n0(p.pending_hq)}</div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 800 }}>{n0(p.on_shelf)}</div>
              <input className="stk-in" type="number" min="0" inputMode="numeric" style={{ padding: '.45rem .55rem' }} value={v ?? ''} onChange={e => setCounts(c => ({ ...c, [p.id]: e.target.value }))} />
              <div style={{ textAlign: 'right', fontWeight: 900, color: diff == null ? C.dim : diff === 0 ? C.green2 : diff < 0 ? C.red : C.blue }}>{diff == null ? '—' : diff === 0 ? '✓' : `${diff > 0 ? '+' : ''}${n0(diff)}`}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '.9rem' }}>
        <label className="stk-lb">Nota (pilihan)</label>
        <input className="stk-in" placeholder="cth kiraan hujung bulan oleh …" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <p style={{ fontSize: '.74rem', color: C.muted, margin: '.75rem 0 0' }}>Beza direkod sebagai pelarasan (+/−) pada baki sistem. Kos purata tidak berubah.</p>
      {err && <div style={{ color: 'var(--s-redtx)', fontSize: '.82rem', marginTop: '.6rem' }}>{err}</div>}
      <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="stk-btn stk-gho" onClick={onClose}>Batal</button>
        <button className="stk-btn stk-pri" disabled={busy || !filled.length} onClick={submit}>{busy ? 'Menyimpan…' : changes.length ? `Selaraskan ${changes.length} produk` : 'Simpan kiraan'}</button>
      </div>
    </Modal>
  );
}

// ─── Borang: Edit stok masuk ──────────────────────────────────────────────────
function EditMovementModal({ row, onClose, onDone }) {
  const [f, setF] = useState({ qty: row.qty, cost_per_unit: row.cost_per_unit ?? '', notes: row.notes || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await api('/api/stock/movements', { method: 'PATCH', body: { id: row.id, qty: parseInt(f.qty, 10), cost_per_unit: Math.round(parseFloat(f.cost_per_unit || 0) * 100) / 100, notes: f.notes } });
      onDone('Rekod stok masuk dikemas kini');
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <Modal title="Edit stok masuk" sub={`${row.sku} · ${fmtDate(row.at)}`} onClose={onClose} width={460}>
      <form onSubmit={submit} style={{ display: 'grid', gap: '.8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
          <div><label className="stk-lb">Kuantiti</label><input className="stk-in" type="number" min="1" value={f.qty} onChange={e => setF(s => ({ ...s, qty: e.target.value }))} required /></div>
          <div><label className="stk-lb">Kos seunit (RM)</label><input className="stk-in" type="number" min="0" step="0.01" value={f.cost_per_unit} onChange={e => setF(s => ({ ...s, cost_per_unit: e.target.value }))} /></div>
        </div>
        <div><label className="stk-lb">Nota</label><input className="stk-in" value={f.notes} onChange={e => setF(s => ({ ...s, notes: e.target.value }))} /></div>
        {err && <div style={{ color: 'var(--s-redtx)', fontSize: '.82rem' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
          <button type="button" className="stk-btn stk-gho" onClick={onClose}>Batal</button>
          <button type="submit" className="stk-btn stk-pri" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Borang: Produk baru ──────────────────────────────────────────────────────
function ProductModal({ onClose, onDone }) {
  const [f, setF] = useState({ name: '', sku: '', unit: 'unit', selling_price: '', low_stock_threshold: '10' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('/api/stock/products', { method: 'POST', body: f }); onDone('Produk baru ditambah'); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <Modal title="Produk baru" sub="SKU bermula KTK- dikira sebagai packaging." onClose={onClose} width={500}>
      <form onSubmit={submit} style={{ display: 'grid', gap: '.8rem' }}>
        <div><label className="stk-lb">Nama produk</label><input className="stk-in" value={f.name} onChange={e => set('name', e.target.value)} required autoFocus /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
          <div><label className="stk-lb">SKU</label><input className="stk-in" value={f.sku} onChange={e => set('sku', e.target.value.toUpperCase())} required /></div>
          <div><label className="stk-lb">Unit</label><input className="stk-in" placeholder="unit / pek / botol" value={f.unit} onChange={e => set('unit', e.target.value)} /></div>
          <div><label className="stk-lb">Harga jual (RM)</label><input className="stk-in" type="number" min="0" step="0.01" value={f.selling_price} onChange={e => set('selling_price', e.target.value)} /></div>
          <div><label className="stk-lb">Amaran stok rendah</label><input className="stk-in" type="number" min="0" value={f.low_stock_threshold} onChange={e => set('low_stock_threshold', e.target.value)} /></div>
        </div>
        {err && <div style={{ color: 'var(--s-redtx)', fontSize: '.82rem' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
          <button type="button" className="stk-btn stk-gho" onClick={onClose}>Batal</button>
          <button type="submit" className="stk-btn stk-pri" disabled={busy}>{busy ? 'Menyimpan…' : 'Tambah produk'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Panel butiran produk ─────────────────────────────────────────────────────
function ProductDrawer({ product: p, onClose, onStockIn, onEdit, onDelete, onSaved, refreshKey, toast }) {
  const [period, setPeriod] = useState({ preset: '30d', ...rangeOf('30d') });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('aktiviti');
  const [form, setForm] = useState({ name: p.name, unit: p.unit, selling_price: p.selling_price, low_stock_threshold: p.low_stock_threshold });
  const [saving, setSaving] = useState(false);

  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    api(`/api/stock/activity?sku=${encodeURIComponent(p.sku)}&from=${period.from}&to=${period.to}`)
      .then(j => live && setData(j.data)).catch(e => live && toast(e.message, 'error')).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [p.sku, period.from, period.to, refreshKey, toast]);

  const save = async patch => {
    setSaving(true);
    try { await api('/api/stock/products', { method: 'PATCH', body: { id: p.id, ...patch } }); onSaved('Produk dikemas kini'); }
    catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };
  const st = STATUS[p.status];

  return (
    <div className="stk-drawer" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="stk-dpanel">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '.7rem', color: C.dim, fontWeight: 800 }}>{p.sku}{p.packaging ? ' · PACKAGING' : ''}{!p.is_active ? ' · TIDAK AKTIF' : ''}</div>
            <h2 style={{ margin: '.15rem 0 .35rem', fontSize: '1.25rem', fontWeight: 900 }}>{p.name}</h2>
            <span className="stk-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
            <button className="stk-btn stk-pri stk-sm" onClick={() => onStockIn(p.id)}>+ Stok masuk</button>
            <button onClick={onClose} aria-label="Tutup" style={{ background: 'none', border: 0, color: C.muted, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>

        <div className="stk-kpis" style={{ marginBottom: '1rem' }}>
          <div className="stk-kpi"><Mini label="Stok bebas" value={<span style={{ color: p.free < 0 ? C.red : C.green2, fontSize: '1.25rem' }}>{n0(p.free)}</span>} hint={p.unit} /></div>
          <div className="stk-kpi"><Mini label="Di rak (anggaran)" value={<span style={{ fontSize: '1.25rem' }}>{n0(p.on_shelf)}</span>} hint={`baki sistem ${n0(p.balance)}`} /></div>
          <div className="stk-kpi"><Mini label="Tunggu pack" value={<span style={{ fontSize: '1.25rem' }}>{n0(p.pending_hq + p.pending_fighter)}</span>} hint={`${n0(p.pending_hq_orders)} order HQ${p.pending_fighter ? ` · fighter ${n0(p.pending_fighter)}` : ''}`} /></div>
          <div className="stk-kpi"><Mini label="Cukup untuk" value={<span style={{ fontSize: '1.25rem' }}>{p.days_cover != null ? `${p.days_cover} hari` : '—'}</span>} hint={`keluar ${n0(p.out_per_day)}/hari (7 hari)`} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '.8rem' }}>
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>

        <div className="stk-card" style={{ padding: '1rem', marginBottom: '1rem', opacity: loading ? .55 : 1 }}>
          {data ? <DailyChart daily={data.daily} showBalance /> : <div style={{ height: 190 }} />}
        </div>
        {data && <div style={{ marginBottom: '1rem' }}><KindTotals totals={data.totals} unit={p.unit} orders={data.keluar_orders} /></div>}

        <div className="stk-seg" style={{ marginBottom: '.8rem' }}>
          {[['aktiviti', 'Aktiviti'], ['pembelian', 'Pembelian'], ['tetapan', 'Tetapan']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>

        {tab === 'aktiviti' && (
          <div className="stk-card" style={{ overflow: 'hidden', opacity: loading ? .55 : 1 }}>
            <Ledger data={data} showBalance showProduct={false} onEdit={onEdit} onDelete={onDelete} limit={60} />
          </div>
        )}

        {tab === 'pembelian' && (
          <div className="stk-card" style={{ overflow: 'hidden' }}>
            {!data?.batches?.length ? <div style={{ padding: '2rem', textAlign: 'center', color: C.muted }}>Tiada rekod stok masuk.</div> : (
              <table className="stk-ptable">
                <thead><tr><th>Tarikh</th><th>Kuantiti</th><th>Kos seunit</th><th>Jumlah</th></tr></thead>
                <tbody>
                  {data.batches.map(b => (
                    <Fragment key={b.id}>
                      <tr>
                        <td>{fmtDate(b.created_at)}</td>
                        <td style={{ fontWeight: 800, color: C.green2 }}>+{n0(b.qty)}</td>
                        <td>{b.cost_per_unit != null ? rm(b.cost_per_unit) : '—'}</td>
                        <td style={{ fontWeight: 700 }}>{rm(b.total)}</td>
                      </tr>
                      {b.notes && <tr><td colSpan={4} style={{ textAlign: 'left', color: C.dim, fontSize: '.74rem', paddingTop: 0 }}>{b.notes}</td></tr>}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'tetapan' && (
          <div className="stk-card" style={{ padding: '1.1rem', display: 'grid', gap: '.85rem' }}>
            <div><label className="stk-lb">Nama produk</label><input className="stk-in" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.7rem' }}>
              <div><label className="stk-lb">Unit</label><input className="stk-in" value={form.unit} onChange={e => setForm(s => ({ ...s, unit: e.target.value }))} /></div>
              <div><label className="stk-lb">Harga jual (RM)</label><input className="stk-in" type="number" min="0" step="0.01" value={form.selling_price} onChange={e => setForm(s => ({ ...s, selling_price: e.target.value }))} /></div>
              <div><label className="stk-lb">Amaran stok rendah</label><input className="stk-in" type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm(s => ({ ...s, low_stock_threshold: e.target.value }))} /></div>
            </div>
            <div style={{ fontSize: '.76rem', color: C.muted }}>Kos purata <b style={{ color: C.text }}>{rm(p.avg_cost)}</b> dikira automatik dari semua stok masuk (purata berwajaran).</div>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button className="stk-btn stk-gho" disabled={saving} onClick={() => save({ is_active: !p.is_active })} style={{ color: p.is_active ? 'var(--s-redtx)' : C.green2 }}>{p.is_active ? 'Nyahaktifkan produk' : 'Aktifkan produk'}</button>
              <button className="stk-btn stk-pri" disabled={saving} onClick={() => save({ name: form.name.trim(), unit: form.unit.trim() || 'unit', selling_price: parseFloat(form.selling_price) || 0, low_stock_threshold: parseInt(form.low_stock_threshold, 10) || 0 })}>{saving ? 'Menyimpan…' : 'Simpan tetapan'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function StokPage() {
  const [ov, setOv] = useState(null);
  const [ovErr, setOvErr] = useState('');
  const [act, setAct] = useState(null);
  const [actLoading, setActLoading] = useState(true);
  const [period, setPeriod] = useState({ preset: '7d', ...rangeOf('7d') });
  const [sku, setSku] = useState('');
  const [kinds, setKinds] = useState([]);
  const [q, setQ] = useState('');
  const [qLive, setQLive] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [drawer, setDrawer] = useState(null);       // product id
  const [modal, setModal] = useState(null);         // { type, ... }
  const [toastMsg, setToastMsg] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const toast = useCallback((msg, type = 'success') => setToastMsg({ msg, type }), []);

  const loadOverview = useCallback(async () => {
    try { const j = await api('/api/stock/overview'); setOv(j.data); setOvErr(''); }
    catch (e) { setOvErr(e.message); }
  }, []);
  useEffect(() => { loadOverview(); }, [loadOverview, refreshKey]);

  useEffect(() => { const t = setTimeout(() => setQ(qLive), 350); return () => clearTimeout(t); }, [qLive]);
  const actUrl = useMemo(() => {
    const p = new URLSearchParams({ from: period.from, to: period.to });
    if (sku) p.set('sku', sku);
    if (kinds.length) p.set('kinds', kinds.join(','));
    if (q) p.set('q', q);
    return `/api/stock/activity?${p}`;
  }, [period.from, period.to, sku, kinds, q]);
  useEffect(() => {
    let live = true;
    setActLoading(true);
    api(actUrl).then(j => live && setAct(j.data)).catch(e => live && toast(e.message, 'error')).finally(() => live && setActLoading(false));
    return () => { live = false; };
  }, [actUrl, refreshKey, toast]);

  const done = msg => { setModal(null); toast(msg); setRefreshKey(k => k + 1); };
  const del = async r => {
    if (!window.confirm(`Padam rekod ini?\n${KINDS[r.kind]?.label}: ${signed(r.kind, r.qty)} ${r.unit} ${r.sku}\n${r.notes || ''}`)) return;
    try { await api('/api/stock/movements', { method: 'DELETE', body: { id: r.id } }); done('Rekod dipadam'); }
    catch (e) { toast(e.message, 'error'); }
  };

  const all = ov?.products || [];
  const visible = all.filter(p => showInactive || p.is_active);
  const goods = visible.filter(p => !p.packaging), packs = visible.filter(p => p.packaging);
  const active = all.filter(p => p.is_active);
  const alerts = active.filter(p => p.status === 'oversold' || p.status === 'habis');
  const pendingOrders = active.filter(p => !p.packaging).reduce((t, p) => Math.max(t, p.pending_hq_orders), 0);
  const drawerProduct = drawer ? all.find(p => p.id === drawer) : null;
  const toggleKind = k => setKinds(ks => (ks.includes(k) ? ks.filter(x => x !== k) : [...ks, k]));

  return (
    <div className="stk">
      <style>{CSS}</style>
      {toastMsg && <Toast {...toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '.7rem', fontWeight: 800, color: C.green, textTransform: 'uppercase', letterSpacing: '.08em' }}>Pengurusan stok</div>
          <h1 style={{ margin: '.15rem 0 0', fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-.02em' }}>Stok Produk</h1>
          <div style={{ fontSize: '.78rem', color: C.muted, marginTop: '.2rem' }}>
            Stok ditolak automatik bila order masuk · {ov ? `dikemas kini ${new Date(ov.generated_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}` : 'memuatkan…'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="stk-btn stk-gho" onClick={() => setModal({ type: 'product' })}>+ Produk</button>
          <button className="stk-btn stk-gho" onClick={() => setModal({ type: 'count' })} disabled={!ov}>Kiraan fizikal</button>
          <button className="stk-btn stk-pri" onClick={() => setModal({ type: 'in' })} disabled={!ov}>+ Stok masuk</button>
        </div>
      </div>

      {ovErr && <div className="stk-card" style={{ padding: '1rem', color: 'var(--s-redtx)', marginBottom: '1rem' }}>Gagal memuatkan stok: {ovErr}</div>}

      {/* Amaran */}
      {alerts.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.35)', borderRadius: 12, padding: '.85rem 1.1rem', marginBottom: '1rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div style={{ fontSize: '.84rem', lineHeight: 1.5 }}>
            {alerts.map(p => (
              <div key={p.id}><b>{p.name}</b>: {p.status === 'oversold' ? <>order melebihi stok sebanyak <b style={{ color: 'var(--s-redtx)' }}>{n0(-p.free)} {p.unit}</b>. Order stok baru atau tahan iklan.</> : 'stok habis.'}</div>
            ))}
          </div>
        </div>
      )}

      {/* Ringkasan */}
      {ov && (
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div className="stk-kpi" style={{ flex: '1 1 160px' }}><Mini label="Nilai stok di rak" value={<span style={{ fontSize: '1.15rem' }}>{rm(ov.total_value)}</span>} hint="ikut kos purata" /></div>
          <div className="stk-kpi" style={{ flex: '1 1 160px' }}><Mini label="Order tunggu pack" value={<span style={{ fontSize: '1.15rem' }}>{n0(pendingOrders)}</span>} hint="belum diambil kurier" /></div>
          <div className="stk-kpi" style={{ flex: '1 1 160px' }}><Mini label="Perlu perhatian" value={<span style={{ fontSize: '1.15rem', color: active.some(p => p.status !== 'ok') ? C.amber : C.green2 }}>{active.filter(p => p.status !== 'ok').length} produk</span>} hint="rendah / habis / terlebih jual" /></div>
        </div>
      )}

      {/* Kad produk */}
      {!ov && !ovErr ? (
        <div className="stk-grid">{[0, 1, 2].map(i => <div key={i} className="stk-card" style={{ height: 190, opacity: .5 }} />)}</div>
      ) : (
        <>
          <div className="stk-grid">{goods.map(p => <ProductCard key={p.id} p={p} onOpen={x => setDrawer(x.id)} />)}</div>
          {packs.length > 0 && (
            <>
              <div style={{ fontSize: '.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', margin: '1.25rem 0 .6rem' }}>Packaging</div>
              <div className="stk-grid">{packs.map(p => <ProductCard key={p.id} p={p} onOpen={x => setDrawer(x.id)} />)}</div>
            </>
          )}
          {all.some(p => !p.is_active) && (
            <button className="stk-btn stk-gho stk-sm" style={{ marginTop: '.8rem' }} onClick={() => setShowInactive(s => !s)}>{showInactive ? 'Sorok produk tidak aktif' : `Tunjuk produk tidak aktif (${all.filter(p => !p.is_active).length})`}</button>
          )}
        </>
      )}
      <p style={{ fontSize: '.72rem', color: C.dim, margin: '.7rem 0 0' }}>
        <b>Bebas</b> = baki sistem tolak order fighter belum dipack. <b>Di rak</b> = baki + barang order yang belum diambil kurier (stok dah ditolak, barang masih ada).
      </p>

      {/* Aktiviti */}
      <div className="stk-card" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.1rem 1.1rem .9rem', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>Aktiviti stok</h2>
              <div style={{ fontSize: '.74rem', color: C.muted }}>Order keluar dihimpun ikut hari — klik untuk lihat setiap order</div>
            </div>
            <a className="stk-btn stk-gho stk-sm" href={`${actUrl}&format=csv`} style={{ textDecoration: 'none' }}>⬇ Export CSV</a>
          </div>
          <PeriodPicker value={period} onChange={setPeriod} />
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="stk-in" style={{ width: 'auto', minWidth: 190, maxWidth: '100%', padding: '.42rem .6rem', fontSize: '.8rem' }} value={sku} onChange={e => setSku(e.target.value)}>
              <option value="">Semua produk</option>
              {all.map(p => <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>)}
            </select>
            {KIND_KEYS.map(k => {
              const on = kinds.includes(k);
              return <button key={k} className="stk-chip" onClick={() => toggleKind(k)} style={on ? { color: KINDS[k].color, background: KINDS[k].bg, borderColor: KINDS[k].color } : undefined}>{KINDS[k].short}</button>;
            })}
            {kinds.length > 0 && <button className="stk-chip" onClick={() => setKinds([])}>× Semua jenis</button>}
            <input className="stk-in" style={{ flex: '1 1 180px', width: 'auto', padding: '.42rem .65rem', fontSize: '.8rem' }} placeholder="Cari nota, pembekal, tracking…" value={qLive} onChange={e => setQLive(e.target.value)} />
          </div>
        </div>

        {/* Ringkasan tempoh */}
        {act && (
          <div style={{ padding: '1rem 1.1rem', borderBottom: `1px solid ${C.border}`, opacity: actLoading ? .55 : 1 }}>
            {act.sku ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <KindTotals totals={act.totals} unit={all.find(p => p.sku === act.sku)?.unit} orders={act.keluar_orders} />
                <DailyChart daily={act.daily} showBalance />
              </div>
            ) : (
              <div className="stk-x">
                <table className="stk-ptable">
                  <thead><tr><th>Produk</th>{KIND_KEYS.map(k => <th key={k} style={{ color: KINDS[k].color }}>{KINDS[k].short}</th>)}<th>Bersih</th></tr></thead>
                  <tbody>
                    {act.by_product.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: C.muted }}>Tiada pergerakan.</td></tr>}
                    {act.by_product.sort((a, b) => (a.sku > b.sku ? 1 : -1)).map(r => {
                      const net = KIND_KEYS.reduce((t, k) => t + KINDS[k].sign * (r[k] || 0), 0);
                      return (
                        <tr key={r.sku} className="click" onClick={() => setSku(r.sku)} title="Tapis produk ini">
                          <td><b>{r.sku}</b> <span className="stk-hide-m" style={{ color: C.dim }}>{r.name}</span></td>
                          {KIND_KEYS.map(k => <td key={k} style={{ color: r[k] ? KINDS[k].color : C.dim, fontWeight: r[k] ? 800 : 400 }}>{r[k] ? signed(k, r[k]) : '–'}</td>)}
                          <td style={{ fontWeight: 900, color: net < 0 ? C.amber : C.green2 }}>{net > 0 ? '+' : ''}{n0(net)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div style={{ opacity: actLoading ? .55 : 1, transition: 'opacity .15s' }}>
          {!act && actLoading ? <div style={{ padding: '2rem', textAlign: 'center', color: C.muted }}>Memuatkan aktiviti…</div>
            : <Ledger data={act} showBalance={!!act?.sku} onEdit={r => setModal({ type: 'edit', row: r })} onDelete={del} />}
        </div>
      </div>

      {/* Panel & borang */}
      {drawerProduct && (
        <ProductDrawer
          key={drawerProduct.id}
          product={drawerProduct}
          refreshKey={refreshKey}
          toast={toast}
          onClose={() => setDrawer(null)}
          onStockIn={id => setModal({ type: 'in', productId: id })}
          onEdit={r => setModal({ type: 'edit', row: r })}
          onDelete={del}
          onSaved={msg => { toast(msg); setRefreshKey(k => k + 1); }}
        />
      )}
      {modal?.type === 'in' && <StockInModal products={active} initialId={modal.productId} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'count' && <CountModal products={active} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'edit' && <EditMovementModal row={modal.row} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'product' && <ProductModal onClose={() => setModal(null)} onDone={done} />}
    </div>
  );
}
