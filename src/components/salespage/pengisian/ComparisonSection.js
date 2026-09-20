'use client';

const ROWS = [
  { label: 'Boleh digunakan berulang kali seumur hidup', air: false, luar: false, tasbih: true },
  { label: 'Kekuatan bacaan tidak pernah berkurang / luput', air: false, luar: false, tasbih: true },
  { label: 'Mampu rawat diri sendiri serta-merta bila diserang', air: false, luar: false, tasbih: true },
  { label: 'Boleh bertindak jam 2-4 pagi tanpa perawat', air: '⚠️', luar: false, tasbih: true },
  { label: 'Boleh menghasilkan air penawar syifa\' sendiri', air: false, luar: false, tasbih: true },
  { label: 'Boleh menghasilkan air mandian ruqyah sendiri', air: false, luar: false, tasbih: true },
  { label: 'Sesuai untuk kes saka keturunan & sihir berat', air: false, luar: '⚠️', tasbih: true },
  { label: 'Kos jangka panjang rendah (hanya 1 kali bayar)', air: '⚠️', luar: false, tasbih: true },
  { label: 'Pelarasan & pengisian semula setiap minggu (Percuma)', air: false, luar: false, tasbih: true },
  { label: '100% Patuh Syariah berlandaskan Al-Quran', air: true, luar: true, tasbih: true },
];

export default function PengisianComparisonSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#ECFDF5', border: '1.5px solid #86EFAC',
          padding: '0.4rem 1.15rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.8rem', fontWeight: 800, color: '#065F46',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
        }}>
          💡 Perbandingan Terus
        </div>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
          fontWeight: 900, color: '#0F172A',
          marginTop: '0.3rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pengisian E-Syifa&apos; vs Air Penawar vs Rawatan Luar
        </h2>

        <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 2.75rem auto' }}>
          Tiga ikhtiar yang berbeza — tetapi hanya satu yang memberikan anda kuasa perlindungan{' '}
          <strong style={{ color: '#047857' }}>mandiri tanpa henti</strong> di rumah.
        </p>

        <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', padding: '1rem', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '520px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1.2rem 1rem', textAlign: 'left', fontSize: '0.88rem', color: '#0F172A', fontWeight: 900, borderBottom: '2px solid #E2E8F0' }}>
                  Ciri-Ciri Utama
                </th>
                {[
                  { label: '💧 Air Penawar', color: '#64748B' },
                  { label: '🏥 Rawatan Luar', color: '#64748B' },
                  { label: '💎 Pengisian E-Syifa\'', color: '#065F46' },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: '1.2rem 0.6rem', textAlign: 'center',
                    fontSize: '0.9rem', fontWeight: 900, color: col.color,
                    borderBottom: '2px solid #E2E8F0',
                    background: i === 2 ? '#ECFDF5' : 'transparent',
                    borderRadius: i === 2 ? '14px 14px 0 0' : 0,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#F8FAFC' : '#FFFFFF' }}>
                  <td style={{ padding: '1rem 1rem', fontSize: '0.9rem', color: '#1E293B', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                    {row.label}
                  </td>
                  {[row.air, row.luar, row.tasbih].map((val, j) => (
                    <td key={j} style={{
                      padding: '1rem 0.6rem', textAlign: 'center',
                      borderBottom: '1px solid #E2E8F0',
                      background: j === 2 ? '#F0FDF4' : 'transparent',
                    }}>
                      {val === true ? <span style={{ color: '#059669', fontSize: '1.25rem', fontWeight: 900 }}>✅</span>
                        : val === false ? <span style={{ color: '#DC2626', fontSize: '1.25rem', fontWeight: 900 }}>❌</span>
                        : <span style={{ color: '#D97706', fontSize: '1.15rem' }}>⚠️</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.84rem', color: '#64748B' }}>
          Petunjuk: ✅ = Berkesan Sepenuhnya · ⚠️ = Terhad / Bersyarat · ❌ = Tidak Boleh
        </p>

      </div>
    </section>
  );
}
