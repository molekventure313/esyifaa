'use client';

const GOALS = [
  {
    icon: '🍲',
    title: 'Meja Makan Kembali Dihidupkan Gurau Senda',
    desc: 'Waktu makan bersama bukan lagi suasana tegang atau sunyi sepi. Suami isteri dan anak-anak kembali bersembang mesra dan bergelak tawa.',
  },
  {
    icon: '🗣️',
    title: 'Bicara Lembut Penuh Saling Menghormati',
    desc: 'Tiada lagi jeritan, tengkingan atau kata-kata yang melukakan hati. Setiap perbincangan dijalankan dengan sabar dan saling memahami.',
  },
  {
    icon: '💑',
    title: 'Kemesraan Di Bilik Tidur Kembali Hangat',
    desc: 'Hilang terus rasa dingin dan meluat. Nafkah batin dan sentuhan kasih sayang kembali mekar seperti zaman awal perkahwinan.',
  },
  {
    icon: '🏡',
    title: 'Rumah Menjadi Syurga Ketenangan (Baiti Jannati)',
    desc: 'Hawa panas sihir dan hasutan Jin Dasim musnah. Seisi rumah terasa sejuk, lapang dada dan penuh rahmat keberkatan.',
  },
  {
    icon: '👶🏻',
    title: 'Anak-Anak Membesar Ceria & Penuh Kasih',
    desc: 'Melihat senyuman anak-anak yang tidak lagi ketakutan atau bersedih. Mereka menikmati belaian kasih sayang ibu bapa yang utuh.',
  },
];

export default function GaramGoalsSection() {
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
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#B45309',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🎯 Impian &amp; Harapan Anda
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Bayangkan Kehidupan Anda{' '}
            <span style={{ color: '#EA580C' }}>Selepas Hati Pasangan Kembali Lembut</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Inilah saat indah yang anda dambakan sejak sekian lama. Saat rumahtangga yang hampir roboh diselamatkan dengan izin Allah SWT.
          </p>
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {GOALS.map((g, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #FED7AA',
                borderRadius: '18px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.04)',
              }}
            >
              <div style={{
                fontSize: '1.8rem',
                lineHeight: 1,
                flexShrink: 0,
                width: '52px',
                height: '52px',
                background: '#FFF7ED',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FDBA74',
              }}>
                {g.icon}
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 0.3rem 0',
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  color: '#0F172A',
                }}>
                  ✅ {g.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivating note */}
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: '#FFEDD5',
          borderRadius: '16px',
          border: '1px dashed #FB923C',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#9A3412', fontWeight: 700, lineHeight: 1.6 }}>
            &ldquo;Selagi masih ada rasa sayang, jangan biarkan ikatan perkahwinan ini putus di tengah jalan. Berikhtiarlah selagi ada peluang.&rdquo;
          </p>
        </div>

      </div>
    </section>
  );
}
