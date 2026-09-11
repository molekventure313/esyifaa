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

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, stockRes] = await Promise.all([
        fetch(`/api/admin/sales-stats?period=${period}`).then(r => r.json()),
        fetch('/api/stock/summary').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (statsRes.success) {
        setData(statsRes.data);
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
      if (stockRes.success) setStockSummary(stockRes.data);
    } catch (_) {}
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totals   = data?.totals   || {};
  const vsPrev   = data?.vs_previous || {};
  const bySP     = data?.by_salespage || [];
  const recent   = data?.recent_orders || [];
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

      {loading ? (
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
                  {recent.map(o => (
                    <div key={o.id} style={{
                      padding: '0.7rem 0.9rem', borderRadius: '8px',
                      background: subCardBg, border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.full_name}
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
                  ))}
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
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{link.icon}</div>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: textPrimary }}>{link.title}</h4>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: textSecondary }}>{link.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
