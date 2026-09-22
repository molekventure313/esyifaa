'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── 3 Volume Packages (FSP PRO: Terbesar di Kiri/Atas -> Terkecil di Kanan/Bawah) ──────────
const PACKAGES = [
  {
    items: 3,
    label: '3 Item (Pakej Seisi Keluarga)',
    sublabel: 'RM66.30 seunit — Jimat RM71! Perlindungan lengkap suami, isteri & anak',
    pillLabel: '3 ITEM — PALING JIMAT',
    price: 199,
    originalPrice: 270,
    savings: 71,
    badge: 'PALING JIMAT',
    recommended: true,
    features: [
      'JIMAT RM71',
      'BENTENG RUQYAH 4 LAPISAN',
      'PELARASAN SEHINGGA PERAWAT MATI',
      'UNTUK SEISI KELUARGA',
    ],
    itemsCount: 3,
  },
  {
    items: 2,
    label: '2 Item (Pakej Suami Isteri)',
    sublabel: 'RM75 seunit — Jimat RM30! Perlindungan bersama pasangan',
    pillLabel: '2 ITEM — BERDUA',
    price: 150,
    originalPrice: 180,
    savings: 30,
    badge: 'PILIHAN BERDUA',
    features: [
      'JIMAT RM30',
      'BENTENG RUQYAH 4 LAPISAN',
      'PELARASAN SEHINGGA PERAWAT MATI',
      'KHAS SUAMI ISTERI',
    ],
    itemsCount: 2,
  },
  {
    items: 1,
    label: '1 Item (Pek Percubaan Diri Sendiri)',
    sublabel: 'Sesuai untuk memulakan ikhtiar mandiri di rumah',
    pillLabel: '1 ITEM — PERCUBAAN',
    price: 90,
    originalPrice: 120,
    savings: 30,
    badge: null,
    features: [
      'JIMAT RM30',
      'BENTENG RUQYAH 4 LAPISAN',
      '1 BARANG SAHAJA',
      'PEK PERCUBAAN DIRI SENDIRI',
    ],
    itemsCount: 1,
  },
];

const DIAL_CODES = [
  { code: '+60',  flag: '🇲🇾', label: 'MY' },
  { code: '+673', flag: '🇧🇳', label: 'BN' },
  { code: '+65',  flag: '🇸🇬', label: 'SG' },
  { code: '+62',  flag: '🇮🇩', label: 'ID' },
];

function getUTMParams() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:   p.get('utm_source')   || null,
    utm_medium:   p.get('utm_medium')   || null,
    utm_campaign: p.get('utm_campaign') || null,
    utm_content:  p.get('utm_content')  || null,
    utm_term:     p.get('utm_term')     || null,
    fbclid:       p.get('fbclid')       || null,
  };
}

function PengisianCheckoutFormInner({ source = 'pengisian-esyifa' }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';

  const [selectedPkg, setSelectedPkg] = useState(0); // Default index 0 = 3 Item (Recommended)
  const [fpxPixelId, setFpxPixelId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    dialCode: '+60',
    phone: '',
    item_description: '',
    honeypot: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ff = 'var(--font-inter), -apple-system, sans-serif';
  const pkg = PACKAGES[selectedPkg];
  const grandTotal = pkg.price; // Fokus 100% pada pakej pengisian item tanpa add-on

  // FPX Pixel Init
  useEffect(() => {
    const isMarketerRoute =
      new URLSearchParams(window.location.search).has('m') ||
      window.location.pathname.startsWith('/m/');
    if (isMarketerRoute) return;

    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.head.appendChild(script);

    fetch('/api/tracking/fpx-pixel-id')
      .then(r => r.json())
      .then(json => { if (json.fpx_pixel_id) setFpxPixelId(json.fpx_pixel_id); })
      .catch(() => {});

    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.full_name.trim()) {
      setErrorMessage('Sila masukkan nama penuh anda.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Sila masukkan nombor WhatsApp anda.');
      return;
    }
    if (!formData.item_description.trim()) {
      setErrorMessage('Sila nyatakan jenis dan nama barang yang ingin diisikan (cth: Cincin perak suami, tasbih isteri).');
      return;
    }

    setLoading(true);

    try {
      const pid = fpxPixelId || (typeof window !== 'undefined' && window.__fpxPixelId);
      const eventId = generateEventId();
      if (typeof window !== 'undefined' && window.fbq) {
        if (pid) {
          window.fbq('trackSingle', pid, 'InitiateCheckout', {
            value: grandTotal,
            currency: 'MYR',
            content_name: `Pengisian E-Syifa — ${pkg.label}`,
          }, { eventID: eventId });
        } else {
          window.fbq('track', 'InitiateCheckout', { value: grandTotal, currency: 'MYR' });
        }
      }

      const { fbp, fbc } = getPixelCookies();
      const utmParams = getUTMParams();
      const fbcValue = fbc || (utmParams.fbclid ? `fb.1.${Date.now()}.${utmParams.fbclid}` : null);
      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;

      const orderProblem = `Pengisian E-Syifa (${pkg.label}) | Barang: ${formData.item_description.trim()}`;

      const response = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: orderProblem,
          amount_in_myr: grandTotal,
          source: source || 'pengisian-esyifa',
          marketer_code: marketerCode,
          source_page: window.location.pathname,
          event_id: eventId,
          honeypot: formData.honeypot,
          landing_page_url: window.location.href,
          referrer_url: document.referrer,
          fbp: fbp || null,
          fbc: fbcValue,
          fbclid: utmParams.fbclid,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
        }),
      });

      const rawText = await response.text();
      let json = {};
      try { json = JSON.parse(rawText); }
      catch { throw new Error('Respons pelayan tidak sah. Sila cuba lagi.'); }

      if (response.ok && json.checkout_url) {
        window.location.href = json.checkout_url;
      } else {
        throw new Error(json.error || 'Gagal memulakan bayaran FPX. Sila cuba lagi.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ralat berlaku. Sila cuba sebentar lagi.');
      setLoading(false);
    }
  };

  return (
    <section
      id="borang"
      style={{
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
        color: '#0F172A',
        padding: '2rem 1.25rem 5rem',
        fontFamily: ff,
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* CSS for Responsive Vertical Pricing Cards Grid */}
        <style dangerouslySetInnerHTML={{ __html: `
          .fsp-pricing-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
            margin-bottom: 3.5rem;
          }
          @media (max-width: 860px) {
            .fsp-pricing-grid-3 {
              grid-template-columns: 1fr;
            }
          }
        `}} />

        {/* Urgency Slot Bar */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #FECACA',
          borderRadius: '18px',
          padding: '1.25rem 1.75rem',
          marginBottom: '2.5rem',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)',
          maxWidth: '860px',
          margin: '0 auto 2.5rem auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🔴 Slot Promosi Pengenalan — 42/50 Diambil
            </p>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
              Baki 8 slot sahaja lagi
            </p>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              width: '84%',
              height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              borderRadius: '999px',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
            Selepas 50 slot terawal habis, yuran pengisian akan kembali ke harga asal <strong style={{ color: '#DC2626' }}>RM120 seunit</strong>.
          </p>
        </div>

        {/* Section #13: CTA & Pakej Headline (Formula FSP PRO) */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '860px', margin: '0 auto 3rem auto' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1.5px solid #86EFAC',
            color: '#065F46',
            padding: '0.4rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>
            💎 Tawaran Khas &amp; Pilihan Pakej
          </span>
          <h2 style={{
            fontSize: 'clamp(1.65rem, 3.5vw, 2.45rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.2rem 0 1rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.28,
          }}>
            Jangan Tunggu Lagi, Tamatkan Azab Gangguan Berulang &amp; Rawat Diri Sendiri Dengan Pengisian E-Syifa Sekarang
          </h2>
          <p style={{
            fontSize: '1.08rem',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '620px',
            margin: '0 auto',
            fontWeight: 500,
          }}>
            Pilih bilangan item anda di bawah sebelum kuota pengisian jarak jauh bulan ini ditutup!
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '12px',
            padding: '1rem',
            color: '#DC2626',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ── Vertical Pricing Cards Grid (Mengikut Gambar Rujukan FSP PRO) ── */}
        <div id="pilih-pakej" className="fsp-pricing-grid-3">
          {PACKAGES.map((p, idx) => {
            const isSelected = selectedPkg === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPkg(idx)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2.5px solid #059669' : '1.5px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.75rem 1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: isSelected
                    ? '0 12px 30px rgba(5, 150, 105, 0.16)'
                    : '0 4px 14px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {/* 1. Visual Representation of Items */}
                <div style={{
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  width: '100%',
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {p.itemsCount === 3 ? (
                      <>
                        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>💍</span>
                        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📿</span>
                        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>✨</span>
                      </>
                    ) : p.itemsCount === 2 ? (
                      <>
                        <span style={{ fontSize: '1.85rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>💍</span>
                        <span style={{ fontSize: '1.85rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📿</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>✨</span>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#059669' }}>
                    {p.itemsCount}x Barang Ruqyah Pasak
                  </div>
                </div>

                {/* 2. Dark Pill Label */}
                <div style={{
                  background: isSelected ? '#047857' : '#064E3B',
                  color: '#FFFFFF',
                  padding: '0.42rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  width: '90%',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {p.pillLabel}
                </div>

                {/* 3. Original Price Strikethrough */}
                <div style={{
                  fontSize: '0.88rem',
                  color: '#64748B',
                  fontWeight: 600,
                  marginBottom: '0.2rem',
                }}>
                  Harga Asal <span style={{ textDecoration: 'line-through' }}>RM{p.originalPrice}</span>
                </div>

                {/* 4. Promo Price (Big & Bold) */}
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: '1.25rem',
                }}>
                  RM{p.price}
                </div>

                {/* 5. Features Checkmarks */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 1.5rem 0',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '0.86rem',
                  color: '#334155',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#059669', fontWeight: 900, fontSize: '0.95rem' }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* 6. Guide Text */}
                <p style={{
                  fontSize: '0.8rem',
                  color: '#64748B',
                  margin: '0 0 0.5rem 0',
                  fontWeight: 600,
                }}>
                  Klik button di bawah untuk beli
                  <span style={{ display: 'block', fontSize: '1.1rem', marginTop: '0.15rem' }}>👇🏻</span>
                </p>

                {/* 7. CTA Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPkg(idx);
                    const target = document.getElementById('maklumat-pesanan');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 0.75rem',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  👉🏻 BELI SEKARANG
                </button>

                {/* 8. Payment Icons / Text */}
                <div style={{
                  marginTop: '0.85rem',
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                }}>
                  <span>FPX Online Banking</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Form Section ── */}
        <div id="maklumat-pesanan" style={{ maxWidth: '680px', margin: '0 auto' }}>

          <div style={{
            background: '#FFFFFF',
            border: '2px solid #CBD5E1',
            borderRadius: '24px',
            padding: '2.5rem 1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
          }}>

            {/* Active Selected Package Banner */}
            <div style={{
              background: '#ECFDF5',
              border: '2px solid #6EE7B7',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pakej Dipilih Anda:
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                  {pkg.label} — <span style={{ color: '#047857' }}>RM{pkg.price}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('pilih-pakej')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Tukar Pakej ↺
              </button>
            </div>

          {/* ── Form Inputs ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {/* Honeypot */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.82rem', fontWeight: 900, color: '#065F46',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem',
              }}>
                Langkah 2: Maklumat Pelanggan &amp; Item
              </span>
            </div>

            {/* Nama Penuh */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Nama Penuh Anda <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Cth: Ahmad bin Sulaiman"
                required
                style={{
                  width: '100%', padding: '0.9rem 1rem', borderRadius: '12px',
                  background: '#FFFFFF', border: '1.5px solid #CBD5E1',
                  color: '#0F172A', fontSize: '0.96rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Nombor WhatsApp */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Nombor WhatsApp <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="dialCode"
                  value={formData.dialCode}
                  onChange={handleChange}
                  style={{
                    padding: '0.9rem 0.75rem', borderRadius: '12px',
                    background: '#F8FAFC', border: '1.5px solid #CBD5E1',
                    color: '#0F172A', fontSize: '0.96rem', outline: 'none', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {DIAL_CODES.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.flag} {d.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="123456789"
                  required
                  style={{
                    flex: 1, padding: '0.9rem 1rem', borderRadius: '12px',
                    background: '#FFFFFF', border: '1.5px solid #CBD5E1',
                    color: '#0F172A', fontSize: '0.96rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Perawat akan menghubungi nombor ini dalam masa 24 jam untuk pengesahan pengisian.
              </p>
            </div>

            {/* Jenis / Nama Barang Yang Ingin Diisi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Jenis &amp; Nama Barang Yang Ingin Diisikan <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                name="item_description"
                value={formData.item_description}
                onChange={handleChange}
                placeholder="Cth: Cincin perak suami, tasbih kayu isteri, atau jam tangan anak"
                rows={3}
                required
                style={{
                  width: '100%', padding: '0.9rem 1rem', borderRadius: '12px',
                  background: '#FFFFFF', border: '1.5px solid #CBD5E1',
                  color: '#0F172A', fontSize: '0.94rem', outline: 'none', boxSizing: 'border-box',
                  fontFamily: ff, lineHeight: 1.5,
                }}
              />
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                Nyatakan mengikut bilangan item dalam pakej yang anda pilih di atas ({pkg.items} barang).
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                background: '#FEF2F2', border: '1.5px solid #EF4444',
                color: '#DC2626', padding: '0.85rem 1rem', borderRadius: '12px',
                fontSize: '0.88rem', textAlign: 'center', fontWeight: 700,
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {/* ── Ringkasan & Submit (Clean Light Box) ── */}
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '18px', padding: '1.35rem 1.5rem', marginTop: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.92rem', color: '#475569' }}>
                <span>Pakej Terpilih:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>{pkg.label}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1.5px solid #E2E8F0', paddingTop: '0.85rem', marginTop: '0.6rem',
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>Jumlah Bayaran:</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669' }}>RM{grandTotal}</span>
              </div>
            </div>

            {/* Submit FPX Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1.25rem',
                borderRadius: '50px', border: '2px solid #FEF08A',
                background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
                color: '#042E23', fontSize: '1.18rem', fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '-0.01em',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? '⏳ Memproses Bayaran FPX...' : `💳 Bayar RM${grandTotal} Melalui FPX Online Banking`}
            </button>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
              🔒 Transaksi Selamat 256-bit SSL via Chip In (Maybank, CIMB, Bank Islam, RHB, BSN &amp; semua bank utama)
            </p>

            {/* WhatsApp Alternative */}
            <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.88rem', color: '#475569' }}>
                Ada kesulitan membuat bayaran online banking?
              </p>
              <a
                href={`https://wa.me/601118939984?text=Assalamualaikum%20ustaz,%20saya%20nak%20buat%20pengisian%20item%20(${encodeURIComponent(pkg.label)})`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#059669', fontSize: '0.9rem', fontWeight: 800,
                  textDecoration: 'none', borderBottom: '1px dashed #059669',
                  paddingBottom: '2px',
                }}
              >
                <span>💬</span> Klik Sini Untuk Daftar &amp; Bayar Manual Melalui WhatsApp
              </a>
            </div>

          </form>

        </div>
        </div>

      </div>
    </section>
  );
}

export default function PengisianCheckoutForm({ source = 'pengisian-esyifa' }) {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#065F46' }}>Memuatkan borang tempahan...</div>}>
      <PengisianCheckoutFormInner source={source} />
    </Suspense>
  );
}
