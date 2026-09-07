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
      background: '#F8FAF9',
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
            🌱 Kehidupan Selepas Rawatan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            5 Perubahan Yang Anda Akan Rasa<br />
            <span style={{ color: '#059669' }}>Bila Sabun Pengisian Mula Bertindak</span>
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto',
          }}>
            Ikhtiar konsisten yang membawa kepada kelegaan fizikal dan ketenangan jiwa, in shaa Allah.
          </p>
        </div>

        {/* Goals list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.3rem 1.5rem',
              display: 'flex',
              gap: '1.2rem',
              alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}>
              <div style={{
                flexShrink: 0,
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#F0FDF4',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
              }}>
                {g.icon}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: '0.25rem' }}>
                  {g.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA nudge */}
        <div style={{ marginTop: '2.75rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            5 perubahan ini bermula dengan satu keputusan —{' '}
            <strong style={{ color: '#047857' }}>mula ikhtiar dengan Sabun Pengisian Ruqyah hari ini.</strong>
          </p>
          <button
            onClick={() => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '0.95rem 2.4rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontFamily: ff,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            🧼 Dapatkan Sabun Sekarang
          </button>
        </div>

      </div>
    </section>
  );
}
