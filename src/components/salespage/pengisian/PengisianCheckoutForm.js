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

  // ─── 2 Add-ons State ───
  const [addKasturi, setAddKasturi] = useState(false);
  const KASTURI_PRICE = 20;

  const [addSabun, setAddSabun] = useState(false);
  const SABUN_PRICE = 25;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ff = 'var(--font-inter), -apple-system, sans-serif';
  const pkg = PACKAGES[selectedPkg];
  const grandTotal = pkg.price + (addKasturi ? KASTURI_PRICE : 0) + (addSabun ? SABUN_PRICE : 0);

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

      const kasturiTag = addKasturi ? ` | Add-On: Kasturi Kijang E-Syifa +RM${KASTURI_PRICE}` : '';
      const sabunTag = addSabun ? ` | Add-On: Sabun Garam Pengisian +RM${SABUN_PRICE}` : '';
      const orderProblem = `Pengisian E-Syifa (${pkg.label}) | Barang: ${formData.item_description.trim()}${kasturiTag}${sabunTag}`;

      const response = await fetch('/api/payments/chip/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: rawPhone,
          problem: orderProblem,
          amount_in_myr: grandTotal,
          addon_kasturi: addKasturi,
          addon_sabun: addSabun,
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
        background: 'linear-gradient(180deg, #031E17 0%, #042E23 50%, #021812 100%)',
        color: '#FFFFFF',
        padding: '2rem 1.25rem 5rem',
        fontFamily: ff,
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Form Container */}
        <div style={{
          background: '#042E23',
          border: '2px solid rgba(253,224,71,0.4)',
          borderRadius: '24px',
          padding: '2rem 1.5rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>

          {/* Form Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
              color: '#FDE047', padding: '0.35rem 1rem', borderRadius: '50px',
              fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '0.75rem',
            }}>
              Langkah 1: Pilih Pakej Pengisian
            </span>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.45rem', fontWeight: 900, color: '#FEF3C7' }}>
              Borang Tempahan Pengisian Jarak Jauh
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#A7F3D0' }}>
              Diisi selama 3 hari berturut-turut · Pelarasan mingguan percuma selamanya
            </p>
          </div>

          {/* ── 3 Volume Packages Grid ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
            {PACKAGES.map((p, idx) => {
              const isSelected = selectedPkg === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPkg(idx)}
                  style={{
                    border: isSelected ? '2px solid #FDE047' : '1.5px solid rgba(74,222,128,0.25)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(253,224,71,0.12), rgba(6,95,70,0.4))' : 'rgba(2,24,18,0.6)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 25px rgba(253,224,71,0.15)' : 'none',
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position: 'absolute', top: '-10px', right: '16px',
                      background: 'linear-gradient(90deg, #FDE047, #EAB308)',
                      color: '#042E23', fontSize: '0.68rem', fontWeight: 900,
                      padding: '0.2rem 0.65rem', borderRadius: '999px',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      {p.badge}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedPkg(idx)}
                        style={{ accentColor: '#FDE047', width: '20px', height: '20px', marginTop: '3px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', marginBottom: '0.25rem' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#A7F3D0', lineHeight: 1.4 }}>
                          {p.sublabel}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>
                        RM{p.price}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#F87171', textDecoration: 'line-through', marginTop: '0.2rem' }}>
                        RM{p.originalPrice}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Form Inputs ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

            <div style={{ borderTop: '1px dashed rgba(74,222,128,0.3)', paddingTop: '1.5rem' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem',
              }}>
                Langkah 2: Maklumat Pelanggan &amp; Item
              </span>
            </div>

            {/* Nama Penuh */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#FEF3C7', marginBottom: '0.4rem' }}>
                Nama Penuh Anda <span style={{ color: '#F87171' }}>*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Cth: Ahmad bin Sulaiman"
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                  background: '#021812', border: '1.5px solid rgba(74,222,128,0.35)',
                  color: '#FFFFFF', fontSize: '0.94rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Nombor WhatsApp */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#FEF3C7', marginBottom: '0.4rem' }}>
                Nombor WhatsApp <span style={{ color: '#F87171' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="dialCode"
                  value={formData.dialCode}
                  onChange={handleChange}
                  style={{
                    padding: '0.85rem 0.6rem', borderRadius: '10px',
                    background: '#021812', border: '1.5px solid rgba(74,222,128,0.35)',
                    color: '#FFFFFF', fontSize: '0.94rem', outline: 'none', cursor: 'pointer',
                  }}
                >
                  {DIAL_CODES.map(d => (
                    <option key={d.code} value={d.code} style={{ background: '#021812', color: '#fff' }}>
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
                    flex: 1, padding: '0.85rem 1rem', borderRadius: '10px',
                    background: '#021812', border: '1.5px solid rgba(74,222,128,0.35)',
                    color: '#FFFFFF', fontSize: '0.94rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.74rem', color: '#6EE7B7' }}>
                Perawat akan menghubungi nombor ini dalam masa 24 jam untuk pengesahan pengisian.
              </p>
            </div>

            {/* Jenis / Nama Barang Yang Ingin Diisi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#FEF3C7', marginBottom: '0.4rem' }}>
                Jenis &amp; Nama Barang Yang Ingin Diisikan <span style={{ color: '#F87171' }}>*</span>
              </label>
              <textarea
                name="item_description"
                value={formData.item_description}
                onChange={handleChange}
                placeholder="Cth: Cincin perak suami, tasbih kayu isteri, atau jam tangan anak"
                rows={3}
                required
                style={{
                  width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                  background: '#021812', border: '1.5px solid rgba(74,222,128,0.35)',
                  color: '#FFFFFF', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
                  fontFamily: ff, lineHeight: 1.5,
                }}
              />
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.74rem', color: '#6EE7B7' }}>
                Nyatakan mengikut bilangan item dalam pakej yang anda pilih di atas (1, 2 atau 3 barang).
              </p>
            </div>

            {/* ── Dual Bump Offers (Add-ons) ── */}
            <div style={{ borderTop: '1px dashed rgba(74,222,128,0.3)', paddingTop: '1.5rem' }}>
              <div style={{
                background: 'rgba(253,224,71,0.08)',
                border: '1.5px solid rgba(253,224,71,0.3)',
                borderRadius: '16px',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontSize: '0.88rem', fontWeight: 800, color: '#FDE047',
                  marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <span>⚡</span> Nak Benteng Fizikal Tambahan Di Rumah? (Pilihan Tambahan)
                </div>

                {/* Add-on 1: Kasturi Kijang RM20 */}
                <label
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '0.75rem', padding: '0.85rem 1rem',
                    background: addKasturi ? 'rgba(253,224,71,0.15)' : 'rgba(2,24,18,0.6)',
                    border: addKasturi ? '1.5px solid #FDE047' : '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '12px', cursor: 'pointer', marginBottom: '0.75rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={addKasturi}
                      onChange={e => setAddKasturi(e.target.checked)}
                      style={{ accentColor: '#FDE047', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FEF3C7' }}>
                        + Minyak Kasturi Kijang Ruqyah Asli (Pati)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#A7F3D0' }}>
                        Bauan sunnah yang dibenci jin, benteng lebam &amp; ditindih malam
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FDE047', flexShrink: 0 }}>
                    +RM20
                  </span>
                </label>

                {/* Add-on 2: Sabun Garam RM25 */}
                <label
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '0.75rem', padding: '0.85rem 1rem',
                    background: addSabun ? 'rgba(253,224,71,0.15)' : 'rgba(2,24,18,0.6)',
                    border: addSabun ? '1.5px solid #FDE047' : '1px solid rgba(74,222,128,0.2)',
                    borderRadius: '12px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={addSabun}
                      onChange={e => setAddSabun(e.target.checked)}
                      style={{ accentColor: '#FDE047', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FEF3C7' }}>
                        + Sabun Bidara Garam Bukit Pengisian (200g)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#A7F3D0' }}>
                        Mandian buang angin bisa saka &amp; sihir pada liang roma
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FDE047', flexShrink: 0 }}>
                    +RM25
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1.5px solid #EF4444',
                color: '#FCA5A5', padding: '0.85rem 1rem', borderRadius: '10px',
                fontSize: '0.85rem', textAlign: 'center', fontWeight: 600,
              }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {/* ── Ringkasan & Submit ── */}
            <div style={{
              background: '#021812',
              border: '1.5px solid rgba(253,224,71,0.3)',
              borderRadius: '16px', padding: '1.25rem 1.4rem', marginTop: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A7F3D0' }}>
                <span>{pkg.label}:</span>
                <span style={{ fontWeight: 700, color: '#FEF3C7' }}>RM{pkg.price}</span>
              </div>
              {addKasturi && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#A7F3D0' }}>
                  <span>+ Kasturi Kijang Ruqyah:</span>
                  <span style={{ fontWeight: 700, color: '#FDE047' }}>+RM{KASTURI_PRICE}</span>
                </div>
              )}
              {addSabun && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#A7F3D0' }}>
                  <span>+ Sabun Bidara Garam:</span>
                  <span style={{ fontWeight: 700, color: '#FDE047' }}>+RM{SABUN_PRICE}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid rgba(74,222,128,0.2)', paddingTop: '0.75rem', marginTop: '0.5rem',
              }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Jumlah Bayaran:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FDE047' }}>RM{grandTotal}</span>
              </div>
            </div>

            {/* Submit FPX Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1.2rem',
                borderRadius: '50px', border: '2px solid #FEF08A',
                background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
                color: '#042E23', fontSize: '1.15rem', fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '-0.01em',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? '⏳ Memproses Bayaran FPX...' : `💳 Bayar RM${grandTotal} Melalui FPX Online Banking`}
            </button>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.78rem', color: '#6EE7B7' }}>
              🔒 Transaksi Selamat 256-bit SSL via Chip In (Maybank, CIMB, Bank Islam, RHB, BSN &amp; semua bank utama)
            </p>

            {/* WhatsApp Alternative */}
            <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid rgba(74,222,128,0.2)', paddingTop: '1.25rem' }}>
              <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', color: '#A7F3D0' }}>
                Ada kesulitan membuat bayaran online banking?
              </p>
              <a
                href={`https://wa.me/601118939984?text=Assalamualaikum%20ustaz,%20saya%20nak%20buat%20pengisian%20item%20(${encodeURIComponent(pkg.label)})`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#4ADE80', fontSize: '0.86rem', fontWeight: 700,
                  textDecoration: 'none', borderBottom: '1px dashed #4ADE80',
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
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#A7F3D0' }}>Memuatkan borang tempahan...</div>}>
      <PengisianCheckoutFormInner source={source} />
    </Suspense>
  );
}
