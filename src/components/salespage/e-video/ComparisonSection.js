'use client';

const ROWS = [
  { label: 'Rawatan tanpa perawat hadir', biasa: false, pengisian: true, evideo: true },
  { label: 'Boleh guna sendiri bila-bila masa', biasa: false, pengisian: true, evideo: true },
  { label: 'Rawatan untuk keseluruhan rumah', biasa: false, pengisian: '⚠️', evideo: true },
  { label: 'Buat air tawar sendiri', biasa: false, pengisian: true, evideo: true },
  { label: 'Buat garam mandian sendiri', biasa: false, pengisian: true, evideo: true },
  { label: 'Rawatan bisa / santau dalam badan', biasa: '⚠️', pengisian: true, evideo: true },
  { label: 'Digital — tanpa perlu pos', biasa: false, pengisian: false, evideo: true },
  { label: 'Kongsi dengan seluruh keluarga', biasa: false, pengisian: false, evideo: true },
  { label: 'Perlukan item fizikal', biasa: false, pengisian: true, evideo: false },
  { label: 'Bayar sekali — guna seumur hidup', biasa: false, pengisian: true, evideo: true },
  { label: '100% Ruqyah Syariyyah', biasa: true, pengisian: true, evideo: true },
];

function Val({ v }) {
  if (v === true) return <span style={{ color: '#4ADE80', fontSize: '1.1rem' }}>✅</span>;
  if (v === false) return <span style={{ color: '#F87171', fontSize: '1.1rem' }}>❌</span>;
  return <span style={{ color: '#FDE047', fontSize: '1rem' }}>⚠️</span>;
}

export default function EVideoComparisonSection() {
  return (
    <section style={{
      background: '#021812', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          💡 Perbandingan Produk
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          E-Video vs Rawatan Biasa vs{' '}
          <span style={{ color: '#FDE047' }}>Pengisian Item</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '680px', margin: '0 auto 2.5rem auto',
        }}>
          Pilih penyelesaian yang paling sesuai dengan keperluan anda.
          Ketiga-tiga boleh digabungkan untuk perlindungan yang lebih menyeluruh.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '520px' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700, borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  Ciri-Ciri
                </th>
                {[
                  { label: '🏥 Rawatan Biasa', color: '#94A3B8', highlight: false },
                  { label: '💎 Pengisian Item', color: '#A7F3D0', highlight: false },
                  { label: '🎬 E-Video Rawatan', color: '#FDE047', highlight: true },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: '1rem 0.5rem', textAlign: 'center',
                    fontSize: '0.82rem', fontWeight: 800, color: col.color,
                    borderBottom: '2px solid rgba(255,255,255,0.1)',
                    background: col.highlight ? 'rgba(253,224,71,0.06)' : 'transparent',
                    borderRadius: col.highlight ? '12px 12px 0 0' : 0,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#FEF3C7', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {row.label}
                  </td>
                  {[row.biasa, row.pengisian, row.evideo].map((val, j) => (
                    <td key={j} style={{
                      padding: '0.85rem 0.5rem', textAlign: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: j === 2 ? 'rgba(253,224,71,0.04)' : 'transparent',
                    }}>
                      <Val v={val} />
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

        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(135deg, #065F46 0%, #042E23 100%)',
          border: '2px solid #FDE047', borderRadius: '16px',
          padding: '1.5rem 2rem', maxWidth: '600px', margin: '2rem auto 0',
        }}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
            🎬 <span style={{ color: '#FDE047' }}>E-Video Rawatan</span> adalah satu-satunya produk yang{' '}
            <span style={{ color: '#4ADE80' }}>100% digital, boleh dikongsi dengan keluarga,</span>{' '}
            dan boleh merawat badan &amp; rumah sekali gus — tanpa memerlukan item fizikal.
          </p>
        </div>

      </div>
    </section>
  );
}
