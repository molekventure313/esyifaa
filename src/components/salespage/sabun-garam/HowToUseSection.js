'use client';

const STEPS = [
  {
    num: '01',
    icon: '💧',
    title: 'Basahkan Badan',
    desc: 'Mandi seperti biasa. Basahkan seluruh badan dengan air bersih terlebih dahulu.',
  },
  {
    num: '02',
    icon: '🧼',
    title: 'Gosok Dengan Sabun Pengisian',
    desc: 'Gosok sabun pada seluruh badan, terutamanya bahagian yang sering sakit, kaku atau terasa berat. Biarkan buih meresap 1-2 minit.',
  },
  {
    num: '03',
    icon: '🚿',
    title: 'Bilas & Rasai Kelegaannya',
    desc: 'Bilas dengan air sehingga bersih. Amalkan setiap kali mandi untuk perlindungan dan pemulihan berterusan, in shaa Allah.',
  },
];

export default function SabunHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#081C15',
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
            ✅ Mudah Digunakan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
          }}>
            3 Langkah Mudah — Sama Seperti Mandi Biasa
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            Tidak perlu amalan yang rumit. Guna seperti sabun mandi biasa dan biarkan tenaga ruqyah bertindak.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              background: '#0D221B',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '1.4rem 1.5rem',
            }}>
              {/* Number pill */}
              <div style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FBBF24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#F8FAFC' }}>{step.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip Box */}
        <div style={{
          marginTop: '2rem',
          padding: '1.1rem 1.4rem',
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.65 }}>
            💡 <strong style={{ color: '#FBBF24' }}>Tips:</strong> Untuk hasil terbaik, gunakan setiap hari.
            Satu ketul 200g boleh bertahan <strong>1-2 bulan</strong> penggunaan biasa.
          </p>
        </div>

      </div>
    </section>
  );
}
