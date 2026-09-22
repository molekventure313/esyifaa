'use client';

export default function GaramHeroSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBEB 45%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '4rem 1.25rem 3.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* 1. H1 HEADLINE (Paling Atas Mengikut Formula FSP PRO) */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4.2vw, 2.85rem)',
          fontWeight: 900,
          lineHeight: 1.3,
          color: '#0F172A',
          marginBottom: '1.25rem',
          letterSpacing: '-0.025em',
        }}>
          &ldquo;Alhamdulillah suami yang dulu baran, dingin &amp; benci tengok muka saya..{' '}
          <span style={{
            color: '#EA580C',
            background: 'linear-gradient(120deg, rgba(254,215,170,0.4) 0%, rgba(254,215,170,0.8) 100%)',
            padding: '0 6px',
            borderRadius: '6px'
          }}>
            kembali lembut hati, mesra &amp; suka makan di rumah
          </span>{' '}
          lepas amalkan Garam Pengasihan Masakan ESyifaa&rdquo;
        </h1>

        {/* 2. H4 DESCRIPTION */}
        <h4 style={{
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          lineHeight: 1.75,
          color: '#475569',
          marginBottom: '1.5rem',
          maxWidth: '740px',
          margin: '0 auto 1.5rem auto',
          fontWeight: 500,
        }}>
          Ikhtiar senyap &amp; penuh rahmah dari dapur — tanpa perlu paksa pasangan berubat. Cukup secubit dalam lauk, sup atau minuman harian. Tenaga ruqyah pemusnah sihir &amp; ayat pengasihan meresap ke dalam darah daging untuk merungkai sihir pemisah serta mengikat kembali jiwa sekeluarga dengan izin Allah 👇🏻
        </h4>

        {/* 3. RATING STAR BADGE (Tepat Di Bawah H4) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          background: '#FFFFFF',
          border: '1px solid #FED7AA',
          padding: '0.45rem 1.25rem',
          borderRadius: '9999px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
        }}>
          <span style={{ color: '#D97706', fontSize: '1rem', letterSpacing: '2px' }}>⭐⭐⭐⭐⭐</span>
          <span style={{ color: '#334155', fontSize: '0.86rem', fontWeight: 700 }}>
            Dinilai <strong style={{ color: '#0F172A' }}>4.9/5</strong> oleh lebih 1,240+ pasangan &amp; keluarga
          </span>
        </div>

        {/* 4. MEDIA VISUAL (Highlight Product Box) */}
        <div style={{
          margin: '0 auto 2rem',
          maxWidth: '520px',
          width: '100%',
          position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
            borderRadius: '24px',
            padding: '1.5rem',
            border: '2px dashed #FB923C',
            boxShadow: '0 20px 40px rgba(234, 88, 12, 0.12)',
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>🧂✨🍲</span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#9A3412' }}>
                GARAM PENGASIHAN MASAKAN ESYIFAA (100g)
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, maxWidth: '400px' }}>
                Garam Bukit Himalaya Tulen digabungkan dengan <strong>Pengisian Ayat Ruqyah Pemusnah Sihir Tafriq</strong> &amp; <strong>Ayat Mahabbah Pelunak Hati</strong> selama 3 hari oleh Perawat ESyifaa.
              </p>
              <div style={{
                display: 'inline-flex',
                gap: '0.4rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '0.25rem'
              }}>
                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px' }}>
                  100% Halal &amp; Patuh Syariah
                </span>
                <span style={{ background: '#FFEDD5', color: '#C2410C', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px' }}>
                  Tiada Unsur Syirik / Tangkal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          {[
            '📖 100% Ayat Ruqyah Al-Quran & Doa Sahih',
            '🍲 Campur Dalam Lauk Pauk & Minuman Harian',
            '🕊️ Ikhtiar Senyap Tanpa Bertengkar',
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

        {/* 5. BUTTON CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.2rem 3rem',
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #EA580C 0%, #C2410C 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(234, 88, 12, 0.35)',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 35px rgba(234, 88, 12, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(234, 88, 12, 0.35)';
            }}
          >
            👉🏻 BELI SEKARANG — PULIHKAN RUMAHTANGGA KITA
          </button>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
            Pakej Serendah <strong style={{ color: '#C2410C' }}>RM39</strong> (Beli 1 Free 1) · Bayar Tunai Masa Posmen Hantar (COD)
          </p>
        </div>

      </div>
    </section>
  );
}
