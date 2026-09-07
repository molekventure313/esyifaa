'use client';

import { useState, useEffect } from 'react';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages ─────────────────────────────────────────────────────────────────
const PACKAGES = [
  { units: 1, label: '1 Unit', price: 39, postage: 5, total: 44, savings: null, badge: null },
  { units: 2, label: '2 Unit', price: 70, postage: 5, total: 75, savings: 8,    badge: 'JIMAT RM8' },
  { units: 3, label: '3 Unit', price: 90, postage: 5, total: 95, savings: 27,   badge: 'TERBAIK — JIMAT RM27', recommended: true },
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
  width: '100%', padding: '0.85rem 1rem',
  background: '#F9FAFB', border: '1.5px solid #CBD5E1',
  borderRadius: '10px', color: '#0F172A', fontSize: '0.95rem',
  outline: 'none', fontWeight: 500, boxSizing: 'border-box',
};
const LABEL_STYLE = { display: 'block', marginBottom: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#06231C' };
const REQ = <span style={{ color: '#DC2626' }}>*</span>;

export default function SabunCheckoutForm({ source = 'sabun-garam' }) {
  const [selectedPkg,    setSelectedPkg]    = useState(2); // index 2 = 3 unit (recommended)
  const [paymentMethod,  setPaymentMethod]  = useState('fpx');
  const [formData,       setFormData]       = useState({ full_name: '', dialCode: '+60', phone: '', address: '', notes: '', honeypot: '' });
  const [loading,        setLoading]        = useState(false);
  const [errorMsg,       setErrorMsg]       = useState('');
  const [codSuccess,     setCodSuccess]     = useState(false);
  const [codOrderId,     setCodOrderId]     = useState('');
  const [fpxPixelId,     setFpxPixelId]     = useState(null);

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

    // Fire pixel
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
          full_name: formData.full_name, phone: rawPhone,
          problem: orderNotes,
          honeypot: formData.honeypot,
          source, event_id: eventId,
          amount_in_myr: pkg.total,
          landing_page_url: window.location.href,
          referrer_url: document.referrer,
          fbp: fbp || null,
          fbc: fbc || (utms.fbclid ? `fb.1.${Date.now()}.${utms.fbclid}` : null),
          fbclid: utms.fbclid || null,
          utm_source: utms.utm_source, utm_medium: utms.utm_medium,
          utm_campaign: utms.utm_campaign, utm_content: utms.utm_content,
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
          full_name: formData.full_name, phone: rawPhone,
          address: formData.address,
          quantity: pkg.units, units_label: pkg.label,
          product: 'Sabun Garam Himalaya Pengisian ESyifaa (200g)',
          amount_base: pkg.price, amount_total: pkg.total,
          honeypot: formData.honeypot, source,
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
      <section id="borang" style={{ background: 'linear-gradient(180deg, #042E23 0%, #0B382D 100%)', padding: '4rem 1rem', fontFamily: ff, textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', background: '#FFFFFF', borderRadius: '20px', padding: '2.5rem 2rem', border: '3px solid #4ADE80', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#042E23', marginBottom: '0.5rem' }}>Pesanan COD Diterima!</h2>
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Terima kasih! Pesanan anda telah kami terima.<br />
            Kami akan <strong>hubungi anda melalui WhatsApp</strong> dalam masa 24 jam untuk sahkan alamat dan butiran penghantaran.
          </p>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ringkasan Pesanan</div>
            {[
              ['Produk', 'Sabun Garam Himalaya Pengisian ESyifaa (200g)'],
              ['Pakej', pkg.label],
              ['Harga', `RM${pkg.price}`],
              ['Postage', 'RM5'],
              ['Jumlah COD', `RM${pkg.total}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#166534', marginBottom: '0.2rem' }}>
                <span>{k}:</span><span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>
            💡 Sila sedia bayaran <strong>RM{pkg.total}</strong> apabila barang tiba.
          </p>
        </div>
      </section>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────
  return (
    <section id="borang" style={{ background: 'linear-gradient(180deg, #042E23 0%, #0B382D 100%)', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            📦 Tempah Sekarang
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', marginTop: '0.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Pilih Pakej & Cara Bayar
          </h2>
          <p style={{ color: '#A7F3D0', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            Postage RM5 untuk semua pakej · COD & FPX tersedia
          </p>
        </div>

        {/* ── Package Selector ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            1. Pilih Pakej:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {PACKAGES.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPkg(i)}
                style={{
                  position: 'relative', padding: '1rem 0.75rem', borderRadius: '14px', cursor: 'pointer',
                  border: `2px solid ${selectedPkg === i ? '#FDE047' : 'rgba(255,255,255,0.12)'}`,
                  background: selectedPkg === i ? 'rgba(253,224,71,0.12)' : 'rgba(4,46,35,0.6)',
                  transition: 'all 0.15s', fontFamily: ff, textAlign: 'center',
                }}
              >
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: p.recommended ? '#FDE047' : '#10B981', color: p.recommended ? '#042E23' : '#FFFFFF',
                    fontSize: '0.62rem', fontWeight: 900, padding: '2px 8px', borderRadius: '20px',
                    whiteSpace: 'nowrap', letterSpacing: '0.02em',
                  }}>
                    {p.badge}
                  </div>
                )}
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: selectedPkg === i ? '#FDE047' : '#FEF3C7', marginBottom: '0.2rem' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: selectedPkg === i ? '#FDE047' : '#A7F3D0', lineHeight: 1 }}>
                  RM{p.price}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
                  + postage RM5
                </div>
              </button>
            ))}
          </div>

          {/* Selected package summary */}
          <div style={{ marginTop: '1rem', padding: '0.85rem 1.25rem', background: 'rgba(253,224,71,0.08)', border: '1px solid rgba(253,224,71,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#A7F3D0', fontWeight: 600 }}>
              {pkg.label} Sabun Garam Himalaya Pengisian · RM{pkg.price} + Postage RM5
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FDE047' }}>
              Jumlah: RM{pkg.total}
            </span>
          </div>
        </div>

        {/* ── Payment Method ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            2. Pilih Cara Bayar:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { key: 'fpx', label: '💳 FPX Online Banking', sub: 'Bayar terus, proses segera' },
              { key: 'cod', label: '🚚 COD (Bayar Masa Terima)', sub: 'Bayar kepada posmen/rider' },
            ].map(m => (
              <button
                key={m.key}
                type="button"
                onClick={() => setPaymentMethod(m.key)}
                style={{
                  padding: '1rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', fontFamily: ff,
                  border: `2px solid ${paymentMethod === m.key ? '#FDE047' : 'rgba(255,255,255,0.12)'}`,
                  background: paymentMethod === m.key ? 'rgba(253,224,71,0.1)' : 'rgba(4,46,35,0.6)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: paymentMethod === m.key ? '#FDE047' : '#FEF3C7', marginBottom: '0.25rem' }}>{m.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>{m.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Form Card ── */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2.25rem 1.75rem', border: '3px solid #FDE047', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>

          {/* Card header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#ECFDF5', border: '1.5px solid #059669', borderRadius: '999px', padding: '0.4rem 1.1rem', marginBottom: '0.75rem',
            }}>
              <span>{paymentMethod === 'fpx' ? '💳' : '🚚'}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {paymentMethod === 'fpx' ? 'Borang FPX Direct Checkout' : 'Borang Tempahan COD'}
              </span>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)', borderRadius: '14px', padding: '1rem', boxShadow: '0 4px 15px rgba(4,46,35,0.2)' }}>
              <div style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {pkg.label} · Sabun Garam Himalaya Pengisian (200g)
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FDE047', lineHeight: 1.1, margin: '0.2rem 0' }}>
                RM{pkg.total}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#FEF3C7', opacity: 0.9 }}>
                RM{pkg.price} + Postage RM5 · {paymentMethod === 'cod' ? 'Bayar Masa Terima' : 'Bayar Online'}
              </div>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.85rem 1rem', color: '#DC2626', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.4 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Honeypot */}
            <input type="text" name="honeypot" value={formData.honeypot} onChange={handleChange} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {/* Nama Penuh */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={LABEL_STYLE}>Nama Penuh {REQ}</label>
              <input type="text" name="full_name" placeholder="Masukkan nama penuh anda" value={formData.full_name} onChange={handleChange} required style={INPUT_STYLE} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={LABEL_STYLE}>Nombor WhatsApp {REQ}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select name="dialCode" value={formData.dialCode} onChange={handleChange} style={{ ...INPUT_STYLE, flexShrink: 0, minWidth: '95px', cursor: 'pointer' }}>
                  {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.label} {d.code}</option>)}
                </select>
                <input type="tel" name="phone" placeholder="123456789" value={formData.phone} onChange={handleChange} required style={{ ...INPUT_STYLE, flex: 1, minWidth: 0 }} />
              </div>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
                Maklumat penghantaran akan dihantar ke WhatsApp ini.
              </p>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={LABEL_STYLE}>Alamat Penghantaran Penuh {REQ}</label>
              <textarea
                name="address" rows={3}
                placeholder="Contoh: No 12, Jalan Bahagia 3, Taman Sejahtera, 41000 Klang, Selangor"
                value={formData.address} onChange={handleChange} required
                style={{ ...INPUT_STYLE, resize: 'vertical' }}
              />
            </div>

            {/* Notes (optional) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={LABEL_STYLE}>Nota Tambahan <span style={{ fontWeight: 500, color: '#6B7280', marginLeft: '0.3rem', fontSize: '0.8rem' }}>(Pilihan)</span></label>
              <input type="text" name="notes" placeholder="Cth: Beli untuk ibu, hantar kepada nama lain, dll..." value={formData.notes} onChange={handleChange} style={INPUT_STYLE} />
            </div>

            {/* FPX bank list */}
            {paymentMethod === 'fpx' && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Disokong Semua Bank FPX Utama
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                  {['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Bank Islam', 'Hong Leong', 'AmBank'].map((b, i) => (
                    <span key={i} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 8px' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '1.15rem', fontSize: '1.1rem', fontWeight: 800,
                color: '#042E23',
                background: loading ? '#A7F3D0' : 'linear-gradient(135deg, #FDE047 0%, #FACC15 100%)',
                border: 'none', borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                boxShadow: loading ? 'none' : '0 8px 24px rgba(253,224,71,0.4)',
                transition: 'all 0.2s', fontFamily: ff,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? (
                <>⏳ {paymentMethod === 'fpx' ? 'Memproses Pembayaran FPX...' : 'Menghantar Pesanan COD...'}</>
              ) : (
                <>
                  {paymentMethod === 'fpx' ? `💳 Bayar RM${pkg.total} via FPX` : `🚚 Tempah COD — Bayar RM${pkg.total} Masa Terima`}
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.78rem', color: '#6B7280' }}>
              {paymentMethod === 'fpx'
                ? '🔒 Transaksi 256-bit SSL Terjamin melalui Chip Gateway'
                : '✅ Pesanan COD — Bayar hanya semasa terima barang'}
            </p>
          </form>
        </div>

      </div>
    </section>
  );
}
