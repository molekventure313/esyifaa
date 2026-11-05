'use client';
// Ads Hub — dashboard prestasi iklan Meta (ROAS dari order sebenar) + tetapan sambungan Meta.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRODUCTS, DIGITAL_AD } from '@/lib/products';

const AD_PRODUCTS = [...PRODUCTS, DIGITAL_AD];

const PERIODS = [
  { id: 'today', label: 'Hari Ini' },
  { id: 'yesterday', label: 'Semalam' },
  { id: '7d', label: '7 Hari' },
  { id: 'month', label: 'Bulan Ini' },
  { id: 'last_month', label: 'Bulan Lepas' },
];

const STATUS = {
  ACTIVE:          { label: 'Berjalan',     dot: '#10B981' },
  PAUSED:          { label: 'Dipause',      dot: '#94A3B8' },
  ADSET_PAUSED:    { label: 'Adset off',    dot: '#94A3B8' },
  CAMPAIGN_PAUSED: { label: 'Kempen off',   dot: '#94A3B8' },
  DISAPPROVED:     { label: 'Ditolak',      dot: '#EF4444' },
  WITH_ISSUES:     { label: 'Ada isu',      dot: '#F59E0B' },
  PENDING_REVIEW:  { label: 'Semakan Meta', dot: '#F59E0B' },
  IN_PROCESS:      { label: 'Diproses',     dot: '#F59E0B' },
  ARCHIVED:        { label: 'Arkib',        dot: '#64748B' },
};

export const rm = v => (v == null ? '—' : `RM ${Number(v).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const rm0 = v => (v == null ? '—' : `RM${Math.round(v).toLocaleString('ms-MY')}`);
const x2 = v => (v == null ? '—' : `${Number(v).toFixed(2)}`);
const pct = v => (v == null ? '—' : `${Number(v).toFixed(2)}%`);

export function ago(iso) {
  if (!iso) return 'belum pernah';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'baru tadi';
  if (m < 60) return `${m} minit lalu`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} jam lalu` : `${Math.round(h / 24)} hari lalu`;
}

export function useLightMode() {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(
      document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light'
    );
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return lm;
}

export function theme(lm) {
  return {
    lm,
    cardBg: lm ? '#FFFFFF' : '#10131A',
    border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
    rowBorder: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
    headBg: lm ? '#F8FAFC' : '#090A0F',
    text: lm ? '#0F172A' : '#F9FAFB',
    text2: lm ? '#475569' : '#9CA3AF',
    muted: lm ? '#64748B' : '#6B7280',
    accent: lm ? '#047857' : '#34D399',
    accentBg: lm ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)',
    good: lm ? '#047857' : '#34D399',
    warn: lm ? '#B45309' : '#FBBF24',
    bad: lm ? '#B91C1C' : '#F87171',
    ff: 'var(--font-inter), -apple-system, sans-serif',
  };
}

const roasColor = (t, v) => (v == null ? t.muted : v >= 2 ? t.good : v >= 1 ? t.warn : t.bad);
// ROI (profit lepas ads ÷ kos ads): ≥1 bagus, 0–1 untung nipis, <0 rugi
const roiColor = (t, v) => (v == null ? t.muted : v >= 1 ? t.good : v >= 0 ? t.warn : t.bad);
const profitColor = (t, v) => (v == null ? t.muted : v >= 0 ? t.good : t.bad);

export function Spinner({ t, text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ width: 32, height: 32, borderStyle: 'solid', borderWidth: 3, borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{'@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'}</style>
      <span style={{ color: t.text2, fontSize: '0.85rem' }}>{text}</span>
    </div>
  );
}

export function Card({ t, title, sub, right, children, pad = true }) {
  return (
    <div style={{ background: t.cardBg, border: t.border, borderRadius: 10, marginBottom: '1.5rem', overflow: 'hidden', boxShadow: t.lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
      {(title || right) && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{title}</div>
            {sub && <div style={{ fontSize: '0.72rem', color: t.muted, marginTop: '0.1rem' }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={pad ? { padding: '1rem 1.25rem' } : undefined}>{children}</div>
    </div>
  );
}

function StatusPill({ t, status }) {
  const s = STATUS[status] || { label: status || '—', dot: '#94A3B8' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, color: status === 'ACTIVE' ? t.good : t.text2, whiteSpace: 'nowrap' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flex: '0 0 8px' }} />{s.label}
    </span>
  );
}

export function RoasChip({ t, v }) {
  const c = roasColor(t, v);
  return (
    <span style={{ display: 'inline-block', minWidth: 44, textAlign: 'center', padding: '2px 8px', borderRadius: 999, fontWeight: 800, fontSize: '0.78rem', color: c, border: `1px solid ${c}`, fontVariantNumeric: 'tabular-nums' }}>
      {x2(v)}
    </span>
  );
}

// Trend harian: bar belanja (kelabu) vs jualan sebenar (hijau)
function TrendChart({ t, daily }) {
  const W = 760, H = 220, P = { l: 52, r: 12, t: 16, b: 34 };
  const max = Math.max(1, ...daily.map(d => Math.max(d.spend, d.revenue)));
  const step = (W - P.l - P.r) / daily.length;
  const bw = Math.max(3, Math.min(18, step / 2 - 3));
  const y = v => P.t + (H - P.t - P.b) * (1 - v / max);
  const ticks = [0, 0.5, 1].map(f => f * max);
  const labelEvery = Math.ceil(daily.length / 10);
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 520, height: 'auto', display: 'block' }} role="img" aria-label="Trend belanja dan jualan harian">
        {ticks.map(v => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke={t.lm ? '#E2E8F0' : 'rgba(255,255,255,0.06)'} />
            <text x={P.l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill={t.muted}>{rm0(v)}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const cx = P.l + step * i + step / 2;
          return (
            <g key={d.date}>
              <title>{`${d.date} · Belanja ${rm(d.spend)} · Jualan ${rm(d.revenue)} · ${d.orders} order · ROAS ${x2(d.roas)}`}</title>
              <rect x={cx - bw - 1} y={y(d.spend)} width={bw} height={Math.max(0, H - P.b - y(d.spend))} rx="2" fill={t.lm ? '#CBD5E1' : '#475569'} />
              <rect x={cx + 1} y={y(d.revenue)} width={bw} height={Math.max(0, H - P.b - y(d.revenue))} rx="2" fill="#10B981" />
              {i % labelEvery === 0 && (
                <text x={cx} y={H - P.b + 14} textAnchor="middle" fontSize="10" fill={t.muted}>{d.date.slice(8)}/{d.date.slice(5, 7)}</text>
              )}
              {d.roas != null && daily.length <= 14 && (
                <text x={cx} y={H - 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={roasColor(t, d.roas)}>{x2(d.roas)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: t.text2, marginTop: '0.4rem', flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: t.lm ? '#CBD5E1' : '#475569', marginRight: 6 }} />Belanja</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#10B981', marginRight: 6 }} />Jualan sebenar</span>
        {daily.length <= 14 && <span>Nombor bawah = ROAS hari itu</span>}
      </div>
    </div>
  );
}

function AngleCell({ t, row, canEdit, onSaved, marketerId }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(row.angle_custom ? row.angle : '');
  const [busy, setBusy] = useState(false);
  if (!editing) {
    return (
      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <span style={{ color: row.angle_custom ? t.text : t.text2 }}>{row.angle}</span>
        {canEdit && (
          <button onClick={() => setEditing(true)} title="Tukar angle" style={{ border: 'none', background: 'none', cursor: 'pointer', color: t.muted, fontSize: '0.75rem', padding: 0 }}>✎</button>
        )}
      </span>
    );
  }
  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/ads-hub/ads/${row.ad_id}${marketerId ? `?marketer=${marketerId}` : ''}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ angle: val }) });
    setBusy(false);
    if (res.ok) { setEditing(false); onSaved(); }
  };
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <input id={`angle-${row.ad_id}`} value={val} onChange={e => setVal(e.target.value)} placeholder={row.adset_name || 'Angle'} maxLength={60}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }} autoFocus
        style={{ width: 130, padding: '3px 6px', borderRadius: 5, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.78rem' }} />
      <button onClick={save} disabled={busy} style={{ border: 'none', background: '#10B981', color: '#fff', borderRadius: 5, padding: '0 8px', cursor: 'pointer', fontSize: '0.75rem' }}>✓</button>
    </span>
  );
}

export function AdsHubDashboard({ marketerId, canEdit, onOpenSettings }) {
  const t = theme(useLightMode());
  const [period, setPeriod] = useState('7d');
  const [product, setProduct] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState({ col: 'spend', dir: 'desc' });

  const qs = `${marketerId ? `&marketer=${marketerId}` : ''}${product ? `&product=${product}` : ''}`;
  const load = useCallback(async (quiet) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const json = await fetch(`/api/ads-hub/overview?period=${period}${qs}`).then(r => r.json());
      if (json.success) setData(json); else setError(json.error || 'Gagal muatkan data.');
    } catch (_) { setError('Gagal muatkan data.'); }
    finally { setLoading(false); }
  }, [period, qs]);
  useEffect(() => { load(); }, [load]);

  const syncNow = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const json = await fetch(`/api/ads-hub/sync${marketerId ? `?marketer=${marketerId}` : ''}`, { method: 'POST' }).then(r => r.json());
      setSyncMsg(json.skipped ? 'Data baru sahaja disync. Cuba lagi dalam 2 minit.' : json.success ? `Sync siap: ${json.ads} ads.` : (json.error || 'Sync gagal.'));
      await load(true);
    } finally { setSyncing(false); }
  };

  const [tagging, setTagging] = useState(false);
  const tagAngles = async () => {
    setTagging(true); setSyncMsg('');
    try {
      const json = await fetch(`/api/ads-hub/ads/suggest-angles${marketerId ? `?marketer=${marketerId}` : ''}`, { method: 'POST' }).then(r => r.json());
      setSyncMsg(json.success ? `${json.tagged} ads ditag oleh AI. Klik ✎ pada ad untuk ubah.` : (json.error || 'Gagal tag angle.'));
      await load(true);
    } finally { setTagging(false); }
  };

  const rows = useMemo(() => {
    const list = (data?.ads || []).filter(r => showAll || r.running);
    const { col, dir } = sort;
    return [...list].sort((a, b) => {
      const av = a[col], bv = b[col];
      if (typeof av === 'string' || typeof bv === 'string') return dir === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
      return dir === 'asc' ? (av ?? -1) - (bv ?? -1) : (bv ?? -1) - (av ?? -1);
    });
  }, [data, showAll, sort]);

  if (loading && !data) return <Spinner t={t} text="Memuatkan Ads Hub..." />;
  if (error && !data) return <div style={{ padding: '2rem', textAlign: 'center', color: t.bad }}>{error}</div>;
  if (!data?.connection) {
    return (
      <Card t={t}>
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: t.text2 }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔌</div>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: '0.3rem' }}>Akaun Meta belum disambung</div>
          <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Sambung akaun Meta untuk lihat prestasi ads dengan ROAS dari order sebenar.</div>
          {onOpenSettings && <button onClick={onOpenSettings} style={btn(t, true)}>Buka Tetapan</button>}
        </div>
      </Card>
    );
  }

  const s = data.summary;
  const c = data.connection;
  const SortTh = ({ col, label, align = 'right' }) => (
    <th onClick={() => setSort(p => ({ col, dir: p.col === col && p.dir === 'desc' ? 'asc' : 'desc' }))} style={{ ...th(t), textAlign: align, cursor: 'pointer', color: sort.col === col ? t.accent : t.text2 }}>
      {label} {sort.col === col ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      {/* Bar atas: akaun, sync, tempoh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ display: 'inline-flex', background: t.lm ? '#F1F5F9' : '#090A0F', padding: 3, borderRadius: 8, border: t.border, flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{
              padding: '0.4rem 0.85rem', borderRadius: 5, fontSize: '0.78rem', fontWeight: period === p.id ? 700 : 500, border: 'none', cursor: 'pointer', fontFamily: t.ff,
              background: period === p.id ? (t.lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: period === p.id ? t.accent : t.text2,
            }}>{p.label}</button>
          ))}
        </div>
        <select id="ads-hub-product" value={product} onChange={e => setProduct(e.target.value)} title="Produk ikut tetapan kempen dalam kad Ads Spend (Tetapan)"
          style={{ padding: '0.42rem 0.7rem', borderRadius: 8, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.8rem', fontFamily: t.ff }}>
          <option value="">Semua produk</option>
          {AD_PRODUCTS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: t.text2, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <span><b style={{ color: t.text }}>{c.ad_account_name || c.ad_account_id}</b> · sync {ago(c.last_synced_at)}</span>
          <button onClick={syncNow} disabled={syncing} style={btn(t)}>{syncing ? 'Sync...' : '🔄 Sync sekarang'}</button>
        </div>
      </div>
      {syncMsg && <div style={{ fontSize: '0.78rem', color: t.text2, marginTop: '-0.75rem', marginBottom: '1rem' }}>{syncMsg}</div>}

      {c.status === 'error' && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 8, border: `1px solid ${t.bad}`, color: t.bad, background: t.lm ? '#FEF2F2' : 'rgba(239,68,68,0.08)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          ⚠️ {c.status_message || 'Sambungan Meta bermasalah.'} {onOpenSettings && <button onClick={onOpenSettings} style={{ ...btn(t), marginLeft: 8 }}>Buka Tetapan</button>}
        </div>
      )}

      {/* Kad ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '0.6rem' }}>
        {[
          { label: 'Belanja', val: rm(s.spend) },
          { label: 'Order', val: s.orders },
          { label: 'Jualan', val: rm(s.revenue), color: t.accent },
          { label: 'ROAS sebenar', val: x2(s.roas), color: roasColor(t, s.roas), hl: true },
          { label: 'Profit lepas ads', val: rm(s.profit), color: profitColor(t, s.profit), hl: true },
          { label: 'ROI', val: x2(s.roi), color: roiColor(t, s.roi), hl: true },
          { label: 'CPA', val: rm(s.cpa) },
          { label: 'Purata order', val: rm(s.aov) },
          { label: 'Ads berjalan', val: s.running_ads },
        ].map(k => (
          <div key={k.label} style={{ background: k.hl ? t.accentBg : t.cardBg, border: k.hl ? '1px solid rgba(16,185,129,0.3)' : t.border, borderRadius: 10, padding: '0.95rem 1.1rem' }}>
            <div style={{ fontSize: '0.63rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>{k.label}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: k.color || t.text, letterSpacing: '-0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{k.val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.74rem', color: t.muted, marginBottom: '1.5rem' }}>
        Kad di atas kira SEMUA order dalam sistem (termasuk organik, WhatsApp & tiada UTM), bukan pixel.
        Profit lepas ads = jualan {rm(s.revenue)} − kos produk & postage {rm(s.cogs)} − kos ads {rm(s.ads_cost)} (belanja + SST 8%). ROI = profit lepas ads ÷ kos ads.<br />
        Dipadankan terus dengan ad (UTM): {s.ad_orders} order, {rm(s.ad_revenue)}, ROAS {x2(s.ad_roas)}, ROI {x2(s.ad_roi)} · tidak dipadankan: {s.unmatched_orders} order ({rm(s.unmatched_revenue)}). Jadual kempen, angle & ads di bawah guna order yang dipadankan sahaja.<br />
        ROAS pixel: {x2(s.pixel_roas)} ({s.pixel_purchases} purchase pixel).
      </div>

      {data.daily.length > 1 && (
        <Card t={t} title="Trend harian" sub={`${data.from} hingga ${data.to} · jualan = semua order sebenar dalam sistem`}>
          <TrendChart t={t} daily={data.daily} />
        </Card>
      )}

      <Card t={t} title="Prestasi ikut kempen" sub="Jualan & profit dari order sebenar yang dipadankan dengan ad dalam kempen" pad={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead><tr style={{ background: t.headBg }}>
              {['Kempen', 'Ads', 'Belanja', 'Order', 'Jualan', 'ROAS', 'Profit lepas ads', 'ROI', 'CPA'].map((h, i) => <th key={h} style={{ ...th(t), textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(data.campaigns || []).map(c => (
                <tr key={c.campaign_id} style={{ borderBottom: t.rowBorder }}>
                  <td style={td(t, 'left')}><b>{c.campaign_name}</b></td>
                  <td style={td(t)}>{c.ads}{c.running ? <span style={{ color: t.good }}> ({c.running} 🟢)</span> : ''}</td>
                  <td style={td(t)}>{rm(c.spend)}</td>
                  <td style={td(t)}>{c.orders}</td>
                  <td style={{ ...td(t), color: t.accent, fontWeight: 700 }}>{rm(c.revenue)}</td>
                  <td style={td(t)}><RoasChip t={t} v={c.roas} /></td>
                  <td style={{ ...td(t), color: profitColor(t, c.profit), fontWeight: 700 }}>{rm(c.profit)}</td>
                  <td style={{ ...td(t), color: roiColor(t, c.roi), fontWeight: 700 }}>{x2(c.roi)}</td>
                  <td style={td(t)}>{rm(c.cpa)}</td>
                </tr>
              ))}
              {!(data.campaigns || []).length && <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: t.muted }}>Tiada data untuk tempoh ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card t={t} title="Prestasi ikut angle" sub="Angle = tag anda pada ad, atau nama adset jika belum ditag" pad={false}
        right={canEdit && (
          <button onClick={tagAngles} disabled={tagging} style={btn(t)} title="AI tag angle bagi ads yang belum ditag">
            {tagging ? 'AI sedang tag...' : '🏷 Tag angle (AI)'}
          </button>
        )}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead><tr style={{ background: t.headBg }}>
              {['Angle', 'Ads', 'Belanja', 'Order', 'Jualan', 'ROAS', 'Profit lepas ads', 'ROI', 'CPA', 'Purata order'].map((h, i) => <th key={h} style={{ ...th(t), textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {data.angles.map(a => (
                <tr key={a.angle} style={{ borderBottom: t.rowBorder }}>
                  <td style={td(t, 'left')}><b>{a.angle}</b></td>
                  <td style={td(t)}>{a.ads}{a.running ? <span style={{ color: t.good }}> ({a.running} 🟢)</span> : ''}</td>
                  <td style={td(t)}>{rm(a.spend)}</td>
                  <td style={td(t)}>{a.orders}</td>
                  <td style={{ ...td(t), color: t.accent, fontWeight: 700 }}>{rm(a.revenue)}</td>
                  <td style={td(t)}><RoasChip t={t} v={a.roas} /></td>
                  <td style={{ ...td(t), color: profitColor(t, a.profit), fontWeight: 700 }}>{rm(a.profit)}</td>
                  <td style={{ ...td(t), color: roiColor(t, a.roi), fontWeight: 700 }}>{x2(a.roi)}</td>
                  <td style={td(t)}>{rm(a.cpa)}</td>
                  <td style={td(t)}>{rm(a.aov)}</td>
                </tr>
              ))}
              {!data.angles.length && <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: t.muted }}>Tiada data untuk tempoh ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card t={t} pad={false} title="Ads" sub={`${rows.length} ads · klik tajuk lajur untuk susun`}
        right={(
          <button onClick={() => setShowAll(v => !v)} style={btn(t, showAll)}>
            {showAll ? 'Semua ads (termasuk off)' : '🟢 Sedang berjalan sahaja'}
          </button>
        )}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead><tr style={{ background: t.headBg }}>
              <SortTh col="status" label="Status" align="left" />
              <SortTh col="name" label="Ad" align="left" />
              <SortTh col="angle" label="Angle" align="left" />
              <SortTh col="daily_budget" label="Budget/hari" />
              <SortTh col="spend" label="Belanja" />
              <SortTh col="orders" label="Order" />
              <SortTh col="revenue" label="Jualan" />
              <SortTh col="roas" label="ROAS" />
              <SortTh col="profit" label="Profit lepas ads" />
              <SortTh col="roi" label="ROI" />
              <SortTh col="cpa" label="CPA" />
              <SortTh col="ctr" label="CTR link" />
              <SortTh col="cpm" label="CPM" />
              <SortTh col="pixel_roas" label="ROAS pixel" />
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.ad_id} style={{ borderBottom: t.rowBorder, opacity: r.running ? 1 : 0.75 }}>
                  <td style={td(t, 'left')}><StatusPill t={t} status={r.status} /></td>
                  <td style={{ ...td(t, 'left'), minWidth: 220 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {r.thumbnail_url
                        ? <img src={r.thumbnail_url} alt="" width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover', flex: '0 0 40px' }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 6, background: t.headBg, flex: '0 0 40px' }} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: t.text }}>{r.name}</div>
                        {r.headline && <div style={{ color: t.text2, fontSize: '0.74rem' }}>“{r.headline}”</div>}
                        <div style={{ color: t.muted, fontSize: '0.7rem' }}>{r.campaign_name} › {r.adset_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td(t, 'left')}><AngleCell t={t} row={r} canEdit={canEdit} marketerId={marketerId} onSaved={() => load(true)} /></td>
                  <td style={td(t)}>{r.daily_budget != null ? rm0(r.daily_budget) : '—'}</td>
                  <td style={td(t)}>{rm(r.spend)}</td>
                  <td style={td(t)}>{r.orders}</td>
                  <td style={{ ...td(t), color: t.accent, fontWeight: 700 }}>{rm(r.revenue)}</td>
                  <td style={td(t)}><RoasChip t={t} v={r.roas} /></td>
                  <td style={{ ...td(t), color: profitColor(t, r.profit), fontWeight: 700 }}>{rm(r.profit)}</td>
                  <td style={{ ...td(t), color: roiColor(t, r.roi), fontWeight: 700 }}>{x2(r.roi)}</td>
                  <td style={td(t)}>{rm(r.cpa)}</td>
                  <td style={td(t)}>{pct(r.ctr)}</td>
                  <td style={td(t)}>{rm(r.cpm)}</td>
                  <td style={{ ...td(t), color: t.text2 }}>{x2(r.pixel_roas)}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={14} style={{ padding: '2.5rem', textAlign: 'center', color: t.muted }}>
                  {showAll ? 'Tiada ads dengan belanja dalam tempoh ini.' : 'Tiada ads sedang berjalan. Tekan butang di atas untuk lihat semua.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export const th = t => ({ padding: '0.65rem 0.9rem', fontSize: '0.66rem', fontWeight: 700, color: t.text2, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', userSelect: 'none' });
export const td = (t, align = 'right') => ({ padding: '0.65rem 0.9rem', textAlign: align, whiteSpace: align === 'right' ? 'nowrap' : 'normal', fontVariantNumeric: 'tabular-nums', color: t.text, verticalAlign: 'middle' });
export const btn = (t, primary) => ({
  padding: '0.42rem 0.9rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: t.ff,
  border: primary ? '1px solid #10B981' : t.border, background: primary ? '#10B981' : t.cardBg, color: primary ? '#fff' : t.text2,
});

const GUIDE = [
  ['Create App', 'developers.facebook.com → My Apps → Create App → use case Other → jenis Business → sambung ke Business Manager anda. Tambah produk Marketing API.'],
  ['System User', 'business.facebook.com → Business Settings → Users → System Users → Add → nama "claude" → role Admin.'],
  ['Assign Assets', 'Pada system user itu → Assign Assets: Ad Account anda (Full control), Page yang dipakai pada iklan (Full control) dan app tadi.'],
  ['Generate Token', 'Generate New Token → pilih app → Token expiration: Never → tanda ads_management, ads_read, business_management, pages_show_list, pages_read_engagement.'],
  ['Tampal di sini', 'Salin token (hanya dipaparkan sekali) dan tampal dalam kotak di bawah. Token disulitkan dan tidak dipaparkan semula.'],
];

export function AdsHubSettings({ marketerId, onChanged }) {
  const t = theme(useLightMode());
  const [conn, setConn] = useState(undefined);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [token, setToken] = useState('');
  const [info, setInfo] = useState(null);
  const [account, setAccount] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const mq = marketerId ? `?marketer=${marketerId}` : '';

  const load = useCallback(async () => {
    const json = await fetch(`/api/ads-hub/connection${mq}`).then(r => r.json()).catch(() => ({}));
    if (json.success) { setConn(json.connection); setEditing(!json.connection); } else { setError(json.error || 'Gagal muatkan tetapan.'); setConn(null); }
  }, [mq]);
  useEffect(() => { load(); }, [load]);

  const post = body => fetch(`/api/ads-hub/connection${mq}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

  const test = async () => {
    setBusy('test'); setError(''); setInfo(null); setMsg('');
    const json = await post({ action: 'test', token });
    setBusy('');
    if (!json.success) return setError(json.error);
    setInfo(json);
    const active = json.ad_accounts.filter(a => a.active);
    setAccount((conn && json.ad_accounts.some(a => a.id === conn.ad_account_id) ? conn.ad_account_id : (active[0] || json.ad_accounts[0]).id));
  };

  const save = async () => {
    setBusy('save'); setError(''); setMsg('');
    const json = await post({ action: 'save', token, ad_account_id: account });
    setBusy('');
    if (!json.success) return setError(json.error);
    setConn(json.connection); setEditing(false); setToken(''); setInfo(null);
    setMsg(json.sync?.ok ? `Disambung. ${json.sync.ads} ads dan ${json.sync.insight_rows} rekod prestasi (35 hari) disync.` : `Disambung, tetapi sync pertama gagal: ${json.sync?.error}`);
    onChanged?.();
  };

  const disconnect = async () => {
    setBusy('delete');
    const json = await fetch(`/api/ads-hub/connection${mq}`, { method: 'DELETE' }).then(r => r.json());
    setBusy(''); setConfirmDisconnect(false);
    if (!json.success) return setError(json.error);
    setConn(null); setEditing(true); setMsg('Sambungan diputuskan dan data cache dibuang.');
    onChanged?.();
  };

  if (conn === undefined) return <Spinner t={t} text="Memuatkan tetapan..." />;

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 820 }}>
      {msg && <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: t.accentBg, border: '1px solid rgba(16,185,129,0.3)', color: t.accent, fontSize: '0.82rem', marginBottom: '1rem' }}>{msg}</div>}
      {error && <div style={{ padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${t.bad}`, color: t.bad, fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</div>}

      {conn && (
        <Card t={t} title="Sambungan Meta" sub="Satu ad account bagi setiap marketer">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem', fontSize: '0.84rem' }}>
            {[
              ['Ad account', `${conn.ad_account_name || '—'} (${conn.ad_account_id})`],
              conn.token_last4 ? ['Token', `EAA••••${conn.token_last4}`] : ['Sambungan', 'MCP Meta Ads (data dihantar oleh Claude)'],
              ['Status', conn.status === 'ok' ? '✅ Berfungsi' : `⚠️ ${conn.status_message || 'Bermasalah'}`],
              ['Sync terakhir', ago(conn.last_synced_at)],
            ].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: '0.66rem', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{k}</div><div style={{ marginTop: 3 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {!editing && <button onClick={() => setEditing(true)} style={btn(t)}>Tukar token / ad account</button>}
            {!confirmDisconnect
              ? <button onClick={() => setConfirmDisconnect(true)} style={{ ...btn(t), color: t.bad }}>Putuskan sambungan</button>
              : (
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: t.bad }}>
                  Buang sambungan & data cache?
                  <button onClick={disconnect} disabled={busy === 'delete'} style={{ ...btn(t), color: '#fff', background: t.bad, border: 'none' }}>Ya, putuskan</button>
                  <button onClick={() => setConfirmDisconnect(false)} style={btn(t)}>Batal</button>
                </span>
              )}
          </div>
        </Card>
      )}

      {editing && (
        <Card t={t} title={conn ? 'Tukar token / ad account' : 'Sambung akaun Meta'} sub="Token System User dari Business Manager anda sendiri">
          <ol style={{ margin: '0 0 1rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: t.text2 }}>
            {GUIDE.map(([k, v]) => <li key={k}><b style={{ color: t.text }}>{k}.</b> {v}</li>)}
          </ol>
          <label htmlFor="ads-hub-token" style={{ fontSize: '0.72rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Token System User</label>
          <textarea id="ads-hub-token" value={token} onChange={e => { setToken(e.target.value); setInfo(null); }} rows={3} placeholder="EAA..." autoComplete="off" spellCheck={false}
            style={{ width: '100%', marginTop: 6, padding: '0.6rem 0.75rem', borderRadius: 8, border: t.border, background: t.headBg, color: t.text, fontFamily: 'monospace', fontSize: '0.78rem', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={test} disabled={!token.trim() || busy === 'test'} style={btn(t, true)}>{busy === 'test' ? 'Menyemak...' : 'Uji sambungan'}</button>
            {conn && <button onClick={() => { setEditing(false); setInfo(null); setToken(''); setError(''); }} style={btn(t)}>Batal</button>}
          </div>

          {info && (
            <div style={{ marginTop: '1.1rem', paddingTop: '1rem', borderTop: t.border }}>
              <div style={{ fontSize: '0.82rem', color: t.accent, marginBottom: '0.75rem' }}>✅ Token sah · System user: <b>{info.system_user}</b></div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Pilih ad account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {info.ad_accounts.map(a => (
                  <label key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0.55rem 0.75rem', borderRadius: 8, border: account === a.id ? '1px solid #10B981' : t.border, cursor: 'pointer', fontSize: '0.84rem' }}>
                    <input type="radio" name="ads-hub-account" id={`acct-${a.id}`} checked={account === a.id} onChange={() => setAccount(a.id)} />
                    <span><b>{a.name}</b> <span style={{ color: t.muted }}>· {a.id} · {a.currency}{a.active ? '' : ' · tidak aktif'}</span></span>
                  </label>
                ))}
              </div>
              <button onClick={save} disabled={!account || busy === 'save'} style={{ ...btn(t, true), marginTop: '0.9rem' }}>
                {busy === 'save' ? 'Menyimpan & sync 35 hari...' : 'Simpan & sync'}
              </button>
            </div>
          )}
        </Card>
      )}

      <div style={{ fontSize: '0.75rem', color: t.muted, lineHeight: 1.6 }}>
        Token disimpan dalam bentuk disulitkan dan hanya digunakan oleh server untuk membaca data iklan anda. Data disync automatik setiap jam.
        Untuk cipta ads baru, guna Kit Creative dalam Claude.
      </div>
    </div>
  );
}
