'use client';

const ELEMENTS = [
  {
    name: 'Garam Himalaya',
    icon: '🧂',
    color: '#F59E0B',
    subtitle: 'Asas Penyucian Semulajadi',
    points: [
      'Mengandungi 84+ mineral semulajadi termasuk magnesium, kalsium & zink',
      'Bersifat anti-bakteria semulajadi — bersihkan kulit secara mendalam',
      'Digunakan sejak zaman dahulu untuk penyucian fizikal & rohani',
      'Garam dalam Al-Quran & sunnah dikenali sebagai bahan berkat & penyucian',
    ],
  },
  {
    name: 'Pengisian Ruqyah Syar\'iyyah',
    icon: '📖',
    color: '#10B981',
    subtitle: 'Kuasa Ayat Al-Quran Dalam Sabun',
    points: [
      'Diisikan dengan ayat-ayat ruqyah pilihan oleh perawat ESyifaa selama 3 hari',
      'Tenaga rohani tertanam dalam setiap zarah sabun — aktif semasa digunakan',
      'Sama kaedah dengan air ruqyah — terbukti dalam amalan ulama & perawat',
      'Bertindak mengusir & melemahkan gangguan sihir, saka & santau semasa mandi',
    ],
  },
];

const HOW_IT_WORKS = [
  { step: '01', text: 'Sabun digosok → mineral garam himalaya bersihkan kulit secara fizikal', color: '#F59E0B' },
  { step: '02', text: 'Tenaga ruqyah terlepas → bertindak pada gangguan rohani dalam badan', color: '#10B981' },
  { step: '03', text: 'Air membilas → membawa keluar gangguan yang telah dilemahkan, in shaa Allah', color: '#3B82F6' },
];

export default function SabunFungsiElemenSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background: 'linear-gradient(180deg, #042E23 0%, #031E17 100%)', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(253,224,71,0.1)',
            border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            🔬 Kenapa Ia Berkesan?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            2 Elemen Utama Yang Menjadikan Sabun Ini Berbeza
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto' }}>
            Bukan sekadar sabun biasa — ia gabungan penyucian fizikal garam himalaya
            dan kekuatan rohani ruqyah syar&apos;iyyah yang bertindak serentak.
          </p>
        </div>

        {/* Elements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {ELEMENTS.map((el, i) => (
            <div key={i} style={{
              background: '#021812', border: `2px solid ${el.color}33`,
              borderRadius: '18px', padding: '1.75rem',
            }}>
              {/* Element header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                  background: `${el.color}15`, border: `1.5px solid ${el.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                }}>
                  {el.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', color: el.color }}>{el.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 600 }}>{el.subtitle}</div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: `${el.color}22`, margin: '1rem 0' }} />

              {/* Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {el.points.map((p, j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ color: el.color, fontWeight: 900, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span style={{ fontSize: '0.84rem', color: '#D1FAE5', lineHeight: 1.55 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How it works flow */}
        <div style={{
          background: '#021812', border: '1px solid rgba(253,224,71,0.2)',
          borderRadius: '18px', padding: '2rem',
        }}>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.78rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
            ⚡ Bagaimana Ia Bertindak Semasa Mandi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%',
                  background: h.color, color: '#021812', fontWeight: 900, fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {h.step}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#D1FAE5', lineHeight: 1.55 }}>
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
