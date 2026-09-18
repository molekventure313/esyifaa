'use client';

export default function KasturiSolutionSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#D1FAE5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            💡 Ikhtiar Sunnah &amp; Ruqyah
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.35rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Perkenalkan:{' '}
            <span style={{ color: '#059669' }}>
              Minyak Kasturi Kijang Ruqyah E-Syifa’
            </span>
          </h2>
          <p style={{
            fontSize: '1.02rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '660px',
            margin: '0 auto',
          }}>
            Gabungan kemuliaan wangian kasturi kijang asli bersama pengisian ayat-ayat suci Ruqyah Syar&apos;iyyah untuk perlindungan rohani, ketenangan emosi dan keselesaan fizikal.
          </p>
        </div>

        {/* Big Feature Card */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #6EE7B7',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 36px rgba(5, 150, 105, 0.08)',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>

            {/* Left: Info Visual Box */}
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              border: '1.5px solid #34D399',
            }}>
              <div style={{ fontSize: '3.8rem', lineHeight: 1, marginBottom: '0.75rem' }}>
                🦌✨
              </div>
              <h3 style={{ margin: '0 0 0.4rem 0', fontWeight: 900, fontSize: '1.3rem', color: '#064E3B' }}>
                Perlindungan Aktif 24 Jam
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#047857', lineHeight: 1.6 }}>
                Bauan kasturi yang kekal pada tubuh bertindak memancarkan getaran positif yang amat dibenci oleh makhluk halus dan menghalang lintasan sihir.
              </p>
            </div>

            {/* Right: 3 Key Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                {
                  title: '1. Membakar & Mengusir Makhluk Halus',
                  desc: 'Aroma pati kasturi kijang yang telah diruqyah memancarkan hawa panas kepada jin yang cuba mendekati tubuh anda.',
                  icon: '🔥',
                },
                {
                  title: '2. Melegakan Keresahan Jiwa & Anxiety',
                  desc: 'Aromaterapi semulajadi yang merehatkan saraf otak, menstabilkan degupan jantung dan memberikan rasa aman.',
                  icon: '🕊️',
                },
                {
                  title: '3. Menghilangkan Lenguh Sendi & Angin Sesat',
                  desc: 'Boleh disapu pada tempat yang sakit seperti tengkuk, pinggang, lutut dan dada untuk melegakan sengal-sengal badan.',
                  icon: '🌿',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '1.3rem',
                    flexShrink: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.icon}
                  </span>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.55 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* CTA Mini Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1rem 2.4rem',
              fontSize: '1.02rem',
              fontWeight: 800,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(5, 150, 105, 0.3)',
              fontFamily: ff,
            }}
          >
            👉🏻 Dapatkan Minyak Kasturi Kijang E-Syifa&rsquo; Sekarang
          </button>
        </div>

      </div>
    </section>
  );
}
