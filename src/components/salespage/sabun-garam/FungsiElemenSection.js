'use client';

const ELEMENTS = [
  {
    name: 'Garam Himalaya Asli',
    icon: '🧂',
    badge: 'Mineral Semulajadi',
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
    badge: 'Tenaga Al-Quran',
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
      background: '#FFFFFF',
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
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🔬 Kenapa Ia Berkesan?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            2 Elemen Utama Yang Menjadikan Sabun Ini Berbeza
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#64748B',
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
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '1.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  {el.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>{el.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>{el.badge}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: '#E2E8F0', margin: '1rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {el.points.map((p, j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                    <span style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* How it works flow */}
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '18px',
          padding: '2rem 1.75rem',
        }}>
          <p style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#047857',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}>
            ⚡ Bagaimana Ia Bertindak Semasa Mandi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  flexShrink: 0,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1.5px solid #10B981',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
                }}>
                  {h.step}
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.55 }}>
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
