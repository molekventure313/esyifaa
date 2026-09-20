'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── 3 Volume Packages ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    items: 3,
    label: '3 Item (Pakej Seisi Keluarga)',
    sublabel: 'RM66.30 seunit — Jimat RM71! Perlindungan lengkap suami, isteri & anak',
    price: 199,
    originalPrice: 270,
    savings: 71,
    badge: 'PALING JIMAT / POPULAR',
    recommended: true,
  },
  {
    items: 2,
    label: '2 Item (Pakej Suami Isteri)',
    sublabel: 'RM75 seunit — Jimat RM30! Perlindungan bersama pasangan',
    price: 150,
    originalPrice: 180,
    savings: 30,
    badge: 'PILIHAN BERDUA',
  },
  {
    items: 1,
    label: '1 Item (Pek Percubaan Diri Sendiri)',
    sublabel: 'Sesuai untuk memulakan ikhtiar mandiri di rumah',
    price: 90,
    originalPrice: 120,
    savings: 30,
    badge: null,
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
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Form Container (Clean White & High Contrast) */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #CBD5E1',
          borderRadius: '24px',
          padding: '2.5rem 1.75rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
        }}>

          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span style={{
              display: 'inline-block',
              background: '#ECFDF5', border: '1.5px solid #86EFAC',
              color: '#065F46', padding: '0.4rem 1.2rem', borderRadius: '50px',
              fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.04em', marginBottom: '0.75rem',
            }}>
              Langkah 1: Pilih Pakej Pengisian
            </span>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.55rem', fontWeight: 900, color: '#0F172A' }}>
              Borang Tempahan Pengisian Jarak Jauh
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748B' }}>
              Diisi selama 3 hari berturut-turut · Pelarasan mingguan percuma selamanya
            </p>
          </div>

          {/* ── 3 Volume Packages Grid ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2.25rem' }}>
            {PACKAGES.map((p, idx) => {
              const isSelected = selectedPkg === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPkg(idx)}
                  style={{
                    border: isSelected ? '2.5px solid #059669' : '1.5px solid #E2E8F0',
                    background: isSelected ? '#F0FDF4' : '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.35rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 20px rgba(5, 150, 105, 0.12)' : 'none',
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position: 'absolute', top: '-11px', right: '18px',
                      background: 'linear-gradient(90deg, #FDE047, #EAB308)',
                      color: '#042E23', fontSize: '0.7rem', fontWeight: 900,
                      padding: '0.25rem 0.75rem', borderRadius: '999px',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}>
                      {p.badge}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedPkg(idx)}
                        style={{ accentColor: '#059669', width: '22px', height: '22px', marginTop: '3px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.25rem' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                          {p.sublabel}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                        RM{p.price}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'line-through', marginTop: '0.25rem' }}>
                        RM{p.originalPrice}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
