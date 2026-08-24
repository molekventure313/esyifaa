'use client';

const GUARANTEES = [
  {
    icon: '📦',
    badge: 'JAMINAN 1 — HASIL',
    title: 'Refund Jika Langsung Tiada Perubahan',
    desc: 'Selepas menggunakan item pengisian dalam kehidupan harian, jika anda dapati langsung tiada sebarang perubahan — PM perawat. Kami akan proses refund 100% tanpa banyak soal.',
    steps: ['Guna item 14 hari', 'Tiada langsung perubahan', 'PM perawat → Refund diproses'],
    color: '#22C55E',
  },
  {
    icon: '📖',
    badge: 'JAMINAN 2 — KESUCIAN',
    title: 'Bebas 100% Unsur Jin, Syirik & Khurafat',
    desc: 'Pengisian ESyifaa dijamin menggunakan HANYA ayat-ayat Al-Quran dan Asma\' Allah yang sahih. Tiada jampi serapah. Tiada unsur jin atau syirik dalam apa jua bentuk. Jika terbukti sebaliknya — refund penuh.',
    steps: ['100% Ayat Quran & Asma\' Allah', 'Tiada unsur khurafat', 'Patuh Syariah sepenuhnya'],
    color: '#FDE047',
  },
];

export default function PengisianGuaranteeSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #042E23 0%, #021812 100%)',
      color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

        <span style={{
          fontSize: '0.75rem', fontWeight: 800, color: '#FDE047',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          JAMINAN KAMI
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.5rem',
          letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          2 Jaminan Yang Kami Pegang
        </h2>

        <p style={{
          color: '#A7F3D0', fontSize: '1rem',
          lineHeight: 1.7, marginBottom: '2.5rem',
          maxWidth: '580px', margin: '0 auto 2.5rem',
        }}>
          Kami yakin dengan pengisian yang kami lakukan — kerana ia berlandaskan Al-Quran dan
          keyakinan kepada kekuasaan Allah SWT. Dua jaminan ini kami beri dengan penuh tanggungjawab.
        </p>

        {/* Two guarantee cards */}
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {GUARANTEES.map((g, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, #1E3A2F 0%, #14532D 100%)',
              border: `2px solid ${g.color}`,
              borderRadius: '20px', padding: '2rem 1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              textAlign: 'left', position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px',
                background: `radial-gradient(circle, ${g.color}22 0%, transparent 70%)`,
                borderRadius: '50%', pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>
                {g.icon}
              </div>

              {/* Badge */}
              <div style={{
                display: 'inline-block', marginBottom: '0.85rem',
                background: `${g.color}22`, border: `1px solid ${g.color}66`,
                borderRadius: '999px', padding: '0.3rem 0.9rem',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: g.color, letterSpacing: '0.05em' }}>
                  {g.badge}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7',
                margin: '0 0 0.75rem', lineHeight: 1.3,
              }}>
                {g.title}
              </h3>

              <p style={{
                fontSize: '0.88rem', color: '#D1FAE5',
                lineHeight: 1.75, margin: '0 0 1.25rem',
              }}>
                {g.desc}
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {g.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${g.color}33`,
                    borderRadius: '8px', padding: '0.45rem 0.85rem',
                  }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      background: g.color, color: idx === 0 ? '#042E23' : '#042E23',
                      fontWeight: 800, fontSize: '0.68rem',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '0.82rem', color: '#D1FAE5', fontWeight: 600 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Doa note */}
        <div style={{
          marginTop: '1.75rem',
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(253,224,71,0.2)',
          borderRadius: '12px', padding: '1rem 1.25rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start', textAlign: 'left',
          maxWidth: '660px', margin: '1.75rem auto 0',
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#FEF3C7', lineHeight: 1.7, fontStyle: 'italic' }}>
            Jaminan ini adalah atas dasar kepercayaan dan niat yang ikhlas. Jika ada yang
            cuba menipu atau mengada-adakan alasan —{' '}
            <strong style={{ color: '#FDE047' }}>kami serahkan kepada Allah SWT. Moga Allah membalas seadilnya.</strong>{' '}
            Kami hanya mampu berbaik sangka kepada semua yang hadir dengan niat tulus ingin mendapat perlindungan.
          </p>
        </div>

      </div>
    </section>
  );
}
