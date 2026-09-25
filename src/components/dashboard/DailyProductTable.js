'use client';

import { Fragment, useEffect, useState } from 'react';
import AdsInput from '@/components/dashboard/AdsInput';

// Jadual harian collapsible — dipakai page Gaji marketer & page Kos Ads HQ.
// Baris utama: total hari tu. Klik → pecahan ikut produk + input ads setiap produk.

export function formatRM(val) {
  if (!val && val !== 0) return 'RM 0.00';
  return `RM ${parseFloat(val).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Roas({ roas, muted }) {
  if (roas === null || roas === undefined) return <span style={{ color: muted, opacity: 0.6 }}>—</span>;
  return <span style={{ fontWeight: 700, color: roas >= 1 ? '#10B981' : '#EF4444' }}>{roas.toFixed(2)}x</span>;
}

// ─── Ringkasan ikut produk (bulanan) ─────────────────────────────────────────
export function ProductSummaryTable({ rows = [], theme, title = '📦 Prestasi Ikut Produk' }) {
  const { lm, cardBg, subCardBg, cardBorder, textPrimary, textSecondary, textMuted } = theme;
  const cell = { padding: '0.7rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' };
  return (
    <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
      <div style={{ padding: '1.25rem', borderBottom: cardBorder }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>{title}</h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>
          Add-on (cth: Kasturi dalam order Sabun) dikira dalam produk utama order — termasuk COGS & postage.
        </p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
              {[['Produk', 'left'], ['Order'], ['Sales'], ['Ads'], ['COGS'], ['Profit'], ['ROAS']].map(([h, align = 'right']) => (
                <th key={h} style={{ ...cell, textAlign: align, padding: '0.75rem 1rem', color: textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.key} style={{ borderBottom: cardBorder }}>
                <td style={{ ...cell, textAlign: 'left', fontWeight: 600, color: p.editable === false ? textMuted : textPrimary }}>{p.label}</td>
                <td style={{ ...cell, color: textSecondary }}>{p.orders}</td>
                <td style={{ ...cell, color: '#10B981', fontWeight: 600 }}>{formatRM(p.sales)}</td>
                <td style={{ ...cell, color: '#F59E0B', fontWeight: 600 }}>{formatRM(p.ads)}</td>
                <td style={{ ...cell, color: '#8B5CF6' }}>{formatRM(p.cogs)}</td>
                <td style={{ ...cell, fontWeight: 700, color: p.profit >= 0 ? '#10B981' : '#EF4444' }}>{formatRM(p.profit)}</td>
                <td style={cell}><Roas roas={p.roas} muted={textMuted} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Jadual harian collapsible ───────────────────────────────────────────────
/**
 * @param days      dari buildMonthlyBreakdown (lib/products)
 * @param totals    { orders, sales, ads, cogs, profit, komisen? } — baris JUMLAH
 * @param commissionPct  null = tiada column Komisen (HQ)
 * @param endpoint  API PUT untuk simpan ads (marketer / admin)
 * @param onSaved   dipanggil lepas ads disimpan (refresh data)
 */
export default function DailyProductTable({ days = [], totals = {}, commissionPct = null, endpoint, onSaved, theme, hint }) {
  const { lm, cardBg, subCardBg, cardBorder, textPrimary, textSecondary, textMuted } = theme;
  const showKomisen = commissionPct !== null && commissionPct !== undefined;

  // Hari ini terbuka automatik; reset bila tukar bulan
  const monthKey = days[0]?.date?.slice(0, 7);
  const [open, setOpen] = useState(() => new Set(days.filter(d => d.isToday).map(d => d.date)));
  useEffect(() => {
    setOpen(new Set(days.filter(d => d.isToday).map(d => d.date)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const toggle = (date) => setOpen(prev => {
    const next = new Set(prev);
    next.has(date) ? next.delete(date) : next.add(date);
    return next;
  });

  const cols = [['Tarikh', 'left'], ['Order'], ['Sales'], ['Ads'], ['COGS'], ['Profit'], ...(showKomisen ? [[`Komisen ${commissionPct}%`]] : [])];
  const cell  = { padding: '0.65rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' };
  const empty = <span style={{ opacity: 0.35 }}>—</span>;
  const accent = lm ? '#A7F3D0' : 'rgba(16,185,129,0.35)';

  return (
    <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
      <div style={{ padding: '1.25rem', borderBottom: cardBorder }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: textPrimary }}>📅 Pecahan Harian</h2>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: textMuted }}>
          {hint || <>Klik tarikh untuk pecahan ikut produk & isi <strong style={{ color: '#F59E0B' }}>kos ads</strong> — tekan Enter atau klik luar untuk simpan. Kosongkan / 0 untuk padam.</>}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
              {cols.map(([h, align = 'right']) => (
                <th key={h} style={{ ...cell, padding: '0.75rem 1rem', textAlign: align, color: h === 'Ads' ? '#F59E0B' : textSecondary, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => {
              const isOpen = open.has(d.date) && !d.isFuture;
              const rowBg = d.isToday
                ? (lm ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)')
                : isOpen ? subCardBg : (i % 2 === 0 ? 'transparent' : subCardBg);
              return (
                <Fragment key={d.date}>
                  <tr
                    onClick={() => !d.isFuture && toggle(d.date)}
                    style={{ background: rowBg, borderBottom: isOpen ? 'none' : cardBorder, opacity: d.isFuture ? 0.45 : 1, cursor: d.isFuture ? 'default' : 'pointer' }}
                  >
                    <td style={{ ...cell, textAlign: 'left', fontWeight: 600, color: textPrimary }}>
                      <span style={{ display: 'inline-block', width: '1rem', color: textMuted, fontSize: '0.75rem' }}>{d.isFuture ? '' : isOpen ? '▾' : '▸'}</span>
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {d.isToday && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', fontWeight: 700, color: '#10B981' }}>HARI INI</span>}
                      {d.missingAds && <span title="Ada order tapi kos ads belum diisi" style={{ marginLeft: '0.4rem', fontSize: '0.65rem', fontWeight: 700, color: '#F59E0B' }}>⚠️ ads kosong</span>}
                    </td>
                    <td style={{ ...cell, color: textSecondary }}>{d.orders || empty}</td>
                    <td style={{ ...cell, color: '#10B981', fontWeight: 500 }}>{d.sales ? formatRM(d.sales) : empty}</td>
                    <td style={{ ...cell, color: '#F59E0B', fontWeight: 600 }}>{d.ads ? formatRM(d.ads) : empty}</td>
                    <td style={{ ...cell, color: '#8B5CF6', fontWeight: 500 }}>{d.cogs ? formatRM(d.cogs) : empty}</td>
                    <td style={{ ...cell, color: d.profit >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>{d.sales || d.ads ? formatRM(d.profit) : empty}</td>
                    {showKomisen && <td style={{ ...cell, color: '#10B981', fontWeight: 700 }}>{d.komisen ? formatRM(d.komisen) : empty}</td>}
                  </tr>

                  {isOpen && (
                    <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                      <td colSpan={cols.length} style={{ padding: '0.25rem 0.75rem 0.9rem 1.75rem' }}>
                        <div style={{ borderLeft: `3px solid ${accent}`, borderRadius: '4px', background: cardBg, overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                              <tr style={{ borderBottom: cardBorder }}>
                                {[['Produk', 'left'], ['Order'], ['Sales'], ['Ads'], ['COGS'], ['Profit'], ['ROAS']].map(([h, align = 'right']) => (
                                  <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: align, color: h === 'Ads' ? '#F59E0B' : textMuted, fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {d.products.map(p => {
                                const sub = { padding: '0.45rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' };
                                return (
                                  <tr key={p.key} style={{ borderBottom: cardBorder }}>
                                    <td style={{ ...sub, textAlign: 'left', fontWeight: 600, color: p.editable ? textPrimary : textMuted }}>{p.label}</td>
                                    <td style={{ ...sub, color: textSecondary }}>{p.orders || empty}</td>
                                    <td style={{ ...sub, color: '#10B981' }}>{p.sales ? formatRM(p.sales) : empty}</td>
                                    <td style={{ ...sub, padding: '0.3rem 0.5rem' }} onClick={e => e.stopPropagation()}>
                                      {p.editable ? (
                                        <AdsInput date={d.date} product={p.key} value={p.ads} endpoint={endpoint} onSaved={onSaved} lm={lm} textPrimary={textPrimary} />
                                      ) : empty}
                                    </td>
                                    <td style={{ ...sub, color: '#8B5CF6' }}>{p.cogs ? formatRM(p.cogs) : empty}</td>
                                    <td style={{ ...sub, fontWeight: 600, color: p.profit >= 0 ? '#10B981' : '#EF4444' }}>{p.sales || p.ads ? formatRM(p.profit) : empty}</td>
                                    <td style={sub}><Roas roas={p.roas} muted={textMuted} /></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            <tr style={{ background: lm ? '#F1F5F9' : '#040508', fontWeight: 800, borderTop: `2px solid ${lm ? '#E2E8F0' : '#1E293B'}` }}>
              <td style={{ ...cell, padding: '1rem', textAlign: 'left', color: textPrimary }}>JUMLAH</td>
              <td style={{ ...cell, padding: '1rem', color: textSecondary }}>{totals.orders ?? days.reduce((n, d) => n + d.orders, 0)}</td>
              <td style={{ ...cell, padding: '1rem', color: '#10B981' }}>{formatRM(totals.sales)}</td>
              <td style={{ ...cell, padding: '1rem', color: '#F59E0B' }}>{formatRM(totals.ads)}</td>
              <td style={{ ...cell, padding: '1rem', color: '#8B5CF6' }}>{formatRM(totals.cogs)}</td>
              <td style={{ ...cell, padding: '1rem', color: (totals.profit ?? 0) >= 0 ? '#10B981' : '#EF4444' }}>{formatRM(totals.profit)}</td>
              {showKomisen && <td style={{ ...cell, padding: '1rem', color: '#10B981' }}>{formatRM(totals.komisen)}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
