'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// Read UTM params from URL
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

const DIAL_CODES = [
  { code: '+60',  flag: '🇲🇾', label: 'MY' },
  { code: '+673', flag: '🇧🇳', label: 'BN' },
  { code: '+65',  flag: '🇸🇬', label: 'SG' },
  { code: '+62',  flag: '🇮🇩', label: 'ID' },
];

function FspChipCheckoutFormInner({ source = 'fsp-checkout' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';
  const [fpxPixelId, setFpxPixelId] = useState(null);

  // On mount: inject FPX pixel script + fetch fpx_pixel_id for trackSingle
  useEffect(() => {
    // Inject /api/pixel-fpx-init script (sets fbq init for FPX pixel + window.__fpxPixelId)
    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.head.appendChild(script);

    // Also fetch fpx_pixel_id for programmatic trackSingle calls
    fetch('/api/tracking/fpx-pixel-id')
      .then(r => r.json())
      .then(json => { if (json.fpx_pixel_id) setFpxPixelId(json.fpx_pixel_id); })
      .catch(() => {});

    return () => {
      // Cleanup script on unmount
      try { document.head.removeChild(script); } catch (_) {}
    };
  }, []);

  const [formData, setFormData] = useState({
    full_name: '',
    dialCode: '+60',
    phone: '',
    problem: '',
    honeypot: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.full_name.trim() || !formData.phone.trim()) {
      setErrorMessage('Sila isi nama penuh dan nombor telefon / WhatsApp anda.');
      return;
    }

    setLoading(true);

    // Fire InitiateCheckout using trackSingle — targets FPX pixel only (not main pixel)
    try {
      const pid = fpxPixelId || (typeof window !== 'undefined' && window.__fpxPixelId);
      if (typeof window !== 'undefined' && window.fbq) {
        if (pid) {
          window.fbq('trackSingle', pid, 'InitiateCheckout', { value: 50.00, currency: 'MYR' });
        } else {
          // Fallback: if FPX pixel ID not loaded yet, use track (fires to all initialised pixels)
          window.fbq('track', 'InitiateCheckout', { value: 50.00, currency: 'MYR' });
        }
      }
    } catch (_) {}

    try {
      const eventId = generateEventId();
      const { fbp, fbc } = getPixelCookies();
      const utmParams = getUTMParams();
      const fbcValue = fbc || (utmParams.fbclid ? `fb.1.${Date.now()}.${utmParams.fbclid}` : null);

      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;

      const response = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: formData.problem,
          honeypot: formData.honeypot,
          source: source,
          marketer_code: marketerCode,
          event_id: eventId,
          amount_in_myr: 50.00,
          landing_page_url: typeof window !== 'undefined' ? window.location.href : null,
          referrer_url: typeof window !== 'undefined' ? document.referrer : null,
          fbp: fbp || null,
          fbc: fbcValue,
          fbclid: utmParams.fbclid || null,
          utm_source:   utmParams.utm_source,
          utm_medium:   utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content:  utmParams.utm_content,
          utm_term:     utmParams.utm_term,
        })
      });

      const json = await response.json();

      if (response.ok && json.success && json.checkout_url) {
        // Redirect customer directly to Chip Checkout URL (FPX payment page)
        window.location.href = json.checkout_url;
      } else {
        throw new Error(json.error || 'Gagal memulakan pembayaran FPX. Sila cuba lagi.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Satu ralat telah berlaku semasa memproses pembayaran. Sila cuba lagi.');
      setLoading(false);
    }
  };

  return (
    <section
      id="borang"
      style={{
        background: 'linear-gradient(180deg, #042E23 0%, #0B382D 100%)',
        color: '#0F172A',
        padding: '4rem 1rem',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif'
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 800, color: '#FDE047',
            textTransform: 'uppercase', letterSpacing: '0.12em'
          }}>
            PEMBAYARAN DALAM TALIAN (FPX)
          </span>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 800,
            color: '#FEF3C7',
            marginTop: '0.4rem',
            marginBottom: '0.6rem',
            letterSpacing: '-0.02em'
          }}>
            Daftar & Terus Bayar Rawatan (RM50)
          </h2>
          <p style={{
            color: '#A7F3D0',
            fontSize: '1rem',
            lineHeight: 1.7,
            maxWidth: '540px',
            margin: '0 auto'
          }}>
            Bayar RM50 melalui <strong style={{ color: '#FDE047' }}>FPX Online Banking</strong>.
            Perawat kami akan terus dihubungkan dan rawatan dimulakan segera.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginBottom: '1.8rem'
        }}>
          {[
            { icon: '🔒', text: 'FPX Online Banking Selamat' },
            { icon: '⚡', text: 'Pengesahan Serta-Merta' },
            { icon: '🌿', text: '100% Ruqyah Syar\'iyyah' },
            { icon: '🤝', text: 'Pakej Rawatan Lengkap RM50' },
          ].map((b, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(253,224,71,0.1)',
              border: '1px solid rgba(253,224,71,0.3)',
              color: '#FEF3C7',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '999px'
            }}>
              {b.icon} {b.text}
            </span>
          ))}
        </div>

        {/* Checkout Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          border: '3px solid #FDE047',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
        }}>

          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ECFDF5',
              border: '1.5px solid #059669',
              borderRadius: '999px',
              padding: '0.4rem 1.1rem',
              marginBottom: '0.9rem'
            }}>
              <span style={{ fontSize: '1rem' }}>💳</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Borang FPX Direct Checkout
              </span>
            </div>
            
            {/* Price Tag Box */}
            <div style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
              borderRadius: '14px',
              padding: '1.2rem',
              color: '#FFFFFF',
              marginTop: '0.5rem',
              boxShadow: '0 4px 15px rgba(4,46,35,0.2)'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Yuran Pakej Rawatan Lengkap
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FDE047', lineHeight: 1.1, margin: '0.2rem 0' }}>
                RM50.00
              </div>
              <span style={{ fontSize: '0.78rem', color: '#FEF3C7', opacity: 0.9 }}>
                Sekali bayar · Termasuk 5 Bonus Perawat · Tiada cas tersembunyi
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#DC2626',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              lineHeight: 1.4
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Nama Penuh */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#06231C' }}>
                Nama Penuh <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Masukkan nama penuh anda"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: '#F9FAFB',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#0F172A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Nombor WhatsApp + Country Code */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#06231C' }}>
                Nombor WhatsApp <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Dial Code Selector */}
                <select
                  name="dialCode"
                  value={formData.dialCode}
                  onChange={handleChange}
                  style={{
                    flexShrink: 0,
                    padding: '0.85rem 0.6rem',
                    background: '#F9FAFB',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#0F172A',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '95px',
                  }}
                >
                  {DIAL_CODES.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.flag} {d.label} {d.code}
                    </option>
                  ))}
                </select>
                {/* Phone Number */}
                <input
                  type="tel"
                  name="phone"
                  placeholder={formData.dialCode === '+60' ? '123456789' : '91234567'}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    flex: 1,
                    padding: '0.85rem 1rem',
                    background: '#F9FAFB',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                    outline: 'none',
                    fontWeight: 500,
                    boxSizing: 'border-box',
                    minWidth: 0,
                  }}
                />
              </div>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
                Resit pembayaran &amp; info perawat akan dihantar melalui WhatsApp ini.
              </p>
            </div>

            {/* Simptom / Masalah (Optional) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#06231C' }}>
                Simptom atau Masalah Anda
                <span style={{ fontWeight: 500, color: '#6B7280', marginLeft: '0.3rem', fontSize: '0.8rem' }}>(Pilihan / Opsional)</span>
              </label>
              <textarea
                name="problem"
                rows={3}
                placeholder="Contoh: Kerap mimpi menakutkan, badan terasa berat, sakit yang doktor tak dapat kesan..."
                value={formData.problem}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: '#F9FAFB',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#0F172A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* FPX Banks Accepted Banner */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Disokong Oleh Semua Bank FPX Utama di Malaysia
              </span>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center',
                marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A'
              }}>
                {['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Bank Islam', 'Hong Leong', 'AmBank'].map((b, i) => (
                  <span key={i} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 8px' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.15rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#042E23',
                background: loading
                  ? '#A7F3D0'
                  : 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                boxShadow: loading ? 'none' : '0 8px 24px rgba(253,224,71,0.4)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>⏳ Memproses Pembayaran FPX...</>
              ) : (
                <>💳 Bayar RM50 Sekarang via FPX</>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.78rem', color: '#6B7280', margin: '0.9rem 0 0 0' }}>
              🔒 Transaksi 256-bit SSL Terjamin &amp; Selamat melalui Chip Gateway
            </p>

          </form>
        </div>

      </div>
    </section>
  );
}

export default function FspChipCheckoutForm(props) {
  return (
    <Suspense fallback={null}>
      <FspChipCheckoutFormInner {...props} />
    </Suspense>
  );
}
