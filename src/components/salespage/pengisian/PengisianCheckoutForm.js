'use client';

import { useState, useEffect } from 'react';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

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

export default function PengisianCheckoutForm() {
  const [fpxPixelId, setFpxPixelId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    dialCode: '+60',
    phone: '',
    honeypot: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Inject FPX pixel script + fetch pixel ID (same pattern as FspChipCheckoutForm)
  useEffect(() => {
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

    if (!formData.full_name.trim() || !formData.phone.trim()) {
      setErrorMessage('Sila isi nama penuh dan nombor WhatsApp anda.');
      return;
    }

    setLoading(true);

    // Fire InitiateCheckout — FPX pixel only
    try {
      const pid = fpxPixelId || (typeof window !== 'undefined' && window.__fpxPixelId);
      if (typeof window !== 'undefined' && window.fbq && pid) {
        window.fbq('trackSingle', pid, 'InitiateCheckout', { value: 90.00, currency: 'MYR' });
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
          problem: 'Pengisian E-Syifa\' — perawat akan hubungi untuk gambar item',
          honeypot: formData.honeypot,
          source: 'pengisian-esyifa',
          event_id: eventId,
          amount_in_myr: 90.00,
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
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Ralat semasa membuat tempahan.');
      }

      if (json.checkout_url) {
        window.location.href = json.checkout_url;
      } else {
        throw new Error('URL pembayaran tidak ditemui.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ralat tidak dijangka. Sila cuba lagi.');
      setLoading(false);
    }
  };

  // Shared styles
  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#0D1117', border: '1.5px solid rgba(52,211,153,0.2)',
    borderRadius: '10px', padding: '0.85rem 1rem',
    fontSize: '0.95rem', color: '#FEF3C7',
    outline: 'none', fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.88rem',
    fontWeight: 700, color: '#D1FAE5', marginBottom: '0.5rem',
  };

  return (
    <section id="borang" style={{
      background: '#10131A', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            color: '#34D399', padding: '0.35rem 1rem', borderRadius: '50px',
            fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            Langkah Pertama
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            fontWeight: 800, color: '#FEF3C7',
            marginTop: '0.3rem', marginBottom: '0.6rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Tempah Pengisian &amp; Bayar RM90 Melalui FPX
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#A7F3D0', lineHeight: 1.65 }}>
            Isi maklumat anda di bawah dan teruskan ke pembayaran FPX.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.75rem' }}>
          {[
            { icon: '💎', text: 'Pengisian 3 Hari' },
            { icon: '🔄', text: 'Pelarasan Mingguan' },
            { icon: '🔒', text: 'Bayaran Selamat' },
            { icon: '⚡', text: 'Respon 24 Jam' },
          ].map((b, i) => (
            <div key={i} style={{
              background: 'rgba(52,211,153,0.07)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '8px', padding: '0.6rem 0.8rem',
              fontSize: '0.82rem', color: '#A7F3D0',
              display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600,
            }}>
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{
          background: '#0D1117', border: '1.5px solid rgba(52,211,153,0.25)',
          borderRadius: '16px', padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Honeypot */}
            <input type="text" name="honeypot" value={formData.honeypot}
              onChange={handleChange} style={{ display: 'none' }}
              tabIndex="-1" autoComplete="off" />

            {/* Nama */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Nama Penuh *</label>
              <input type="text" name="full_name" value={formData.full_name}
                onChange={handleChange} required placeholder="Masukkan nama penuh anda"
                style={inputStyle} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Nombor WhatsApp *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select name="dialCode" value={formData.dialCode} onChange={handleChange}
                  style={{ ...inputStyle, width: 'auto', minWidth: '95px', padding: '0.85rem 0.6rem', flexShrink: 0 }}>
                  {DIAL_CODES.map(d => (
                    <option key={d.code} value={d.code}>{d.flag} {d.label} {d.code}</option>
                  ))}
                </select>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} required placeholder="123456789"
                  style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>

            {/* Perawat contact note — replace item field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(253,224,71,0.08)',
                border: '1.5px solid rgba(253,224,71,0.3)',
                borderLeft: '4px solid #FDE047',
                borderRadius: '10px', padding: '1rem 1.15rem',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📸</span>
                <div>
                  <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.88rem', fontWeight: 800, color: '#FDE047' }}>
                    Langkah Seterusnya — Gambar Item Anda
                  </p>
                  <p style={{ margin: 0, fontSize: '0.83rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                    Perawat akan menghubungi anda melalui WhatsApp untuk meminta{' '}
                    <strong style={{ color: '#FEF3C7' }}>gambar item yang ingin dibuat pengisian E-Syifa&apos;</strong>.
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.83rem', color: '#FCA5A5', fontWeight: 700 }}>
                    ⚠️ Pastikan nombor WhatsApp anda betul.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', padding: '0.85rem 1rem',
                fontSize: '0.875rem', color: '#FCA5A5', marginBottom: '1.25rem',
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1.1rem',
              fontSize: '1.05rem', fontWeight: 800,
              color: loading ? '#6EE7B7' : '#042E23',
              background: loading
                ? 'rgba(52,211,153,0.15)'
                : 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              border: loading ? '2px solid rgba(52,211,153,0.3)' : '2px solid #FEF08A',
              borderRadius: '50px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(234,179,8,0.4)',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em',
            }}>
              {loading ? '⏳ Memproses Tempahan...' : '💎 Tempah & Bayar RM90 via FPX'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              margin: '1.1rem 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(167,243,208,0.15)' }} />
              <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.05em' }}>ATAU</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(167,243,208,0.15)' }} />
            </div>

            {/* WA Button */}
            <a
              href={`https://wa.me/601118939984?text=${encodeURIComponent('Saya nak buat pengisian item RM90')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { try { window.fbq('track', 'Lead'); } catch (_) {} }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', width: '100%', padding: '1rem',
                fontSize: '1rem', fontWeight: 800, color: '#FFFFFF',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                borderRadius: '50px', textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
                border: '2px solid rgba(255,255,255,0.2)',
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              🟢 Bayar Melalui WhatsApp
            </a>

            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.78rem', color: '#6EE7B7' }}>
              🔒 Bayaran diproses selamat oleh CHIP · 256-bit SSL
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
