'use client';

const COMPARISONS = [
  {
    aspect: 'Fungsi Utama',
    biasa: 'Bersih fizikal sahaja',
    pengisian: 'Bersih fizikal + rohani (ruqyah)',
  },
  {
    aspect: 'Kesan Pada Sihir & Saka',
    biasa: 'Tiada kesan langsung',
    pengisian: 'Membantu usir & lemahkan gangguan in shaa Allah',
  },
  {
    aspect: 'Kandungan',
    biasa: 'Bahan kimia, pewarna, pewangi',
    pengisian: 'Garam Himalaya asli + tenaga ayat ruqyah',
  },
  {
    aspect: 'Guna Untuk Sakit Badan',
    biasa: 'Tiada manfaat tambahan',
    pengisian: 'Bantu melegakan sakit urat & badan secara rohani',
  },
  {
    aspect: 'Diisikan Oleh Perawat',
    biasa: '✗ Tidak',
    pengisian: '✓ Ya — 3 hari berturut-turut',
  },
  {
    aspect: 'Selamat Untuk Keluarga',
    biasa: 'Bergantung pada bahan',
    pengisian: '✓ Selamat untuk dewasa & kanak-kanak',
  },
];

export default function SabunComparisonSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background: '#031E17', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(253,224,71,0.1)',
            border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ⚖️ Perbandingan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0', letterSpacing: '-0.02em',
          }}>
            Sabun Biasa vs Sabun Garam Himalaya Pengisian ESyifaa
          </h2>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.65rem 1rem', fontSize: '0.78rem', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aspek</div>
          <div style={{ padding: '0.65rem 1rem', fontSize: '0.78rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Sabun Biasa</div>
          <div style={{ padding: '0.65rem 1rem', fontSize: '0.78rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
            🧼 Sabun Pengisian ESyifaa
          </div>
        </div>

        {/* Rows */}
        {COMPARISONS.map((row, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0',
            background: i % 2 === 0 ? 'rgba(4,46,35,0.5)' : 'transparent',
            borderRadius: '8px', marginBottom: '2px',
          }}>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#A7F3D0', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              {row.aspect}
            </div>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#F87171', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', opacity: 0.85 }}>
              {row.biasa}
            </div>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#4ADE80', textAlign: 'center', fontWeight: 700 }}>
              {row.pengisian}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
