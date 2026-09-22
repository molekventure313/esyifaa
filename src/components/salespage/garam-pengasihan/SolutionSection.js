'use client';

export default function GaramSolutionSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFEDD5',
            border: '1px solid #FED7AA',
            color: '#C2410C',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            💡 Solusi Lembut &amp; Berkesan
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
            <span style={{ color: '#EA580C' }}>
              Garam Masakan Pengasihan ESyifaa (100g)
            </span>
          </h2>
          <p style={{
            fontSize: '1.02rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '660px',
            margin: '0 auto',
          }}>
            Ikhtiar paling bijak dan selamat untuk memulihkan rumahtangga tanpa perlu bergaduh, bertegang leher atau memaksa pasangan pergi berubat!
          </p>
        </div>

        {/* Big Feature Showcase Card */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #FDBA74',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 36px rgba(234, 88, 12, 0.08)',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>

            {/* Left: Highlight visual info */}
            <div style={{
              background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              border: '1.5px solid #FB923C',
            }}>
              <div style={{ fontSize: '3.8rem', lineHeight: 1, marginBottom: '0.75rem' }}>
                🍲✨
              </div>
              <h3 style={{ margin: '0 0 0.4rem 0', fontWeight: 900, fontSize: '1.3rem', color: '#9A3412' }}>
                Rahsia &ldquo;Sentuhan Dari Dapur&rdquo;
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#7C2D12', lineHeight: 1.6 }}>
                Makanan yang dimasukkan garam berisian ruqyah akan dihadam dan mengalir menjadi darah daging. Racun sihir yang bersarang di hati akan terhakis secara semulajadi.
              </p>
            </div>

            {/* Right: 3 Key Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                {
                  title: '1. Meruntuhkan Simpulan Sihir Pemisah',
                  desc: 'Menghapuskan rasa benci, panas dada dan meluat bila bertentang mata dengan pasangan.',
                  icon: '🔥',
                },
                {
                  title: '2. Melembutkan Ego & Hati Yang Keras',
                  desc: 'Ayat mahabbah melembutkan getaran jiwa yang ego, baran dan degil sehingga kembali boleh berbincang secara tenang.',
                  icon: '🤍',
                },
                {
                  title: '3. Mengikat Kasih Sayang Seisi Keluarga',
                  desc: 'Bukan sekadar suami isteri — anak-anak juga turut menikmati kesannya, menjadi lebih ceria, taat dan mudah mendengar kata.',
                  icon: '👨‍👩‍👧‍👦',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '1.3rem',
                    flexShrink: 0,
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#FFEDD5',
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

        {/* CTA Mini Banner */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1rem 2.4rem',
              fontSize: '1.02rem',
              fontWeight: 800,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #EA580C 0%, #C2410C 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(234, 88, 12, 0.3)',
              fontFamily: ff,
            }}
          >
            👉🏻 Tempah Garam Pengasihan Masakan Sekarang
          </button>
        </div>

      </div>
    </section>
  );
}
