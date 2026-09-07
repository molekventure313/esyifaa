'use client';

const COMPARISONS = [
  {
    aspect: 'Fungsi Utama',
    biasa: 'Bersih luaran sahaja',
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
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
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
            ⚖️ Perbandingan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0',
            letterSpacing: '-0.02em',
          }}>
            Sabun Biasa vs Sabun Garam Himalaya Pengisian ESyifaa
          </h2>
        </div>

        {/* Table Container */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1.2fr',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          }}>
            <div style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ciri & Manfaat
            </div>
            <div style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Sabun Biasa
            </div>
            <div style={{
              padding: '1rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#047857',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: 'center',
              background: '#ECFDF5',
              borderLeft: '1px solid #D1FAE5',
            }}>
              🧼 Sabun ESyifaa
            </div>
          </div>

          {/* Table Rows */}
          {COMPARISONS.map((row, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1.2fr',
              borderBottom: i === COMPARISONS.length - 1 ? 'none' : '1px solid #F1F5F9',
              background: i % 2 === 0 ? '#FFFFFF' : '#FBFDFB',
            }}>
              <div style={{ padding: '0.95rem 1.25rem', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', borderRight: '1px solid #F1F5F9' }}>
                {row.aspect}
              </div>
              <div style={{ padding: '0.95rem 1rem', fontSize: '0.85rem', color: '#64748B', textAlign: 'center', borderRight: '1px solid #F1F5F9' }}>
                {row.biasa}
              </div>
              <div style={{
                padding: '0.95rem 1rem',
                fontSize: '0.88rem',
                color: '#059669',
                textAlign: 'center',
                fontWeight: 700,
                background: '#F0FDF4',
                borderLeft: '1px solid #E6F8ED',
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
