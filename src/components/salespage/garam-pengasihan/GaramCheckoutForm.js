'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages (FSP PRO: Terbesar di Kiri/Atas -> Terkecil di Kanan/Bawah) ──────────
const BASE_PACKAGES = [
  {
    units: 6,
    label: '6 Pek (100g x 6) — Beli 4 Free 2 Pek',
    sublabel: 'Dapat 6 Pek Garam (100g) + Percuma 1 Botol Minyak Kasturi Kijang + Free Pos',
    pillLabel: 'BELI 4 FREE 2 + FREE KASTURI',
    price: 90,
    originalPrice: 180,
    savings: 90,
    badge: 'PALING JIMAT + FREE GIFT',
    recommended: true,
    freePostage: true,
    includesKasturi: true,
    features: [
      'BELI 4 PERCUMA 2 PEK (DAPAT 6 PEK)',
      'PERCUMA MINYAK KASTURI KIJANG (RM20)',
      'PERCUMA POSTAGE & COD (SEMENANJUNG)',
      'RAWATAN LENGKAP SEISI RUMAH (6 BULAN)',
    ],
    itemsCount: 6,
    hasCod: true,
  },
  {
    units: 4,
    label: '4 Pek (100g x 4) — Beli 2 Free 2 Pek',
    sublabel: 'Dapat 4 Pek Garam (100g) — Ikhtiar berterusan sekeluarga + Free Pos',
    pillLabel: 'BELI 2 FREE 2',
    price: 70,
    originalPrice: 120,
    savings: 50,
    badge: 'PILIHAN RAMAI',
    recommended: false,
    freePostage: true,
    includesKasturi: false,
    features: [
      'BELI 2 PERCUMA 2 PEK (DAPAT 4 PEK)',
      'PERCUMA POSTAGE & COD (SEMENANJUNG)',
      'BEKALAN TAHAN 2-3 BULAN',
      'KHAS IKHTIAR SUAMI ISTERI',
    ],
    itemsCount: 4,
    hasCod: true,
  },
  {
    units: 2,
    label: '2 Pek (100g x 2) — Beli 1 Free 1 Pek',
    sublabel: 'Dapat 2 Pek Garam (100g) — Pek pengenalan masakan berkat',
    pillLabel: 'BELI 1 FREE 1',
    price: 39,
    originalPrice: 60,
    savings: 21,
    badge: null,
    recommended: false,
    freePostage: false,
    includesKasturi: false,
    features: [
      'BELI 1 PERCUMA 1 PEK (DAPAT 2 PEK)',
      'KOS POSTAGE HANYA RM5',
      'PEK PERCUBAAN HARIAN',
      'PENGGUNAAN 1 BULAN',
    ],
    itemsCount: 2,
    hasCod: true,
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

  const [selectedPkg, setSelectedPkg] = useState(0); // index 0 = 6 Pek (Beli 4 Free 2 + Free Kasturi)
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

  // Derived: Sabah/Sarawak logic & Dynamic Package Postage
  const isEastMalaysia = EAST_MALAYSIA.includes(formData.negeri);
  const pkg = BASE_PACKAGES[selectedPkg] || BASE_PACKAGES[0];
  const effectivePostage = isEastMalaysia
    ? POSTAGE_EAST
    : (pkg.freePostage ? 0 : POSTAGE_NORMAL);

  // ─── 2 Add-ons State ───
  // Add-on 1: Minyak Kasturi Kijang E-Syifa' (+RM20)
  const [addKasturi, setAddKasturi] = useState(false);
  const KASTURI_PRICE = 20;

  // Add-on 2: Sabun Garam Himalaya Pengisian 200g (+RM25)
  const [addSabun, setAddSabun] = useState(false);
  const SABUN_PRICE = 25;

  const grandTotal = pkg.price + effectivePostage + (addKasturi ? KASTURI_PRICE : 0) + (addSabun ? SABUN_PRICE : 0);

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

      const freeKasturiNote = pkg.includesKasturi ? ' | Free Gift: Minyak Kasturi Kijang' : '';
      const kasturiNote = addKasturi ? ` | Add-On: Kasturi Kijang E-Syifa' +RM${KASTURI_PRICE}` : '';
      const sabunNote   = addSabun   ? ` | Add-On: Sabun Garam Pengisian +RM${SABUN_PRICE}` : '';
      const orderNotes  = `Alamat: ${address} | Pakej: ${pkg.label}${freeKasturiNote} | Postage: RM${effectivePostage}${kasturiNote}${sabunNote}`;

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
          product: 'Garam Pengasihan Masakan ESyifaa (100g)',
          amount_base: pkg.price,
          amount_total: grandTotal,
          addon_kasturi: addKasturi,
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
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

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

        {/* Section #13: CTA & Pakej Headline (Formula FSP PRO) */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '860px', margin: '0 auto 3rem auto' }}>
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
            marginBottom: '1rem',
          }}>
            📦 Tawaran Khas &amp; Pilihan Pakej
          </span>
          <h2 style={{
            fontSize: 'clamp(1.65rem, 3.5vw, 2.45rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.2rem 0 1rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.28,
          }}>
            Jangan Tunggu Lagi, Pulihkan Keretakan Rumahtangga &amp; Lembutkan Hati Pasangan Dengan Garam Pengasihan Masakan Sekarang
          </h2>
          <p style={{
            fontSize: '1.08rem',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '620px',
            margin: '0 auto',
            fontWeight: 500,
          }}>
            Pilih pakej anda sekarang sementara harga promosi &amp; kuota pos percuma masih dibuka!
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
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── Vertical Pricing Cards Grid (Mengikut Gambar Rujukan FSP PRO: 3 Pakej) ── */}
        <div id="pilih-pakej" className="fsp-pricing-grid-3">
          {BASE_PACKAGES.map((p, idx) => {
            const isSelected = selectedPkg === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPkg(idx)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2.5px solid #EA580C' : '1.5px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.75rem 1.15rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: isSelected
                    ? '0 12px 30px rgba(234, 88, 12, 0.16)'
                    : '0 4px 14px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {/* Floating Top Badge */}
                {p.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    background: p.recommended ? 'linear-gradient(135deg, #EA580C, #C2410C)' : '#1E293B',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '0.28rem 0.85rem',
                    borderRadius: '9999px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                    zIndex: 2,
                  }}>
                    ⭐ {p.badge}
                  </div>
                )}

                {/* 1. Visual Stack of Items */}
                <div style={{
                  minHeight: '95px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  width: '100%',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    flexWrap: 'wrap',
                    maxWidth: '180px',
                  }}>
                    {Array.from({ length: p.itemsCount }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: p.itemsCount > 4 ? '26px' : '34px',
                          height: p.itemsCount > 4 ? '38px' : '46px',
                          background: 'linear-gradient(180deg, #FDBA74 0%, #EA580C 100%)',
                          borderRadius: '6px 6px 8px 8px',
                          border: '1.5px solid #C2410C',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '0.55rem',
                          boxShadow: '0 2px 6px rgba(234, 88, 12, 0.2)',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          width: '65%',
                          height: '3px',
                          background: '#9A3412',
                          borderRadius: '2px 2px 0 0',
                          position: 'absolute',
                          top: '-3px',
                        }} />
                        <span>100g</span>
                      </div>
                    ))}
                    {p.includesKasturi && (
                      <div
                        style={{
                          width: '28px',
                          height: '42px',
                          background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                          borderRadius: '4px 4px 6px 6px',
                          border: '1.5px solid #047857',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '0.52rem',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                          position: 'relative',
                        }}
                        title="Free Kasturi Kijang E-Syifa'"
                      >
                        <span>🎁</span>
                        <span style={{ fontSize: '0.45rem' }}>FREE</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#EA580C' }}>
                    {p.itemsCount}x Pek (100g) {p.includesKasturi ? '+ Free Kasturi 🎁' : ''}
                  </div>
                </div>

                {/* 2. Dark Pill Label */}
                <div style={{
                  background: isSelected ? '#C2410C' : '#1E293B',
                  color: '#FFFFFF',
                  padding: '0.42rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
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
                  fontSize: '0.84rem',
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
                  <span>FPX</span> · <span>Mastercard</span> · <span>VISA</span> · <span>COD</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Form Section ── */}
        <div id="maklumat-pesanan" style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Active Selected Package Banner */}
          <div style={{
            background: '#FFF7ED',
            border: '2px solid #FDBA74',
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
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pakej Dipilih Anda:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                {pkg.label} — <span style={{ color: '#EA580C' }}>RM{pkg.price}</span>
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

          {/* ── 3. DUAL BUMP OFFERS (SELEPAS ISI BUTIRAN DIRI) ── */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
                Nak Rawatan &amp; Pendinding Diri Lebih Lengkap? Tambah Ni 👇
              </span>
            </div>

            {/* ── BUMP OFFER 1: Kasturi Kijang E-Syifa' (+RM20) ── */}
            <div
              onClick={() => setAddKasturi(v => !v)}
              role="checkbox"
              aria-checked={addKasturi}
              style={{
                position: 'relative',
                border: addKasturi ? '2px solid #EA580C' : '2px dashed #D97706',
                borderRadius: '16px',
                padding: '1.75rem 1.15rem 1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer',
                background: addKasturi ? 'rgba(234,88,12,0.04)' : 'rgba(251,191,36,0.04)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Badges row */}
              <div style={{
                position: 'absolute', top: '-11px', left: '1rem',
                display: 'flex', gap: '0.4rem', flexWrap: 'nowrap',
              }}>
                <div style={{
                  background: '#D97706', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(217,119,6,0.3)', whiteSpace: 'nowrap',
                }}>
                  ⚡ Tambahan Khas — Tawaran Sekali Sahaja
                </div>
                <div style={{
                  background: '#059669', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(5,150,105,0.3)', whiteSpace: 'nowrap',
                }}>
                  🎁 Diskaun RM30
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Tick Checkbox */}
                <div style={{
                  flexShrink: 0, marginTop: '3px',
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: addKasturi ? '#EA580C' : '#FFFFFF',
                  border: addKasturi ? '2px solid #EA580C' : '2px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                  boxShadow: addKasturi ? '0 0 0 3px rgba(234,88,12,0.15)' : 'none',
                }}>
                  {addKasturi && (
                    <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.97rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    Ya! Tambah Minyak Kasturi Kijang E-Syifa’ 🌿
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>RM50</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#EA580C' }}>RM{KASTURI_PRICE} sahaja</span>
                  </div>

                  {/* Image + Bullets (Identikal macam SP Sabun) */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '96px', height: '96px', flexShrink: 0,
                      borderRadius: '10px', overflow: 'hidden',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      position: 'relative',
                    }}>
                      <Image
                        src="/images/kasturi-kijang-opt.jpg"
                        alt="Kasturi Kijang E-Syifa'"
                        width={96}
                        height={96}
                        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                        loading="lazy"
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '160px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
                      <div>🛡️ <strong>Wangian yang dibenci jin</strong> — benteng &amp; pendinding sihir</div>
                      <div>✨ Diisi <strong>Ayat Ruqyah Benteng &amp; Pendinding</strong> yang khas</div>
                      <div>💚 Perlindungan aktif <strong>selagi bauan masih ada pada badan</strong></div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.55rem', fontSize: '0.74rem', fontWeight: 700, color: addKasturi ? '#059669' : '#D97706', transition: 'color 0.2s' }}>
                    {addKasturi
                      ? '✓ Kasturi Kijang ditambah ke pesanan anda! 🎉'
                      : '☐ Klik untuk tambahkan ke order anda →'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BUMP OFFER 2: Sabun Garam Pengisian 200g (+RM25) ── */}
            <div
              onClick={() => setAddSabun(v => !v)}
              role="checkbox"
              aria-checked={addSabun}
              style={{
                position: 'relative',
                border: addSabun ? '2px solid #059669' : '2px dashed #0D9488',
                borderRadius: '16px',
                padding: '1.75rem 1.15rem 1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer',
                background: addSabun ? 'rgba(5,150,105,0.04)' : 'rgba(13,148,136,0.04)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Badges row */}
              <div style={{
                position: 'absolute', top: '-11px', left: '1rem',
                display: 'flex', gap: '0.4rem', flexWrap: 'nowrap',
              }}>
                <div style={{
                  background: '#0D9488', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(13,148,136,0.3)', whiteSpace: 'nowrap',
                }}>
                  ⚡ Kombo Lengkap: Rawatan Luar &amp; Dalam
                </div>
                <div style={{
                  background: '#059669', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(5,150,105,0.3)', whiteSpace: 'nowrap',
                }}>
                  🎁 Jimat RM14 (RM25 Sahaja)
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Tick Checkbox */}
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

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.97rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                    Ya! Tambah Sabun Garam Himalaya Pengisian (200g) 🧼
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>RM39</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#059669' }}>RM{SABUN_PRICE} sahaja</span>
                  </div>

                  {/* Image + Bullets */}
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
                        alt="Sabun Garam Himalaya Pengisian"
                        width={96}
                        height={96}
                        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                        loading="lazy"
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '160px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
                      <div>🚿 <strong>Mandian Ruqyah 200g</strong> — cuci bisa sihir &amp; gangguan dari luar tubuh</div>
                      <div>🌿 <strong>Melengkapi Garam Masakan</strong> — rawatan dalam (makanan) &amp; luar (mandian) serentak</div>
                      <div>✨ Hilangkan <strong>rasa berat badan, lesu &amp; sengal urat</strong> semasa mandi</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.55rem', fontSize: '0.74rem', fontWeight: 700, color: addSabun ? '#059669' : '#0D9488', transition: 'color 0.2s' }}>
                    {addSabun
                      ? '✓ Sabun Garam Pengisian ditambah ke pesanan anda! 🎉'
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

            {pkg.includesKasturi && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#059669' }}>
                <span>🎁 Free Gift: Minyak Kasturi Kijang E-Syifa':</span>
                <strong>PERCUMA</strong>
              </div>
            )}

            {addKasturi && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#EA580C' }}>
                <span>Add-on: Kasturi Kijang E-Syifa’:</span>
                <strong>+RM{KASTURI_PRICE}</strong>
              </div>
            )}

            {addSabun && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#059669' }}>
                <span>Add-on: Sabun Garam Pengisian (200g):</span>
                <strong>+RM{SABUN_PRICE}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#475569' }}>
              <span>Postage ({isEastMalaysia ? 'Sabah / Sarawak' : 'Semenanjung'}):</span>
              <strong style={{ color: effectivePostage === 0 ? '#059669' : '#0F172A' }}>
                {effectivePostage === 0 ? 'PERCUMA' : `RM${effectivePostage}`}
              </strong>
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
