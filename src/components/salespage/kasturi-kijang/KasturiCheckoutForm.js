'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages ─────────────────────────────────────────────────────────────────
// Pakej mengikut arahan: 1 botol RM20, 3 botol RM30, 5 botol RM40
const BASE_PACKAGES = [
  {
    units: 5,
    label: '5 Botol (Pakej Seisi Keluarga)',
    sublabel: 'RM8 sebotol sahaja — Jimat RM60! Benteng lengkap satu rumah',
    price: 40,
    originalPrice: 100,
    savings: 60,
    badge: 'PALING POPULAR (JIMAT RM60)',
    recommended: true,
  },
  {
    units: 3,
    label: '3 Botol (Pakej Rawatan Lengkap)',
    sublabel: 'RM10 sebotol sahaja — Simpan di rumah, bilik & kereta',
    price: 30,
    originalPrice: 60,
    savings: 30,
    badge: 'JIMAT RM30',
  },
  {
    units: 1,
    label: '1 Botol (Pek Percubaan)',
    sublabel: 'Sesuai untuk mencuba khasiat pati kasturi kijang ruqyah',
    price: 20,
    originalPrice: 35,
    savings: null,
    badge: null,
  },
];

// Negeri Sabah/Sarawak — COD ditutup, postage RM10
const EAST_MALAYSIA = ['Sabah', 'Sarawak'];
const POSTAGE_NORMAL = 5;
const POSTAGE_EAST   = 10;

const MY_STATES = [
  'Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang',
  'Perak','Perlis','Pulau Pinang','Selangor','Terengganu',
  'Wilayah Persekutuan Kuala Lumpur','Wilayah Persekutuan Labuan','Wilayah Persekutuan Putrajaya',
  'Sabah','Sarawak',
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
  background: '#FFFFFF',
  border: '1.5px solid #CBD5E1',
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

function KasturiCheckoutFormInner({ source = 'kasturi-kijang' }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';

  const [selectedPkg, setSelectedPkg] = useState(0); // index 0 = 5 Botol (recommended)
  const [paymentMethod, setPaymentMethod] = useState('fpx');
  const [formData, setFormData] = useState({
    full_name: '', dialCode: '+60', phone: '',
    street: '', poskod: '', daerah: '', negeri: '',
    honeypot: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fpxPixelId, setFpxPixelId] = useState(null);

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  // Derived: Sabah/Sarawak logic
  const isEastMalaysia = EAST_MALAYSIA.includes(formData.negeri);
  const postage = isEastMalaysia ? POSTAGE_EAST : POSTAGE_NORMAL;

  // ─── Add-on: Sabun Garam Pengisian 200g (+RM25) ───
  const [addSabun, setAddSabun] = useState(false);
  const SABUN_PRICE = 25;

  // ─── Add-on: Garam Masakan Pengasihan 500g (+RM25) ───
  const [addGaramMasakan, setAddGaramMasakan] = useState(false);
  const GARAM_MASAKAN_PRICE = 25;

  const pkg = BASE_PACKAGES[selectedPkg];
  const effectivePostage = postage;
  const grandTotal = pkg.price + effectivePostage + (addSabun ? SABUN_PRICE : 0) + (addGaramMasakan ? GARAM_MASAKAN_PRICE : 0);

  // If East Malaysia, COD is disabled
  useEffect(() => {
    if (isEastMalaysia && paymentMethod === 'cod') {
      setPaymentMethod('fpx');
    }
  }, [isEastMalaysia, paymentMethod]);

  // Load FPX Pixel script
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

  const buildAddress = () => {
    const parts = [
      formData.street.trim(),
      formData.poskod.trim(),
      formData.daerah.trim(),
      formData.negeri.trim(),
    ].filter(Boolean);
    return parts.join(', ');
  };

  const validate = () => {
    if (!formData.full_name.trim()) return 'Sila masukkan nama penuh anda.';
    if (!formData.phone.trim()) return 'Sila masukkan nombor WhatsApp / telefon anda.';
    if (!formData.street.trim()) return 'Sila masukkan alamat penghantaran (No. rumah, nama jalan, taman).';
    if (!formData.poskod.trim()) return 'Sila masukkan poskod.';
    if (!formData.daerah.trim()) return 'Sila masukkan daerah / bandar.';
    if (!formData.negeri.trim()) return 'Sila pilih negeri anda.';
    return null;
  };

  // ─── FPX Submit ───────────────────────────────────────────────────────────
  const handleFPX = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setLoading(true);

    try {
      const eventId  = generateEventId();
      const { fbp, fbc } = getPixelCookies();
      const pid      = fpxPixelId || (typeof window !== 'undefined' && window.__fpxPixelId);
      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;
      const utms     = getUTMParams();
      const address  = buildAddress();

      const sabunNote = addSabun ? ` | Add-On: Sabun Garam Pengisian +RM${SABUN_PRICE}` : '';
      const garamNote = addGaramMasakan ? ` | Add-On: Garam Masakan Pengasihan +RM${GARAM_MASAKAN_PRICE}` : '';
      const orderNotes = `Alamat: ${address} | Pakej: ${pkg.label} | Postage: RM${effectivePostage}${sabunNote}${garamNote}`;

      try {
        if (window.fbq) {
          if (pid) window.fbq('trackSingle', pid, 'InitiateCheckout', {
            value: grandTotal, currency: 'MYR',
            content_name: `Kasturi Kijang — ${pkg.label}`,
          }, { eventID: eventId });
          else window.fbq('track', 'InitiateCheckout', { value: grandTotal, currency: 'MYR' });
        }
      } catch (_) {}

      const res = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: orderNotes,
          address,
          honeypot: formData.honeypot,
          source,
          marketer_code: marketerCode,
          source_page: window.location.pathname,
          event_id: eventId,
          amount_in_myr: grandTotal,
          addon_sabun: addSabun,
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

      const rawText = await res.text();
      let json = {};
      try { json = JSON.parse(rawText); }
      catch { throw new Error('Respons pelayan tidak sah. Sila cuba lagi.'); }

      if (res.ok && json.checkout_url) {
        window.location.href = json.checkout_url;
      } else {
        throw new Error(json.error || 'Gagal memulakan bayaran FPX. Sila cuba lagi.');
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
      const utms     = getUTMParams();
      const address  = buildAddress();
      const { fbp, fbc } = getPixelCookies();

      const res = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          address,
          quantity: pkg.units,
          units_label: pkg.label,
          product: 'Minyak Kasturi Kijang Ruqyah E-Syifa',
          amount_base: pkg.price,
          amount_total: grandTotal,
          addon_sabun: addSabun,
          honeypot: formData.honeypot,
          source,
          marketer_code: marketerCode,
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
      if (res.ok && json.success) {
        window.location.href = `/payment-success?order_id=${json.order_id}&amount=${grandTotal}&product=${encodeURIComponent(`Minyak Kasturi Kijang — ${pkg.label}`)}&type=cod`;
      } else {
        throw new Error(json.error || 'Gagal menghantar pesanan COD. Sila cuba lagi.');
      }
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (paymentMethod === 'fpx') handleFPX();
    else handleCOD();
  };

  return (
    <section
      id="borang"
      style={{
        background: 'linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 100%)',
        padding: '4.5rem 1.25rem',
        fontFamily: ff,
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Form Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#D1FAE5',
            border: '1.5px solid #6EE7B7',
            color: '#065F46',
            padding: '0.4rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.85rem',
          }}>
            📦 Borang Pesanan Rasmi
          </span>
          <h2 style={{
            fontSize: 'clamp(1.65rem, 3.5vw, 2.35rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.2rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Pilih Pakej Minyak Kasturi Kijang
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.65,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Isi maklumat penghantaran di bawah. Bungkusan privasi berinsurans dihantar terus ke pintu rumah anda!
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '12px',
            padding: '1rem',
            color: '#DC2626',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── 1. SELECT PACKAGE (Cards) ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ ...LABEL_STYLE, fontSize: '1rem', marginBottom: '0.85rem', color: '#0F172A' }}>
            Langkah 1: Pilih Pakej Anda {REQ}
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {BASE_PACKAGES.map((p, idx) => {
              const isSelected = selectedPkg === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPkg(idx)}
                  style={{
                    background: isSelected ? '#ECFDF5' : '#FFFFFF',
                    border: isSelected ? '2px solid #059669' : '1.5px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '1.25rem 1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 20px rgba(5, 150, 105, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* Radio circle */}
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #059669' : '2px solid #94A3B8',
                      background: '#FFFFFF',
                      flexShrink: 0,
                    }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
                          {p.label}
                        </span>
                        {p.badge && (
                          <span style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '99px',
                            letterSpacing: '0.04em',
                          }}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                        {p.sublabel}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>
                      RM{p.price}
                    </div>
                    {p.originalPrice && (
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                        RM{p.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. FORM FIELDS ── */}
        <form onSubmit={handleSubmit} style={{
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}>

          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            Langkah 2: Butiran Penghantaran
          </h3>

          {/* Nama Penuh */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={LABEL_STYLE}>Nama Penuh {REQ}</label>
            <input
              type="text"
              name="full_name"
              placeholder="Contoh: Ahmad Danial Bin Razak"
              value={formData.full_name}
              onChange={handleChange}
              style={INPUT_STYLE}
              required
            />
          </div>

          {/* Phone + Dial Code */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={LABEL_STYLE}>Nombor WhatsApp / Telefon {REQ}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                name="dialCode"
                value={formData.dialCode}
                onChange={handleChange}
                style={{
                  padding: '0.85rem 0.6rem',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
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
              <input
                type="tel"
                name="phone"
                placeholder={formData.dialCode === '+60' ? '0123456789' : '123456789'}
                value={formData.phone}
                onChange={handleChange}
                style={{ ...INPUT_STYLE, flex: 1 }}
                required
              />
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.76rem', color: '#64748B' }}>
              Nombor tracking &amp; status kurier dihantar melalui WhatsApp ini.
            </p>
          </div>

          {/* Alamat Jalan */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={LABEL_STYLE}>Alamat Rumah (No. Rumah, Jalan &amp; Taman) {REQ}</label>
            <textarea
              name="street"
              rows={2}
              placeholder="Contoh: No. 15, Jalan Nilam 2, Taman Nilam Sari"
              value={formData.street}
              onChange={handleChange}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
              required
            />
          </div>

          {/* Poskod & Daerah */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.1rem' }}>
            <div>
              <label style={LABEL_STYLE}>Poskod {REQ}</label>
              <input
                type="text"
                name="poskod"
                placeholder="43000"
                value={formData.poskod}
                onChange={handleChange}
                style={INPUT_STYLE}
                required
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Daerah / Bandar {REQ}</label>
              <input
                type="text"
                name="daerah"
                placeholder="Kajang"
                value={formData.daerah}
                onChange={handleChange}
                style={INPUT_STYLE}
                required
              />
            </div>
          </div>

          {/* Negeri */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={LABEL_STYLE}>Negeri {REQ}</label>
            <select
              name="negeri"
              value={formData.negeri}
              onChange={handleChange}
              style={{
                ...INPUT_STYLE,
                cursor: 'pointer',
                fontWeight: formData.negeri ? 600 : 400,
                color: formData.negeri ? '#0F172A' : '#94A3B8',
              }}
              required
            >
              <option value="">-- Sila Pilih Negeri --</option>
              {MY_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* ── 3. BUMP OFFERS (SELEPAS ISI BUTIRAN DIRI) ── */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
                Nak Perlindungan &amp; Rawatan Lebih Menyeluruh? Tambah Ni 👇
              </span>
            </div>

            {/* ── BUMP OFFER 1: Sabun Garam Himalaya Pengisian 200g (+RM25) ── */}
            <div
              onClick={() => setAddSabun(v => !v)}
              role="checkbox"
              aria-checked={addSabun}
              style={{
                position: 'relative',
                border: addSabun ? '2px solid #059669' : '2px dashed #059669',
                borderRadius: '16px',
                padding: '1.75rem 1.15rem 1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer',
                background: addSabun ? 'rgba(5,150,105,0.04)' : 'rgba(16,185,129,0.04)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                position: 'absolute', top: '-11px', left: '1rem',
                display: 'flex', gap: '0.4rem', flexWrap: 'nowrap',
              }}>
                <div style={{
                  background: '#047857', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.3)', whiteSpace: 'nowrap',
                }}>
                  ⚡ Tawaran Khas Kombo
                </div>
                <div style={{
                  background: '#D97706', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(217,119,6,0.3)', whiteSpace: 'nowrap',
                }}>
                  🎁 Jimat RM14 (RM25 Sahaja)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  flexShrink: 0, marginTop: '3px',
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: addSabun ? '#059669' : '#FFFFFF',
                  border: addSabun ? '2px solid #059669' : '2px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                  boxShadow: addSabun ? '0 0 0 3px rgba(5,150,105,0.15)' : 'none',
                }}>
                  {addSabun && (
                    <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.97rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    Ya! Tambah Sabun Garam Himalaya Pengisian (200g) 🧼
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>RM39</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669' }}>RM{SABUN_PRICE} sahaja</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '96px', height: '96px', flexShrink: 0,
                      borderRadius: '10px', overflow: 'hidden',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      position: 'relative',
                      background: '#F8FAFC',
                    }}>
                      <Image
                        src="/images/sabun-garam/hero-saka-sihir-santau.png"
                        alt="Sabun Garam Pengisian"
                        width={96}
                        height={96}
                        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                        loading="lazy"
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '160px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
                      <div>🚿 <strong>Mandian Ruqyah 200g</strong> — leraikan bisa sihir &amp; santau semasa mandi</div>
                      <div>🌿 <strong>Kombo Hebat</strong> — mandi sabun ruqyah, kemudian sapu kasturi kijang</div>
                      <div>✨ Hilangkan <strong>badan lesu, bisa urat &amp; mimpi buruk</strong></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.55rem', fontSize: '0.74rem', fontWeight: 700, color: addSabun ? '#059669' : '#047857', transition: 'color 0.2s' }}>
                    {addSabun
                      ? '✓ Sabun Garam Pengisian ditambah ke pesanan anda! 🎉'
                      : '☐ Klik untuk tambahkan ke order anda →'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BUMP OFFER 2: Garam Masakan Pengasihan 500g (+RM25) ── */}
            <div
              onClick={() => setAddGaramMasakan(v => !v)}
              role="checkbox"
              aria-checked={addGaramMasakan}
              style={{
                position: 'relative',
                border: addGaramMasakan ? '2px solid #EA580C' : '2px dashed #EA580C',
                borderRadius: '16px',
                padding: '1.75rem 1.15rem 1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer',
                background: addGaramMasakan ? 'rgba(234,88,12,0.04)' : 'rgba(254,243,199,0.2)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                position: 'absolute', top: '-11px', left: '1rem',
                display: 'flex', gap: '0.4rem', flexWrap: 'nowrap',
              }}>
                <div style={{
                  background: '#C2410C', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(194,65,12,0.3)', whiteSpace: 'nowrap',
                }}>
                  ⚡ Khas Rumahtangga
                </div>
                <div style={{
                  background: '#EA580C', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(234,88,12,0.3)', whiteSpace: 'nowrap',
                }}>
                  🎁 Jimat RM20 (RM25 Sahaja)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  flexShrink: 0, marginTop: '3px',
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: addGaramMasakan ? '#EA580C' : '#FFFFFF',
                  border: addGaramMasakan ? '2px solid #EA580C' : '2px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                  boxShadow: addGaramMasakan ? '0 0 0 3px rgba(234,88,12,0.15)' : 'none',
                }}>
                  {addGaramMasakan && (
                    <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.97rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    Ya! Tambah Garam Masakan Pengasihan ESyifaa (500g) 🍲
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>RM45</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#EA580C' }}>RM{GARAM_MASAKAN_PRICE} sahaja</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.65 }}>
                    <div>🍲 <strong>Secubit dalam masakan harian</strong> — merungkai sihir pemisah dari dalam darah</div>
                    <div>🤍 <strong>Melembutkan hati pasangan yang panas baran</strong> &amp; mengikat kasih sekeluarga</div>
                  </div>

                  <div style={{ marginTop: '0.55rem', fontSize: '0.74rem', fontWeight: 700, color: addGaramMasakan ? '#EA580C' : '#C2410C', transition: 'color 0.2s' }}>
                    {addGaramMasakan
                      ? '✓ Garam Masakan ditambah ke pesanan anda! 🎉'
                      : '☐ Klik untuk tambahkan ke order anda →'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── 4. PAYMENT METHOD (FPX vs COD) ── */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ ...LABEL_STYLE, fontSize: '1rem', marginBottom: '0.75rem', color: '#0F172A' }}>
              Langkah 3: Kaedah Pembayaran {REQ}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

              {/* Option 1: FPX */}
              <div
                onClick={() => setPaymentMethod('fpx')}
                style={{
                  background: paymentMethod === 'fpx' ? '#ECFDF5' : '#FFFFFF',
                  border: paymentMethod === 'fpx' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>💳</span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                  FPX Online Banking
                </span>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  Pantas &amp; Selamat
                </span>
              </div>

              {/* Option 2: COD */}
              <div
                onClick={() => {
                  if (!isEastMalaysia) setPaymentMethod('cod');
                }}
                style={{
                  background: isEastMalaysia
                    ? '#F1F5F9'
                    : paymentMethod === 'cod' ? '#ECFDF5' : '#FFFFFF',
                  border: paymentMethod === 'cod' ? '2px solid #059669' : '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '1rem',
                  cursor: isEastMalaysia ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  opacity: isEastMalaysia ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>💵</span>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                  Cash On Delivery (COD)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {isEastMalaysia ? 'Ditutup untuk Sabah/Sarawak' : 'Barang Sampai Baru Bayar'}
                </span>
              </div>

            </div>
          </div>

          {/* ── 5. ORDER SUMMARY ── */}
          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '1.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#475569' }}>
              <span>Pakej ({pkg.label}):</span>
              <strong style={{ color: '#0F172A' }}>RM{pkg.price}</strong>
            </div>

            {addSabun && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#059669' }}>
                <span>Add-on: Sabun Garam Pengisian (200g):</span>
                <strong>+RM{SABUN_PRICE}</strong>
              </div>
            )}

            {addGaramMasakan && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#EA580C' }}>
                <span>Add-on: Garam Masakan Pengasihan (500g):</span>
                <strong>+RM{GARAM_MASAKAN_PRICE}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#475569' }}>
              <span>Postage ({isEastMalaysia ? 'Sabah / Sarawak' : 'Semenanjung'}):</span>
              <strong style={{ color: '#0F172A' }}>RM{effectivePostage}</strong>
            </div>

            <div style={{ borderTop: '1px dashed #CBD5E1', margin: '0.6rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.05rem', fontWeight: 900 }}>
              <span style={{ color: '#0F172A' }}>Jumlah Keseluruhan:</span>
              <span style={{ color: '#047857', fontSize: '1.4rem' }}>
                RM{grandTotal}
              </span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.15rem',
              fontSize: '1.12rem',
              fontWeight: 800,
              color: '#FFFFFF',
              background: loading
                ? '#94A3B8'
                : 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(5, 150, 105, 0.4)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <>⏳ Memproses Pesanan Anda...</>
            ) : paymentMethod === 'fpx' ? (
              <>💳 Bayar RM{grandTotal} Sekarang (FPX Online Banking)</>
            ) : (
              <>🚚 Sahkan Pesanan COD (Bayar RM{grandTotal} Semasa Sampai)</>
            )}
          </button>

          <p style={{ textAlign: 'center', margin: '0.85rem 0 0 0', fontSize: '0.76rem', color: '#64748B' }}>
            🔒 Transaksi Selamat · Maklumat Anda Dijamin 100% Sulit &amp; Terpelihara
          </p>

        </form>

      </div>
    </section>
  );
}

export default function KasturiCheckoutForm(props) {
  return (
    <Suspense fallback={null}>
      <KasturiCheckoutFormInner {...props} />
    </Suspense>
  );
}
