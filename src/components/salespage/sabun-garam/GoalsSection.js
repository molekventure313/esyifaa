'use client';

const GOALS = [
  {
    icon: '☀️',
    title: 'Badan Terasa Ringan & Segar',
    desc: 'Rasa berat, tertindas dan lesu yang selama ini bersarang — makin berkurang hari demi hari. Bangun tidur dengan badan bertenaga.',
  },
  {
    icon: '🌙',
    title: 'Tidur Lena, Tanpa Mimpi Buruk',
    desc: 'Tidur nyenyak tanpa terganggu bisikan, mimpi ngeri atau terbangun di tengah malam dalam keadaan cemas.',
  },
  {
    icon: '💚',
    title: 'Emosi Lebih Stabil & Hati Lapang',
    desc: 'Kurang rasa marah mendadak, kurang gelisah tanpa sebab. Hati terasa tenang dan sabar kembali hadir dalam diri.',
  },
  {
    icon: '🕌',
    title: 'Ibadah Lebih Khusyuk & Tenang',
    desc: 'Solat terasa lebih khusyuk, bacaan Al-Quran lebih lancar. Fikiran tidak lagi diganggu lintasan-lintasan yang mengacau.',
  },
  {
    icon: '🏡',
    title: 'Keluarga Lebih Harmoni & Dilindungi',
    desc: 'Suasana rumah kembali damai. Anak-anak tidur tenang dan hubungan suami isteri lebih mesra tanpa pertengkaran kecil yang pelik.',
  },
];

export default function SabunGoalsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#061510',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34D399',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🌱 Kehidupan Selepas Rawatan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            5 Perubahan Yang Anda Akan Rasa<br />
            <span style={{ color: '#34D399' }}>Bila Sabun Pengisian Mula Bertindak</span>
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
          }}>
            Ikhtiar konsisten yang membawa kepada kelegaan fizikal dan ketenangan jiwa, in shaa Allah.
          </p>
        </div>

        {/* Goals list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#0D221B',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              gap: '1.1rem',
              alignItems: 'flex-start',
            }}>
              <div style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                {g.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>
                  {g.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA nudge */}
        <div style={{ marginTop: '2.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            5 perubahan ini bermula dengan satu keputusan —{' '}
            <strong style={{ color: '#FBBF24' }}>mula ikhtiar dengan Sabun Pengisian Ruqyah hari ini.</strong>
          </p>
          <button
            onClick={() => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '0.9rem 2.2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#061811',
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontFamily: ff,
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)',
            }}
          >
            🧼 Dapatkan Sabun Sekarang
          </button>
        </div>

      </div>
    </section>
  );
}
