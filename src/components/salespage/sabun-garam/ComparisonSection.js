'use client';

const COMPARISONS = [
  {
    aspect: 'Fungsi Utama',
    biasa: 'Bersih fizikal sahaja',
    pengisian: 'Bersih fizikal + rohani (ruqyah)',
  },
  {
    aspect: 'Kesan Pada Sihir & Saka',
    biasa: 'Tiada kesan',
    pengisian: 'Membantu mengusir & melemahkan gangguan',
  },
  {
    aspect: 'Kandungan Asas',
    biasa: 'Bahan kimia & pewangi sintetik',
    pengisian: 'Garam Himalaya asli + ayat ruqyah syar\'iyyah',
  },
  {
    aspect: 'Sengal & Sakit Badan',
    biasa: 'Tiada manfaat tambahan',
    pengisian: 'Membantu melegakan urat & bisa rohani',
  },
  {
    aspect: 'Pengisian Perawat',
    biasa: '✗ Tiada',
    pengisian: '✓ 3 hari pengisian ruqyah khusus',
  },
  {
    aspect: 'Keselamatan Penggunaan',
    biasa: 'Bergantung pada bahan kimia',
    pengisian: '✓ Lembut & selamat untuk seisi keluarga',
  },
];

export default function SabunComparisonSection() {
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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#FBBF24',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚖️ Perbandingan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.2vw, 1.95rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0',
            letterSpacing: '-0.02em',
          }}>
            Sabun Biasa vs Sabun Garam Himalaya Pengisian ESyifaa
          </h2>
        </div>

        {/* Table Container */}
        <div style={{
          background: '#0D221B',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1.2fr',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={{ padding: '0.9rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ciri & Manfaat
            </div>
            <div style={{ padding: '0.9rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Sabun Biasa
            </div>
            <div style={{
              padding: '0.9rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#34D399',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.06)',
            }}>
              🧼 Sabun ESyifaa
            </div>
          </div>

          {/* Table Rows */}
          {COMPARISONS.map((row, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1.2fr',
              borderBottom: i === COMPARISONS.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
            }}>
              <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9', borderRight: '1px solid rgba(255, 255, 255, 0.04)' }}>
                {row.aspect}
              </div>
              <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#64748B', textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.04)' }}>
                {row.biasa}
              </div>
              <div style={{
                padding: '0.85rem 1rem',
                fontSize: '0.84rem',
                color: '#34D399',
                textAlign: 'center',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.04)',
              }}>
                {row.pengisian}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
