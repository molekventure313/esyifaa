'use client';

import { useState, useEffect, useCallback } from 'react';
import DailyProductTable, { ProductSummaryTable, formatRM } from '@/components/dashboard/DailyProductTable';

// Kos Ads HQ — admin isi ads HQ ikut produk (harian, collapsible) + prestasi sales HQ.
// Order HQ = order tanpa marketer (marketer_id NULL).

const thisMonthMY = () => new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 7);

export default function AdminAdsPage() {
  const [month, setMonth]     = useState(thisMonthMY());
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
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

  // silent === true → refresh tanpa spinner (lepas simpan ads)
  const fetchData = useCallback(async (silent) => {
    if (silent !== true) setLoading(true);
    try {
      const res  = await fetch(`/api/admin/ads-spend/hq-daily?month=${month}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (_) {}
    finally { if (silent !== true) setLoading(false); }
  }, [month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const shiftMonth = (n) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  };
  const monthLabel = new Date(`${month}-01T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' });

  const lm = isLightMode;
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const theme = { lm, cardBg, subCardBg, cardBorder, textPrimary, textSecondary, textMuted };

  const t = data?.totals || {};
  const profitPositive = (t.profit ?? 0) >= 0;
  const cards = [
    { label: '💰 Sales HQ',  val: formatRM(t.sales), color: '#10B981' },
    { label: '💸 Total Ads', val: formatRM(t.ads),   color: '#F59E0B' },
    { label: '📦 COGS',      val: formatRM(t.cogs),  color: '#8B5CF6' },
    { label: '🎯 Profit',    val: formatRM(t.profit), color: profitPositive ? '#10B981' : '#EF4444' },
    { label: '📈 ROAS',      val: t.roas ? `${t.roas.toFixed(2)}x` : '—', color: t.roas >= 1 ? '#10B981' : textSecondary },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, padding: '0.25rem 0' }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>📊 Kos Ads HQ</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: textSecondary }}>
            Isi kos ads HQ ikut produk & pantau sales order HQ (tanpa marketer).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: subCardBg, padding: '0.4rem', borderRadius: '8px', border: cardBorder }}>
          <button onClick={() => shiftMonth(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1.2rem' }}>◀</button>
          <span style={{ fontWeight: 700, minWidth: '130px', textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: textSecondary, fontSize: '1.2rem' }}>▶</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem', flexDirection: 'column' }}>
          <div style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan data...</span>
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: textMuted }}>Gagal muatkan data. Cuba refresh.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {cards.map(c => (
              <div key={c.label} style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.1rem 1.3rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{c.label}</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{c.val}</div>
              </div>
            ))}
          </div>

          <ProductSummaryTable rows={data.productSummary || []} theme={theme} title="📦 Prestasi HQ Ikut Produk" />

          <DailyProductTable
            days={data.days || []}
            totals={t}
            endpoint="/api/admin/ads-spend"
            onSaved={() => fetchData(true)}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
