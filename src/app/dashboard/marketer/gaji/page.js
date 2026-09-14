'use client';

import { useState, useEffect, useCallback } from 'react';

function formatRM(val) {
  if (!val && val !== 0) return 'RM 0.00';
  return `RM ${parseFloat(val).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MarketerGajiPage() {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [currentMonth, setCurrentMonth] = useState(currentMonthStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketer/gaji?month=${currentMonth}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeMonth = (offset) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const getMonthName = (monthStr) => {
    const [y, m] = monthStr.split('-');
    const date = new Date(y, m - 1, 1);
    return date.toLocaleString('ms-MY', { month: 'long', year: 'numeric' });
  };

  const lm = isLightMode;
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const totals = data || {};
  const daily = totals.dailyBreakdown || [];
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
            Gaji & Prestasi
          </h1>
        </div>

        {/* Month Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: subCardBg, padding: '0.4rem', borderRadius: '8px', border: cardBorder }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1.2rem' }}>◀</button>
          <span style={{ fontWeight: 700, minWidth: '130px', textAlign: 'center', color: textPrimary }}>{getMonthName(currentMonth)}</span>
          <button onClick={() => changeMonth(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1.2rem' }}>▶</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', flexDirection: 'column' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan data...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>💰 Total Sales</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalSales)}</div>
            </div>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>💸 Total Ads</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalAds)}</div>
            </div>
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>📦 Total COGS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.totalCOGS)}</div>
            </div>
            <div style={{ background: profitPositive ? (lm ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)') : (lm ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)'), border: profitPositive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '1.25rem 1.4rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: profitPositive ? '#10B981' : '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>🎯 Profit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: profitPositive ? '#10B981' : '#EF4444', letterSpacing: '-0.03em', lineHeight: 1 }}>{formatRM(totals.profit)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Gaji Summary Box */}
            <div style={{ background: lm ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, rgba(6,78,59,0.4), rgba(5,150,105,0.15))', border: '3px solid #10B981', borderRadius: '10px', padding: '1.5rem', boxShadow: lm ? '0 2px 8px rgba(16,185,129,0.1)' : 'none' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: lm ? '#065F46' : '#6EE7B7' }}>Ringkasan Gaji</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', color: textPrimary, fontWeight: 500 }}>
                <span>Gaji Basic</span>
                <span>{formatRM(totals.basic_salary)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem', color: textPrimary, fontWeight: 500 }}>
                <span>Komisen {totals.commission_pct}% (dari profit)</span>
                <span>+ {formatRM(totals.komisen)}</span>
              </div>
              
              {!profitPositive && (
                 <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#EF4444', fontStyle: 'italic' }}>
                   * Profit negatif — komisen tidak dikira
                 </div>
              )}
              
              <hr style={{ borderTop: lm ? '1px dashed #A7F3D0' : '1px dashed rgba(16,185,129,0.3)', borderBottom: 'none', margin: '0 0 1rem' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', color: textPrimary, fontWeight: 800 }}>
                <span>JUMLAH GAJI</span>
                <span style={{ color: '#10B981' }}>{formatRM(totals.totalGaji)} ✅</span>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ padding: '1.25rem', borderBottom: cardBorder }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📅 Pecahan Harian</h2>
              </div>
              
              {daily.length === 0 ? (
                 <div style={{ padding: '2rem', textAlign: 'center', color: textMuted, fontSize: '0.9rem' }}>Tiada data untuk bulan ini.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tarikh</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Sales</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Ads</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>COGS</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Profit</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Komisen {totals.commission_pct}%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daily.map((d, i) => (
                        <tr key={d.date} style={{ background: i % 2 === 0 ? 'transparent' : subCardBg, borderBottom: cardBorder }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: textPrimary }}>
                            {new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#10B981', fontWeight: 500 }}>{formatRM(d.sales)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#F59E0B', fontWeight: 500 }}>{formatRM(d.ads)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#8B5CF6', fontWeight: 500 }}>{formatRM(d.cogs)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: d.profit >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>{formatRM(d.profit)}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#10B981', fontWeight: 700 }}>{formatRM(d.komisen)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: lm ? '#F1F5F9' : '#040508', fontWeight: 800, borderTop: `2px solid ${lm ? '#E2E8F0' : '#1E293B'}` }}>
                        <td style={{ padding: '1rem', color: textPrimary }}>JUMLAH</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10B981' }}>{formatRM(totals.totalSales)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#F59E0B' }}>{formatRM(totals.totalAds)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#8B5CF6' }}>{formatRM(totals.totalCOGS)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: profitPositive ? '#10B981' : '#EF4444' }}>{formatRM(totals.profit)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10B981' }}>{formatRM(totals.komisen)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
