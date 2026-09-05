'use client';

import { useState, useEffect } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const WA_NUMBER = '601118939984';
const WA_MESSAGE = encodeURIComponent('Saya nak buat pengisian item RM90');
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function PengisianWACtaSection() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const firePixel = () => {
    try { window.fbq('track', 'Lead'); } catch (_) {}
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <>
      <section
        id="borang"
        style={{
          background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
          padding: '4rem 1rem',
          fontFamily: ff,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.4)',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.75rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            💎 Tempah Pengisian E-Syifa&apos;
          </div>

          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            fontWeight: 800, color: '#FEF3C7',
            marginTop: '0.4rem', marginBottom: '0.6rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Tempah Melalui WhatsApp
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#A7F3D0', lineHeight: 1.65, marginBottom: '2rem' }}>
            Hubungi perawat ESyifaa terus melalui WhatsApp. Kami akan bantu anda dari mula sehingga selesai.
          </p>

          {/* Main WA CTA card */}
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
            border: '2px solid #FDE047', borderRadius: '20px',
            padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            marginBottom: '1.5rem',
          }}>
            {/* Price reminder */}
            <div style={{
              background: 'rgba(253,224,71,0.1)',
              border: '1px solid rgba(253,224,71,0.3)',
              borderRadius: '12px', padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>RM90</div>
              <div style={{ fontSize: '0.82rem', color: '#A7F3D0', marginTop: '0.3rem' }}>
                Sekali bayar · Pelarasan mingguan percuma selamanya
              </div>
            </div>

            {/* Steps */}
            <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
              {[
                'Klik butang WhatsApp di bawah',
                'Beritahu item yang ingin dibuat pengisian',
                'Perawat akan beri arahan pembayaran & proses pengisian',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: i < 2 ? '0.75rem' : 0 }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: '#FDE047', color: '#042E23',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 900, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '0.88rem', color: '#D1FAE5', lineHeight: 1.55 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* WA Button */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={firePixel}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', width: '100%', padding: '1.15rem',
                fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                borderRadius: '50px', textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(37,211,102,0.5)',
                border: '2px solid rgba(255,255,255,0.25)',
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              🟢 Hubungi Perawat Via WhatsApp
            </a>

            <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.78rem', color: '#6EE7B7' }}>
              Balas dalam masa 30 minit · Isnin hingga Ahad
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
            {['✅ 100% Patuh Syariah', '🌍 Rawatan Jarak Jauh', '🔄 Pelarasan Mingguan Percuma', '🛡️ Jaminan Refund'].map((t, i) => (
              <span key={i} style={{
                background: 'rgba(167,243,208,0.08)', border: '1px solid rgba(167,243,208,0.2)',
                color: '#A7F3D0', fontSize: '0.78rem', fontWeight: 600,
                padding: '0.3rem 0.85rem', borderRadius: '999px',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky WA button */}
      {showSticky && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(2,24,18,0.97)',
          borderTop: '2px solid rgba(37,211,102,0.4)',
          padding: '0.85rem 1rem',
          display: 'flex', justifyContent: 'center',
          zIndex: 1000,
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
          fontFamily: ff,
        }}>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={firePixel}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.6rem', width: '100%', maxWidth: '420px',
              padding: '0.9rem 1.5rem', fontSize: '0.95rem', fontWeight: 800,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
            }}
          >
            🟢 Tempah Pengisian RM90 Via WhatsApp
          </a>
        </div>
      )}
    </>
  );
}
