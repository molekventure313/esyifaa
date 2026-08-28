'use client';

import { useState, useEffect } from 'react';

// Salespage homepage variants (boleh ditetapkan sebagai homepage)
const SALESPAGES = [
  {
    slug: 'sihir',
    label: 'Angle: Sihir',
    desc: 'Rawatan sihir pemisah, penghalang rezeki & penyakit misteri.',
    url: '/sihir',
    color: '#7C3AED',
  },
  {
    slug: 'saka',
    label: 'Angle: Saka',
    desc: 'Gangguan turun-temurun yang mempengaruhi keluarga generasi demi generasi.',
    url: '/saka',
    color: '#B45309',
  },
  {
    slug: 'penyakit-misteri',
    label: 'Angle: Penyakit Misteri',
    desc: 'Sakit berterusan tapi doktor & ujian hospital sahkan semua normal.',
    url: '/penyakit-misteri',
    color: '#0369A1',
  },
  {
    slug: 'gangguan-berulang',
    label: 'Angle: Gangguan Berulang',
    desc: 'Sudah dirawat berkali-kali tapi gangguan masih kembali.',
    url: '/gangguan-berulang',
    color: '#BE123C',
  },
  {
    slug: 'belum-zuriat',
    label: 'Angle: Belum Dikurniakan Zuriat',
    desc: 'Pasangan yang belum mendapat zuriat & keguguran berulang.',
    url: '/belum-zuriat',
    color: '#0F766E',
  },
  {
    slug: 'kedai-tutup',
    label: 'Angle: Perniagaan Merosot',
    desc: 'Pelanggan lari, rezeki tersekat & gangguan pada premis perniagaan.',
    url: '/kedai-tutup',
    color: '#C2410C',
  },
  {
    slug: 'fsp',
    label: 'FSP 10% — Formula Homepage Baru',
    desc: 'Clone homepage dengan 15 sections FSP proven 10% conversion rate. Lead → Borang Diagnos Percuma.',
    url: '/fsp',
    color: '#059669',
  },
  {
    slug: 'wa',
    label: '💬 WA Landing Page (FB Ads → WhatsApp)',
    desc: 'Landing page khas untuk FB Ads → WhatsApp. Fokus: Scanning & Air Tawar PERCUMA. Auto-rotate antara perawat.',
    url: '/wa',
    color: '#25D366',
  },
];

// Salespage produk standalone (preview sahaja — bukan homepage variant)
const PRODUCT_PAGES = [
  {
    label: 'FSP Direct FPX Checkout',
    desc: 'Clone FSP 10% dengan bayaran terus FPX Online Banking via Chip Gateway (RM50).',
    url: '/fsp-checkout',
    color: '#10B981',
    icon: '💳',
    isNew: true,
  },
  {
    label: 'Pengisian E-Syifa\' (Servis Baharu)',
    desc: 'Salespage pengisian ayat ruqyah pada barang pesakit. Countdown 31 Ogos. RM90 → RM120.',
    url: '/pengisian-esyifa',
    color: '#D97706',
    icon: '💎',
  },
  {
    label: 'Tasbih E-Syifa\' (FSP V2)',
    desc: 'Clone tasbih dengan 15 sections FSP — versi upgrade dengan Fears, Authority, Goals & 3-kolum comparison.',
    url: '/tasbih-v2',
    color: '#F59E0B',
    icon: '📿',
    isNew: true,
  },
  {
    label: 'Rawat Sendiri — Pengisian V2',
    desc: 'Versi kedua pengisian esyifa dengan angle baru: "Berhenti bergantung pada perawat & mula rawat diri sendiri". 6 sections angle-specific, 9 sections dikongsi.',
    url: '/rawat-sendiri',
    color: '#10B981',
    icon: '🛡️',
    isNew: true,
  },
  {
    label: 'E-Video Rawatan Ruqyah',
    desc: 'Produk digital baru — rakaman video ruqyah RM150. Untuk rawatan diri, rumah, air tawar, garam mandian & bisa. Video dihantar via WhatsApp dalam 24 jam selepas bayar FPX.',
    url: '/e-video',
    color: '#8B5CF6',
    icon: '🎬',
    isNew: true,
  },
];

export default function SalespageManagement({ isLightMode, cardBg, cardBorder, textPrimary, textSecondary }) {
  const [activeSlug, setActiveSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // slug being saved

  const [trackingTypes, setTrackingTypes] = useState({});
  const [togglingTracking, setTogglingTracking] = useState({});

  useEffect(() => {
    fetch('/api/settings/homepage')
      .then(r => r.json())
      .then(json => setActiveSlug(json.slug || null))
      .catch(() => setActiveSlug(null))
      .finally(() => setLoading(false));

    fetch('/api/settings/salespage')
      .then(r => r.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          const types = {};
          json.data.forEach(page => {
            types[page.slug] = page.tracking_type;
          });
          setTrackingTypes(types);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const setAsHomepage = async (slug) => {
    setSaving(slug);
    try {
      const res = await fetch('/api/settings/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveSlug(slug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const resetToDefault = async () => {
    setSaving('__default__');
    try {
      const res = await fetch('/api/settings/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: null }),
      });
      const json = await res.json();
      if (json.success) setActiveSlug(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const toggleTracking = async (slug, currentType) => {
    const newType = currentType === 'purchase' ? 'lead' : 'purchase';
    setTogglingTracking(prev => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch('/api/settings/salespage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, tracking_type: newType })
      });
      const json = await res.json();
      if (json.success) {
        setTrackingTypes(prev => ({ ...prev, [slug]: newType }));
      } else {
        console.error(json.error || 'Failed to update tracking type');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingTracking(prev => ({ ...prev, [slug]: false }));
    }
  };

  const tBg = isLightMode ? '#F8FAFC' : '#0D0F18';
  const tBorder = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.07)';

  return (
    <div
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: '10px',
        padding: '1.5rem',
        marginBottom: '1.75rem',
        boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1rem' }}>🖥️</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textPrimary }}>
              Salespage Management
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: textSecondary }}>
            Pilih salespage yang akan dipaparkan sebagai homepage{' '}
            <code style={{ background: isLightMode ? '#F1F5F9' : '#1E2230', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', color: isLightMode ? '#047857' : '#34D399' }}>
              localhost:3000/
            </code>
          </p>
        </div>

        {/* Active Homepage Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: activeSlug ? 'rgba(16,185,129,0.1)' : (isLightMode ? '#F1F5F9' : '#1A1D2A'),
          border: activeSlug ? '1px solid rgba(16,185,129,0.35)' : tBorder,
          padding: '0.45rem 0.85rem', borderRadius: '20px'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: activeSlug ? '#10B981' : '#6B7280', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeSlug ? '#10B981' : textSecondary }}>
            {loading ? 'Memuatkan...' : activeSlug
              ? `Aktif: /${activeSlug}`
              : 'Homepage: Salespage Utama (Default)'}
          </span>
        </div>
      </div>

      {/* Default Homepage Card */}
      <div style={{
        background: !activeSlug ? (isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.07)') : tBg,
        border: !activeSlug ? '2px solid #10B981' : tBorder,
        borderRadius: '8px', padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: isLightMode ? '#DCFCE7' : 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ fontSize: '1.1rem' }}>🏠</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: textPrimary }}>
              Salespage Utama (Default)
            </div>
            <div style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.1rem' }}>
              Salespage asal ESyifaa — tanpa angle khusus
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {!activeSlug ? (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: '#10B981',
              background: 'rgba(16,185,129,0.15)', padding: '0.3rem 0.75rem',
              borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)'
            }}>
              AKTIF SEBAGAI HOMEPAGE
            </span>
          ) : (
            <button
              onClick={resetToDefault}
              disabled={saving === '__default__'}
              style={{
                padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600,
                background: 'transparent',
                border: `1px solid ${isLightMode ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '6px', color: textSecondary, cursor: 'pointer',
                transition: 'all 0.15s ease',
                opacity: saving === '__default__' ? 0.6 : 1
              }}
            >
              {saving === '__default__' ? 'Menyimpan...' : 'Jadikan Homepage'}
            </button>
          )}
        </div>
      </div>

      {/* 6 Variant Salespage Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {SALESPAGES.map((page) => {
          const isActive = activeSlug === page.slug;
          const isSaving = saving === page.slug;
          const trackingType = trackingTypes[page.slug];

          return (
            <div
              key={page.slug}
              style={{
                background: isActive ? (isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.07)') : tBg,
                border: isActive ? '2px solid #10B981' : tBorder,
                borderRadius: '8px',
                padding: '1rem 1.1rem',
                display: 'flex', flexDirection: 'column', gap: '0.65rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '7px', flexShrink: 0,
                  background: `${page.color}22`,
                  border: `1px solid ${page.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: page.color, display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textPrimary, marginBottom: '0.1rem' }}>
                    {page.label}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: textSecondary, lineHeight: 1.4 }}>
                    {page.desc}
                  </div>
                </div>
              </div>

              {/* Slug URL */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: isLightMode ? '#F1F5F9' : '#1A1D2A',
                padding: '0.3rem 0.6rem', borderRadius: '5px'
              }}>
                <span style={{ fontSize: '0.68rem', color: textSecondary, fontFamily: 'monospace' }}>
                  localhost:3000{page.url}
                </span>
              </div>

              {/* Action Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.1rem' }}>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.73rem', color: isLightMode ? '#047857' : '#34D399',
                    textDecoration: 'none', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  Lihat Preview →
                </a>

                {isActive ? (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, color: '#10B981',
                    background: 'rgba(16,185,129,0.15)', padding: '0.25rem 0.65rem',
                    borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)',
                    whiteSpace: 'nowrap'
                  }}>
                    AKTIF SEBAGAI HOMEPAGE
                  </span>
                ) : (
                  <button
                    onClick={() => setAsHomepage(page.slug)}
                    disabled={!!saving}
                    style={{
                      padding: '0.38rem 0.85rem', fontSize: '0.75rem', fontWeight: 600,
                      background: isSaving ? 'rgba(16,185,129,0.2)' : (isLightMode ? '#047857' : '#064E3B'),
                      border: `1px solid ${isLightMode ? '#047857' : '#065f46'}`,
                      borderRadius: '6px',
                      color: isLightMode ? '#FFFFFF' : '#34D399',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      opacity: saving && !isSaving ? 0.5 : 1
                    }}
                  >
                    {isSaving ? 'Menyimpan...' : 'Jadikan Homepage'}
                  </button>
                )}
              </div>

              {/* Badge + Toggle Row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'0.4rem', paddingTop:'0.4rem', borderTop: `1px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}` }}>
                <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'0.2rem 0.6rem', borderRadius:'999px',
                  background: trackingType === 'purchase' ? 'rgba(234,179,8,0.15)' : 'rgba(16,185,129,0.12)',
                  color: trackingType === 'purchase' ? '#EAB308' : '#34D399',
                  border: `1px solid ${trackingType === 'purchase' ? 'rgba(234,179,8,0.3)' : 'rgba(16,185,129,0.25)'}` }}>
                  {trackingType === 'purchase' ? '💛 Purchase — FPX' : '🟢 Lead — Utama'}
                </span>
                <button onClick={() => toggleTracking(page.slug, trackingType)} disabled={!!togglingTracking[page.slug]}
                  style={{ fontSize:'0.68rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'4px',
                    background:'transparent', border:`1px solid ${isLightMode ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`,
                    color: textSecondary, cursor:'pointer' }}>
                  {togglingTracking[page.slug] ? '...' : trackingType === 'purchase' ? 'Tukar ke Lead' : 'Tukar ke Purchase'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Salespage Produk Standalone ── */}
      <div
        style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: '10px',
          padding: '1.5rem',
          marginTop: '1.75rem',
          boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1rem' }}>📿</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textPrimary }}>Salespage Produk</h3>
        </div>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: textSecondary }}>
          Salespage produk standalone — tidak boleh dijadikan homepage. Preview & akses terus melalui URL.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {PRODUCT_PAGES.map((page, i) => {
            const pSlug = page.url.replace(/^\//, '');
            const pType = trackingTypes[pSlug];

            return (
              <div
                key={i}
                style={{
                  background: isLightMode ? '#F8FAFC' : '#0D0F18',
                  border: `1px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '8px',
                  padding: '1rem 1.1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '7px', flexShrink: 0,
                    background: `${page.color}22`, border: `1px solid ${page.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                  }}>
                    {page.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: textPrimary }}>{page.label}</span>
                      {page.isNew && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#fff', background: '#059669', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>BARU</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: textSecondary, lineHeight: 1.4 }}>{page.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: isLightMode ? '#F1F5F9' : '#1A1D2A', padding: '0.3rem 0.6rem', borderRadius: '5px' }}>
                  <span style={{ fontSize: '0.68rem', color: textSecondary, fontFamily: 'monospace' }}>localhost:3000{page.url}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.73rem', color: isLightMode ? '#047857' : '#34D399', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Lihat Preview →
                  </a>
                </div>

                {/* Badge + Toggle Row for Standalone Products */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'0.4rem', paddingTop:'0.4rem', borderTop: `1px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}` }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'0.2rem 0.6rem', borderRadius:'999px',
                    background: pType === 'purchase' ? 'rgba(234,179,8,0.15)' : 'rgba(16,185,129,0.12)',
                    color: pType === 'purchase' ? '#EAB308' : '#34D399',
                    border: `1px solid ${pType === 'purchase' ? 'rgba(234,179,8,0.3)' : 'rgba(16,185,129,0.25)'}` }}>
                    {pType === 'purchase' ? '💛 Purchase — FPX' : '🟢 Lead — Utama'}
                  </span>
                  <button onClick={() => toggleTracking(pSlug, pType)} disabled={!!togglingTracking[pSlug]}
                    style={{ fontSize:'0.68rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'4px',
                      background:'transparent', border:`1px solid ${isLightMode ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`,
                      color: textSecondary, cursor:'pointer' }}>
                    {togglingTracking[pSlug] ? '...' : pType === 'purchase' ? 'Tukar ke Lead' : 'Tukar ke Purchase'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
