'use client';

// Sabun 100% garam Himalaya (tiada campuran) — TIDAK berbuih. Cara guna: rendam & larutkan dalam baldi, kemudian mandi.
const STEPS = [
  {
    num: '01',
    icon: '🪣',
    title: 'Rendam Sabun Dalam Baldi',
    desc: 'Letak sabun garam dalam baldi, kemudian isi air ke dalam baldi tersebut.',
  },
  {
    num: '02',
    icon: '🥄',
    title: 'Kacau Sehingga Garam Larut',
    desc: 'Kacau air perlahan-lahan supaya garam dari sabun larut ke dalam air. Bila dah larut, keluarkan sabun dari baldi.',
  },
  {
    num: '03',
    icon: '🚿',
    title: 'Mandi Sambil Berdoa Dalam Hati',
    desc: 'Mandi menggunakan air garam dalam baldi tersebut. Semasa mandi, niat dan berdoa dalam hati:',
  },
];

const DOA = [
  {
    for: 'Untuk gangguan',
    name: 'Ya Jabbar',
    arabic: 'يَا جَبَّارُ',
    text: 'musnahkan segala gangguan jin & bisa-bisa badan dalam tubuhku.',
  },
  {
    for: 'Untuk kesembuhan',
    name: 'Ya Syafi',
    arabic: 'يَا شَافِي',
    text: 'sembuhkanlah penyakitku… (sebut penyakit yang dihidapi).',
  },
];

export default function SabunHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            ✅ Cara Guna
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
          }}>
            3 Langkah Mudah — Rendam, Larutkan &amp; Mandi
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
          }}>
            Sabun ini <strong style={{ color: '#047857' }}>100% garam Himalaya tanpa sebarang campuran</strong> — sebab itu ia
            tidak berbuih. Cara gunanya sedikit berbeza daripada sabun biasa:
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.4rem 1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}>
              {/* Number pill */}
              <div style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A' }}>{step.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  {step.desc}
                </p>

                {/* Doa — langkah 3 */}
                {i === STEPS.length - 1 && (
                  <div style={{ display: 'grid', gap: '0.65rem', marginTop: '0.85rem' }}>
                    {DOA.map(d => (
                      <div key={d.name} style={{
                        background: '#FFFFFF',
                        border: '1px solid #A7F3D0',
                        borderLeft: '4px solid #10B981',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                          {d.for}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span dir="rtl" lang="ar" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#065F46', lineHeight: 1.4 }}>
                            {d.arabic}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>“{d.name},</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                          {d.text}”
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Nota */}
        <div style={{
          marginTop: '2rem',
          padding: '1.2rem 1.5rem',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400E', lineHeight: 1.65 }}>
            💡 <strong style={{ color: '#B45309' }}>Tiada buih?</strong> Itu normal — sabun ini garam Himalaya asli tanpa bahan pembuih.
            Yang penting, garam larut ke dalam air mandian anda.
          </p>
        </div>

      </div>
    </section>
  );
}
