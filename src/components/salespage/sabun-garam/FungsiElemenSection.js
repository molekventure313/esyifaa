'use client';

const ELEMENTS = [
  {
    name: 'Garam Himalaya Asli',
    icon: '🧂',
    color: '#F59E0B',
    subtitle: 'Asas Penyucian Semulajadi',
    points: [
      'Mengandungi 84+ mineral semulajadi termasuk magnesium, kalsium & zink',
      'Bersifat anti-bakteria semulajadi — membersihkan kulit secara mendalam',
      'Digunakan sejak zaman dahulu untuk amalan penyucian fizikal & rohani',
      'Garam dalam tradisi perubatan Islam dikenali sebagai bahan berkat & penyucian',
    ],
  },
  {
    name: 'Pengisian Ruqyah Syar\'iyyah',
    icon: '📖',
    color: '#10B981',
    subtitle: 'Tenaga Ayat Al-Quran Terpilih',
    points: [
      'Diisikan dengan ayat-ayat ruqyah khusus oleh perawat ESyifaa selama 3 hari',
      'Tenaga rohani tertanam dalam setiap zarah sabun — aktif semasa digunakan',
      'Sama kaedah dengan air penawar ruqyah — terbukti dalam amalan rawatan syarak',
      'Bertindak melemahkan dan mengusir gangguan sihir, saka & santau semasa mandi',
    ],
  },
];

const HOW_IT_WORKS = [
  { step: '01', text: 'Sabun digosok pada tubuh — mineral garam himalaya membersihkan kulit secara fizikal' },
  { step: '02', text: 'Tenaga ayat ruqyah terlepas — bertindak balas terhadap gangguan rohani dalam badan' },
  { step: '03', text: 'Bilas dengan air bersih — membawa keluar sisa bisa dan gangguan yang dilemahkan' },
];

export default function SabunFungsiElemenSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#081C15',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#FBBF24',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🔬 Kenapa Ia Berkesan?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            2 Elemen Utama Yang Menjadikan Sabun Ini Berbeza
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            maxWidth: '580px',
            margin: '0 auto',
          }}>
            Bukan sekadar sabun wangi — ia gabungan khasiat mineral garam himalaya
            dan kekuatan ayat ruqyah syar&apos;iyyah yang bertindak serentak.
          </p>
        </div>

        {/* Elements Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {ELEMENTS.map((el, i) => (
            <div key={i} style={{
              background: '#0D221B',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: `${el.color}15`,
                  border: `1px solid ${el.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  {el.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#F8FAFC' }}>{el.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{el.subtitle}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '1rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {el.points.map((p, j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.55 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How it works flow */}
        <div style={{
          background: '#0D221B',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '2rem 1.75rem',
        }}>
          <p style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#FBBF24',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}>
            ⚡ Bagaimana Ia Bertindak Semasa Mandi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FBBF24',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {h.step}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.55 }}>
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
