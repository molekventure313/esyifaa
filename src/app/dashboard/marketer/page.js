'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PERIODS = [
  { id: 'today',     label: 'Hari Ini' },
  { id: 'yesterday', label: 'Kelmarin' },
  { id: 'week',      label: 'Mingguan' },
  { id: 'month',     label: 'Bulanan' },
  { id: 'all',       label: 'Keseluruhan' },
];

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

export default function MarketerDashboardPage() {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
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
      const res = await fetch(`/api/marketer/stats?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const marketerName = data?.profile?.full_name || 'Marketer';
  const totals = data || {};
  const recent = data?.recentOrders || [];
  const bySP = data?.salesBySource || [];
  const maxRev = bySP[0]?.revenue || 1;
  const profitPositive = totals.profit >= 0;

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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: textPrimary }}>
            Dashboard Marketer — {marketerName}
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: textSecondary }}>
            Dikemaskini setiap 15 saat
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
          <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan data jualan...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>📦 Total Orders</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{totals.totalOrders ?? 0}</div>
            </div>
            <div style={{ background: lm ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(5,150,105,0.15))', border: lm ? '1px solid #A7F3D0' : '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 2px 8px rgba(16,185,129,0.1)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>💰 Total Revenue (RM)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lm ? '#065F46' : '#6EE7B7', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalRevenue)}</div>
            </div>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>💸 Total Ads Spend (RM)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalAdsSpend)}</div>
            </div>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: lm ? '#92400E' : '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>📦 COGS + Postage (RM)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: lm ? '#92400E' : '#FCD34D', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalCOGS ?? 0)}</div>
            </div>
            <div style={{ background: profitPositive ? (lm ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)') : (lm ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)'), border: profitPositive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: profitPositive ? '#10B981' : '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>🎯 Net Profit (RM)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: profitPositive ? '#10B981' : '#EF4444', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.profit)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Sales By Source */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📊 Sales by Salespage</h2>
              </div>
              {bySP.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Tiada data jualan.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {bySP.map((sp, i) => {
                    const pct = Math.round((sp.revenue / maxRev) * 100);
                    return (
                      <div key={sp.source}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: textPrimary }}>{sp.source}</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: lm ? '#047857' : '#34D399' }}>{formatRM(sp.revenue)}</span>
                            <span style={{ fontSize: '0.7rem', color: textMuted, marginLeft: '0.4rem' }}>({sp.count} order)</span>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>🕐 Recent Orders</h2>
                <Link href="/dashboard/marketer/orders" style={{ fontSize: '0.775rem', fontWeight: 700, color: lm ? '#047857' : '#34D399', textDecoration: 'none' }}>Lihat Semua →</Link>
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Tiada order.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {recent.map(o => (
                    <div key={o.id} style={{ padding: '0.7rem 0.9rem', borderRadius: '8px', background: subCardBg, border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textPrimary }}>{o.full_name}</div>
                        <div style={{ fontSize: '0.7rem', color: textMuted, marginTop: '0.1rem' }}>{o.source} · {formatTimeAgo(o.created_at)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '5px', background: o.payment_status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: o.payment_status === 'completed' ? '#10B981' : '#F59E0B' }}>
                          {o.payment_status}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: lm ? '#047857' : '#34D399' }}>{formatRM(o.amount ?? o.amount_paid)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
