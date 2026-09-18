'use client';

const ELEMENTS = [
  {
    name: 'Pati Kasturi Kijang Asli Gred A',
    icon: '🦌',
    badge: 'Wangian Semulajadi',
    points: [
      'Pati tulen bauan kasturi kijang yang pekat dan tahan lama',
      'Bauan yang sangat disukai para malaikat dan dicintai baginda Rasulullah ﷺ',
      'Makhluk halus dan syaitan mempunyai alahan semula jadi yang teruk terhadap aroma kasturi',
      'Bebas alkohol dan bahan kimia sintetik merbahaya — selamat untuk kulit sensitif',
    ],
  },
  {
    name: 'Pengisian 4 Lapisan Ayat Ruqyah Syar\'iyyah',
    icon: '📖',
    badge: 'Benteng & Pendinding Al-Quran',
    points: [
      'Diperdengarkan bacaan Surah Al-Baqarah, Ayat Kursi & 3 Qul secara khusus',
      'Diisikan ayat pembakar jin: Surah As-Saffat, Surah Al-Jin & Surah Ad-Dukhan',
      'Doa-doa syifa dan perlindungan Nabawi daripada sengatan bisa rohani',
      'Pengisian rohaniah selama 3 hari berturut-turut oleh Perawat Bertauliah ESyifaa',
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Disapu Pada Titik Nadi & Tengkuk',
    desc: 'Minyak meresap ke dalam liang roma di titik aliran darah utama. Aromanya yang menenangkan merangsang hormon ketenangan dalam otak.',
  },
  {
    step: '02',
    title: 'Membina Benteng Gelombang Positif',
    desc: 'Getaran ayat-ayat suci Ruqyah Syar\'iyyah yang tertanam di dalam minyak membentuk perisai batin di sekeliling tubuh si pemakai.',
  },
  {
    step: '03',
    title: 'Jin & Entiti Halus Menjauhkan Diri',
    desc: 'Aroma kasturi yang dibenci syaitan menyebabkan mereka merasa sesak dan terbakar, lalu terpaksa menjauhkan diri daripada tubuh anda.',
  },
];

export default function KasturiFungsiElemenSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🔬 Gabungan 2 Elemen Hebat
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Kenapa Minyak Kasturi Kijang E-Syifa’{' '}
            <span style={{ color: '#047857' }}>Jauh Berbeza Daripada Wangian Biasa?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Bukan sekadar minyak wangi tepi jalan. Ia adalah gabungan mukjizat Al-Quran bersama khasiat alam yang dibuktikan berkesan.
          </p>
        </div>

        {/* 2 Elements Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {ELEMENTS.map((el, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1.5px solid #A7F3D0',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    flexShrink: 0,
                    background: '#ECFDF5',
                    border: '1px solid #6EE7B7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {el.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{el.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>{el.badge}</div>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#E2E8F0', margin: '1rem 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {el.points.map((p, j) => (
                    <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Flow */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '2px solid #6EE7B7',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
        }}>
          <p style={{
            margin: '0 0 1.75rem 0',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#065F46',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}>
            ⚡ Bagaimana Ia Bertindak Membenteng Tubuh Anda
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.4rem',
                border: '1px solid #A7F3D0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#047857',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}>
                  {h.step}
                </div>
                <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>
                  {h.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.6 }}>
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
