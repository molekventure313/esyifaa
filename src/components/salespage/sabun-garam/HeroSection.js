'use client';

export default function SabunHeroSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '3.5rem 1rem 4rem',
      fontFamily: ff, textAlign: 'center',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.5)',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.5rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🧼 Sabun Garam Himalaya 200g · Pengisian Ruqyah Syar&apos;iyyah
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)',
          fontWeight: 900, lineHeight: 1.2,
          color: '#FDE047', marginBottom: '1.2rem',
          letterSpacing: '-0.02em',
        }}>
          Usir Saka, Sihir & Santau —{' '}
          <span style={{ color: '#4ADE80' }}>
            Sembuh Sakit Urat, Sakit Badan & Penyakit Misteri
          </span>{' '}
          Dengan Sabun Pengisian Ruqyah
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: '1.05rem', lineHeight: 1.75,
          color: '#D1FAE5', marginBottom: '0.75rem',
          maxWidth: '700px', margin: '0 auto 0.75rem auto',
        }}>
          Sabun garam himalaya 200g diisikan tenaga ayat ruqyah syar&apos;iyyah
          selama <strong style={{ color: '#FDE047' }}>3 hari berturut-turut</strong> — mandi seperti biasa,
          rasai kesan perlindungan & rawatan pada badan anda, in shaa Allah.
        </p>

        {/* Trust badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', marginTop: '1rem' }}>
          {[
            '📖 Berasaskan Al-Quran & Sunnah',
            '🧂 Garam Himalaya 200g',
            '🔄 Diisi 3 Hari Berturut-Turut',
            '🚚 COD & FPX Tersedia',
          ].map((b, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              color: '#A7F3D0', fontSize: '0.78rem', fontWeight: 700,
              padding: '0.3rem 0.85rem', borderRadius: '50px',
            }}>{b}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.15rem 2.5rem', fontSize: '1.1rem', fontWeight: 900,
              color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              border: '2px solid #FEF08A', borderRadius: '50px', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(234,179,8,0.45)', fontFamily: ff,
            }}
          >
            🧼 Dapatkan Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6EE7B7' }}>
            Dari <strong style={{ color: '#FDE047' }}>RM39</strong> seunit · Postage RM5 · COD & FPX tersedia
          </p>
        </div>

      </div>
    </section>
  );
}
