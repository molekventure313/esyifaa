'use client';

import { useState, useEffect } from 'react';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages ─────────────────────────────────────────────────────────────────
const PACKAGES = [
  { units: 1, label: '1 Unit', price: 39, postage: 5, total: 44, savings: null, badge: null },
  { units: 2, label: '2 Unit', price: 70, postage: 5, total: 75, savings: 8,    badge: 'JIMAT RM8' },
  { units: 3, label: '3 Unit', price: 90, postage: 5, total: 95, savings: 27,   badge: 'Paling Jimat (Jimat RM27)', recommended: true },
];

const DIAL_CODES = [
  { code: '+60', flag: '🇲🇾', label: 'MY' },
  { code: '+673', flag: '🇧🇳', label: 'BN' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+62', flag: '🇮🇩', label: 'ID' },
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

const INPUT_STYLE = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  color: '#0F172A',
  fontSize: '0.94rem',
  outline: 'none',
  fontWeight: 500,
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

const LABEL_STYLE = {
  display: 'block',
  marginBottom: '0.4rem',
  fontWeight: 700,
  fontSize: '0.88rem',
  color: '#1E293B',
};

const REQ = <span style={{ color: '#E11D48', marginLeft: '2px' }}>*</span>;

export default function SabunCheckoutForm({ source = 'sabun-garam' }) {
  const [selectedPkg,   setSelectedPkg]   = useState(2); // index 2 = 3 unit (recommended)
  const [paymentMethod, setPaymentMethod] = useState('fpx');
  const [formData,      setFormData]      = useState({ full_name: '', dialCode: '+60', phone: '', address: '', notes: '', honeypot: '' });
  const [loading,       setLoading]       = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [codSuccess,    setCodSuccess]    = useState(false);
  const [codOrderId,    setCodOrderId]    = useState('');
  const [fpxPixelId,    setFpxPixelId]    = useState(null);

  const ff = 'var(--font-inter), -apple-system, sans-serif';
  const pkg = PACKAGES[selectedPkg];

  useEffect(() => {
    // FPX pixel init
    const script = document.createElement('script');
    script.src = '/api/pixel-fpx-init';
    script.async = true;
    document.head.appendChild(script);
    fetch('/api/tracking/fpx-pixel-id')
      .then(r => r.json())
      .then(j => { if (j.fpx_pixel_id) setFpxPixelId(j.fpx_pixel_id); })
      .catch(() => {});
    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.full_name.trim()) return 'Sila isi nama penuh anda.';
    if (!formData.phone.trim())     return 'Sila isi nombor WhatsApp anda.';
    if (!formData.address.trim())   return 'Sila isi alamat penghantaran anda.';
    return null;
  };

  // ─── FPX Submit ───────────────────────────────────────────────────────────
  const handleFPX = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setLoading(true);

    try {
      const pid = fpxPixelId || window.__fpxPixelId;
      if (window.fbq) {
        if (pid) window.fbq('trackSingle', pid, 'InitiateCheckout', { value: pkg.total, currency: 'MYR' });
        else      window.fbq('track', 'InitiateCheckout', { value: pkg.total, currency: 'MYR' });
      }
    } catch (_) {}

    try {
      const eventId = generateEventId();
      const { fbp, fbc } = getPixelCookies();
      const utms = getUTMParams();
      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;
      const orderNotes = `[SABUN GARAM HIMALAYA] [Pakej: ${pkg.label} / RM${pkg.price} + postage RM5 = RM${pkg.total}] [Alamat: ${formData.address.trim()}]`;

      const res = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: orderNotes,
          honeypot: formData.honeypot,
          source,
          event_id: eventId,
          amount_in_myr: pkg.total,
          landing_page_url: window.location.href,
          referrer_url: document.referrer,
          fbp: fbp || null,
          fbc: fbc || (utms.fbclid ? `fb.1.${Date.now()}.${utms.fbclid}` : null),
          fbclid: utms.fbclid || null,
          utm_source: utms.utm_source,
          utm_medium: utms.utm_medium,
          utm_campaign: utms.utm_campaign,
          utm_content: utms.utm_content,
          utm_term: utms.utm_term,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.checkout_url) {
        window.location.href = json.checkout_url;
      } else {
        throw new Error(json.error || 'Gagal proses FPX. Sila cuba lagi.');
      }
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  // ─── COD Submit ───────────────────────────────────────────────────────────
  const handleCOD = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setLoading(true);

    try {
      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;
      const utms = getUTMParams();

      const res = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          address: formData.address,
          quantity: pkg.units,
          units_label: pkg.label,
          product: 'Sabun Garam Himalaya Pengisian ESyifaa (200g)',
          amount_base: pkg.price,
          amount_total: pkg.total,
          honeypot: formData.honeypot,
          source,
          landing_page_url: window.location.href,
          referrer_url: document.referrer,
          ...utms,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCodOrderId(json.order_id || '');
        setCodSuccess(true);
      } else {
        throw new Error(json.error || 'Ralat berlaku. Sila cuba lagi.');
      }
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.honeypot) return;
    if (paymentMethod === 'fpx') handleFPX();
    else handleCOD();
  };

  // ─── COD Success State ────────────────────────────────────────────────────
  if (codSuccess) {
    return (
      <section id="borang" style={{
        background: '#061510',
        padding: '4.5rem 1.25rem',
        fontFamily: ff,
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '540px',
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '2.5rem 2rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0F172A', marginBottom: '0.4rem' }}>
            Pesanan COD Diterima
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Terima kasih! Pesanan anda telah direkodkan. Perawat kami akan <strong>menghubungi anda melalui WhatsApp</strong> untuk pengesahan alamat sebelum penghantaran.
          </p>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.1rem',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ringkasan Pesanan
            </div>
            {[
              ['Produk', 'Sabun Garam Himalaya Pengisian (200g)'],
              ['Pakej', pkg.label],
              ['Harga Produk', `RM${pkg.price}`],
              ['Postage', 'RM5'],
              ['Jumlah Perlu Dibayar', `RM${pkg.total}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#334155', marginBottom: '0.35rem' }}>
                <span>{k}:</span>
                <span style={{ fontWeight: 600, color: k.includes('Jumlah') ? '#0F172A' : 'inherit' }}>{v}</span>
              </div>
            ))}
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
            💡 Sila sediakan wang tunai <strong>RM{pkg.total}</strong> apabila pihak kurier tiba.
          </p>
        </div>
      </section>
    );
  }

  // ─── Clean Form Render ─────────────────────────────────────────────────────
  return (
    <section id="borang" style={{
      background: 'linear-gradient(180deg, #061510 0%, #081C15 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#FBBF24',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            📦 Tempah Sekarang
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.5rem',
            letterSpacing: '-0.025em',
          }}>
            Pilih Pakej & Kaedah Pembayaran
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
            Postage RM5 seluruh Malaysia · Pilihan COD atau FPX Online Banking
          </p>
        </div>

        {/* ── 1. Package Selector ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#CBD5E1',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            Langkah 1: Pilih Pakej
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {PACKAGES.map((p, i) => {
              const isSelected = selectedPkg === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPkg(i)}
                  style={{
                    position: 'relative',
                    padding: '1.1rem 0.65rem 0.95rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#0D221B',
                    transition: 'all 0.15s ease',
                    fontFamily: ff,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: p.recommended ? '#F59E0B' : '#10B981',
                      color: '#061811',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#FBBF24' : '#F1F5F9', marginBottom: '0.2rem' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isSelected ? '#FBBF24' : '#E2E8F0', lineHeight: 1.1 }}>
                    RM{p.price}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.25rem' }}>
                    + pos RM5
                  </div>
                </button>
              );
            })}
          </div>

          {/* Minimal Selected Package Summary */}
          <div style={{
            marginTop: '0.85rem',
            padding: '0.75rem 1.1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
              {pkg.label} · Sabun Garam Himalaya 200g (RM{pkg.price} + RM5 postage)
            </span>
            <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FBBF24' }}>
              Jumlah: RM{pkg.total}
            </span>
          </div>
        </div>

        {/* ── 2. Payment Method Switcher ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#CBD5E1',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.75rem',
          }}>
            Langkah 2: Kaedah Pembayaran
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { key: 'fpx', label: '💳 FPX Online Banking', sub: 'Bayar sekarang secara selamat' },
              { key: 'cod', label: '🚚 Bayar Masa Terima (COD)', sub: 'Bayar tunai kepada kurier' },
            ].map(m => {
              const isSelected = paymentMethod === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPaymentMethod(m.key)}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: ff,
                    border: isSelected ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : '#0D221B',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: isSelected ? '#FBBF24' : '#F1F5F9', marginBottom: '0.2rem' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Clean Modern Form Card ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '2rem 1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        }}>
          {/* Header Inside Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #F1F5F9',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ringkasan Tempahan
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {pkg.label} · Sabun Pengisian (200g)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Jumlah Pembayaran</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                RM{pkg.total}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#E11D48',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Honeypot */}
            <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {/* Nama Penuh */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={LABEL_STYLE}>Nama Penuh {REQ}</label>
              <input
                type="text"
                name="full_name"
                placeholder="Nama penerima parcel"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
              />
            </div>

            {/* Phone WhatsApp */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={LABEL_STYLE}>Nombor WhatsApp {REQ}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="dialCode"
                  value={formData.dialCode}
                  onChange={handleChange}
                  style={{ ...INPUT_STYLE, flexShrink: 0, width: '100px', cursor: 'pointer', paddingRight: '0.5rem' }}
                >
                  {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
                </select>
                <input
                  type="tel"
                  name="phone"
                  placeholder="123456789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.73rem', color: '#94A3B8' }}>
                Perawat akan menghantar butiran penghantaran ke WhatsApp ini.
              </p>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={LABEL_STYLE}>Alamat Penghantaran Lengkap {REQ}</label>
              <textarea
                name="address"
                rows={3}
                placeholder="No. rumah, nama jalan, taman, poskod, bandar & negeri"
                value={formData.address}
                onChange={handleChange}
                required
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ ...LABEL_STYLE, display: 'flex', justifyContent: 'space-between' }}>
                <span>Nota Tambahan</span>
                <span style={{ fontWeight: 400, color: '#94A3B8', fontSize: '0.78rem' }}>Pilihan</span>
              </label>
              <input
                type="text"
                name="notes"
                placeholder="Cth: Tinggalkan di pondok guard, hubungi sebelum hantar..."
                value={formData.notes}
                onChange={handleChange}
                style={INPUT_STYLE}
              />
            </div>

            {/* FPX Banks banner (subtle) */}
            {paymentMethod === 'fpx' && (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Disokong Bank FPX Utama (Maybank, CIMB, Bank Islam, RHB dll)
                </span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.05rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#061811',
                background: loading ? '#CBD5E1' : 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.25)',
                transition: 'all 0.15s ease',
                fontFamily: ff,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>Sedang diproses...</>
              ) : (
                <>
                  {paymentMethod === 'fpx'
                    ? `Bayar RM${pkg.total} Melalui FPX →`
                    : `Sahkan Pesanan COD (RM${pkg.total}) →`}
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.75rem', color: '#94A3B8' }}>
              {paymentMethod === 'fpx'
                ? '🔒 Bayaran selamat melalui FPX Online Banking berenkripsi 256-bit'
                : '✅ Tiada risiko — anda hanya bayar apabila parcel selamat sampai'}
            </p>
          </form>
        </div>

      </div>
    </section>
  );
}
