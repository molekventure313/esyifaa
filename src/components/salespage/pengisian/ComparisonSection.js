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
      background: '#031E17',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          💡 Perbandingan Terus
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pengisian E-Syifa&apos; vs Air Penawar vs Rawatan Luar
        </h2>

        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 2.75rem auto' }}>
          Tiga ikhtiar yang berbeza — tetapi hanya satu yang memberikan anda kuasa perlindungan{' '}
          <strong style={{ color: '#FDE047' }}>mandiri tanpa henti</strong> di rumah.
        </p>

        <div style={{ overflowX: 'auto', background: '#042E23', borderRadius: '18px', border: '1px solid rgba(74,222,128,0.2)', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '500px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1.1rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6EE7B7', fontWeight: 800, borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  Ciri-Ciri Utama
                </th>
                {[
                  { label: '💧 Air Penawar', color: '#94A3B8' },
                  { label: '🏥 Rawatan Luar', color: '#94A3B8' },
                  { label: '💎 Pengisian E-Syifa\'', color: '#FDE047' },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: '1.1rem 0.6rem', textAlign: 'center',
                    fontSize: '0.86rem', fontWeight: 900, color: col.color,
                    borderBottom: '2px solid rgba(255,255,255,0.1)',
                    background: i === 2 ? 'rgba(253,224,71,0.1)' : 'transparent',
                    borderRadius: i === 2 ? '12px 12px 0 0' : 0,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '0.95rem 1rem', fontSize: '0.88rem', color: '#FEF3C7', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {row.label}
                  </td>
                  {[row.air, row.luar, row.tasbih].map((val, j) => (
                    <td key={j} style={{
                      padding: '0.95rem 0.6rem', textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: j === 2 ? 'rgba(253,224,71,0.06)' : 'transparent',
                    }}>
                      {val === true ? <span style={{ color: '#4ADE80', fontSize: '1.2rem' }}>✅</span>
                        : val === false ? <span style={{ color: '#F87171', fontSize: '1.2rem' }}>❌</span>
                        : <span style={{ color: '#FDE047', fontSize: '1.1rem' }}>⚠️</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: '#A7F3D0', fontStyle: 'italic' }}>
          Petunjuk: ✅ = Berkesan Sepenuhnya · ⚠️ = Terhad / Bersyarat · ❌ = Tidak Boleh
        </p>

      </div>
    </section>
  );
}
