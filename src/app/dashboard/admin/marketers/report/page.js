'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdsInput from '@/components/dashboard/AdsInput';
import { PRODUCTS } from '@/lib/products';

const PERIODS = [
  { id: 'today',     label: 'Hari Ini' },
  { id: 'yesterday', label: 'Semalam' },
  { id: 'week',      label: '7 Hari' },
  { id: 'month',     label: 'Bulan Ini' },
  { id: 'all',       label: 'Semua' },
];

function fmt(val) {
  if (val === null || val === undefined) return '—';
  return `RM ${parseFloat(val).toFixed(2)}`;
}
function fmtNum(val) {
  if (val === null || val === undefined) return '—';
  return parseFloat(val).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProfitCell({ val, lm }) {
  if (val === null || val === undefined) return <span style={{ color: '#6B7280' }}>—</span>;
  const pos = val >= 0;
  return (
    <span style={{
      fontWeight: 700,
      color: pos ? (lm ? '#047857' : '#34D399') : (lm ? '#DC2626' : '#F87171'),
    }}>
      {pos ? '+' : ''}{fmtNum(val)}
    </span>
  );
}

// ── Sales & Ads Ikut Produk ────────────────────────────────────────────────────
function RoasCell({ roas, textMuted }) {
  if (roas === null || roas === undefined) return <span style={{ color: textMuted }}>—</span>;
  return <span style={{ fontWeight: 700, color: roas >= 1 ? '#10B981' : '#EF4444' }}>{roas.toFixed(2)}x</span>;
}

function ProductSection({ byProduct, lm, cardBg, cardBorder, textPrimary, textSecondary, textMuted, ff }) {
  const [openKey, setOpenKey] = useState(null);
  if (!byProduct) return null;
  const { products, totals } = byProduct;
  const th = (h, align = 'right') => (
    <th key={h} style={{ padding: '0.7rem 1rem', textAlign: align, fontSize: '0.7rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
  );
  const td = { padding: '0.8rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' };
  const rowBorder = lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)';

  return (
    <div style={{ marginTop: '1.75rem', background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
      <div style={{ padding: '1.1rem 1.25rem', borderBottom: cardBorder }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📦 Sales & Ads Ikut Produk</h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>
          Semua marketer + HQ. Add-on (cth: Kasturi dalam order Sabun) dikira dalam produk utama order. Klik produk untuk pecahan setiap marketer.
        </p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff, fontSize: '0.83rem' }}>
          <thead>
            <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: cardBorder }}>
              {th('Produk', 'left')}{th('Orders')}{th('Sales (RM)')}{th('Ads (RM)')}{th('ROAS')}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const open = openKey === p.key;
              return [
                <tr key={p.key} onClick={() => setOpenKey(open ? null : p.key)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: open ? (lm ? '#F8FAFC' : 'rgba(255,255,255,0.02)') : 'transparent' }}>
                  <td style={{ ...td, textAlign: 'left', fontWeight: 700, color: textPrimary }}>
                    <span style={{ display: 'inline-block', width: '1rem', color: textMuted }}>{open ? '▾' : '▸'}</span>{p.label}
                  </td>
                  <td style={{ ...td, color: textPrimary }}>{p.orders}</td>
                  <td style={{ ...td, color: lm ? '#047857' : '#34D399', fontWeight: 600 }}>{fmtNum(p.sales)}</td>
                  <td style={{ ...td, color: '#60A5FA', fontWeight: 600 }}>{fmtNum(p.ads)}</td>
                  <td style={td}><RoasCell roas={p.roas} textMuted={textMuted} /></td>
                </tr>,
                open && (p.breakdown.length === 0 ? (
                  <tr key={`${p.key}-empty`} style={{ borderBottom: rowBorder }}>
                    <td colSpan={5} style={{ padding: '0.7rem 1rem 0.7rem 2.25rem', fontSize: '0.78rem', color: textMuted }}>Tiada sales / ads untuk produk ini dalam tempoh ini.</td>
                  </tr>
                ) : p.breakdown.map(b => (
                  <tr key={`${p.key}-${b.id}`} style={{ borderBottom: rowBorder, background: lm ? '#FAFBFC' : 'rgba(255,255,255,0.015)', fontSize: '0.8rem' }}>
                    <td style={{ ...td, textAlign: 'left', paddingLeft: '2.25rem', color: textSecondary }}>
                      {b.name}{b.id === '__hq__' && <span style={{ fontSize: '0.62rem', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.4rem' }}>HQ</span>}
                    </td>
                    <td style={{ ...td, color: textSecondary }}>{b.orders}</td>
                    <td style={{ ...td, color: lm ? '#047857' : '#34D399' }}>{fmtNum(b.sales)}</td>
                    <td style={{ ...td, color: '#60A5FA' }}>{fmtNum(b.ads)}</td>
                    <td style={td}><RoasCell roas={b.roas} textMuted={textMuted} /></td>
                  </tr>
                ))),
              ];
            })}
            <tr style={{ background: lm ? '#EFF6FF' : 'rgba(99,102,241,0.08)', borderTop: lm ? '2px solid #BFDBFE' : '1px solid rgba(99,102,241,0.25)', fontWeight: 800 }}>
              <td style={{ ...td, textAlign: 'left', color: lm ? '#1E40AF' : '#A5B4FC', textTransform: 'uppercase', fontSize: '0.8rem' }}>⚡ Jumlah Fizikal</td>
              <td style={{ ...td, color: lm ? '#1E40AF' : '#A5B4FC' }}>{totals.orders}</td>
              <td style={{ ...td, color: lm ? '#047857' : '#34D399' }}>{fmtNum(totals.sales)}</td>
              <td style={{ ...td, color: '#60A5FA' }}>{fmtNum(totals.ads)}</td>
              <td style={td}><RoasCell roas={totals.roas} textMuted={textMuted} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Ads HQ Harian (isi ads HQ ikut produk, 1hb → hujung bulan) ────────────────
function HqAdsDaily({ lm, cardBg, subCardBg, cardBorder, textPrimary, textSecondary, textMuted, ff, onSaved }) {
  const todayMonth = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 7);
  const [month, setMonth] = useState(todayMonth);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`/api/admin/ads-spend/hq-daily?month=${month}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (_) {}
    finally { if (!silent) setLoading(false); }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const shiftMonth = (n) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  };
  const monthLabel = new Date(`${month}-01T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' });

  const products = data?.products || PRODUCTS;
  const days = data?.days || [];
  const sumAds = k => days.reduce((t, d) => t + (d.adsByProduct?.[k] || 0), 0);
  const cell = { padding: '0.55rem 0.9rem', textAlign: 'right', whiteSpace: 'nowrap' };
  const empty = <span style={{ opacity: 0.35 }}>—</span>;

  return (
    <div style={{ marginTop: '1.75rem', background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
      <div style={{ padding: '1.1rem 1.25rem', borderBottom: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>🏢 Ads HQ Harian</h2>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>
            Isi kos ads HQ <strong style={{ color: '#F59E0B' }}>ikut produk</strong> — tekan Enter atau klik luar untuk simpan. Kosongkan / 0 untuk padam.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: subCardBg, padding: '0.3rem', borderRadius: '8px', border: cardBorder }}>
          <button onClick={() => shiftMonth(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1rem' }}>◀</button>
          <span style={{ fontWeight: 700, minWidth: '120px', textAlign: 'center', fontSize: '0.85rem' }}>{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1rem' }}>▶</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Memuatkan...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff, fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: cardBorder }}>
                {[['Tarikh', 'left'], ['Order HQ', 'right'], ['Sales HQ', 'right'], ...products.map(p => [`Ads ${p.short}`, 'right', true]), ['Total Ads', 'right', true]].map(([h, align, isAds]) => (
                  <th key={h} style={{ padding: '0.7rem 0.9rem', textAlign: align, fontSize: '0.7rem', fontWeight: 700, color: isAds ? '#F59E0B' : textSecondary, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr key={d.date} style={{
                  borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
                  background: d.isToday ? (lm ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)') : (i % 2 ? (lm ? '#FAFBFC' : 'rgba(255,255,255,0.015)') : 'transparent'),
                  opacity: d.isFuture ? 0.45 : 1,
                }}>
                  <td style={{ ...cell, textAlign: 'left', fontWeight: 600, color: textPrimary }}>
                    {new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {d.isToday && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', fontWeight: 700, color: '#10B981' }}>HARI INI</span>}
                  </td>
                  <td style={{ ...cell, color: textSecondary }}>{d.orders || empty}</td>
                  <td style={{ ...cell, color: lm ? '#047857' : '#34D399', fontWeight: 600 }}>{d.sales ? fmtNum(d.sales) : empty}</td>
                  {products.map(p => (
                    <td key={p.key} style={{ ...cell, padding: '0.35rem 0.5rem' }}>
                      <AdsInput
                        date={d.date}
                        product={p.key}
                        value={d.adsByProduct?.[p.key]}
                        disabled={d.isFuture}
                        endpoint="/api/admin/ads-spend"
                        onSaved={() => { load(true); onSaved?.(); }}
                        lm={lm}
                        textPrimary={textPrimary}
                      />
                    </td>
                  ))}
                  <td style={{ ...cell, color: '#F59E0B', fontWeight: 600 }}>{d.ads ? fmtNum(d.ads) : empty}</td>
                </tr>
              ))}
              <tr style={{ background: lm ? '#EFF6FF' : 'rgba(99,102,241,0.08)', borderTop: lm ? '2px solid #BFDBFE' : '1px solid rgba(99,102,241,0.25)', fontWeight: 800 }}>
                <td style={{ ...cell, textAlign: 'left', color: lm ? '#1E40AF' : '#A5B4FC', textTransform: 'uppercase', fontSize: '0.8rem' }}>⚡ Jumlah</td>
                <td style={{ ...cell, color: lm ? '#1E40AF' : '#A5B4FC' }}>{days.reduce((t, d) => t + d.orders, 0)}</td>
                <td style={{ ...cell, color: lm ? '#047857' : '#34D399' }}>{fmtNum(days.reduce((t, d) => t + d.sales, 0))}</td>
                {products.map(p => <td key={p.key} style={{ ...cell, color: '#F59E0B' }}>{fmtNum(sumAds(p.key))}</td>)}
                <td style={{ ...cell, color: '#F59E0B' }}>{fmtNum(days.reduce((t, d) => t + d.ads, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Monthly Section ────────────────────────────────────────────────────────────
function MonthSection({ month, lm, cardBg, cardBorder, textPrimary, textSecondary, textMuted, ff }) {
  const [open, setOpen] = useState(false);
  const t = month.totals;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Month header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          padding: '0.9rem 1.25rem', borderRadius: open ? '10px 10px 0 0' : '10px',
          background: lm ? '#F1F5F9' : '#0D1017',
          border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', userSelect: 'none',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: textPrimary, minWidth: '160px' }}>
          {open ? '▼' : '▶'} {month.label}
        </span>
        <span style={{ fontSize: '0.8rem', color: textSecondary }}>📦 {t.orders} orders</span>
        <span style={{ fontSize: '0.8rem', color: lm ? '#047857' : '#34D399', fontWeight: 700 }}>💰 {fmt(t.revenue)}</span>
        <span style={{ fontSize: '0.8rem', color: '#60A5FA' }}>💸 Ads: {fmt(t.ads)}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.profit >= 0 ? (lm ? '#047857' : '#34D399') : (lm ? '#DC2626' : '#F87171') }}>
          📊 Profit: {t.profit >= 0 ? '+' : ''}{fmt(t.profit)}
        </span>
      </div>

      {/* Marketer table */}
      {open && (
        <div style={{ overflowX: 'auto', border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: cardBg }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff, fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                {['Marketer','Orders','Sales (RM)','COGS (RM)','Postage (RM)','Gross Profit','Ads (RM)','Net Profit','Komisen (RM)','Est. Gaji'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 1rem', textAlign: h === 'Marketer' ? 'left' : 'right', fontWeight: 700, fontSize: '0.7rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {month.marketers.map((m, i) => {
                const isHQ = m.id === '__hq__';
                return (
                  <tr key={m.id} style={{
                    borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
                    background: isHQ ? (lm ? '#F8FAFC' : 'rgba(255,255,255,0.02)') : 'transparent',
                  }}>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: isHQ ? 600 : 500, color: textPrimary, whiteSpace: 'nowrap' }}>
                      {m.name}
                      {m.code && <span style={{ fontSize: '0.68rem', color: textMuted, marginLeft: '0.4rem' }}>({m.code})</span>}
                      {isHQ && <span style={{ fontSize: '0.65rem', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.4rem' }}>HQ</span>}
                    </td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: textPrimary }}>{m.orders}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399', fontWeight: 600 }}>{fmtNum(m.revenue)}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(m.product_cogs ?? m.cogs)}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: textMuted }}>{fmtNum(m.postage ?? 0)}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}><ProfitCell val={m.gross_profit ?? (m.revenue - (m.product_cogs ?? m.cogs) - (m.postage ?? 0))} lm={lm} /></td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#60A5FA' }}>{fmtNum(m.ads)}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}><ProfitCell val={m.profit} lm={lm} /></td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: textSecondary }}>{m.komisen !== null ? fmtNum(m.komisen) : '—'}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: textPrimary, fontWeight: 600 }}>{m.est_gaji !== null ? fmtNum(m.est_gaji) : '—'}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ background: lm ? '#EFF6FF' : 'rgba(99,102,241,0.08)', borderTop: lm ? '2px solid #BFDBFE' : '1px solid rgba(99,102,241,0.25)', fontWeight: 800 }}>
                <td style={{ padding: '0.75rem 1rem', color: lm ? '#1E40AF' : '#A5B4FC', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>JUMLAH</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: lm ? '#1E40AF' : '#A5B4FC' }}>{month.totals.orders}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399' }}>{fmtNum(month.totals.revenue)}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(month.totals.product_cogs ?? month.totals.cogs)}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textMuted }}>{fmtNum(month.totals.postage ?? 0)}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}><ProfitCell val={month.totals.gross_profit} lm={lm} /></td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60A5FA' }}>{fmtNum(month.totals.ads)}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}><ProfitCell val={month.totals.profit} lm={lm} /></td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(month.totals.komisen)}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textMuted }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketerReportPage() {
  const [mode,    setMode]    = useState('period');   // 'period' | 'monthly'
  const [period,  setPeriod]  = useState('month');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState('revenue');
  const [sortDir, setSortDir] = useState('desc');
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const check = () => setIsLightMode(
      document.body.classList.contains('light-mode') ||
      document.documentElement.getAttribute('data-theme') === 'light'
    );
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const lm = isLightMode;
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  // silent === true → refresh tanpa spinner (cth: lepas simpan ads HQ). Butang Refresh hantar event → bukan silent.
  const fetchData = useCallback(async (silent) => {
    if (silent !== true) setLoading(true);
    try {
      const url = mode === 'monthly'
        ? '/api/admin/marketers/report?mode=monthly'
        : `/api/admin/marketers/report?mode=period&period=${period}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (_) {}
    finally { if (silent !== true) setLoading(false); }
  }, [mode, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sorting for period mode
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sortedMarketers = (() => {
    if (!data?.marketers) return [];
    const hq  = data.marketers.filter(m => m.id === '__hq__');
    const rest = data.marketers.filter(m => m.id !== '__hq__');
    rest.sort((a, b) => {
      const av = a[sortCol] ?? -Infinity;
      const bv = b[sortCol] ?? -Infinity;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return [...rest, ...hq];
  })();

  const t = data?.totals;

  // Summary cards values
  const summaryCards = t ? [
    { label: '💰 Total Sales', val: fmt(t.revenue), color: lm ? '#047857' : '#34D399', bg: lm ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' },
    { label: '📦 Total Orders', val: t.orders, color: textPrimary, bg: cardBg, border: cardBorder },
    { label: '📊 Gross Profit', val: fmt(t.gross_profit), color: (t.gross_profit ?? 0) >= 0 ? (lm ? '#047857' : '#34D399') : (lm ? '#DC2626' : '#F87171'), bg: cardBg, border: cardBorder },
    { label: '💸 Total Ads', val: fmt(t.ads), color: '#60A5FA', bg: cardBg, border: cardBorder },
    { label: '📈 Net Profit', val: fmt(t.profit), color: t.profit >= 0 ? (lm ? '#047857' : '#34D399') : (lm ? '#DC2626' : '#F87171'), bg: cardBg, border: cardBorder },
  ] : [];

  const ColHeader = ({ col, label, align = 'right' }) => (
    <th
      onClick={() => mode === 'period' && handleSort(col)}
      style={{
        padding: '0.7rem 1rem', textAlign: align, fontSize: '0.7rem', fontWeight: 700,
        color: sortCol === col && mode === 'period' ? (lm ? '#3B82F6' : '#60A5FA') : textSecondary,
        textTransform: 'uppercase', letterSpacing: '0.05em', cursor: mode === 'period' ? 'pointer' : 'default',
        whiteSpace: 'nowrap', userSelect: 'none',
      }}
    >
      {label} {sortCol === col && mode === 'period' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            ESYIFAA · ADMIN
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            📊 Laporan Prestasi Marketer
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: textSecondary }}>
            Sales, orders, profit & komisyen semua marketer
          </p>
        </div>
        <Link href="/dashboard/admin/marketers" style={{ fontSize: '0.8rem', color: lm ? '#3B82F6' : '#60A5FA', textDecoration: 'none', fontWeight: 600 }}>
          ← Senarai Marketer
        </Link>
      </div>

      {/* Mode + Period tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', border: cardBorder }}>
          {[{ id: 'period', label: '📅 Ikut Period' }, { id: 'monthly', label: '🗓 Bulanan' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              padding: '0.4rem 1rem', borderRadius: '5px', fontSize: '0.78rem', fontWeight: mode === m.id ? 700 : 500,
              border: 'none', cursor: 'pointer', fontFamily: ff,
              background: mode === m.id ? (lm ? '#FFFFFF' : '#064E3B') : 'transparent',
              color: mode === m.id ? (lm ? '#047857' : '#34D399') : textSecondary,
              transition: 'all 0.15s',
            }}>{m.label}</button>
          ))}
        </div>

        {/* Period selector (only in period mode) */}
        {mode === 'period' && (
          <div style={{ display: 'flex', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', border: cardBorder }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '5px', fontSize: '0.78rem', fontWeight: period === p.id ? 700 : 500,
                border: 'none', cursor: 'pointer', fontFamily: ff,
                background: period === p.id ? (lm ? '#FFFFFF' : '#1E1B4B') : 'transparent',
                color: period === p.id ? (lm ? '#4F46E5' : '#A5B4FC') : textSecondary,
                transition: 'all 0.15s',
              }}>{p.label}</button>
            ))}
          </div>
        )}

        <button onClick={fetchData} style={{
          padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
          border: cardBorder, cursor: 'pointer', fontFamily: ff, background: cardBg, color: textSecondary,
        }}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan data marketer...</span>
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: textMuted }}>Gagal muatkan data. Cuba refresh.</div>
      ) : mode === 'monthly' ? (
        /* ── MONTHLY VIEW ── */
        <div>
          {data.avg_cost > 0 && (
            <div style={{ fontSize: '0.78rem', color: textMuted, marginBottom: '1rem' }}>
              Kos seunit sabun: <strong style={{ color: textSecondary }}>RM {parseFloat(data.avg_cost).toFixed(2)}</strong>
            </div>
          )}
          {(data.months || []).map(month => (
            <MonthSection key={month.key} month={month} lm={lm} cardBg={cardBg} cardBorder={cardBorder}
              textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} ff={ff} />
          ))}
        </div>
      ) : (
        /* ── PERIOD VIEW ── */
        <>
          {/* Summary Cards */}
          {t && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {summaryCards.map(c => (
                <div key={c.label} style={{ background: c.bg, border: c.border, borderRadius: '10px', padding: '1.1rem 1.3rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{c.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{c.val}</div>
                </div>
              ))}
            </div>
          )}

          {data.avg_cost > 0 && (
            <div style={{ fontSize: '0.78rem', color: textMuted, marginBottom: '1rem' }}>
              Kos seunit sabun: <strong style={{ color: textSecondary }}>RM {parseFloat(data.avg_cost).toFixed(2)}</strong>
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: 'auto', background: cardBg, border: cardBorder, borderRadius: '10px', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff, fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                  <ColHeader col="name" label="Marketer" align="left" />
                  <ColHeader col="orders" label="Orders" />
                  <ColHeader col="revenue" label="Sales (RM)" />
                  <ColHeader col="product_cogs" label="COGS (RM)" />
                  <ColHeader col="postage" label="Postage (RM)" />
                  <ColHeader col="gross_profit" label="Gross Profit" />
                  <ColHeader col="ads" label="Ads (RM)" />
                  <ColHeader col="profit" label="Net Profit" />
                  <ColHeader col="komisen" label="Komisen (RM)" />
                  <ColHeader col="est_gaji" label="Est. Gaji" />
                </tr>
              </thead>
              <tbody>
                {sortedMarketers.map((m) => {
                  const isHQ = m.id === '__hq__';
                  return (
                    <tr key={m.id} style={{
                      borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
                      background: isHQ ? (lm ? '#F8FAFC' : 'rgba(255,255,255,0.02)') : 'transparent',
                      transition: 'background 0.1s',
                    }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: isHQ ? 600 : 500, color: textPrimary, whiteSpace: 'nowrap' }}>
                        {m.name}
                        {m.code && <span style={{ fontSize: '0.68rem', color: textMuted, marginLeft: '0.4rem' }}>({m.code})</span>}
                        {isHQ && <span style={{ fontSize: '0.65rem', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.4rem' }}>HQ</span>}
                        {!isHQ && m.is_active === false && <span style={{ fontSize: '0.62rem', color: '#EF4444', marginLeft: '0.4rem' }}>• tidak aktif</span>}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textPrimary }}>{m.orders}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399', fontWeight: 600 }}>{fmtNum(m.revenue)}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(m.product_cogs ?? m.cogs)}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textMuted }}>{fmtNum(m.postage ?? 0)}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}><ProfitCell val={m.gross_profit} lm={lm} /></td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: '#60A5FA' }}>{fmtNum(m.ads)}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}><ProfitCell val={m.profit} lm={lm} /></td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textSecondary }}>{m.komisen !== null ? fmtNum(m.komisen) : '—'}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textPrimary, fontWeight: 600 }}>{m.est_gaji !== null ? fmtNum(m.est_gaji) : '—'}</td>
                    </tr>
                  );
                })}

                {/* Totals row */}
                {t && (
                  <tr style={{
                    background: lm ? '#EFF6FF' : 'rgba(99,102,241,0.08)',
                    borderTop: lm ? '2px solid #BFDBFE' : '1px solid rgba(99,102,241,0.25)',
                    fontWeight: 800,
                  }}>
                    <td style={{ padding: '0.9rem 1rem', color: lm ? '#1E40AF' : '#A5B4FC', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>⚡ JUMLAH</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: lm ? '#1E40AF' : '#A5B4FC' }}>{t.orders}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399' }}>{fmtNum(t.revenue)}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(t.product_cogs ?? t.cogs)}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: textMuted }}>{fmtNum(t.postage ?? 0)}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}><ProfitCell val={t.gross_profit} lm={lm} /></td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: '#60A5FA' }}>{fmtNum(t.ads)}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}><ProfitCell val={t.profit} lm={lm} /></td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: textSecondary }}>{fmtNum(t.komisen)}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right', color: textMuted }}>—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ProductSection byProduct={data.byProduct} lm={lm} cardBg={cardBg} cardBorder={cardBorder}
            textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} ff={ff} />
        </>
      )}

      {/* Ads HQ — sentiasa papar (bebas dari mode / period) */}
      <HqAdsDaily lm={lm} cardBg={cardBg} subCardBg={lm ? '#F1F5F9' : '#090A0F'} cardBorder={cardBorder}
        textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} ff={ff}
        onSaved={() => fetchData(true)} />
    </div>
  );
}
