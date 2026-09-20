'use client';

const GOALS = [
  {
    icon: '⚡',
    title: 'Mampu Merawat Diri Sendiri Serta-Merta — Tanpa Menunggu',
    desc: 'Bila terasa seram sejuk atau kepala pening mencucuk, anda tak perlu panik mencari perawat. Capai item berisian anda, lakukan amalan ringkas, dan rasakan ketenangan kembali serta-merta.',
  },
  {
    icon: '🌙',
    title: 'Tidur Malam Nyenyak &amp; Bangun Pagi Dengan Segar',
    desc: 'Tiada lagi mimpi dikejar binatang berbisa, tiada lagi ditindih lembaga hitam jam 3 pagi. Dada lapang, tidur lena dan bangun dalam keadaan bertenaga untuk beribadah dan bekerja.',
  },
  {
    icon: '💰',
    title: 'Jimat Beribu-Ribu Ringgit Dari Terus Hangus',
    desc: 'Tiada lagi kos rawatan ratusan ringgit setiap bulan. Satu bayaran upah pengisian memberi anda alat ikhtiar peribadi yang bertahan seumur hidup.',
  },
  {
    icon: '💧',
    title: 'Boleh Hasilkan Air Penawar Sendiri Tanpa Had',
    desc: 'Bila anak meracau atau pasangan panas baran, anda boleh terus buat air minuman syifa\' atau air mandian penawar sendiri di rumah tanpa perlu membeli air botol dari luar.',
  },
  {
    icon: '🏡',
    title: 'Suasana Rumah &amp; Bilik Tidur Kembali Sejuk Harmoni',
    desc: 'Aura panas dan suram sihir lenyap. Hubungan suami isteri kembali mesra, anak-anak tenang mendengar kata, dan pintu rezeki terbuka luas tanpa halangan ghaib.',
  },
];

export default function PengisianGoalsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🎯 Kehidupan Selepas Ikhtiar
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          5 Perubahan Positif Yang Bakal Anda Rasai
        </h2>

        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 2.75rem auto' }}>
          Bayangkan nikmat hidup tanpa ketakutan gangguan ghaib. Inilah transformasi yang dilalui oleh para pesakit yang telah berikhtiar dengan Pengisian E-Syifa&apos;.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '2px solid #FDE047',
              borderRadius: '16px', padding: '1.35rem 1.6rem',
              display: 'flex', alignItems: 'flex-start', gap: '1.1rem',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: '#ECFDF5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0,
              }}>{g.icon}</div>
              <div>
                <p style={{ margin: '0 0 0.35rem 0', fontWeight: 800, fontSize: '1.02rem', color: '#042E23' }}>
                  {g.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.65 }}>
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
