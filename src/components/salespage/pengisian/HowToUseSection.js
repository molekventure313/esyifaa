'use client';

const STEPS = [
  {
    step: '01',
    icon: '🤲',
    title: 'Baca Kunci Amalan & Doa Tujuan',
    desc: 'Pegang item pengisian anda. Cukup baca kunci amalan ringkas yang dibekalkan oleh perawat dan berdoa mengikut apa tujuan atau hajat yang anda inginkan.',
  },
  {
    step: '02',
    icon: '⚡',
    title: 'Niat Alirkan Tenaga Sambil Berzikir',
    desc: 'Contohnya jika ingin memusnahkan jin dalam badan: baca kunci amalan & doa untuk musnahkan jin dalam badan, kemudian niatkan mengalirkan tenaga pemusnah dari item ke seluruh badan sambil berzikir.',
  },
  {
    step: '03',
    icon: '✨',
    title: 'Badan Auto Bereaksi (Pembersihan)',
    desc: 'Jika terdapat gangguan dalam badan, tubuh akan bertindak balas secara automatik seperti muntah, loya, sendawa atau rasa bisa keluar menandakan gangguan sedang dihancurkan.',
  },
  {
    step: '04',
    icon: '🛡️',
    title: 'Item Multifungsi Untuk Pelbagai Hajat',
    desc: 'Item ini bersifat multifungsi — kaedah yang sama boleh digunakan untuk pelbagai ikhtiar: cukup niat alirkan tenaga kepada air untuk buat air tawar, pagar keliling rumah, benteng diri dan lain-lain.',
  },
];

export default function PengisianHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F0FDF4',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            📋 Panduan Praktikal
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#064E3B',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Cara Guna Item Pengisian E-Syifa&apos;
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Sangat mudah dan selamat diamalkan oleh sesiapa sahaja. Cukup baca kunci amalan, berdoa mengikut hajat tujuan, dan niatkan pengaliran tenaga ruqyah.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '1.5px solid #A7F3D0',
              borderRadius: '18px', padding: '1.75rem 1.35rem',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.4rem' }}>{s.icon}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 900, color: '#065F46',
                  background: '#ECFDF5', border: '1px solid #A7F3D0',
                  padding: '0.25rem 0.65rem', borderRadius: '999px',
                }}>
                  Langkah {s.step}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, flex: 1 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Panduan PDF Note (Light High Contrast Card) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #10B981',
          borderRadius: '16px', padding: '1.35rem 1.8rem', textAlign: 'center',
          maxWidth: '780px', margin: '0 auto',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#064E3B', lineHeight: 1.65, fontWeight: 600 }}>
            📖 <strong>Bimbingan Percuma:</strong> Perawat kami akan menghantar panduan audio &amp; teks bertulis secara terperinci melalui WhatsApp selepas proses pengisian selesai. Anda akan dibimbing sepenuhnya dari A hingga Z!
          </p>
        </div>

      </div>
    </section>
  );
}
