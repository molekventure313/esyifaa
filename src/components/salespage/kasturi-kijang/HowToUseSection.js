'use client';

const STEPS = [
  {
    step: '01',
    title: 'Sapu Pada Titik Nadi & Tengkuk',
    desc: 'Titiskan 1–2 titik pada pergelangan tangan, gosok kedua-dua belah nadi dan sapukan ke belakang telinga serta tengkuk.',
    icon: '🤲🏻',
  },
  {
    step: '02',
    title: 'Hidu Aromaterapinya Dalam-Dalam',
    desc: 'Dekatkan tapak tangan ke hidung, tarik nafas perlahan-lahan sambil berniat di dalam hati memohon perlindungan Allah dan berselawat 3x.',
    icon: '👃🏻',
  },
  {
    step: '03',
    title: 'Calit Pada Bantal Sebelum Tidur',
    desc: 'Untuk mengelakkan mimpi ngeri dan kena himpit, calitkan sedikit pada bucu bantal dan selimut sebelum tidur malam.',
    icon: '🛌',
  },
  {
    step: '04',
    title: 'Untuk Bayi & Anak Kecil',
    desc: 'Calitkan nipis pada ubun-ubun kepala dan tapak kaki anak sebelum waktu maghrib dan sebelum tidur malam.',
    icon: '👶🏻',
  },
];

export default function KasturiHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Section Header */}
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
            🧴 Panduan Amalan Harian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Cara Guna Minyak Kasturi Kijang E-Syifa’{' '}
            <span style={{ color: '#047857' }}>Sangat Mudah &amp; Praktikal</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Botol roll-on yang mudah dibawa ke mana sahaja — di tempat kerja, dalam kereta mahupun sebelum solat.
          </p>
        </div>

        {/* Steps Grid (4 Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '20px',
                padding: '1.8rem 1.4rem',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(5, 150, 105, 0.04)',
                position: 'relative',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#047857',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
              }}>
                {s.step}
              </div>

              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '0.75rem' }}>
                {s.icon}
              </span>

              <h4 style={{
                margin: '0 0 0.45rem 0',
                fontSize: '1.02rem',
                fontWeight: 800,
                color: '#0F172A',
              }}>
                {s.title}
              </h4>

              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
