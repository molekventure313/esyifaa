'use client';

const STEPS = [
  {
    num: '01',
    icon: '💧',
    title: 'Basahkan Badan',
    desc: 'Mandi seperti biasa. Basahkan seluruh badan dengan air terlebih dahulu.',
    color: '#3B82F6',
  },
  {
    num: '02',
    icon: '🧼',
    title: 'Gosok Dengan Sabun Pengisian',
    desc: 'Gosok sabun pada seluruh badan terutama bahagian yang sakit atau terasa berat. Biarkan berbusa 1-2 minit.',
    color: '#10B981',
  },
  {
    num: '03',
    icon: '🚿',
    title: 'Bilas & Rasa Perbezaannya',
    desc: 'Bilas dengan air. Lakukan setiap kali mandi. In shaa Allah badan terasa lebih ringan & tenang dari masa ke semasa.',
    color: '#FDE047',
    colorText: '#042E23',
  },
];

export default function SabunHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background: '#042E23', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ✅ Mudah Digunakan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.6rem', letterSpacing: '-0.02em',
          }}>
            3 Langkah Mudah — Sama Seperti Mandi Biasa
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            Tidak perlu buat apa-apa yang rumit. Guna seperti sabun mandi biasa dan biarkan tenaga ruqyah bertindak.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
              background: '#031E17', border: `1px solid ${step.color}44`,
              borderRadius: '16px', padding: '1.5rem',
            }}>
              {/* Number */}
              <div style={{
                flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%',
                background: step.color, color: step.colorText || '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1rem',
              }}>
                {step.num}
              </div>
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{step.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FEF3C7' }}>{step.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#A7F3D0', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{
          marginTop: '2rem', padding: '1.1rem 1.5rem',
          background: 'rgba(253,224,71,0.06)', border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '12px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#FEF3C7', lineHeight: 1.65 }}>
            💡 <strong style={{ color: '#FDE047' }}>Tips:</strong> Untuk hasil terbaik, guna setiap hari.
            Satu unit 200g boleh tahan <strong>1-2 bulan</strong> penggunaan harian.
          </p>
        </div>

      </div>
    </section>
  );
}
