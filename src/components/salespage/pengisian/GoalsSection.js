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
      background: '#FFFFFF',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#ECFDF5', border: '1.5px solid #86EFAC',
          padding: '0.4rem 1.15rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.8rem', fontWeight: 800, color: '#065F46',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
        }}>
          🎯 Kehidupan Selepas Ikhtiar
        </div>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
          fontWeight: 900, color: '#0F172A',
          marginTop: '0.3rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          5 Perubahan Positif Yang Bakal Anda Rasai
        </h2>

        <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 2.75rem auto' }}>
          Bayangkan nikmat hidup tanpa ketakutan gangguan ghaib. Inilah transformasi yang dilalui oleh para pesakit yang telah berikhtiar dengan Pengisian E-Syifa&apos;.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: '18px', padding: '1.5rem 1.6rem',
              display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '14px',
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0,
              }}>{g.icon}</div>
              <div>
                <p style={{ margin: '0 0 0.35rem 0', fontWeight: 800, fontSize: '1.05rem', color: '#064E3B' }}>
                  {g.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.65 }}>
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
