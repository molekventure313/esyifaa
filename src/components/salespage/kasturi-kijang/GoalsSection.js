'use client';

const GOALS = [
  {
    icon: '🛌',
    title: 'Tidur Lena Nyenyak Sampai Azan Subuh',
    desc: 'Tiada lagi gangguan kena tindih, mimpi jatuh gaung atau ular hitam. Anda tidur dalam keadaan tenang dan terlindung di bawah naungan doa.',
  },
  {
    icon: '⚡',
    title: 'Tubuh Terasa Sangat Ringan & Bertenaga',
    desc: 'Bangun pagi dengan rasa segar, sengal-sengal di bahu dan tengkuk hilang. Anda bersedia memulakan hari dengan senyuman dan keceriaan.',
  },
  {
    icon: '🕊️',
    title: 'Dada Lapang & Bebas Daripada Anxiety',
    desc: 'Perasaan panik dan cemas tiba-tiba hilang. Jiwa berasa damai, fikiran tenang dan degupan jantung stabil sepanjang hari.',
  },
  {
    icon: '👶🏻',
    title: 'Anak-Anak Tidur Selesa Tanpa Menangis Malam',
    desc: 'Tiada lagi tangisan histeria waktu senja. Anak-anak kecil membesar dengan ceria dan dilindungi daripada pandangan jahat entiti halus.',
  },
  {
    icon: '🛡️',
    title: 'Perisai Diri Sentiasa Aktif Ke Mana Sahaja',
    desc: 'Bauan kasturi menjadi benteng yang menghalang pandangan ain, sihir lintasan dan aura jahat daripada menembusi diri anda.',
  },
];

export default function KasturiGoalsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🎯 Transformasi Yang Anda Rasai
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Bayangkan Ketenangan Hidup Anda{' '}
            <span style={{ color: '#047857' }}>Selepas Memiliki Benteng Pendinding Ini</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Kesihatan rohani dan emosi yang sejahtera bermula daripada perlindungan diri yang berterusan.
          </p>
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {GOALS.map((g, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #BBF7D0',
                borderRadius: '18px',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.04)',
              }}
            >
              <div style={{
                fontSize: '1.8rem',
                lineHeight: 1,
                flexShrink: 0,
                width: '52px',
                height: '52px',
                background: '#ECFDF5',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #6EE7B7',
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

        {/* Motivating Note */}
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: '#ECFDF5',
          borderRadius: '16px',
          border: '1px dashed #34D399',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#065F46', fontWeight: 700, lineHeight: 1.6 }}>
            &ldquo;Sediakan payung sebelum hujan. Membentengi diri dan anak-anak adalah tanggungjawab kita sebagai pelindung keluarga.&rdquo;
          </p>
        </div>

      </div>
    </section>
  );
}
