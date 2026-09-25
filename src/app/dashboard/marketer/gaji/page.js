'use client';

import { useState, useEffect, useCallback } from 'react';
import AdsInput from '@/components/dashboard/AdsInput';
import { PRODUCTS } from '@/lib/products';

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

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/marketer/gaji?month=${currentMonth}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (_) {}
    finally { if (!silent) setLoading(false); }
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

            {/* Prestasi Ikut Produk */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ padding: '1.25rem', borderBottom: cardBorder }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📦 Prestasi Ikut Produk</h2>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>Add-on (cth: Kasturi dalam order Sabun) dikira dalam produk utama order.</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                      {[['Produk', 'left'], ['Order', 'right'], ['Sales', 'right'], ['Ads', 'right'], ['ROAS', 'right']].map(([h, align]) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: align, color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(totals.productSummary || []).map(p => (
                      <tr key={p.key} style={{ borderBottom: cardBorder }}>
                        <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: textPrimary }}>{p.label}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textSecondary }}>{p.orders}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatRM(p.sales)}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: '#F59E0B', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatRM(p.ads)}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', fontWeight: 700, color: p.roas === null ? textMuted : p.roas >= 1 ? '#10B981' : '#EF4444' }}>{p.roas === null ? '—' : `${p.roas.toFixed(2)}x`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily Breakdown Table — semua hari; column Ads boleh diisi terus */}
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ padding: '1.25rem', borderBottom: cardBorder }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📅 Pecahan Harian</h2>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>
                  Isi kos ads harian <strong style={{ color: '#F59E0B' }}>ikut produk</strong> terus dalam jadual — tekan Enter atau klik luar untuk simpan. Kosongkan / 0 untuk padam.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                      {[['Tarikh', 'left'], ['Order', 'right'], ['Sales', 'right'], ...PRODUCTS.map(p => [`Ads ${p.short}`, 'right', true]), ['Total Ads', 'right'], ['COGS', 'right'], ['Profit', 'right'], [`Komisen ${totals.commission_pct ?? ''}%`, 'right']].map(([h, align, isAds]) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: align, color: isAds || h === 'Total Ads' ? '#F59E0B' : textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((d, i) => {
                      const muted = d.isFuture;
                      const rowBg = d.isToday
                        ? (lm ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)')
                        : (i % 2 === 0 ? 'transparent' : subCardBg);
                      const cell  = { padding: '0.6rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' };
                      const empty = <span style={{ opacity: 0.35 }}>—</span>;
                      return (
                        <tr key={d.date} style={{ background: rowBg, borderBottom: cardBorder, opacity: muted ? 0.45 : 1 }}>
                          <td style={{ ...cell, textAlign: 'left', fontWeight: 600, color: textPrimary }}>
                            {new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {d.isToday && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', fontWeight: 700, color: '#10B981' }}>HARI INI</span>}
                          </td>
                          <td style={{ ...cell, color: textSecondary }}>{d.orders || empty}</td>
                          <td style={{ ...cell, color: '#10B981', fontWeight: 500 }}>{d.sales ? formatRM(d.sales) : empty}</td>
                          {PRODUCTS.map(p => (
                            <td key={p.key} style={{ ...cell, padding: '0.4rem 0.5rem' }}>
                              <AdsInput
                                date={d.date}
                                product={p.key}
                                value={d.adsByProduct?.[p.key]}
                                disabled={d.isFuture}
                                onSaved={() => fetchData(true)}
                                lm={lm}
                                textPrimary={textPrimary}
                              />
                            </td>
                          ))}
                          <td style={{ ...cell, color: '#F59E0B', fontWeight: 600 }}>{d.ads ? formatRM(d.ads) : empty}</td>
                          <td style={{ ...cell, color: '#8B5CF6', fontWeight: 500 }}>{d.cogs ? formatRM(d.cogs) : empty}</td>
                          <td style={{ ...cell, color: d.profit >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>{d.sales || d.ads ? formatRM(d.profit) : empty}</td>
                          <td style={{ ...cell, color: '#10B981', fontWeight: 700 }}>{d.komisen ? formatRM(d.komisen) : empty}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: lm ? '#F1F5F9' : '#040508', fontWeight: 800, borderTop: `2px solid ${lm ? '#E2E8F0' : '#1E293B'}` }}>
                      <td style={{ padding: '1rem', color: textPrimary }}>JUMLAH</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: textSecondary }}>{daily.reduce((n, d) => n + (d.orders || 0), 0)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#10B981' }}>{formatRM(totals.totalSales)}</td>
                      {PRODUCTS.map(p => (
                        <td key={p.key} style={{ padding: '1rem', textAlign: 'right', color: '#F59E0B', whiteSpace: 'nowrap' }}>
                          {formatRM((totals.productSummary || []).find(x => x.key === p.key)?.ads || 0)}
                        </td>
                      ))}
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#F59E0B', whiteSpace: 'nowrap' }}>{formatRM(totals.totalAds)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#8B5CF6' }}>{formatRM(totals.totalCOGS)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: profitPositive ? '#10B981' : '#EF4444' }}>{formatRM(totals.profit)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#10B981' }}>{formatRM(totals.komisen)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
