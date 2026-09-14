'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

const SALESPAGES = [
  { slug: 'sihir', label: 'Sihir & Gangguan Jin', category: 'Rawatan' },
  { slug: 'saka', label: 'Saka Keturunan', category: 'Rawatan' },
  { slug: 'penyakit-misteri', label: 'Penyakit Misteri', category: 'Rawatan' },
  { slug: 'gangguan-berulang', label: 'Gangguan Berulang', category: 'Rawatan' },
  { slug: 'belum-zuriat', label: 'Belum Zuriat', category: 'Rawatan' },
  { slug: 'kedai-tutup', label: 'Kedai Tutup / Bisnes Merosot', category: 'Rawatan' },
  { slug: 'fsp', label: 'FSP (Formula Sales Page)', category: 'Rawatan' },
  { slug: 'sabun-garam-1', label: 'Sabun Garam #1 — Saka/Sihir', category: 'Produk Fizikal' },
  { slug: 'sabun-garam-2', label: 'Sabun Garam #2 — Lenguh Badan', category: 'Produk Fizikal' },
  { slug: 'sabun-garam-3', label: 'Sabun Garam #3 — Sakit Misteri', category: 'Produk Fizikal' },
  { slug: 'sabun-garam-4', label: 'Sabun Garam #4 — Emosi/Bisikan', category: 'Produk Fizikal' },
  { slug: 'sabun-garam-5', label: 'Sabun Garam #5 — Anak Meracau', category: 'Produk Fizikal' },
  { slug: 'pengisian-esyifa', label: 'Pengisian ESyifa', category: 'Pengisian' },
  { slug: 'rawat-sendiri', label: 'Rawat Sendiri', category: 'Pengisian' },
  { slug: 'tasbih-esyifa', label: 'Tasbih ESyifa', category: 'Pengisian' },
  { slug: 'e-video', label: 'E-Video Ruqyah', category: 'E-Video' },
];

export default function MarketerLinksPage() {
  const { profile } = useAuth();
  const [copiedLink, setCopiedLink] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleCopy = (link, slug) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const lm = isLightMode;
  const cardBg = lm ? '#FFFFFF' : '#10131A';
  const subCardBg = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted = lm ? '#64748B' : '#6B7280';

  const marketerCode = profile?.marketer_code || 'M000';

  // Group by category
  const grouped = SALESPAGES.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', background: cardBg, border: cardBorder, boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>Link Promosi (Affiliate)</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: textSecondary }}>Salin link di bawah untuk tujuan promosi dan pemasaran. Kod marketer anda ialah <strong style={{ color: '#10B981' }}>{marketerCode}</strong>.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: textPrimary, borderBottom: cardBorder, paddingBottom: '0.5rem' }}>{category}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {items.map((item) => {
                const link = `https://esyifaa.com/${item.slug}?m=${marketerCode}`;
                const isCopied = copiedLink === item.slug;
                
                return (
                  <div key={item.slug} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: lm ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: textPrimary }}>{item.label}</div>
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: lm ? '#F1F5F9' : 'rgba(255,255,255,0.06)', color: textSecondary }}>{item.category}</span>
                    </div>
                    <div style={{ background: subCardBg, border: cardBorder, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: textSecondary, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                      {link}
                    </div>
                    <button
                      onClick={() => handleCopy(link, item.slug)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: isCopied ? '#10B981' : (lm ? '#F1F5F9' : 'rgba(255,255,255,0.06)'), color: isCopied ? '#FFFFFF' : textPrimary, fontWeight: 600, fontSize: '0.8rem', border: isCopied ? 'none' : cardBorder, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {isCopied ? '✅ Disalin!' : '📋 Salin Link'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
