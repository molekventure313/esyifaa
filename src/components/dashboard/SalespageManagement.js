'use client';

import { useState, useEffect } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────

// TAB 1: Rawatan — homepage variants (boleh jadikan homepage)
const RAWATAN_HOMEPAGE_VARIANTS = [
  { slug: 'wa',              label: '💬 WA Landing Page',          desc: 'FB Ads → Air Tawar Test. Auto-rotate perawat.',           url: '/wa',               color: '#25D366' },
  { slug: 'fsp',             label: '📋 FSP 10% — Formula Baru',   desc: 'Lead → Borang Diagnos. 15 sections FSP proven.',          url: '/fsp',              color: '#059669' },
  { slug: 'sihir',           label: 'Angle: Sihir',                desc: 'Rawatan sihir pemisah, penghalang rezeki & penyakit.',    url: '/sihir',            color: '#7C3AED' },
  { slug: 'saka',            label: 'Angle: Saka',                 desc: 'Gangguan turun-temurun yang mempengaruhi keluarga.',      url: '/saka',             color: '#B45309' },
  { slug: 'penyakit-misteri',label: 'Angle: Penyakit Misteri',     desc: 'Sakit berterusan tapi hospital sahkan semua normal.',     url: '/penyakit-misteri', color: '#0369A1' },
  { slug: 'gangguan-berulang',label: 'Angle: Gangguan Berulang',   desc: 'Dirawat berkali-kali tapi gangguan masih kembali.',       url: '/gangguan-berulang',color: '#BE123C' },
  { slug: 'belum-zuriat',    label: 'Angle: Belum Dikurniakan Zuriat', desc: 'Pasangan belum zuriat & keguguran berulang.',         url: '/belum-zuriat',     color: '#0F766E' },
  { slug: 'kedai-tutup',     label: 'Angle: Perniagaan Merosot',   desc: 'Pelanggan lari, rezeki tersekat & gangguan premis.',     url: '/kedai-tutup',      color: '#C2410C' },
];

// TAB 1: Rawatan — standalone (preview sahaja)
const RAWATAN_STANDALONE = [
  { label: 'FSP Direct FPX Checkout', desc: 'FSP 10% dengan bayaran FPX terus via Chip (RM50). Includes RuqyahTest Section.', url: '/fsp-checkout', color: '#10B981', icon: '💳', isNew: true },
];

// TAB 2: Pengisian E-Syifa'
const PENGISIAN_PAGES = [
  { label: "Pengisian E-Syifa' (FPX)",     desc: "Salespage pengisian ruqyah pada barang pesakit. 50 slot terawal RM90 → RM120.", url: '/pengisian-esyifa', color: '#D97706', icon: '💎' },
  { label: "Pengisian E-Syifa' (WA Lead)", desc: "Clone pengisian — CTA = WhatsApp sahaja. Tiada FPX. Tracking: Lead pixel.",     url: '/pengisian-wasap',  color: '#059669', icon: '🟢', isNew: true },
  { label: "Rawat Sendiri — Pengisian V2", desc: "Angle baru: 'Berhenti bergantung perawat & rawat diri sendiri'. RM90.",          url: '/rawat-sendiri',    color: '#10B981', icon: '🛡️', isNew: true },
  { label: "Tasbih E-Syifa' (FSP V2)",     desc: "Clone tasbih — 15 sections FSP, Fears, Authority, Goals & comparison.",          url: '/tasbih-v2',        color: '#F59E0B', icon: '📿', isNew: true },
];

// TAB 3: E-Video
const EVIDEO_PAGES = [
  { label: 'E-Video Rawatan Ruqyah', desc: 'Produk digital — pakej 8 video rawatan RM60 (promo). Dihantar via WhatsApp dalam 24 jam selepas bayar FPX.', url: '/e-video', color: '#8B5CF6', icon: '🎬', isNew: true },
];

const TABS = [
  { id: 'rawatan',   label: '🏥 Rawatan',           count: RAWATAN_HOMEPAGE_VARIANTS.length + RAWATAN_STANDALONE.length },
  { id: 'pengisian', label: "💎 Pengisian E-Syifa'", count: PENGISIAN_PAGES.length },
  { id: 'evideo',    label: '🎬 E-Video',            count: EVIDEO_PAGES.length },
];

// ─── Card Components ──────────────────────────────────────────────────────────

function SlugBadge({ url, isLightMode, textSecondary }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: isLightMode ? '#F1F5F9' : '#1A1D2A', padding: '0.3rem 0.6rem', borderRadius: '5px' }}>
      <span style={{ fontSize: '0.68rem', color: textSecondary, fontFamily: 'monospace' }}>
        e-syifa.com{url}
      </span>
    </div>
  );
}

function TrackingRow({ slug, trackingTypes, togglingTracking, toggleTracking, isLightMode, textSecondary }) {
  const t = trackingTypes[slug];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: `1px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}` }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px',
        background: t === 'purchase' ? 'rgba(234,179,8,0.15)' : 'rgba(16,185,129,0.12)',
        color: t === 'purchase' ? '#EAB308' : '#34D399',
        border: `1px solid ${t === 'purchase' ? 'rgba(234,179,8,0.3)' : 'rgba(16,185,129,0.25)'}`,
      }}>
        {t === 'purchase' ? '💛 Purchase — FPX' : '🟢 Lead — Utama'}
      </span>
      <button
        onClick={() => toggleTracking(slug, t)}
        disabled={!!togglingTracking[slug]}
        style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'transparent', border: `1px solid ${isLightMode ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`, color: textSecondary, cursor: 'pointer' }}
      >
        {togglingTracking[slug] ? '...' : t === 'purchase' ? 'Tukar ke Lead' : 'Tukar ke Purchase'}
      </button>
    </div>
  );
}

// Homepage variant card (ada "Jadikan Homepage" button)
function HomepageVariantCard({ page, isActive, isSaving, saving, setAsHomepage, trackingTypes, togglingTracking, toggleTracking, isLightMode, tBg, tBorder, textPrimary, textSecondary }) {
  const trackingType = trackingTypes[page.slug];
  return (
    <div style={{
      background: isActive ? (isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.07)') : tBg,
      border: isActive ? '2px solid #10B981' : tBorder,
      borderRadius: '8px', padding: '1rem 1.1rem',
      display: 'flex', flexDirection: 'column', gap: '0.65rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '7px', flexShrink: 0, background: `${page.color}22`, border: `1px solid ${page.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: page.color, display: 'block' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: textPrimary, marginBottom: '0.1rem' }}>{page.label}</div>
          <div style={{ fontSize: '0.73rem', color: textSecondary, lineHeight: 1.4 }}>{page.desc}</div>
        </div>
      </div>
      <SlugBadge url={page.url} isLightMode={isLightMode} textSecondary={textSecondary} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.73rem', color: isLightMode ? '#047857' : '#34D399', textDecoration: 'none', fontWeight: 500 }}>
          Lihat Preview →
        </a>
        {isActive ? (
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', whiteSpace: 'nowrap' }}>
            AKTIF HOMEPAGE
          </span>
        ) : (
          <button
            onClick={() => setAsHomepage(page.slug)}
            disabled={!!saving}
            style={{
              padding: '0.38rem 0.85rem', fontSize: '0.75rem', fontWeight: 600,
              background: isSaving ? 'rgba(16,185,129,0.2)' : (isLightMode ? '#047857' : '#064E3B'),
              border: `1px solid ${isLightMode ? '#047857' : '#065f46'}`,
              borderRadius: '6px', color: isLightMode ? '#FFFFFF' : '#34D399',
              cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              opacity: saving && !isSaving ? 0.5 : 1,
            }}
          >
            {isSaving ? 'Menyimpan...' : 'Jadikan Homepage'}
          </button>
        )}
      </div>
      <TrackingRow slug={page.slug} trackingTypes={trackingTypes} togglingTracking={togglingTracking} toggleTracking={toggleTracking} isLightMode={isLightMode} textSecondary={textSecondary} />
    </div>
  );
}

// Standalone product card (preview + tracking toggle only)
function ProductCard({ page, trackingTypes, togglingTracking, toggleTracking, isLightMode, tBg, tBorder, textPrimary, textSecondary }) {
  const pSlug = page.url.replace(/^\//, '');
  return (
    <div style={{ background: tBg, border: tBorder, borderRadius: '8px', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '7px', flexShrink: 0, background: `${page.color}22`, border: `1px solid ${page.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
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
      <SlugBadge url={page.url} isLightMode={isLightMode} textSecondary={textSecondary} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.73rem', color: isLightMode ? '#047857' : '#34D399', textDecoration: 'none', fontWeight: 500 }}>
          Lihat Preview →
        </a>
      </div>
      <TrackingRow slug={pSlug} trackingTypes={trackingTypes} togglingTracking={togglingTracking} toggleTracking={toggleTracking} isLightMode={isLightMode} textSecondary={textSecondary} />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SalespageManagement({ isLightMode, cardBg, cardBorder, textPrimary, textSecondary }) {
  const [activeSlug, setActiveSlug]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(null);
  const [trackingTypes, setTrackingTypes] = useState({});
  const [togglingTracking, setTogglingTracking] = useState({});
  const [activeTab, setActiveTab]         = useState('rawatan');

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
          json.data.forEach(page => { types[page.slug] = page.tracking_type; });
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
      if (json.success) setActiveSlug(slug);
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
        body: JSON.stringify({ slug, tracking_type: newType }),
      });
      const json = await res.json();
      if (json.success) setTrackingTypes(prev => ({ ...prev, [slug]: newType }));
      else console.error(json.error || 'Failed to update tracking type');
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingTracking(prev => ({ ...prev, [slug]: false }));
    }
  };

  const tBg     = isLightMode ? '#F8FAFC' : '#0D0F18';
  const tBorder = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.07)';
  const shared  = { trackingTypes, togglingTracking, toggleTracking, isLightMode, tBg, tBorder, textPrimary, textSecondary };

  return (
    <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1rem' }}>🖥️</span>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: textPrimary }}>Salespage Management</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: textSecondary }}>
            Urus semua salespage mengikut kategori produk.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: activeSlug ? 'rgba(16,185,129,0.1)' : (isLightMode ? '#F1F5F9' : '#1A1D2A'),
          border: activeSlug ? '1px solid rgba(16,185,129,0.35)' : tBorder,
          padding: '0.45rem 0.85rem', borderRadius: '20px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: activeSlug ? '#10B981' : '#6B7280', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeSlug ? '#10B981' : textSecondary }}>
            {loading ? 'Memuatkan...' : activeSlug ? `Aktif: /${activeSlug}` : 'Homepage: Default'}
          </span>
        </div>
      </div>

      {/* ── Default Homepage Card ── */}
      <div style={{
        background: !activeSlug ? (isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.07)') : tBg,
        border: !activeSlug ? '2px solid #10B981' : tBorder,
        borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isLightMode ? '#DCFCE7' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.1rem' }}>🏠</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: textPrimary }}>Salespage Utama (Default)</div>
            <div style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.1rem' }}>Salespage asal ESyifaa — tanpa angle khusus</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {!activeSlug ? (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' }}>
              AKTIF SEBAGAI HOMEPAGE
            </span>
          ) : (
            <button
              onClick={resetToDefault}
              disabled={saving === '__default__'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, background: 'transparent', border: `1px solid ${isLightMode ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`, borderRadius: '6px', color: textSecondary, cursor: 'pointer', opacity: saving === '__default__' ? 0.6 : 1 }}
            >
              {saving === '__default__' ? 'Menyimpan...' : 'Jadikan Homepage'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: `2px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}`, marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 700,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? (isLightMode ? '#047857' : '#34D399') : textSecondary,
              borderBottom: activeTab === tab.id
                ? `2px solid ${isLightMode ? '#047857' : '#34D399'}`
                : '2px solid transparent',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: '0.4rem', fontSize: '0.65rem', fontWeight: 800,
              background: activeTab === tab.id ? (isLightMode ? '#DCFCE7' : 'rgba(52,211,153,0.15)') : (isLightMode ? '#F1F5F9' : 'rgba(255,255,255,0.07)'),
              color: activeTab === tab.id ? (isLightMode ? '#047857' : '#34D399') : textSecondary,
              padding: '0.1rem 0.45rem', borderRadius: '999px',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB: Rawatan ── */}
      {activeTab === 'rawatan' && (
        <div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: textSecondary }}>
            Salespage rawatan ruqyah RM50. Variant dengan "Jadikan Homepage" boleh ditetapkan sebagai halaman utama e-syifa.com.
          </p>

          {/* Homepage variants grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {RAWATAN_HOMEPAGE_VARIANTS.map(page => (
              <HomepageVariantCard
                key={page.slug}
                page={page}
                isActive={activeSlug === page.slug}
                isSaving={saving === page.slug}
                saving={saving}
                setAsHomepage={setAsHomepage}
                {...shared}
              />
            ))}
          </div>

          {/* Standalone rawatan */}
          {RAWATAN_STANDALONE.length > 0 && (
            <>
              <div style={{ borderTop: `1px solid ${isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.07)'}`, paddingTop: '1rem', marginBottom: '0.85rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Checkout Terus (Standalone)
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
                {RAWATAN_STANDALONE.map((page, i) => (
                  <ProductCard key={i} page={page} {...shared} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: Pengisian E-Syifa' ── */}
      {activeTab === 'pengisian' && (
        <div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: textSecondary }}>
            Salespage produk Pengisian E-Syifa&apos; — ayat ruqyah dipaksakan ke dalam item peribadi pesakit. Semua preview sahaja.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
            {PENGISIAN_PAGES.map((page, i) => (
              <ProductCard key={i} page={page} {...shared} />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: E-Video ── */}
      {activeTab === 'evideo' && (
        <div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: textSecondary }}>
            Salespage produk digital E-Video — pakej 8 video rawatan ruqyah. Dihantar via WhatsApp selepas bayar FPX.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
            {EVIDEO_PAGES.map((page, i) => (
              <ProductCard key={i} page={page} {...shared} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
