'use client';

const ELEMENTS = [
  {
    name: 'Garam Bukit Himalaya Asli',
    icon: '🧂',
    badge: 'Gred Masakan Tulen',
    points: [
      'Garam gred makanan semulajadi yang kaya dengan 84+ mineral penting',
      'Penyerap gelombang caj negatif dan unsur bisa rohani dalam badan',
      'Media terbaik yang dapat mengikat getaran ayat suci Al-Quran dan doa',
      'Digunakan sejak turun-temurun dalam perubatan thibbun nabawi',
    ],
  },
  {
    name: 'Ayat Pembatal Sihir Pemisah',
    icon: '⚔️',
    badge: 'Pemusnah Sihir Tafriq',
    points: [
      'Dibacakan Surah Yunus (81-82), Surah Al-A\'raf & Taha khusus pemusnah sihir',
      'Mematikan ikatan batin yang dipasang pihak ketiga atau jin penghasut',
      'Membakar bisikan Jin Dasim yang membisikkan syak wasangka dan benci',
      'Dilakukan secara bertahap oleh perawat bertauliah ESyifaa selama 3 hari',
    ],
  },
  {
    name: 'Ayat Mahabbah & Pengikat Jiwa',
    icon: '🕊️',
    badge: 'Pengasihan Syar\'iyyah',
    points: [
      'Ayat cinta dan kasih sayang: Surah Taha ayat 39 & Surah Ali-Imran ayat 31',
      'Doa Nabi Daud A.S — memohon dilembutkan hati pasangan bagaikan besi yang lebur',
      'Menanamkan rasa kasih, mawaddah dan rahmah dalam setiap suapan',
      'Merapatkan kembali hubungan suami, isteri dan anak-anak sekeluarga',
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Hadam & Meresap Ke Salur Darah',
    desc: 'Bila dimakan bersama lauk pauk atau minuman, zarah garam berisian ruqyah dihadam dan mengalir ke seluruh urat dan sel darah pemakannya.',
  },
  {
    step: '02',
    title: 'Merungkai Ikatan Sihir & Bisa Benci',
    desc: 'Tenaga ayat pembatal sihir bertindak balas terhadap racun sihir tafriq yang bersarang di hati dan dada. Perasaan panas hati mula surut.',
  },
  {
    step: '03',
    title: 'Memancarkan Kasih Sayang & Kelembutan',
    desc: 'Doa mahabbah meresap ke dalam jiwa — memulihkan getaran kasih, rasa rindu, hormat dan keharmonian dalam rumahtangga secara beransur-ansur.',
  },
];

export default function GaramFungsiElemenSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFDFB',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

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
            🔬 Rahsia Keberkesanan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            3 Elemen Tunjang Yang Mengubah Hati &amp; Jiwa Pasangan
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Gabungan garam bukit gred makanan, mukjizat ayat pembatal sihir, dan doa pengasihan mahabbah yang bersatu di dalam setiap zarah garam.
          </p>
        </div>

        {/* 3 Elements Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}>
          {ELEMENTS.map((el, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1.5px solid #FED7AA',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.04)',
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
                    background: '#FFF7ED',
                    border: '1px solid #FDBA74',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {el.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{el.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 700 }}>{el.badge}</div>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#FED7AA', margin: '1rem 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {el.points.map((p, j) => (
                    <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#EA580C', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Through Food */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '2px solid #FDBA74',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
        }}>
          <p style={{
            margin: '0 0 1.75rem 0',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#9A3412',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}>
            ⚡ Bagaimana Ia Bekerja Dari Dapur Terus Ke Hati
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
                border: '1px solid #FED7AA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EA580C',
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
