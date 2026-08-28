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

export default function EVideoCheckoutForm() {
  const [fpxPixelId, setFpxPixelId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    dialCode: '+60',
    phone: '',
    honeypot: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        window.fbq('trackSingle', pid, 'InitiateCheckout', { value: 150.00, currency: 'MYR' });
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
          problem: 'E-Video Rawatan Ruqyah — perawat akan hubungi untuk hantar video via WhatsApp',
          honeypot: formData.honeypot,
          source: 'e-video',
          event_id: eventId,
          amount_in_myr: 150.00,
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
            Tempah E-Video &amp; Bayar RM150 Melalui FPX
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#A7F3D0', lineHeight: 1.65 }}>
            Isi maklumat anda di bawah dan teruskan ke pembayaran FPX.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.75rem' }}>
          {[
            { icon: '🎬', text: 'E-Video Rawatan' },
            { icon: '📱', text: 'Dihantar Via WA' },
            { icon: '🔒', text: 'Bayaran Selamat' },
            { icon: '⚡', text: 'Hantar 24 Jam' },
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

            {/* Video delivery note */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(253,224,71,0.08)',
                border: '1.5px solid rgba(253,224,71,0.3)',
                borderLeft: '4px solid #FDE047',
                borderRadius: '10px', padding: '1rem 1.15rem',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📱</span>
                <div>
                  <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.88rem', fontWeight: 800, color: '#FDE047' }}>
                    Cara Terima E-Video
                  </p>
                  <p style={{ margin: 0, fontSize: '0.83rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                    Selepas bayaran berjaya, perawat akan hubungi anda melalui WhatsApp dan{' '}
                    <strong style={{ color: '#FEF3C7' }}>hantar E-Video Rawatan dalam masa 24 jam</strong>.
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.83rem', color: '#FCA5A5', fontWeight: 700 }}>
                    ⚠️ Pastikan nombor WhatsApp anda betul dan aktif.
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
              transition: 'all 0.2s', letterSpacing: '-0.01em',
            }}>
              {loading ? '⏳ Memproses Tempahan...' : '🎬 Tempah & Bayar RM150 via FPX'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.78rem', color: '#6EE7B7' }}>
              🔒 Bayaran diproses selamat oleh CHIP · 256-bit SSL
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
