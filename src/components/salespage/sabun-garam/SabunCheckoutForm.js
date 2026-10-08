'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { generateEventId, getPixelCookies } from '@/lib/tracking/pixel';

// ─── Packages ─────────────────────────────────────────────────────────────────
const BASE_PACKAGES = [
  {
    units: 1, label: '1 Unit', price: 39, savings: null, badge: null,
    pillLabel: 'PEK PERCUBAAN', originalPrice: null,
    features: ['1 KETUL SABUN GARAM (200g)', 'POSTAGE RM5 (SEMENANJUNG)', 'COD TERSEDIA (SEMENANJUNG)'],
  },
  {
    units: 2, label: '2 Unit', price: 70, savings: 8, badge: 'JIMAT RM8',
    pillLabel: 'PAKEJ BERDUA', originalPrice: 78,
    features: ['2 KETUL SABUN GARAM (200g)', 'JIMAT RM8', 'POSTAGE RM5 (SEMENANJUNG)', 'COD TERSEDIA (SEMENANJUNG)'],
  },
  {
    units: 3, label: '3 Unit', price: 90, savings: 27, badge: 'Paling Jimat (Jimat RM27)', recommended: true,
    pillLabel: 'PAKEJ PALING JIMAT', originalPrice: 117,
    features: ['3 KETUL SABUN GARAM (200g)', 'JIMAT RM27', 'POSTAGE RM5 (SEMENANJUNG)', 'COD TERSEDIA (SEMENANJUNG)'],
  },
];

// Susunan kad: terbesar dahulu (kiri / atas) — sama gaya SP Garam
const CARD_ORDER = [2, 1, 0];

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

function SabunCheckoutFormInner({ source = 'sabun-garam' }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams?.get('m') || '';
  
  const [selectedPkg,   setSelectedPkg]   = useState(2); // index 2 = 3 unit (recommended)
  const [paymentMethod, setPaymentMethod] = useState('fpx');
  const [formData,      setFormData]      = useState({
    full_name: '', dialCode: '+60', phone: '',
    street: '',   // No. rumah, nama jalan, taman
    poskod: '',
    daerah: '',
    negeri: '',
    honeypot: '',
  });
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [fpxPixelId, setFpxPixelId] = useState(null);

  const ff  = 'var(--font-inter), -apple-system, sans-serif';

  // ─── Derived: Sabah/Sarawak logic ─────────────────────────────────────────
  const isEastMalaysia = EAST_MALAYSIA.includes(formData.negeri);
  const postage        = isEastMalaysia ? POSTAGE_EAST : POSTAGE_NORMAL;

  // Build packages with dynamic postage — semua pakej: RM5 Semenanjung / RM10 Sabah & Sarawak
  const PACKAGES = BASE_PACKAGES.map(p => ({
    ...p,
    postage: p.freePostage ? 0 : postage,
    total: p.price + (p.freePostage ? 0 : postage),
  }));

  const pkg = PACKAGES[selectedPkg];

  // ─── Add-on: Kasturi Kijang E-Syifa' ──────────────────────────────────────
  const [addKasturi, setAddKasturi] = useState(false);
  // Pakej 3 Unit dah termasuk Kasturi PERCUMA — add-on Kasturi dimatikan
  useEffect(() => { if (PACKAGES[selectedPkg]?.includesKasturi) setAddKasturi(false); }, [selectedPkg]);   // eslint-disable-line react-hooks/exhaustive-deps
  const KASTURI_PRICE            = 20;
  const KASTURI_POSTAGE_DISCOUNT = 5;   // RM5 off postage; Semenanjung: FREE, Sabah/Sarawak: RM5→RM5
  const pkgPostage               = pkg.postage;                                   // 0 untuk pakej free postage
  const effectivePostage         = addKasturi ? Math.max(0, pkgPostage - KASTURI_POSTAGE_DISCOUNT) : pkgPostage;
  const postageIsFree            = addKasturi && effectivePostage === 0 && pkgPostage > 0;  // selepas tick: untuk Ringkasan
  const addonPostagePerk         = pkgPostage > 0;                                // add-on Kasturi masih beri diskaun postage?
  const kasturiGivesFreePostage  = pkgPostage > 0 && pkgPostage <= KASTURI_POSTAGE_DISCOUNT; // sebelum tick: untuk badge/sub-text
  const grandTotal               = pkg.price + effectivePostage + (addKasturi ? KASTURI_PRICE : 0);

  // If Sabah/Sarawak selected and COD was active, switch to FPX
  useEffect(() => {
    if (isEastMalaysia && paymentMethod === 'cod') {
      setPaymentMethod('fpx');
    }
  }, [isEastMalaysia, paymentMethod]);

  useEffect(() => {
    // Marketer routes (/m/ atau ?m=) — jangan load HQ FPX pixel
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
      .then(j => { if (j.fpx_pixel_id) setFpxPixelId(j.fpx_pixel_id); })
      .catch(() => {});
    return () => { try { document.head.removeChild(script); } catch (_) {} };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Combine address fields into single address string for API
  const buildAddress = () => {
    const parts = [formData.street, formData.poskod, formData.daerah, formData.negeri];
    return parts.filter(Boolean).join(', ');
  };

  const validate = () => {
    if (!formData.full_name.trim()) return 'Sila isi nama penuh anda.';
    if (!formData.phone.trim())     return 'Sila isi nombor WhatsApp anda.';
    if (!formData.street.trim())    return 'Sila isi alamat (No. rumah / jalan / taman).';
    if (!formData.poskod.trim())    return 'Sila isi poskod.';
    if (!formData.daerah.trim())    return 'Sila isi daerah / bandar.';
    if (!formData.negeri)           return 'Sila pilih negeri.';
    return null;
  };

  // ─── FPX Submit ───────────────────────────────────────────────────────────
  const handleFPX = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setLoading(true);

    try {
      const pid      = fpxPixelId || window.__fpxPixelId;
      const eventId  = generateEventId();
      const { fbp, fbc } = getPixelCookies();
      const rawPhone = `${formData.dialCode}${formData.phone.replace(/^0+/, '')}`;
      const utms     = getUTMParams();
      const address  = buildAddress();

      const kasturiNote = addKasturi ? ` | Add-On: Kasturi Kijang E-Syifa' +RM${KASTURI_PRICE}` : '';
      const giftNote   = pkg.includesKasturi ? ' | Free Gift: Minyak Kasturi Kijang' : '';   // → stok Kasturi ditolak bila bayaran berjaya
      const orderNotes = `Alamat: ${address} | Pakej: ${pkg.label}${giftNote} | Postage: RM${effectivePostage}${kasturiNote}`;

      // Fire InitiateCheckout pixel
      try {
        if (window.fbq) {
          if (pid) window.fbq('trackSingle', pid, 'InitiateCheckout', {
            value: pkg.total, currency: 'MYR',
            content_name: `Sabun Garam — ${pkg.label}`,
          }, { eventID: eventId });
          else window.fbq('track', 'InitiateCheckout', { value: pkg.total, currency: 'MYR' });
        }
      } catch (_) {}

      const res = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: orderNotes,
          address,                          // ← simpan address ke kolum dedicated
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
        throw new Error(json.error || 'Gagal membuat FPX. Sila cuba lagi.');
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
          product: 'Sabun Garam Himalaya Pengisian ESyifaa (200g)',
          amount_base: pkg.price,
          amount_total: grandTotal,
          addon_kasturi: addKasturi,
          free_gift_kasturi: !!pkg.includesKasturi,   // pakej 3 Unit: percuma 1 botol Kasturi (stok ditolak di route COD)
          honeypot: formData.honeypot,
          source,
          marketer_code: marketerCode,
          landing_page_url: window.location.href,
          referrer_url: document.referrer,
          fbp: fbp || null,
          fbc: fbc || (utms.fbclid ? `fb.1.${Date.now()}.${utms.fbclid}` : null),
          fbclid: utms.fbclid || null,
          ...utms,
        }),
      });

      const rawText = await res.text();
      let json = {};
      try { json = JSON.parse(rawText); }
      catch { throw new Error('Respons daripada pelayan tidak sah. Sila hubungi admin atau cuba sebentar lagi.'); }

      if (res.ok && json.success) {
        // Fire client-side Purchase pixel before redirect
        try {
          const pid = fpxPixelId || window.__fpxPixelId;
          if (window.fbq) {
            const evtId = `cod_${json.order_id || Date.now()}`;
            if (pid) {
              window.fbq('trackSingle', pid, 'Purchase', {
                value: grandTotal, currency: 'MYR',
                content_name: `Sabun Garam — ${pkg.label}`,
              }, { eventID: evtId });
            } else {
              window.fbq('track', 'Purchase', {
                value: grandTotal, currency: 'MYR',
                content_name: `Sabun Garam — ${pkg.label}`,
              }, { eventID: evtId });
            }
          }
        } catch (_) {}

        // Redirect to TQ page
        const productLabel = encodeURIComponent(`Sabun Garam ${pkg.label}`);
        window.location.href = `/payment-success?type=cod&amount=${grandTotal}&product=${productLabel}&order_id=${json.order_id || ''}${marketerCode ? `&m=${encodeURIComponent(marketerCode)}` : ''}`;
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

  // ─── Form Render ─────────────────────────────────────────────────────────
  return (
    <section id="borang" style={{
      background: 'linear-gradient(180deg, #F0FDF4 0%, #F8FAF9 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

        {/* CSS grid kad harga — 3 lajur desktop, 1 lajur mobile */}
        <style dangerouslySetInnerHTML={{ __html: `
          .sabun-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 3rem; }
          @media (max-width: 860px) { .sabun-pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin-left: auto; margin-right: auto; } }
        `}} />

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            📦 Tempah Sekarang
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.5rem',
            letterSpacing: '-0.025em',
          }}>
            Pilih Pakej &amp; Tempah
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto' }}>
            Postage RM5 Semenanjung / RM10 Sabah &amp; Sarawak · Tambah Minyak Kasturi untuk <strong style={{ color: '#047857' }}>diskaun postage RM5</strong>
          </p>
        </div>

        {/* ── 1. Kad Harga (gaya SP Garam) ── */}
        <div id="pilih-pakej" className="sabun-pricing-grid">
          {CARD_ORDER.map(idx => {
            const p = PACKAGES[idx];
            const isSelected = selectedPkg === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPkg(idx)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2.5px solid #10B981' : '1.5px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '1.75rem 1.15rem 1.5rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
                  textAlign: 'center', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 12px 30px rgba(16, 185, 129, 0.16)' : '0 4px 14px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Badge atas */}
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: '-12px',
                    background: p.recommended ? 'linear-gradient(135deg, #10B981, #047857)' : '#1E293B',
                    color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
                    padding: '0.28rem 0.85rem', borderRadius: '9999px', boxShadow: '0 3px 10px rgba(0,0,0,0.18)', zIndex: 2, whiteSpace: 'nowrap',
                  }}>
                    ⭐ {p.badge}
                  </div>
                )}

                {/* Visual ketul sabun */}
                <div style={{ minHeight: '95px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {Array.from({ length: p.units }).map((_, i) => (
                      <div key={i} style={{
                        width: '46px', height: '34px',
                        background: 'linear-gradient(180deg, #FFE8DC 0%, #FCCDB4 55%, #F2A98B 100%)',
                        borderRadius: '10px', border: '1.5px solid #E08D6D',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#7C2D12', fontWeight: 900, fontSize: '0.55rem',
                        boxShadow: '0 2px 6px rgba(224, 141, 109, 0.3)',
                      }}>
                        200g
                      </div>
                    ))}
                    {p.includesKasturi && (
                      <div title="Free Minyak Kasturi Kijang" style={{
                        width: '28px', height: '42px',
                        background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
                        borderRadius: '4px 4px 6px 6px', border: '1.5px solid #047857',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#FFFFFF', fontWeight: 900, fontSize: '0.52rem',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                      }}>
                        <span>🎁</span>
                        <span style={{ fontSize: '0.45rem' }}>FREE</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#047857' }}>
                    {p.units}x Sabun Garam (200g){p.includesKasturi ? ' + Free Kasturi 🎁' : ''}
                  </div>
                </div>

                {/* Label pil */}
                <div style={{
                  background: isSelected ? '#047857' : '#1E293B', color: '#FFFFFF',
                  padding: '0.42rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800,
                  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1rem', width: '90%', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {p.pillLabel}
                </div>

                {/* Harga asal */}
                <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem', minHeight: '1.3em' }}>
                  {p.originalPrice ? <>Harga Asal <span style={{ textDecoration: 'line-through' }}>RM{p.originalPrice}</span></> : 'Harga Seunit'}
                </div>

                {/* Harga promo */}
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                  RM{p.price}
                </div>

                {/* Ciri */}
                <ul style={{
                  listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', textAlign: 'left', width: '100%',
                  fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                  {p.features.map((feat, fIdx) => {
                    // Item PERCUMA (postage / Kasturi) ditonjolkan
                    const perk = feat.startsWith('PERCUMA');
                    const isGift = perk && feat.includes('KASTURI');
                    return (
                      <li key={fIdx} style={perk ? {
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: isGift ? 'linear-gradient(90deg, #FEF3C7, #FFFBEB)' : 'linear-gradient(90deg, #D1FAE5, #ECFDF5)',
                        border: isGift ? '1.5px solid #F59E0B' : '1.5px solid #34D399',
                        color: isGift ? '#92400E' : '#065F46',
                        borderRadius: '8px', padding: '0.4rem 0.55rem', fontWeight: 800,
                      } : { display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: perk ? 'inherit' : '#059669', fontWeight: 900, fontSize: '0.95rem', flexShrink: 0 }}>
                          {isGift ? '🎁' : perk ? '🚚' : '✓'}
                        </span>
                        <span>{feat}</span>
                      </li>
                    );
                  })}
                </ul>

                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                  Klik button di bawah untuk beli
                  <span style={{ display: 'block', fontSize: '1.1rem', marginTop: '0.15rem' }}>👇🏻</span>
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPkg(idx);
                    document.getElementById('maklumat-pesanan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    width: '100%', padding: '0.85rem 0.75rem', background: '#0F172A', color: '#FFFFFF',
                    borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  👉🏻 BELI SEKARANG
                </button>

                <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <span>FPX</span> · <span>Mastercard</span> · <span>VISA</span> · <span>COD</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Borang (680px) ── */}
        <div id="maklumat-pesanan" style={{ maxWidth: '680px', margin: '0 auto', scrollMarginTop: '1rem' }}>

          {/* Pakej dipilih */}
          <div style={{
            background: '#ECFDF5', border: '2px solid #A7F3D0', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pakej Dipilih Anda:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>
                {pkg.label} Sabun Garam — <span style={{ color: '#059669' }}>RM{pkg.price}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('pilih-pakej')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: '#FFFFFF', border: '1.5px solid #CBD5E1', padding: '0.4rem 0.85rem', borderRadius: '8px',
                fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer',
              }}
            >
              Tukar Pakej ↺
            </button>
          </div>

        {/* ── 2. Form Card (Langkah 2: Maklumat Penghantaran) ── */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px',
          padding: '2.25rem 2rem', border: '1px solid #CBD5E1',
          boxShadow: '0 10px 35px rgba(0,0,0,0.05)',
        }}>
          <p style={{
            fontSize: '0.8rem', fontWeight: 700, color: '#0F172A',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            marginBottom: '1.5rem', paddingBottom: '1.25rem',
            borderBottom: '1px solid #F1F5F9',
          }}>
            Langkah 2: Maklumat Penghantaran
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px',
              padding: '0.75rem 1rem', color: '#BE123C', fontSize: '0.85rem',
              fontWeight: 600, marginBottom: '1.25rem', lineHeight: 1.4,
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
                type="text" name="full_name"
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
                  name="dialCode" value={formData.dialCode} onChange={handleChange}
                  style={{ ...INPUT_STYLE, flexShrink: 0, width: '105px', cursor: 'pointer', paddingRight: '0.5rem' }}
                >
                  {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
                </select>
                <input
                  type="tel" name="phone"
                  placeholder="123456789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.74rem', color: '#64748B' }}>
                Kami akan hantar maklumat pesanan ke WhatsApp ini.
              </p>
            </div>

            {/* Alamat — Street */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={LABEL_STYLE}>Alamat (No. Rumah / Jalan / Taman) {REQ}</label>
              <input
                type="text" name="street"
                placeholder="Cth: No. 12, Jln Setia 3, Tmn Setia Indah"
                value={formData.street}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
              />
            </div>

            {/* Poskod + Daerah — 2 column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
              <div>
                <label style={LABEL_STYLE}>Poskod {REQ}</label>
                <input
                  type="text" name="poskod"
                  placeholder="Cth: 81300"
                  value={formData.poskod}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label style={LABEL_STYLE}>Daerah / Bandar {REQ}</label>
                <input
                  type="text" name="daerah"
                  placeholder="Cth: Skudai"
                  value={formData.daerah}
                  onChange={handleChange}
                  required
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Negeri */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={LABEL_STYLE}>Negeri {REQ}</label>
              <select
                name="negeri" value={formData.negeri} onChange={handleChange}
                required
                style={{ ...INPUT_STYLE, cursor: 'pointer', color: formData.negeri ? '#0F172A' : '#94A3B8' }}
              >
                <option value="">-- Pilih Negeri --</option>
                {MY_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* East Malaysia notice */}
              {isEastMalaysia && (
                <div style={{
                  marginTop: '0.6rem', padding: '0.65rem 0.85rem',
                  background: '#FFF7ED', border: '1px solid #FED7AA',
                  borderRadius: '8px', fontSize: '0.8rem', color: '#9A3412', fontWeight: 600,
                }}>
                  📍 Sabah / Sarawak — Postage {pkg.freePostage ? 'PERCUMA untuk pakej ini' : 'RM10'}. Pembayaran FPX sahaja (COD tidak tersedia).
                </div>
              )}
            </div>

            {pkg.includesKasturi ? (
              /* Pakej 3 Unit — Kasturi dah termasuk percuma; tiada add-on */
              <div style={{
                marginBottom: '1.25rem', padding: '0.95rem 1.1rem', borderRadius: '14px',
                background: 'linear-gradient(90deg, #FEF3C7, #FFFBEB)', border: '1.5px solid #F59E0B',
                display: 'flex', alignItems: 'center', gap: '0.85rem',
              }}>
                <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #FDE68A' }}>
                  <Image src="/images/kasturi-kijang-opt.jpg" alt="Kasturi Kijang E-Syifa'" width={56} height={56}
                    style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} loading="lazy" />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#92400E', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#78350F' }}>🎁 Minyak Kasturi Kijang PERCUMA</strong>
                  Bernilai <strong>RM20</strong> — dah termasuk dalam Pakej 3 Unit anda. Tak perlu tambah lagi.
                </div>
              </div>
            ) : (
            <>
            {/* ── Bump Offer Header ── */}
            <div style={{ textAlign: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                {'Nak Benteng Diri Lebih Lengkap? Tambah Ni \uD83D\uDC47'}
              </span>
            </div>

            {/* ── Bump Offer: Kasturi Kijang E-Syifa' ── */}
            <div
              onClick={() => setAddKasturi(v => !v)}
              role="checkbox"
              aria-checked={addKasturi}
              style={{
                position: 'relative',
                border: addKasturi ? '2px solid #10B981' : '2px dashed #D97706',
                borderRadius: '16px',
                padding: '1.75rem 1.15rem 1rem',
                marginBottom: '1.25rem',
                cursor: 'pointer',
                background: addKasturi ? 'rgba(16,185,129,0.04)' : 'rgba(251,191,36,0.04)',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Badge row — two badges */}
              <div className="bump-badges" style={{
                // Dalam aliran layout (bukan absolute) — badge boleh turun baris di skrin kecil
                position: 'relative', margin: '-2.45rem 0 0.85rem 0', zIndex: 1,
                display: 'flex', gap: '0.35rem', flexWrap: 'wrap',
              }}>
                <div style={{
                  background: '#D97706', color: '#FFF',
                  fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                  borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(217,119,6,0.3)', whiteSpace: 'nowrap',
                }}>{'⚡ Tambahan Khas — Tawaran Sekali Sahaja'}</div>
                {addonPostagePerk && (
                  <div style={{
                    background: '#059669', color: '#FFF',
                    fontSize: '0.62rem', fontWeight: 800, padding: '0.18rem 0.65rem',
                    borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.3)', whiteSpace: 'nowrap',
                  }}>{kasturiGivesFreePostage ? '🎁 POSTAGE FREE' : '🎁 DISKAUN POSTAGE RM5'}</div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {/* Tick checkbox */}
                <div style={{
                  flexShrink: 0, marginTop: '3px',
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: addKasturi ? '#10B981' : '#FFFFFF',
                  border: addKasturi ? '2px solid #10B981' : '2px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                  boxShadow: addKasturi ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
                }}>
                  {addKasturi && (
                    <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 900, lineHeight: 1 }}>{'✓'}</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Title row */}
                  <div style={{ fontSize: '0.97rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, marginBottom: '0.3rem' }}>
                    {'Ya! Tambah Kasturi Kijang E-Syifa\u2019 \uD83C\uDF3F'}
                  </div>

                  {/* Price + postage saving */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', textDecoration: 'line-through' }}>RM50</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10B981' }}>RM{KASTURI_PRICE} sahaja</span>
                  </div>
                  {addonPostagePerk ? (
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.65rem' }}>
                      {kasturiGivesFreePostage
                        ? '\uD83D\uDE9A Tambah Kasturi ni, Kami belanja Free Postage'
                        : '\uD83D\uDE9A Diskaun postage RM5 untuk Sabah/Sarawak'}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.65rem' }}>
                      {pkg.includesKasturi ? '\u2795 Tambah sebotol lagi untuk ahli keluarga' : '\u2728 Lengkapkan benteng diri anda'}
                    </div>
                  )}

                  {/* Image + bullets */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '96px', height: '96px', flexShrink: 0,
                      borderRadius: '10px', overflow: 'hidden',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
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

                    {/* Bullets */}
                    <div style={{ flex: 1, minWidth: '160px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.7 }}>
                      <div>{'🛡️ '}<strong>{'Wangian yang dibenci jin'}</strong>{' — benteng & pendinding sihir'}</div>
                      <div>{'✨ Diisi '}<strong>{'Ayat Ruqyah Benteng & Pendinding'}</strong>{' yang khas'}</div>
                      <div>{'💚 Perlindungan aktif '}<strong>{'selagi bauan masih ada pada badan'}</strong></div>
                    </div>
                  </div>

                  {/* CTA text */}
                  <div style={{ marginTop: '0.55rem', fontSize: '0.72rem', fontWeight: 700, color: addKasturi ? '#059669' : '#D97706', transition: 'color 0.2s' }}>
                    {addKasturi
                      ? (addonPostagePerk
                          ? `\u2713 Kasturi ditambah — ${postageIsFree ? 'Postage percuma diaktifkan! \uD83C\uDF89' : 'Diskaun postage RM5 diaktifkan! \uD83C\uDF89'}`
                          : '\u2713 Kasturi ditambah ke order anda \uD83C\uDF89')
                      : '\u2610 Klik untuk tambahkan ke order anda \u2192'}
                  </div>

                </div>
              </div>
            </div>
            </>
            )}

            {/* ── Banner: postage saving active ── */}
            {addKasturi && addonPostagePerk && (
              <div style={{
                marginBottom: '0.75rem', padding: '0.6rem 0.85rem',
                background: '#ECFDF5', border: '1px solid #6EE7B7',
                borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#065F46',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1rem' }}>🎉</span>
                {postageIsFree
                  ? 'Tahniah! Postage percuma diaktifkan kerana tambah Kasturi.'
                  : 'Diskaun postage RM5 diaktifkan kerana tambah Kasturi.'}
              </div>
            )}

            {/* ── Ringkasan Order ── */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                🧾 Ringkasan Order
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#475569' }}>Sabun Garam — {pkg.label}</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>RM{pkg.price}</span>
              </div>
              {pkg.includesKasturi && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#059669' }}>{'🎁 Free Gift: Minyak Kasturi Kijang'}</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>PERCUMA</span>
                </div>
              )}
              {/* Postage row — dynamic */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', marginBottom: addKasturi ? '0.4rem' : '0' }}>
                <span style={{ color: '#475569' }}>Postage</span>
                {pkg.freePostage ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 500, color: '#94A3B8', textDecoration: 'line-through', fontSize: '0.8rem' }}>RM{postage}</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>PERCUMA 🎁</span>
                  </span>
                ) : addKasturi ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 500, color: '#94A3B8', textDecoration: 'line-through', fontSize: '0.8rem' }}>RM{postage}</span>
                    <span style={{ fontWeight: 700, color: postageIsFree ? '#059669' : '#0F172A' }}>
                      {postageIsFree ? 'PERCUMA 🎁' : `RM${effectivePostage}`}
                    </span>
                    {!postageIsFree && <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>(- RM{KASTURI_POSTAGE_DISCOUNT})</span>}
                  </span>
                ) : (
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>RM{postage}</span>
                )}
              </div>
              {addKasturi && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#059669' }}>{'🌿 Kasturi Kijang E-Syifa\u2019'}</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>RM{KASTURI_PRICE}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #E2E8F0', margin: '0.75rem 0 0.6rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Jumlah Bayaran</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>RM{grandTotal}</span>
              </div>
            </div>

            {/* ── Langkah 3: Payment Method ── */}
            <div style={{
              paddingTop: '1.25rem', marginBottom: '1.5rem',
              borderTop: '1px solid #F1F5F9',
            }}>
              <p style={{
                fontSize: '0.8rem', fontWeight: 700, color: '#0F172A',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem',
              }}>
                Langkah 3: Kaedah Pembayaran
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {/* FPX Radio */}
                <label
                  onClick={() => setPaymentMethod('fpx')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.9rem 1.1rem', borderRadius: '12px', cursor: 'pointer',
                    border: paymentMethod === 'fpx' ? '2px solid #10B981' : '1.5px solid #E2E8F0',
                    background: paymentMethod === 'fpx' ? '#ECFDF5' : '#FFFFFF',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    border: paymentMethod === 'fpx' ? '6px solid #10B981' : '2px solid #CBD5E1',
                    background: '#FFFFFF', transition: 'all 0.15s ease',
                  }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: paymentMethod === 'fpx' ? '#047857' : '#0F172A' }}>
                      💳 FPX Online Banking
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.1rem' }}>Bayar secara online &amp; selamat</div>
                  </div>
                </label>

                {/* COD Radio — hidden for Sabah/Sarawak */}
                {!isEastMalaysia && (
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.85rem',
                      padding: '0.9rem 1.1rem', borderRadius: '12px', cursor: 'pointer',
                      border: paymentMethod === 'cod' ? '2px solid #10B981' : '1.5px solid #E2E8F0',
                      background: paymentMethod === 'cod' ? '#ECFDF5' : '#FFFFFF',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: paymentMethod === 'cod' ? '6px solid #10B981' : '2px solid #CBD5E1',
                      background: '#FFFFFF', transition: 'all 0.15s ease',
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: paymentMethod === 'cod' ? '#047857' : '#0F172A' }}>
                        🚚 Bayar Masa Terima (COD)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.1rem' }}>Bayar tunai kepada posmen</div>
                    </div>
                  </label>
                )}
              </div>

              {/* FPX banks note */}
              {paymentMethod === 'fpx' && (
                <div style={{
                  marginTop: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0',
                  borderRadius: '8px', padding: '0.65rem 0.9rem', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>
                    Disokong Semua Bank FPX Utama (Maybank, CIMB, Bank Islam, RHB dll)
                  </span>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1.1rem',
                fontSize: '1.02rem', fontWeight: 700, color: '#FFFFFF',
                background: loading ? '#94A3B8' : 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                border: 'none', borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(16,185,129,0.28)',
                transition: 'all 0.15s ease', fontFamily: ff,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? (
                <>Sedang diproses...</>
              ) : (
                <>
                  {paymentMethod === 'fpx'
                    ? `Bayar RM${grandTotal} Melalui FPX Sekarang →`
                    : `Sahkan Pesanan COD (RM${grandTotal}) Sekarang →`}
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.76rem', color: '#64748B' }}>
              {paymentMethod === 'fpx'
                ? '🔒 Bayaran selamat melalui FPX Online Banking rasmi (enkripsi 256-bit)'
                : '✅ Tiada risiko — anda hanya bayar tunai apabila barang selamat sampai'}
            </p>
          </form>
        </div>
        </div>{/* /maklumat-pesanan */}

      </div>
    </section>
  );
}

export default function SabunCheckoutForm(props) {
  return (
    <Suspense fallback={null}>
      <SabunCheckoutFormInner {...props} />
    </Suspense>
  );
}
