'use client';

import { useState, useEffect } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const FALLBACK_NUMBER = '601135172611';
const WA_MESSAGE = encodeURIComponent('Assalamualaikum, saya ingin dapatkan Diagnos Percuma. Boleh bantu saya?');
const buildWaLink = (num) => `https://wa.me/${num}?text=${WA_MESSAGE}`;
const LS_KEY = 'esyifaa_sp_wa_idx'; // key berbeza dari /wa page

// ─── Hook: fetch & rotate WA numbers ─────────────────────────────────────────
function useWaLink() {
  const [waLink, setWaLink] = useState(buildWaLink(FALLBACK_NUMBER));

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/public/wasap');
        const json = await res.json();
        const numbers = (json.success && json.data?.length > 0)
          ? json.data.map(d => d.number)
          : [FALLBACK_NUMBER];

        const lastIdx = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
        const nextIdx = (lastIdx + 1) % numbers.length;
        localStorage.setItem(LS_KEY, String(nextIdx));
        setWaLink(buildWaLink(numbers[nextIdx]));
      } catch {
        setWaLink(buildWaLink(FALLBACK_NUMBER));
      }
    };
    init();
  }, []);

  return waLink;
}

// ─── Fire Lead pixel ──────────────────────────────────────────────────────────
function fireLead() {
  try { window.fbq('track', 'Lead'); } catch (_) {}
}

// ─── Sticky Bar ───────────────────────────────────────────────────────────────
function StickyBar({ waLink }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #042E23 0%, #064E3B 100%)',
      borderTop: '2px solid rgba(52,211,153,0.4)',
      padding: '0.85rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 -6px 30px rgba(0,0,0,0.45)',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={fireLead}
        id="cta-sticky-sp"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.6rem', width: '100%', maxWidth: '400px',
          padding: '0.85rem 1.5rem', fontSize: '0.95rem', fontWeight: 800,
          color: '#FFFFFF',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: '50px', textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(37,211,102,0.45)',
          letterSpacing: '0.01em',
        }}
      >
        🟢 Hubungi Perawat — Diagnos PERCUMA
      </a>
    </div>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────
const BADGES = [
  { icon: '✅', text: 'Diagnos 100% Percuma' },
  { icon: '🤝', text: 'Tiada Paksaan' },
  { icon: '🔒', text: 'Maklumat Sulit & Selamat' },
  { icon: '⚡', text: 'Respon Dalam 30 Min' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ApplicationForm({ source }) {
  const waLink = useWaLink();
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <>
      {/* WA Contact Section */}
      <section
        id="borang"
        style={{
          background: 'linear-gradient(180deg, #042E23 0%, #0B382D 100%)',
          color: '#FFFFFF',
          padding: '4rem 1rem',
          fontFamily: ff,
        }}
      >
        {/* Invisible anchor alias for legacy scroll targets */}
        <span id="apply-form" style={{ display: 'block', marginTop: '-80px', paddingTop: '80px' }} />

        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>

          {/* Label */}
          <span style={{
            fontSize: '0.75rem', fontWeight: 800, color: '#FDE047',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            LANGKAH PERTAMA
          </span>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FEF3C7',
            marginTop: '0.5rem', marginBottom: '0.6rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Hubungi Perawat ESyifaa Sekarang
          </h2>

          <p style={{
            color: '#A7F3D0', fontSize: '1rem',
            lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 1.75rem',
          }}>
            Perawat kami akan{' '}
            <strong style={{ color: '#FDE047' }}>diagnos dahulu secara percuma</strong>.
            Anda boleh tentukan sendiri sama ada nak teruskan rawatan atau tidak.
            Tiada paksaan. Tiada tekanan.
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            flexWrap: 'wrap', gap: '0.55rem', marginBottom: '2.25rem',
          }}>
            {BADGES.map((b, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(253,224,71,0.1)',
                border: '1px solid rgba(253,224,71,0.3)',
                color: '#FEF3C7', fontSize: '0.78rem', fontWeight: 700,
                padding: '0.3rem 0.75rem', borderRadius: '999px',
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>

          {/* WA Button Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '2px solid rgba(52,211,153,0.3)',
            borderRadius: '20px', padding: '2.5rem 2rem',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}>
            {/* WA icon pulse */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(37,211,102,0.15)',
                border: '2px solid rgba(37,211,102,0.35)',
                fontSize: '2rem',
              }}>
                💬
              </span>
            </div>

            <p style={{
              fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.6,
              margin: '0 0 1.75rem',
            }}>
              Tekan butang di bawah untuk berhubung terus dengan perawat ESyifaa
              melalui WhatsApp. <strong style={{ color: '#FEF3C7' }}>Percuma. Tiada obligasi.</strong>
            </p>

            {/* Main WA CTA */}
            <a
              id="cta-borang-wa"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={fireLead}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.65rem', width: '100%', maxWidth: '420px',
                padding: '1.15rem 1.5rem',
                fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                borderRadius: '50px', textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(37,211,102,0.45)',
                border: '2px solid rgba(37,211,102,0.5)',
                letterSpacing: '0.01em',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(37,211,102,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.45)';
              }}
            >
              🟢 Hubungi Perawat Via WhatsApp
            </a>

            <p style={{
              marginTop: '1rem', fontSize: '0.8rem',
              color: '#6EE7B7', fontStyle: 'italic',
            }}>
              Diagnos Percuma · Tanpa Obligasi · Tiada Bayaran
            </p>

            {/* Divider */}
            <div style={{
              margin: '1.5rem auto', width: '80px',
              borderTop: '1px solid rgba(167,243,208,0.2)',
            }} />

            {/* Secondary trust info */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem', maxWidth: '380px', margin: '0 auto',
            }}>
              {[
                { icon: '🌍', text: 'Malaysia · Brunei · Singapura · Indonesia' },
                { icon: '🕌', text: '100% Patuh Syariah — Al-Quran & Doa Sahih' },
                { icon: '🩺', text: 'Diagnos dahulu, anda buat keputusan sendiri' },
                { icon: '📞', text: 'Perawat akan balas dalam masa 30 minit' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.15)',
                  borderRadius: '10px', padding: '0.7rem 0.85rem',
                  fontSize: '0.75rem', color: '#A7F3D0', lineHeight: 1.5,
                  display: 'flex', flexDirection: 'column', gap: '0.3rem',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Sticky WA Bar — muncul selepas scroll 400px */}
      <StickyBar waLink={waLink} />
    </>
  );
}
