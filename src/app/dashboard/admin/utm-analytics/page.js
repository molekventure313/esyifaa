'use client';
import { useState, useEffect, useCallback } from 'react';

const PERIODS = [
  { id: 'today',     label: 'Hari Ini' },
  { id: 'yesterday', label: 'Semalam' },
  { id: 'week',      label: '7 Hari' },
  { id: 'month',     label: 'Bulan Ini' },
];

function fmt(v) { return `RM ${parseFloat(v || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(s) {
  const d = new Date(new Date(s).getTime() + 8 * 3600000);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── Campaign drill-down row ─────────────────────────────────────────────────
function CampaignRow({ c, depth = 0, lm, textPrimary, textSecondary, textMuted, cardBorder }) {
  const [open, setOpen] = useState(depth === 0 ? false : false);
  const hasChildren = depth === 0 ? c.adsets?.length > 0 : depth === 1 ? c.ads?.length > 0 : false;
  const children    = depth === 0 ? c.adsets : depth === 1 ? c.ads : [];
  const label       = depth === 0 ? c.campaign : depth === 1 ? c.adset : c.ad;
  const icon        = depth === 0 ? '🎯' : depth === 1 ? '📂' : '🖼';
  const indentPx    = depth * 28;

  const barMax = c.revenue;
  const barW   = '100%';

  return (
    <>
      <tr
        onClick={() => hasChildren && setOpen(o => !o)}
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          background: open ? (lm ? 'rgba(59,130,246,0.04)' : 'rgba(99,102,241,0.06)') : 'transparent',
          borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
          transition: 'background 0.1s',
        }}
      >
        <td style={{ padding: `0.7rem 1rem 0.7rem ${indentPx + 16}px`, whiteSpace: 'nowrap', maxWidth: '320px' }}>
          <span style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}>
            {hasChildren ? (open ? '▼' : '▶') : '·'}
          </span>
          <span style={{ fontSize: '0.75rem', marginRight: '0.35rem' }}>{icon}</span>
          <span style={{ fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 400, color: textPrimary, fontSize: '0.83rem' }}>
            {label}
          </span>
        </td>
        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textPrimary, fontWeight: 600, fontSize: '0.83rem' }}>{c.orders}</td>
        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399', fontWeight: 700, fontSize: '0.83rem' }}>{fmt(c.revenue)}</td>
        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textSecondary, fontSize: '0.82rem' }}>{fmt(c.avg_order)}</td>
      </tr>
      {open && (children || []).map((child, i) => (
        <CampaignRow key={i} c={child} depth={depth + 1} lm={lm}
          textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} cardBorder={cardBorder} />
      ))}
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function UTMAnalyticsPage() {
  const [period,     setPeriod]     = useState('today');
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [utmOnly,    setUtmOnly]    = useState(false);
  const [sortCol,    setSortCol]    = useState('created_at');
  const [sortDir,    setSortDir]    = useState('desc');
  const [lm,         setLm]         = useState(false);

  useEffect(() => {
    const check = () => setLm(
      document.body.classList.contains('light-mode') ||
      document.documentElement.getAttribute('data-theme') === 'light'
    );
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/utm-analytics?period=${period}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (_) {}
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const displayOrders = (() => {
    if (!data?.orders) return [];
    let o = utmOnly ? data.orders.filter(x => x.has_utm) : data.orders;
    o = [...o].sort((a, b) => {
      const av = a[sortCol] ?? ''; const bv = b[sortCol] ?? '';
      if (sortCol === 'amount') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return o;
  })();

  const s = data?.summary;

  const SortTh = ({ col, label, align = 'right' }) => (
    <th onClick={() => handleSort(col)} style={{
      padding: '0.65rem 1rem', textAlign: align, fontSize: '0.68rem', fontWeight: 700,
      color: sortCol === col ? (lm ? '#3B82F6' : '#60A5FA') : textSecondary,
      textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
      whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      {label} {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div style={{ fontFamily: ff, color: textPrimary }}>

      {/* Header */}
      <div style={{ padding: '1.2rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', background: cardBg, border: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: lm ? '#7C3AED' : '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>ESYIFAA · ADMIN</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>📊 UTM Analytics</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: textSecondary }}>Attribution order dari iklan — kempen, adset & iklan mana yang convert</p>
        </div>
        <button onClick={fetchData} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: cardBorder, cursor: 'pointer', fontFamily: ff, background: cardBg, color: textSecondary }}>🔄 Refresh</button>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: lm ? '#F1F5F9' : '#090A0F', padding: '3px', borderRadius: '8px', border: cardBorder }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '5px', fontSize: '0.78rem', fontWeight: period === p.id ? 700 : 500,
              border: 'none', cursor: 'pointer', fontFamily: ff, transition: 'all 0.15s',
              background: period === p.id ? (lm ? '#FFFFFF' : '#1E1B4B') : 'transparent',
              color: period === p.id ? (lm ? '#4F46E5' : '#A5B4FC') : textSecondary,
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderStyle: 'solid', borderWidth: '3px', borderColor: 'rgba(167,139,250,0.2)', borderTopColor: '#A78BFA', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan UTM data...</span>
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: textMuted }}>Gagal muatkan data.</div>
      ) : (
        <>
          {/* Summary Cards */}
          {s && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              {[
                { label: '📦 Total Orders', val: s.total_orders, valColor: textPrimary, bg: cardBg, border: cardBorder },
                { label: '🎯 UTM Orders', val: `${s.utm_orders} (${s.utm_pct}%)`, valColor: lm ? '#4F46E5' : '#A78BFA', bg: lm ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' },
                { label: '💰 Total Revenue', val: fmt(s.total_revenue), valColor: lm ? '#047857' : '#34D399', bg: lm ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)' },
                { label: '🎯 UTM Revenue', val: fmt(s.utm_revenue), valColor: lm ? '#4F46E5' : '#A78BFA', bg: lm ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' },
              ].map(c => (
                <div key={c.label} style={{ background: c.bg, border: c.border, borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
                  <div style={{ fontSize: '0.63rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{c.label}</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: c.valColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{c.val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Campaign Drill-down */}
          {data.campaigns?.length > 0 && (
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', marginBottom: '1.75rem', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🎯 Prestasi Kempen</div>
                  <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.1rem' }}>Kempen → Adset → Iklan. Klik row untuk expand.</div>
                </div>
                <div style={{ fontSize: '0.72rem', color: textMuted }}>
                  {data.campaigns.length} kempen
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff }}>
                  <thead>
                    <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kempen / Adset / Iklan</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg/Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((c, i) => (
                      <CampaignRow key={i} c={c} depth={0} lm={lm}
                        textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} cardBorder={cardBorder} />
                    ))}
                    {/* Organik row */}
                    {s.non_utm_orders > 0 && (
                      <tr style={{ background: lm ? '#F8FAFC' : 'rgba(255,255,255,0.02)', borderTop: lm ? '2px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
                        <td style={{ padding: '0.7rem 1rem', color: textMuted, fontSize: '0.82rem' }}>📵 Organik / Tiada UTM</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textMuted, fontSize: '0.82rem' }}>{s.non_utm_orders}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textMuted, fontSize: '0.82rem' }}>{fmt(s.non_utm_revenue)}</td>
                        <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: textMuted, fontSize: '0.82rem' }}>{s.non_utm_orders > 0 ? fmt(s.non_utm_revenue / s.non_utm_orders) : '—'}</td>
                      </tr>
                    )}
                    {/* Total row */}
                    <tr style={{ background: lm ? '#EFF6FF' : 'rgba(99,102,241,0.08)', borderTop: lm ? '2px solid #BFDBFE' : '1px solid rgba(99,102,241,0.25)', fontWeight: 800 }}>
                      <td style={{ padding: '0.8rem 1rem', color: lm ? '#1E40AF' : '#A5B4FC', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>⚡ JUMLAH</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: lm ? '#1E40AF' : '#A5B4FC' }}>{s.total_orders}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399' }}>{fmt(s.total_revenue)}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', color: textSecondary }}>{s.total_orders > 0 ? fmt(s.total_revenue / s.total_orders) : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.campaigns?.length === 0 && (
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '2rem', textAlign: 'center', marginBottom: '1.75rem', color: textMuted, fontSize: '0.85rem' }}>
              📵 Tiada data UTM untuk tempoh ini. Orders mungkin datang dari organik / direct.
            </div>
          )}

          {/* Orders Table */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>📋 Senarai Order</div>
                <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.1rem' }}>{displayOrders.length} rekod — klik header untuk sort</div>
              </div>
              <button onClick={() => setUtmOnly(v => !v)} style={{
                padding: '0.38rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                border: utmOnly ? '1px solid rgba(99,102,241,0.4)' : cardBorder,
                background: utmOnly ? (lm ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.12)') : cardBg,
                color: utmOnly ? (lm ? '#4F46E5' : '#A78BFA') : textSecondary,
                cursor: 'pointer', fontFamily: ff,
              }}>
                {utmOnly ? '✅' : '⬜'} UTM Sahaja
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: ff, fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: lm ? '#F8FAFC' : '#090A0F', borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
                    <SortTh col="created_at" label="Tarikh" align="left" />
                    <SortTh col="full_name"  label="Pelanggan" align="left" />
                    <SortTh col="source_label" label="SP" align="left" />
                    <SortTh col="amount"    label="Jumlah" />
                    <SortTh col="utm_campaign" label="Kempen" align="left" />
                    <SortTh col="utm_medium"   label="Adset" align="left" />
                    <SortTh col="utm_content"  label="Iklan" align="left" />
                    <SortTh col="marketer_name" label="Marketer" align="left" />
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}>
                      <td style={{ padding: '0.7rem 1rem', color: textMuted, whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                      <td style={{ padding: '0.7rem 1rem', color: textPrimary, fontWeight: 500, whiteSpace: 'nowrap', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.full_name}</td>
                      <td style={{ padding: '0.7rem 1rem', color: textSecondary, whiteSpace: 'nowrap' }}>{o.source_label}</td>
                      <td style={{ padding: '0.7rem 1rem', textAlign: 'right', color: lm ? '#047857' : '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(o.amount)}</td>
                      <td style={{ padding: '0.7rem 1rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.utm_campaign
                          ? <span style={{ color: lm ? '#4F46E5' : '#A78BFA', fontWeight: 500 }}>{o.utm_campaign}</span>
                          : <span style={{ color: textMuted, fontSize: '0.72rem' }}>organik</span>}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: textSecondary, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.utm_medium || '—'}</td>
                      <td style={{ padding: '0.7rem 1rem', color: textSecondary, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.utm_content || '—'}</td>
                      <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: o.marketer_name === 'HQ' ? (lm ? '#F1F5F9' : 'rgba(255,255,255,0.06)') : (lm ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)'), color: o.marketer_name === 'HQ' ? textMuted : (lm ? '#047857' : '#34D399'), fontWeight: 600 }}>
                          {o.marketer_name}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {displayOrders.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>
                      {utmOnly ? '📵 Tiada order dengan UTM dalam tempoh ini.' : 'Tiada rekod order.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
