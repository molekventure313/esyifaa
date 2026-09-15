'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PERIODS = [
  { id: 'today',     label: 'Hari Ini' },
  { id: 'yesterday', label: 'Semalam' },
  { id: 'week',      label: '7 Hari' },
  { id: 'month',     label: '30 Hari' },
  { id: 'all',       label: 'Semua' },
];

const PERIOD_VS_LABEL = {
  today:     'vs semalam',
  yesterday: 'vs kelmarin',
  week:      'vs 7 hari lalu',
  month:     'vs 30 hari lalu',
  all:       '',
};

function formatRM(val) {
  if (!val && val !== 0) return '—';
  return `RM ${parseFloat(val).toFixed(2)}`;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (new Date() - new Date(dateStr)) / 60000;
  if (diff < 1)   return 'Baru sahaja';
  if (diff < 60)  return `${Math.floor(diff)}m lepas`;
  if (diff < 1440) return `${Math.floor(diff / 60)}j lepas`;
  return `${Math.floor(diff / 1440)}h lepas`;
}

export default function AdminDashboardPage() {
  const [period,  setPeriod]  = useState('today');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [stockSummary, setStockSummary] = useState(null);

  // ── PNL Tab state ────────────────────────────────────────────────────────
  const [activeView,    setActiveView]    = useState('overview');
  const [pnlMode,       setPnlMode]       = useState('daily');   // 'daily' | 'monthly'
  const [pnlPeriod,     setPnlPeriod]     = useState('today');   // 'today' | 'week' | 'month'
  const [pnlData,       setPnlData]       = useState(null);
  const [pnlLoading,    setPnlLoading]    = useState(false);
  const [adsForm,       setAdsForm]       = useState({ spend_date: '', amount: '', notes: '', id: null });
  const [adsSubmitting, setAdsSubmitting] = useState(false);
  // ── Overview pkg breakdown ────────────────────────────────────────────────
  const [pkgData,       setPkgData]       = useState(null);

  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsLightMode(
        document.body.classList.contains('light-mode') ||
        document.documentElement.getAttribute('data-theme') === 'light'
      );
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const lm = isLightMode;
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  // ── Marketer Filter state ──────────────────────────────────────────────────
  const [marketerFilter, setMarketerFilter] = useState('all');
  const [marketers, setMarketers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/marketers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMarketers(data.data || []);
      })
      .catch(console.error);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      // Map overview period to pnl-report period
      const pnlPeriodMap = { today: 'today', yesterday: 'yesterday', week: 'week', month: 'month', all: 'all' };
      const mappedPeriod = pnlPeriodMap[period] || 'today';
      const mParam = marketerFilter !== 'all' ? `&marketer_id=${marketerFilter}` : '';

      const [statsRes, stockRes, pkgRes] = await Promise.all([
        fetch(`/api/admin/sales-stats?period=${period}${mParam}`).then(r => r.json()),
        fetch('/api/stock/summary').then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/admin/pnl-report?mode=daily&period=${mappedPeriod}${mParam}`).then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (statsRes.success) {
        setData(statsRes.data);
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
      if (stockRes.success) setStockSummary(stockRes.data);
      if (pkgRes.success)   setPkgData(pkgRes.summary);
    } catch (_) {}
    finally { setLoading(false); }
  }, [period, marketerFilter]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // ── PNL fetch ─────────────────────────────────────────────────────────────
  const fetchPnl = useCallback(async () => {
    if (activeView !== 'pnl') return;
    setPnlLoading(true);
    try {
      const mParam = marketerFilter !== 'all' ? `&marketer_id=${marketerFilter}` : '';
      const url = pnlMode === 'monthly'
        ? `/api/admin/pnl-report?mode=monthly${mParam}`
        : `/api/admin/pnl-report?mode=daily&period=${pnlPeriod}${mParam}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.success) setPnlData(json);
    } catch (_) {}
    finally { setPnlLoading(false); }
  }, [activeView, pnlMode, pnlPeriod, marketerFilter]);

  useEffect(() => { fetchPnl(); }, [fetchPnl]);

  // Auto-set ads date to today (MYT) when opening PNL tab
  useEffect(() => {
    if (activeView === 'pnl' && !adsForm.spend_date) {
      const todayMYT = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
      setAdsForm(f => ({ ...f, spend_date: todayMYT }));
    }
  }, [activeView]); // eslint-disable-line

  const totals   = data?.totals   || {};
  const vsPrev   = data?.vs_previous || {};
  const bySP     = data?.by_salespage || [];
  const recent   = data?.recent_orders || [];
  const pnl      = data?.pnl || {};
  const maxRev   = bySP[0]?.revenue || 1;

  const currentDate = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
  });

  const PctBadge = ({ pct, label }) => {
    if (!pct && pct !== 0) return null;
    const up    = pct >= 0;
    const color = up ? '#10B981' : '#EF4444';
    const bg    = up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color, background: bg, padding: '0.18rem 0.45rem', borderRadius: '6px' }}>
        {up ? '▲' : '▼'} {Math.abs(pct)}% {label}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>

      {/* ─── Header ─── */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ESYIFAA · SALES DASHBOARD
            </span>
            <span style={{ fontSize: '0.75rem', color: textMuted }}>{currentDate}</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: textPrimary }}>
            Papan Kawalan Jualan
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: textSecondary }}>
            Sales FPX & COD · Dikemaskini setiap 15 saat
            {lastUpdated && <span style={{ marginLeft: '0.5rem', color: lm ? '#047857' : '#34D399' }}>· {lastUpdated}</span>}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Marketer Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: textSecondary }}>Marketer:</span>
            <select
              value={marketerFilter}
              onChange={e => setMarketerFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem',
                background: lm ? '#F1F5F9' : '#090A0F',
                border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.08)',
                color: textPrimary,
                fontFamily: ff,
                outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="all">Semua (HQ + Marketers)</option>
              <option value="hq">HQ Sahaja</option>
              {marketers.map(m => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.marketer_code || 'Tiada Kod'})</option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div style={{
            display: 'flex', background: lm ? '#F1F5F9' : '#090A0F',
            padding: '3px', borderRadius: '8px',
            border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.08)',
          }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                padding: '0.4rem 0.9rem', borderRadius: '5px', fontSize: '0.78rem',
                fontWeight: period === p.id ? 700 : 500, border: 'none', cursor: 'pointer',
                background: period === p.id ? (lm ? '#FFFFFF' : '#064E3B') : 'transparent',
                color: period === p.id ? (lm ? '#047857' : '#34D399') : textSecondary,
                boxShadow: period === p.id && lm ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── View Tab Switcher ─── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', width: 'fit-content', border: cardBorder }}>
        <button onClick={() => setActiveView('overview')} style={{ padding: '0.4rem 1.1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeView === 'overview' ? 700 : 500, fontSize: '0.82rem', fontFamily: ff, background: activeView === 'overview' ? (lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: activeView === 'overview' ? (lm ? '#047857' : '#34D399') : textSecondary }}>📊 Overview</button>
        <button onClick={() => setActiveView('pnl')} style={{ padding: '0.4rem 1.1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: activeView === 'pnl' ? 700 : 500, fontSize: '0.82rem', fontFamily: ff, background: activeView === 'pnl' ? (lm ? '#FFFFFF' : '#1E1B4B') : 'transparent', color: activeView === 'pnl' ? (lm ? '#4F46E5' : '#A5B4FC') : textSecondary }}>💰 Laporan PNL</button>
      </div>

      {activeView === 'overview' && (loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', flexDirection: 'column' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981' }} />
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan data jualan...</span>
        </div>
      ) : (
        <>
          {/* ─── Row 1: 5 Metric Cards ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

            {/* Total Sales */}
            <div style={{
              background: lm ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(5,150,105,0.15))',
              border: lm ? '1px solid #A7F3D0' : '1px solid rgba(16,185,129,0.25)',
              borderRadius: '10px', padding: '1.25rem 1.4rem',
              boxShadow: lm ? '0 2px 8px rgba(16,185,129,0.1)' : 'none',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                💰 Total Sales
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lm ? '#065F46' : '#6EE7B7', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatRM(totals.revenue)}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <PctBadge pct={vsPrev.revenue} label={PERIOD_VS_LABEL[period]} />
              </div>
            </div>

            {/* Jumlah Order */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                📦 Jumlah Order
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {totals.orders ?? 0}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <PctBadge pct={vsPrev.orders} label={PERIOD_VS_LABEL[period]} />
              </div>
            </div>

            {/* FPX */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                💳 FPX Online
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatRM(totals.fpx_revenue)}
              </div>
              <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '0.4rem' }}>
                {totals.fpx_orders ?? 0} order
              </div>
            </div>

            {/* COD */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                🚚 COD
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FB923C', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatRM(totals.cod_revenue)}
              </div>
              <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '0.4rem' }}>
                {totals.cod_orders ?? 0} order
              </div>
            </div>

            {/* Prev Period */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                📅 {period === 'all' ? 'Semua Masa' : 'Sebelum Ini'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: textSecondary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {formatRM(vsPrev.prev_revenue)}
              </div>
              <div style={{ fontSize: '0.78rem', color: textMuted, marginTop: '0.4rem' }}>
                {vsPrev.prev_orders ?? 0} order {PERIOD_VS_LABEL[period]}
              </div>
            </div>
          </div>

          {/* ─── Gross PNL Banner ─── */}
          {(() => {
            const pnlPositive = pnl.gross_pnl > 0;
            const pnlNegative = pnl.gross_pnl < 0;
            const noCost      = !pnl.cost_configured;
            const pnlColor    = noCost ? textMuted : pnlPositive ? '#10B981' : '#EF4444';
            const pnlBg       = noCost
              ? (lm ? '#F8FAFC' : 'rgba(255,255,255,0.03)')
              : pnlPositive
                ? (lm ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)')
                : (lm ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)');
            const pnlBorder   = noCost ? cardBorder
              : pnlPositive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)';
            return (
              <div style={{
                background: pnlBg, border: pnlBorder, borderRadius: '10px',
                padding: '1rem 1.5rem', marginBottom: '1.5rem',
                display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: pnlColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                    💰 Gross PNL {noCost ? '(Kos belum diisi)' : ''}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: pnlColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {noCost ? '—' : `${pnlPositive ? '+' : ''}${formatRM(pnl.gross_pnl)}`}
                  </div>
                  {!noCost && (
                    <div style={{ fontSize: '0.75rem', color: pnlColor, marginTop: '0.2rem', fontWeight: 600 }}>
                      Margin: {pnl.gross_margin}%
                    </div>
                  )}
                </div>
                <div style={{ height: '40px', width: '1px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.08)' }} />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>📦 COGS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: textSecondary }}>
                    {noCost ? '—' : formatRM(pnl.cogs)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.15rem' }}>
                    {pnl.units_sold ?? 0} unit × {noCost ? 'kos ?' : `RM ${pnl.avg_cost?.toFixed(2)}`}
                  </div>
                </div>
                <div style={{ height: '40px', width: '1px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.08)' }} />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>💵 Revenue</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: lm ? '#047857' : '#34D399' }}>
                    {formatRM(totals.revenue)}
                  </div>
                </div>
                {noCost && (
                  <Link href="/dashboard/admin/stok" style={{
                    marginLeft: 'auto', fontSize: '0.76rem', fontWeight: 700,
                    color: lm ? '#3B82F6' : '#60A5FA', textDecoration: 'none',
                    background: lm ? 'rgba(59,130,246,0.08)' : 'rgba(96,165,250,0.1)',
                    border: '1px solid rgba(96,165,250,0.25)', padding: '0.4rem 0.9rem', borderRadius: '7px',
                  }}>
                    Isi Kos Seunit →
                  </Link>
                )}
              </div>
            );
          })()}

          {/* ─── Pecahan Set Widget ─── */}
          {pkgData?.total_pkg && (
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '0.85rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem 2rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', flex: '0 0 auto' }}>📦 Pecahan Set:</div>
              {[1, 2, 3].map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>Set {k}U</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: k === 1 ? '#60A5FA' : k === 2 ? '#34D399' : '#F59E0B' }}>{pkgData.total_pkg[k] ?? 0}</span>
                  <span style={{ fontSize: '0.68rem', color: textMuted }}>order</span>
                </div>
              ))}
              {/* Kasturi add-on count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.25rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>🌿 Add-On Kasturi</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#A78BFA' }}>{pkgData.kasturi_orders ?? 0}</span>
                <span style={{ fontSize: '0.68rem', color: textMuted }}>order</span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.68rem', color: textMuted }}>{pkgData.total_orders ?? 0} order · {pkgData.total_units ?? 0} unit</div>
            </div>
          )}

          {/* ─── Row 2: SP Breakdown + Recent Orders ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Left: Jualan Ikut SP */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>
                    📊 Jualan Ikut Salespage
                  </h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: textMuted }}>
                    SP yang jana paling banyak sales
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', color: textMuted, background: subCardBg, padding: '0.3rem 0.7rem', borderRadius: '6px', border: cardBorder }}>
                  {bySP.length} SP aktif
                </span>
              </div>

              {bySP.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
                  Tiada data jualan untuk tempoh ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {bySP.map((sp, i) => {
                    const pct = Math.round((sp.revenue / maxRev) * 100);
                    return (
                      <div key={sp.source}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 800, width: '18px', height: '18px',
                              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: i === 0 ? '#10B981' : i === 1 ? '#60A5FA' : i === 2 ? '#FB923C' : subCardBg,
                              color: i < 3 ? '#fff' : textMuted,
                            }}>{i + 1}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: textPrimary }}>{sp.label}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: lm ? '#047857' : '#34D399' }}>
                              {formatRM(sp.revenue)}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: textMuted, marginLeft: '0.4rem' }}>
                              ({sp.orders} order)
                            </span>
                          </div>
                        </div>
                        {/* Bar */}
                        <div style={{ width: '100%', height: '6px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`, height: '100%', borderRadius: '3px',
                            background: i === 0
                              ? 'linear-gradient(90deg, #10B981, #059669)'
                              : i === 1
                              ? 'linear-gradient(90deg, #60A5FA, #3B82F6)'
                              : i === 2
                              ? 'linear-gradient(90deg, #FB923C, #F97316)'
                              : lm ? '#CBD5E1' : 'rgba(255,255,255,0.15)',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Order Terkini */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>
                    🕐 Order Terkini
                  </h2>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: textMuted }}>
                    10 order selesai terbaru (semua masa)
                  </p>
                </div>
                <Link href="/dashboard/admin/pesakit-berbayar" style={{ fontSize: '0.775rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textDecoration: 'none' }}>
                  Lihat Semua →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
                  Tiada order selesai lagi.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {recent.map(o => {
                    const marketer = o.marketer_id ? marketers.find(m => m.id === o.marketer_id) : null;
                    return (
                    <div key={o.id} style={{
                      padding: '0.7rem 0.9rem', borderRadius: '8px',
                      background: subCardBg, border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.85rem', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.full_name}
                          {marketer && (
                            <span style={{ 
                              fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                              background: 'rgba(124, 58, 237, 0.15)', color: lm ? '#6D28D9' : '#A78BFA', fontWeight: 700,
                              marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center'
                            }}>
                              📢 {marketer.marketer_code || 'Marketer'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: textMuted, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.source_label} · {formatTimeAgo(o.created_at)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem',
                          borderRadius: '5px',
                          background: o.payment_type === 'fpx_payment' ? 'rgba(96,165,250,0.12)' : 'rgba(251,146,60,0.12)',
                          color: o.payment_type === 'fpx_payment' ? '#60A5FA' : '#FB923C',
                          border: o.payment_type === 'fpx_payment' ? '1px solid rgba(96,165,250,0.25)' : '1px solid rgba(251,146,60,0.25)',
                        }}>
                          {o.payment_type === 'fpx_payment' ? 'FPX' : 'COD'}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: lm ? '#047857' : '#34D399' }}>
                          {formatRM(o.amount)}
                        </span>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>

          {/* ─── Row 3: Stock Widget ─── */}
          {stockSummary?.products?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <Link href="/dashboard/admin/stok" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  padding: '1rem 1.5rem', borderRadius: '10px',
                  background: lm ? '#FFFBEB' : 'rgba(245,158,11,0.06)',
                  border: lm ? '1px solid #FCD34D' : '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '1.4rem' }}>📦</span>
                  {stockSummary.products.map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: lm ? '#92400E' : '#F59E0B', textTransform: 'uppercase' }}>{p.name}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: p.current_stock <= p.low_stock_threshold ? '#EF4444' : lm ? '#047857' : '#34D399' }}>
                          {p.current_stock} {p.unit}
                          {p.current_stock <= p.low_stock_threshold && <span style={{ fontSize: '0.75rem', marginLeft: '0.4rem' }}>⚠️ Stok Rendah!</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: lm ? '#92400E' : '#F59E0B' }}>
                        Nilai: <strong>{formatRM(stockSummary.total_value)}</strong>
                      </div>
                    </div>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: lm ? '#92400E' : '#F59E0B', fontWeight: 600, whiteSpace: 'nowrap' }}>Pengurusan Stok →</span>
                </div>
              </Link>
            </div>
          )}

          {/* ─── Row 4: Quick Links ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { href: '/dashboard/admin/pesakit-berbayar', icon: '📦', title: 'Pengurusan Order', desc: 'Senarai FPX & COD · Export NinjaVan · Return COD' },
              { href: '/dashboard/admin/stok',             icon: '🏪', title: 'Pengurusan Stok',  desc: 'Stok sabun · Tambah batch · Sejarah pergerakan' },
              { href: '/dashboard/admin/tracking',         icon: '🎯', title: 'Tracking & Pixel', desc: 'Meta Pixel · CAPI · Salespage' },
              { href: '/dashboard/admin/kes',              icon: '📋', title: 'Pengurusan Kes',   desc: 'Agih & kemaskini perawat' },
              { href: '/dashboard/admin/perawat',          icon: '👥', title: 'Pengurusan Perawat', desc: 'Beban kerja & status perawat' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '1.1rem 1.25rem', borderRadius: '10px', textDecoration: 'none',
                background: cardBg, border: cardBorder,
                boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                display: 'block', transition: 'border-color 0.15s',
              }}
                >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{link.icon}</div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: textPrimary }}>{link.title}</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: textSecondary }}>{link.desc}</p>
              </Link>
            ))}
          </div>
        </>
      ))}

      {/* ─── PNL Tab ─── */}
      {activeView === 'pnl' && (
        <>
          {/* Sub-period selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', border: cardBorder }}>
              {[{ id: 'daily', label: '📋 Harian' }, { id: 'monthly', label: '📅 Bulanan' }].map(m => (
                <button key={m.id} onClick={() => setPnlMode(m.id)} style={{ padding: '0.35rem 0.85rem', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: pnlMode === m.id ? 700 : 500, fontSize: '0.78rem', fontFamily: ff, background: pnlMode === m.id ? (lm ? '#FFFFFF' : '#1E1B4B') : 'transparent', color: pnlMode === m.id ? (lm ? '#4F46E5' : '#A5B4FC') : textSecondary }}>{m.label}</button>
              ))}
            </div>
            {pnlMode === 'daily' && (
              <div style={{ display: 'flex', gap: '0.25rem', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', border: cardBorder }}>
                {[{ id: 'today', label: 'Hari Ini' }, { id: 'week', label: '7 Hari' }, { id: 'month', label: '30 Hari' }].map(p => (
                  <button key={p.id} onClick={() => setPnlPeriod(p.id)} style={{ padding: '0.35rem 0.85rem', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: pnlPeriod === p.id ? 700 : 500, fontSize: '0.78rem', fontFamily: ff, background: pnlPeriod === p.id ? (lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: pnlPeriod === p.id ? (lm ? '#047857' : '#34D399') : textSecondary }}>{p.label}</button>
                ))}
              </div>
            )}
            <button onClick={fetchPnl} style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, border: cardBorder, borderRadius: '7px', background: 'transparent', color: textSecondary, cursor: 'pointer', fontFamily: ff }}>🔄 Refresh</button>
          </div>

          {/* Ads Quick Entry */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>💸 Isi / Kemaskini Kos Ads Harian</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: textMuted, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Tarikh</label>
                <input type="date" value={adsForm.spend_date} onChange={e => setAdsForm(f => ({ ...f, spend_date: e.target.value, id: null, amount: '', notes: '' }))}
                  style={{ padding: '0.55rem 0.85rem', background: lm ? '#F8FAFC' : '#090A0F', border: cardBorder, borderRadius: '7px', color: textPrimary, fontSize: '0.85rem', fontFamily: ff }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: textMuted, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Kos Ads (RM)</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={adsForm.amount} onChange={e => setAdsForm(f => ({ ...f, amount: e.target.value }))}
                  style={{ padding: '0.55rem 0.85rem', background: lm ? '#F8FAFC' : '#090A0F', border: cardBorder, borderRadius: '7px', color: textPrimary, fontSize: '0.85rem', fontFamily: ff, width: '110px' }} />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: textMuted, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Nota (pilihan)</label>
                <input type="text" placeholder="Cth: FB Ads Sep" value={adsForm.notes} onChange={e => setAdsForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ padding: '0.55rem 0.85rem', background: lm ? '#F8FAFC' : '#090A0F', border: cardBorder, borderRadius: '7px', color: textPrimary, fontSize: '0.85rem', fontFamily: ff, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button disabled={adsSubmitting || !adsForm.spend_date || !adsForm.amount}
                onClick={async () => {
                  if (!adsForm.spend_date || !adsForm.amount) return;
                  setAdsSubmitting(true);
                  try {
                    const res = await fetch('/api/admin/pnl-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spend_date: adsForm.spend_date, amount: parseFloat(adsForm.amount), notes: adsForm.notes || null, id: adsForm.id || undefined }) });
                    const json = await res.json();
                    if (json.success) { setAdsForm(f => ({ ...f, amount: '', notes: '', id: null })); fetchPnl(); }
                  } catch (_) {}
                  finally { setAdsSubmitting(false); }
                }}
                style={{ padding: '0.55rem 1.25rem', background: '#2563EB', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: ff, whiteSpace: 'nowrap', opacity: adsSubmitting ? 0.6 : 1 }}>
                {adsSubmitting ? 'Menyimpan...' : adsForm.id ? '✓ Kemaskini' : '+ Simpan'}
              </button>
            </div>
          </div>

          {pnlLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary, fontSize: '0.9rem' }}>⏳ Memuatkan laporan PNL...</div>
          ) : pnlData ? (
            <>
              {/* ── Summary Banner (Daily) ── */}
              {pnlData.mode === 'daily' && pnlData.summary && (() => {
                const s = pnlData.summary;
                return (
                  <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                    {[
                      { label: '💵 Revenue',   val: formatRM(s.total_revenue), sub: `${s.total_orders} order`,        col: lm ? '#047857' : '#34D399' },
                      { label: '📦 COGS',      val: formatRM(s.total_cogs),    sub: `${s.total_units} unit × kos`,    col: textSecondary },
                      { label: '💸 Kos Ads',   val: formatRM(s.total_ads),     sub: s.roas ? `ROAS: ${s.roas}×` : 'Belum isi', col: '#60A5FA' },
                      { label: '💰 Gross PNL', val: formatRM(s.gross_pnl),     sub: '(Revenue − COGS)',               col: s.gross_pnl >= 0 ? '#10B981' : '#EF4444' },
                      { label: '🎯 Net PNL',   val: formatRM(s.net_pnl),       sub: `Margin: ${s.net_margin}%`,       col: s.net_pnl >= 0 ? '#10B981' : '#EF4444' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.label}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: item.col }}>{item.val}</div>
                        <div style={{ fontSize: '0.68rem', color: textMuted, marginTop: '0.12rem' }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ── Package Breakdown Summary ── */}
              {pnlData.mode === 'daily' && pnlData.summary?.total_pkg && (
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '0.9rem 1.5rem', marginBottom: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase' }}>📦 Pecahan Set:</div>
                  {[1, 2, 3].map(k => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.62rem', color: textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Set {k}U</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: k === 1 ? '#60A5FA' : k === 2 ? '#34D399' : '#F59E0B', lineHeight: 1 }}>{pnlData.summary.total_pkg[k] ?? 0}</div>
                      <div style={{ fontSize: '0.62rem', color: textMuted }}>order</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Daily Breakdown Table ── */}
              {pnlData.mode === 'daily' && (
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', overflowX: 'auto', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 800, color: textPrimary }}>📋 Breakdown Harian</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: cardBorder }}>
                        {['Tarikh', '1U', '2U', '3U', 'Order', 'Revenue', 'Ads', 'Net PNL', ''].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.6rem', textAlign: ['Revenue','Ads','Net PNL'].includes(h) ? 'right' : 'left', fontSize: '0.66rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(pnlData.daily || []).map(d => (
                        <tr key={d.date} style={{ borderBottom: `1px solid ${lm ? '#F1F5F9' : 'rgba(255,255,255,0.04)'}` }}>
                          <td style={{ padding: '0.6rem 0.6rem', color: textSecondary, whiteSpace: 'nowrap', fontSize: '0.79rem' }}>
                            {new Date(d.date + 'T12:00:00Z').toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          {[1, 2, 3].map(k => (
                            <td key={k} style={{ padding: '0.6rem 0.4rem', textAlign: 'center', fontWeight: (d.pkg?.[k] || 0) > 0 ? 800 : 400, color: (d.pkg?.[k] || 0) > 0 ? (k === 1 ? '#60A5FA' : k === 2 ? '#34D399' : '#F59E0B') : textMuted }}>
                              {d.pkg?.[k] ?? 0}
                            </td>
                          ))}
                          <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: textSecondary }}>{d.orders}</td>
                          <td style={{ padding: '0.6rem 0.6rem', textAlign: 'right', fontWeight: 700, color: lm ? '#047857' : '#34D399' }}>{formatRM(d.revenue)}</td>
                          <td style={{ padding: '0.6rem 0.6rem', textAlign: 'right', color: d.ads_cost ? '#60A5FA' : textMuted }}>{d.ads_cost ? formatRM(d.ads_cost) : '—'}</td>
                          <td style={{ padding: '0.6rem 0.6rem', textAlign: 'right', fontWeight: 700, color: d.net_pnl !== null ? (d.net_pnl >= 0 ? '#10B981' : '#EF4444') : textMuted }}>
                            {d.net_pnl !== null ? `${d.net_pnl >= 0 ? '+' : ''}${formatRM(d.net_pnl)}` : '—'}
                          </td>
                          <td style={{ padding: '0.6rem 0.4rem', whiteSpace: 'nowrap' }}>
                            <button onClick={() => setAdsForm({ spend_date: d.date, amount: d.ads_cost ?? '', notes: d.ads_notes ?? '', id: d.ads_id })}
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${d.ads_id ? 'rgba(96,165,250,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: '5px', background: d.ads_id ? 'rgba(96,165,250,0.08)' : 'rgba(16,185,129,0.08)', color: d.ads_id ? '#60A5FA' : '#34D399', fontFamily: ff }}>
                              {d.ads_id ? '✏️' : '+ Ads'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Monthly Table ── */}
              {pnlData.mode === 'monthly' && (
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', overflowX: 'auto', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 800, color: textPrimary }}>📅 Laporan Bulanan (6 Bulan Terakhir)</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: cardBorder }}>
                        {['Bulan', '1U', '2U', '3U', 'Order', 'Revenue', 'Kos Ads', 'COGS', 'Net PNL', 'ROAS'].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.6rem', textAlign: ['Bulan','1U','2U','3U','Order'].includes(h) ? 'left' : 'right', fontSize: '0.66rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(pnlData.data || []).map(m => (
                        <tr key={m.key} style={{ borderBottom: `1px solid ${lm ? '#F1F5F9' : 'rgba(255,255,255,0.04)'}` }}>
                          <td style={{ padding: '0.65rem 0.6rem', fontWeight: 700, color: textPrimary, whiteSpace: 'nowrap' }}>{m.label}</td>
                          {[1, 2, 3].map(k => (
                            <td key={k} style={{ padding: '0.65rem 0.4rem', fontWeight: (m.pkg?.[k] || 0) > 0 ? 800 : 400, color: (m.pkg?.[k] || 0) > 0 ? (k === 1 ? '#60A5FA' : k === 2 ? '#34D399' : '#F59E0B') : textMuted }}>
                              {m.pkg?.[k] ?? 0}
                            </td>
                          ))}
                          <td style={{ padding: '0.65rem 0.4rem', color: textSecondary }}>{m.orders}</td>
                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontWeight: 700, color: lm ? '#047857' : '#34D399' }}>{formatRM(m.revenue)}</td>
                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', color: m.total_ads > 0 ? '#60A5FA' : textMuted }}>{m.total_ads > 0 ? formatRM(m.total_ads) : '—'}</td>
                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', color: textSecondary }}>{formatRM(m.cogs)}</td>
                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', fontWeight: 700, color: m.net_pnl >= 0 ? '#10B981' : '#EF4444' }}>{`${m.net_pnl >= 0 ? '+' : ''}${formatRM(m.net_pnl)}`}</td>
                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'right', color: m.roas ? '#A78BFA' : textMuted }}>{m.roas ? `${m.roas}×` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: textSecondary }}>Tiada data PNL tersedia.</div>
          )}
        </>
      )}
    </div>
  );
}
