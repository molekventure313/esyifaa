'use client';

const GOALS = [
  {
    icon: '☀️',
    title: 'Badan Terasa Ringan & Bebas',
    desc: 'Rasa berat, tertindas dan lesu yang selama ini ada — makin berkurang hari demi hari. Bangun tidur rasa segar, bukan terbeban.',
    color: '#FDE047',
  },
  {
    icon: '🌙',
    title: 'Tidur Lena, Tanpa Mimpi Pelik',
    desc: 'Tidur nyenyak tanpa terganggu bisikan, mimpi ngeri atau terbangun di tengah malam rasa gelisah. Rehat yang benar-benar rehat.',
    color: '#A78BFA',
  },
  {
    icon: '💚',
    title: 'Emosi Lebih Stabil & Tenang',
    desc: 'Kurang cepat marah, kurang anxious, kurang rasa sedih tanpa sebab. Hati jadi lapang, sabar datang sendiri, in shaa Allah.',
    color: '#4ADE80',
  },
  {
    icon: '🕌',
    title: 'Ibadah Lebih Khusyuk & Bermakna',
    desc: 'Solat terasa lebih tenang. Bacaan Al-Quran lebih mudah. Hati lebih dekat dengan Allah apabila gangguan tidak lagi menghalang.',
    color: '#34D399',
  },
  {
    icon: '🏡',
    title: 'Keluarga Lebih Harmoni & Selamat',
    desc: 'Suasana rumah berubah. Anak-anak lebih tenang. Hubungan suami isteri kembali rapat. Rumah terasa lebih sejuk dan terlindung.',
    color: '#60A5FA',
  },
];

export default function SabunGoalsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background: '#031E17', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            🌱 Kehidupan Selepas Rawatan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            5 Perubahan Yang Anda Akan Rasa<br />
            <span style={{ color: '#4ADE80' }}>Bila Sabun Pengisian Mula Bertindak</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            Bukan janji kosong — ini adalah perubahan yang sering dilaporkan
            oleh pelanggan kami selepas guna secara konsisten, in shaa Allah.
          </p>
        </div>

        {/* Goals list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#042E23',
              border: `1px solid ${g.color}25`,
              borderLeft: `4px solid ${g.color}`,
              borderRadius: '14px', padding: '1.4rem 1.5rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
            }}>
              {/* Icon circle */}
              <div style={{
                flexShrink: 0, width: '52px', height: '52px', borderRadius: '50%',
                background: `${g.color}15`, border: `1.5px solid ${g.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
              }}>
                {g.icon}
              </div>
              {/* Text */}
              <div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: g.color, marginBottom: '0.3rem' }}>
                  {g.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.87rem', color: '#D1FAE5', lineHeight: 1.6 }}>
                  {g.desc}
                </p>
              </div>
              {/* Number */}
              <div style={{
                flexShrink: 0, marginLeft: 'auto', fontSize: '2.2rem',
                fontWeight: 900, color: `${g.color}25`, lineHeight: 1, alignSelf: 'center',
                display: 'none',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* CTA nudge */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: '#FEF3C7', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            5 perubahan ini bermula dengan satu keputusan mudah —{' '}
            <strong style={{ color: '#FDE047' }}>mula gunakan Sabun Garam Himalaya Pengisian ESyifaa hari ini.</strong>
          </p>
          <button
            onClick={() => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '0.9rem 2rem', fontSize: '0.95rem', fontWeight: 800,
              color: '#042E23', background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              border: '2px solid #FEF08A', borderRadius: '50px', cursor: 'pointer',
              fontFamily: ff, boxShadow: '0 8px 24px rgba(234,179,8,0.35)',
            }}
          >
            🧼 Dapatkan Sabun Sekarang
          </button>
        </div>

      </div>
    </section>
  );
}
