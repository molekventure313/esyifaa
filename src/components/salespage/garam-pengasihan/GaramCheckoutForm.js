'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages ─────────────────────────────────────────────────────────────────
const BASE_PACKAGES = [
  {
    units: 3,
    label: '3 Bekas (500g x 3)',
    sublabel: 'Rawatan Penuh 40 Hari — Seisi Rumah & Pemulihan Hati',
    price: 99,
    originalPrice: 135,
    savings: 36,
    badge: 'PALING POPULAR (JIMAT RM36)',
    recommended: true,
  },
  {
    units: 2,
    label: '2 Bekas (500g x 2)',
    sublabel: 'Rawatan Intensif Suami Isteri & Makanan Harian',
    price: 79,
    originalPrice: 90,
    savings: 11,
    badge: 'JIMAT RM11',
  },
  {
    units: 1,
    label: '1 Bekas (500g)',
    sublabel: 'Pek Percubaan & Pengenalan Masakan Berkat',
    price: 45,
    originalPrice: 55,
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

function GaramCheckoutFormInner({ source = 'garam-pengasihan' }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';

  const [selectedPkg, setSelectedPkg] = useState(0); // index 0 = 3 Bekas (recommended)
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

  // Add-on state: Minyak Kasturi Kijang (+RM20)
  const [addKasturi, setAddKasturi] = useState(false);
  const KASTURI_PRICE = 20;

  const pkg = BASE_PACKAGES[selectedPkg];
  const effectivePostage = postage;
  const grandTotal = pkg.price + effectivePostage + (addKasturi ? KASTURI_PRICE : 0);

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

      const kasturiNote = addKasturi ? ` | Add-On: Kasturi Kijang E-Syifa' +RM${KASTURI_PRICE}` : '';
      const orderNotes = `Alamat: ${address} | Pakej: ${pkg.label} | Postage: RM${effectivePostage}${kasturiNote}`;

      try {
        if (window.fbq) {
          if (pid) window.fbq('trackSingle', pid, 'InitiateCheckout', {
            value: grandTotal, currency: 'MYR',
            content_name: `Garam Pengasihan — ${pkg.label}`,
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
          addon_kasturi: addKasturi,
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
          product: 'Garam Pengasihan Masakan ESyifaa (500g)',
          amount_base: pkg.price,
          amount_total: grandTotal,
          addon_kasturi: addKasturi,
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
        window.location.href = `/payment-success?order_id=${json.order_id}&amount=${grandTotal}&product=${encodeURIComponent(`Garam Pengasihan Masakan — ${pkg.label}`)}&type=cod`;
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
        background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)',
        padding: '4.5rem 1.25rem',
        fontFamily: ff,
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Form Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFEDD5',
            border: '1.5px solid #FDBA74',
            color: '#C2410C',
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
            Pilih Pakej Garam Pengasihan Masakan
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.65,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Isi maklumat penghantaran di bawah. Pesanan anda akan dibungkus rapi dalam bungkusan privasi &amp; dihantar segera!
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
                    background: isSelected ? '#FFF7ED' : '#FFFFFF',
                    border: isSelected ? '2px solid #EA580C' : '1.5px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '1.25rem 1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 20px rgba(234, 88, 12, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
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
                      border: isSelected ? '6px solid #EA580C' : '2px solid #94A3B8',
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
                            background: '#EA580C',
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
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#C2410C' }}>
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

        {/* ── 2. ADD-ON: KASTURI KIJANG (+RM20) ── */}
        <div style={{
          background: '#FEF3C7',
          border: '1.5px dashed #D97706',
          borderRadius: '16px',
          padding: '1.1rem 1.3rem',
          marginBottom: '2.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setAddKasturi(!addKasturi)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <input
              type="checkbox"
              checked={addKasturi}
              onChange={() => {}} // handled by div
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#D97706' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#92400E' }}>
                🔥 Tambah: Minyak Kasturi Kijang Ruqyah E-Syifa (+RM20)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#B45309' }}>
                Wangian sunnah kegemaran Nabi ﷺ — sapu pada nadi &amp; bantal untuk ketenangan jiwa
              </div>
            </div>
          </div>
          <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.94rem' }}>
            +RM20
          </span>
        </div>

        {/* ── 3. FORM FIELDS ── */}
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
              placeholder="Contoh: Siti Fatimah Binti Ismail"
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
              Nombor tracking &amp; kemaskini posmen akan dihantar melalui WhatsApp ini.
            </p>
          </div>

          {/* Alamat Jalan */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={LABEL_STYLE}>Alamat Rumah (No. Rumah, Jalan &amp; Taman) {REQ}</label>
            <textarea
              name="street"
              rows={2}
              placeholder="Contoh: No. 12, Jalan Melati 3, Taman Seri Melati"
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
                placeholder="40000"
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
                placeholder="Shah Alam"
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
                  background: paymentMethod === 'fpx' ? '#FFF7ED' : '#FFFFFF',
                  border: paymentMethod === 'fpx' ? '2px solid #EA580C' : '1.5px solid #CBD5E1',
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
                    : paymentMethod === 'cod' ? '#FFF7ED' : '#FFFFFF',
                  border: paymentMethod === 'cod' ? '2px solid #EA580C' : '1.5px solid #CBD5E1',
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

            {addKasturi && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#475569' }}>
                <span>Add-on: Minyak Kasturi Kijang:</span>
                <strong style={{ color: '#0F172A' }}>+RM{KASTURI_PRICE}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#475569' }}>
              <span>Postage ({isEastMalaysia ? 'Sabah / Sarawak' : 'Semenanjung'}):</span>
              <strong style={{ color: '#0F172A' }}>RM{effectivePostage}</strong>
            </div>

            <div style={{ borderTop: '1px dashed #CBD5E1', margin: '0.6rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.05rem', fontWeight: 900 }}>
              <span style={{ color: '#0F172A' }}>Jumlah Keseluruhan:</span>
              <span style={{ color: '#C2410C', fontSize: '1.4rem' }}>
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
                : 'linear-gradient(180deg, #EA580C 0%, #C2410C 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(234, 88, 12, 0.4)',
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

export default function GaramCheckoutForm(props) {
  return (
    <Suspense fallback={null}>
      <GaramCheckoutFormInner {...props} />
    </Suspense>
  );
}
