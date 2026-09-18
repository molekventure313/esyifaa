'use client';

import Image from 'next/image';

export default function KasturiHeroSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 45%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '4rem 1.25rem 3.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #A7F3D0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#FFFFFF',
          border: '1px solid #6EE7B7',
          padding: '0.45rem 1.15rem',
          borderRadius: '9999px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
        }}>
          <span style={{ fontSize: '1rem' }}>🦌🌿</span>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#065F46',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Pati Kasturi Kijang Asli · Diisi 4 Lapisan Ayat Ruqyah Pendinding Syar&apos;iyyah
          </span>
        </div>

        {/* Rating Star Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#D97706',
          fontWeight: 700,
        }}>
          <span>⭐⭐⭐⭐⭐</span>
          <span style={{ color: '#475569', fontSize: '0.84rem' }}>
            Dinilai <strong>4.9/5</strong> oleh lebih 3,450+ pengguna di Malaysia &amp; Singapura
          </span>
        </div>

        {/* H1 Headline (FSP PRO Formula: Testimoni Hasil + 3 Masalah Selesai) */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 900,
          lineHeight: 1.3,
          color: '#0F172A',
          marginBottom: '1.25rem',
          letterSpacing: '-0.025em',
        }}>
          &ldquo;Alhamdulillah badan rasa ringan, mimpi ngeri hilang &amp;{' '}
          <span style={{
            color: '#047857',
            background: 'linear-gradient(120deg, rgba(167,243,208,0.4) 0%, rgba(167,243,208,0.8) 100%)',
            padding: '0 6px',
            borderRadius: '6px'
          }}>
            tiada lagi rasa takut &amp; diperhatikan
          </span>{' '}
          lepas amalkan Minyak Kasturi Kijang E-Syifa&rsquo;&rdquo;
        </h1>

        {/* Subheadline (Pengalaman yang prospek akan lalui) */}
        <p style={{
          fontSize: '1.05rem',
          lineHeight: 1.75,
          color: '#475569',
          marginBottom: '2rem',
          maxWidth: '720px',
          margin: '0 auto 2rem auto',
          fontWeight: 400,
        }}>
          Wangian sunnah kegemaran baginda Nabi ﷺ yang amat ditakuti oleh jin, syaitan dan tukang sihir. Cukup sekadar sapuan halus pada titik nadi dan tengkuk — bertindak sebagai <strong>benteng pendinding aktif 24 jam</strong> serta aromaterapi penenang jiwa yang resah.
        </p>

        {/* Highlight Image Box */}
        <div style={{
          margin: '1.5rem auto 2.25rem',
          maxWidth: '460px',
          width: '100%',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            borderRadius: '24px',
            padding: '1.25rem',
            border: '2px solid #34D399',
            boxShadow: '0 20px 40px rgba(5, 150, 105, 0.12)',
          }}>
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              background: '#FFFFFF',
            }}>
              <Image
                src="/images/kasturi-kijang-opt.jpg"
                alt="Minyak Kasturi Kijang E-Syifa'"
                width={440}
                height={320}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                priority
              />
            </div>
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.4rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ background: '#FFFFFF', color: '#065F46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '99px', border: '1px solid #A7F3D0' }}>
                100% Bebas Alkohol
              </span>
              <span style={{ background: '#FFFFFF', color: '#065F46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '99px', border: '1px solid #A7F3D0' }}>
                Sah Solat &amp; Mesra Ihram
              </span>
              <span style={{ background: '#FFFFFF', color: '#065F46', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '99px', border: '1px solid #A7F3D0' }}>
                Pati Pekat Tahan Berbulan
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          {[
            '📖 Ruqyah Syar\'iyyah Al-Quran & As-Sunnah',
            '🛡️ Benteng & Pendinding Aktif 24 Jam',
            '🕊️ Melegakan Anxiety & Keresahan Hati',
            '🚚 Boleh Bayar Bila Barang Sampai (COD)',
          ].map((b, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.4rem 0.95rem',
              borderRadius: '9999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>{b}</span>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.15rem 2.8rem',
              fontSize: '1.12rem',
              fontWeight: 800,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(5, 150, 105, 0.35)',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 35px rgba(5, 150, 105, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(5, 150, 105, 0.35)';
            }}
          >
            👉🏻 BELI SEKARANG — LINDUNGI DIRI &amp; KELUARGA
          </button>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
            Pakej Serendah <strong style={{ color: '#047857' }}>RM20</strong> Sebotol · Pakej 5 Botol RM40 (Paling Jimat) · Bayar Tunai Masa Sampai (COD)
          </p>
        </div>

      </div>
    </section>
  );
}
