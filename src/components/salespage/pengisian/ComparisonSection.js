'use client';

const ROWS = [
  { label: 'Boleh digunakan berulang kali', air: false, luar: false, tasbih: true },
  { label: 'Tidak pernah habis / tamat', air: false, luar: false, tasbih: true },
  { label: 'Rawat sendiri tanpa perawat', air: false, luar: false, tasbih: true },
  { label: 'Boleh guna waktu malam / segera', air: '⚠️', luar: false, tasbih: true },
  { label: 'Buat air penawar sendiri', air: false, luar: false, tasbih: true },
  { label: 'Buat air mandian sendiri', air: false, luar: false, tasbih: true },
  { label: 'Sesuai untuk kes berulang berat', air: false, luar: '⚠️', tasbih: true },
  { label: 'Kos jangka panjang rendah', air: '⚠️', luar: false, tasbih: true },
  { label: 'Kekuatan tidak berkurang', air: false, luar: false, tasbih: true },
  { label: '100% Ruqyah Syar\'iyyah', air: true, luar: true, tasbih: true },
];

function Cell({ val, isHeader, label }) {
  if (isHeader) return (
    <div style={{ padding: '0.85rem 0.5rem', fontWeight: 800, fontSize: '0.82rem', color: label === 'Pengisian E-Syifa\'' ? '#FDE047' : '#94A3B8', textAlign: 'center' }}>
      {label}
    </div>
  );
  if (val === true) return <div style={{ textAlign: 'center', color: '#4ADE80', fontSize: '1.1rem' }}>✅</div>;
  if (val === false) return <div style={{ textAlign: 'center', color: '#F87171', fontSize: '1.1rem' }}>❌</div>;
  return <div style={{ textAlign: 'center', color: '#FDE047', fontSize: '1rem' }}>⚠️</div>;
}

export default function PengisianComparisonSection() {
  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          💡 Perbandingan
        </div>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pengisian E-Syifa&apos; vs Air Penawar vs Rawatan Luar Biasa
        </h2>
        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          Tiga pilihan — tapi hanya satu yang memberikan perlindungan{' '}
          <strong style={{ color: '#FDE047' }}>berterusan tanpa had</strong> untuk kes berulang &amp; berat.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '480px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700, borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  Ciri-Ciri
                </th>
                {[
                  { label: '💧 Air Penawar', color: '#94A3B8' },
                  { label: '🏥 Rawatan Luar', color: '#94A3B8' },
                  { label: '💎 Pengisian E-Syifa\'', color: '#FDE047' },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: '1rem 0.5rem', textAlign: 'center',
                    fontSize: '0.82rem', fontWeight: 800, color: col.color,
                    borderBottom: '2px solid rgba(255,255,255,0.1)',
                    background: i === 2 ? 'rgba(253,224,71,0.06)' : 'transparent',
                    borderRadius: i === 2 ? '12px 12px 0 0' : 0,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#FEF3C7', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {row.label}
                  </td>
                  {[row.air, row.luar, row.tasbih].map((val, j) => (
                    <td key={j} style={{
                      padding: '0.85rem 0.5rem', textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: j === 2 ? 'rgba(253,224,71,0.04)' : 'transparent',
                    }}>
                      {val === true ? <span style={{ color: '#4ADE80', fontSize: '1.1rem' }}>✅</span>
                        : val === false ? <span style={{ color: '#F87171', fontSize: '1.1rem' }}>❌</span>
                        : <span style={{ color: '#FDE047', fontSize: '1rem' }}>⚠️</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#6EE7B7', fontStyle: 'italic' }}>
          ⚠️ = Terhad / Bersyarat · ✅ = Ya · ❌ = Tidak
        </p>
      </div>
    </section>
  );
}
