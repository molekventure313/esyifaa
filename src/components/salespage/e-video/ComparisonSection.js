'use client';

const ROWS = [
  { label: 'Rawatan tanpa perawat hadir', biasa: false, evideo: true },
  { label: 'Boleh guna sendiri bila-bila masa', biasa: false, evideo: true },
  { label: 'Rawatan untuk keseluruhan rumah', biasa: false, evideo: true },
  { label: 'Buat air tawar & garam sendiri', biasa: false, evideo: true },
  { label: 'Rawatan bisa / santau dalam badan', biasa: '⚠️', evideo: true },
  { label: 'Digital — tanpa perlu pos', biasa: false, evideo: true },
  { label: 'Kongsi dengan seluruh keluarga', biasa: false, evideo: true },
  { label: 'Bayar sekali — guna seumur hidup', biasa: false, evideo: true },
  { label: 'Ulang rawatan tanpa kos tambahan', biasa: false, evideo: true },
  { label: '100% Ruqyah Syar\'iyyah', biasa: true, evideo: true },
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
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

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
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Rawatan Biasa vs{' '}
          <span style={{ color: '#FDE047' }}>E-Video Rawatan ESyifaa</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '580px', margin: '0 auto 2.5rem auto',
        }}>
          Apa yang membezakan E-Video dari rawatan konvensional?
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '420px' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '1rem', textAlign: 'left',
                  fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700,
                  borderBottom: '2px solid rgba(255,255,255,0.1)',
                }}>
                  Ciri-Ciri
                </th>
                <th style={{
                  padding: '1rem 0.75rem', textAlign: 'center',
                  fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8',
                  borderBottom: '2px solid rgba(255,255,255,0.1)',
                }}>
                  🏥 Rawatan Biasa
                </th>
                <th style={{
                  padding: '1rem 0.75rem', textAlign: 'center',
                  fontSize: '0.82rem', fontWeight: 800, color: '#FDE047',
                  borderBottom: '2px solid rgba(255,255,255,0.1)',
                  background: 'rgba(253,224,71,0.06)',
                  borderRadius: '12px 12px 0 0',
                }}>
                  🎬 E-Video ESyifaa
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{
                    padding: '0.85rem 1rem', fontSize: '0.875rem',
                    color: '#FEF3C7', fontWeight: 600, textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {row.label}
                  </td>
                  <td style={{
                    padding: '0.85rem 0.75rem', textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <Val v={row.biasa} />
                  </td>
                  <td style={{
                    padding: '0.85rem 0.75rem', textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(253,224,71,0.04)',
                  }}>
                    <Val v={row.evideo} />
                  </td>
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
          padding: '1.5rem 2rem',
        }}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
            🎬 <span style={{ color: '#FDE047' }}>E-Video Rawatan ESyifaa</span>{' '}
            adalah satu-satunya penyelesaian yang memberi anda kuasa untuk rawat diri sendiri —
            <span style={{ color: '#4ADE80' }}>{' '}tanpa tunggu, tanpa bergantung, tanpa bayar lagi.</span>
          </p>
        </div>

      </div>
    </section>
  );
}
