'use client';

const STEPS = [
  {
    step: '01',
    title: 'Secubit Dalam Masakan Harian',
    desc: 'Gunakan sebagai garam masakan harian. Masukkan secubit dua ke dalam gulai, sup, lauk-pauk atau nasi semasa memasak untuk sekeluarga.',
    icon: '🍲',
  },
  {
    step: '02',
    title: 'Campur Dalam Minuman Pasangan',
    desc: 'Boleh juga dilarutkan secubit kecil ke dalam air teh, kopi atau air kosong pasangan. Rasa masinnya sangat halus dan tidak mengubah rasa minuman.',
    icon: '☕',
  },
  {
    step: '03',
    title: 'Berniat & Selawat 3 Kali',
    desc: 'Semasa memasukkan garam, niatkan dalam hati: "Ya Allah, lembutkanlah hati suamiku/isteriku (nama pasangan), dan matikanlah segala sihir pemisah di antara kami" berserta selawat 3x.',
    icon: '🤲🏻',
  },
];

export default function GaramHowToUseSection() {
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
            🥣 Panduan Penggunaan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Cara Guna Garam Pengasihan Masakan{' '}
            <span style={{ color: '#EA580C' }}>Sangat Mudah &amp; Ringkas</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Tiada ritual pelik atau pantang larang yang menyusahkan. Ia bertindak secara semulajadi melalui masakan harian anda.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFDFB',
                border: '1.5px solid #FED7AA',
                borderRadius: '20px',
                padding: '2rem 1.6rem',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.04)',
                position: 'relative',
              }}
            >
              {/* Step number circle */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#EA580C',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}>
                {s.step}
              </div>

              <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '0.75rem' }}>
                {s.icon}
              </span>

              <h4 style={{
                margin: '0 0 0.45rem 0',
                fontSize: '1.05rem',
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

        {/* Secret & Safe Banner */}
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '740px',
          margin: '0 auto',
        }}>
          <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>🤫</span>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400E', lineHeight: 1.6, fontWeight: 600 }}>
            <strong>100% Tidak Disedari Pasangan:</strong> Rasa dan rupanya seperti garam biasa. Pasangan langsung tidak akan tahu melainkan anda sendiri yang memberitahunya!
          </p>
        </div>

      </div>
    </section>
  );
}
