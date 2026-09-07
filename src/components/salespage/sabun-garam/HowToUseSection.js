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
      background: '#FFFFFF',
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
            ✅ Mudah Digunakan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
          }}>
            3 Langkah Mudah — Sama Seperti Mandi Biasa
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#64748B',
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
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.4rem 1.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}>
              {/* Number pill */}
              <div style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A' }}>{step.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip Box */}
        <div style={{
          marginTop: '2rem',
          padding: '1.2rem 1.5rem',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400E', lineHeight: 1.65 }}>
            💡 <strong style={{ color: '#B45309' }}>Tips:</strong> Untuk hasil terbaik, gunakan setiap hari.
            Satu ketul 200g boleh bertahan <strong>1-2 bulan</strong> penggunaan biasa.
          </p>
        </div>

      </div>
    </section>
  );
}
