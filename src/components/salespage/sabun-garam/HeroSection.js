'use client';

const DEFAULT_HEADLINE = (
  <>
    Usir Saka, Sihir & Santau —{' '}
    <span style={{ color: '#059669' }}>
      Sembuh Sakit Urat, Sakit Badan & Penyakit Misteri
    </span>{' '}
    Dengan Sabun Pengisian Ruqyah
  </>
);

const DEFAULT_SUB = 'Sabun garam himalaya 200g diisikan tenaga ayat ruqyah syar\'iyyah selama 3 hari berturut-turut — mandi seperti biasa, rasai badan lebih ringan, segar & dilindungi dengan izin Allah.';

export default function SabunHeroSection({ headline = DEFAULT_HEADLINE, subheadline = DEFAULT_SUB }) {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 50%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '4.5rem 1.25rem 4rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* Ceria & Segar Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: '#FFFFFF',
          border: '1px solid #A7F3D0',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
        }}>
          <span style={{ fontSize: '0.9rem' }}>🧼</span>
          <span style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#047857',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Sabun Garam Himalaya 200g · Pengisian Ruqyah Syar&apos;iyyah
          </span>
        </div>

        {/* H1 Headline */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 4.2vw, 2.85rem)',
          fontWeight: 800,
          lineHeight: 1.28,
          color: '#0F172A',
          marginBottom: '1.25rem',
          letterSpacing: '-0.025em',
        }}>
          {headline}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.05rem',
          lineHeight: 1.75,
          color: '#475569',
          marginBottom: '2rem',
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          fontWeight: 400,
        }}>
          {subheadline}
        </p>

        {/* Trust badges — Clean & Fresh */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          {[
            '📖 Berasaskan Al-Quran & Sunnah',
            '🧂 Garam Himalaya 200g Asli',
            '🔄 Diisi 3 Hari Berturut-Turut',
            '🚚 COD & FPX Disediakan',
          ].map((b, i) => (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>{b}</span>
          ))}
        </div>

        {/* CTA Button — Segar & Vibrant */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.05rem 2.5rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            🧼 Dapatkan Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
            Dari <strong style={{ color: '#047857' }}>RM39</strong> seunit · Postage RM5 · Bayar Masa Terima (COD) atau FPX
          </p>
        </div>

      </div>
    </section>
  );
}
