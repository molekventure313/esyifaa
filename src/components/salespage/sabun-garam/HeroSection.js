'use client';

const DEFAULT_HEADLINE = (
  <>
    Usir Saka, Sihir & Santau —{' '}
    <span style={{ color: '#34D399' }}>
      Sembuh Sakit Urat, Sakit Badan & Penyakit Misteri
    </span>{' '}
    Dengan Sabun Pengisian Ruqyah
  </>
);

const DEFAULT_SUB = 'Sabun garam himalaya 200g diisikan tenaga ayat ruqyah syar\'iyyah selama 3 hari berturut-turut — mandi seperti biasa, rasai kesan perlindungan & rawatan pada badan anda, in shaa Allah.';

export default function SabunHeroSection({ headline = DEFAULT_HEADLINE, subheadline = DEFAULT_SUB }) {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #061510 0%, #081C15 100%)',
      color: '#FFFFFF',
      padding: '4rem 1.25rem 4.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Minimalist Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '0.35rem 0.95rem',
          borderRadius: '9999px',
          marginBottom: '1.75rem',
        }}>
          <span style={{ fontSize: '0.85rem' }}>🧼</span>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#FBBF24',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Sabun Garam Himalaya 200g · Pengisian Ruqyah Syar&apos;iyyah
          </span>
        </div>

        {/* H1 Headline */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4.2vw, 2.75rem)',
          fontWeight: 800,
          lineHeight: 1.28,
          color: '#F8FAFC',
          marginBottom: '1.25rem',
          letterSpacing: '-0.025em',
        }}>
          {headline}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.02rem',
          lineHeight: 1.75,
          color: '#94A3B8',
          marginBottom: '2rem',
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          fontWeight: 400,
        }}>
          {subheadline}
        </p>

        {/* Trust badges — Clean & Subtle */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          {[
            '📖 Berasaskan Al-Quran & Sunnah',
            '🧂 Garam Himalaya 200g',
            '🔄 Diisi 3 Hari Berturut-Turut',
            '🚚 COD & FPX Tersedia',
          ].map((b, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#CBD5E1',
              fontSize: '0.76rem',
              fontWeight: 500,
              padding: '0.32rem 0.85rem',
              borderRadius: '9999px',
            }}>{b}</span>
          ))}
        </div>

        {/* CTA Button — Clean Minimalist */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1rem 2.4rem',
              fontSize: '1.02rem',
              fontWeight: 700,
              color: '#061811',
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.25)',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            🧼 Dapatkan Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
            Dari <span style={{ color: '#FBBF24', fontWeight: 600 }}>RM39</span> seunit · Postage RM5 · Bayar Masa Terima (COD) atau FPX
          </p>
        </div>

      </div>
    </section>
  );
}
