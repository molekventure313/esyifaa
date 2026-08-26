'use client';

const BEFORE = [
  { text: 'Kena PM perawat setiap kali ada masalah' },
  { text: 'Tunggu slot — kadang 3 hingga 7 hari' },
  { text: 'Bayar RM200–RM500 setiap sesi rawatan' },
  { text: 'Habis ribuan ringgit setahun' },
  { text: 'Tiada perlindungan antara sesi rawatan' },
  { text: 'Keluarga terdedah bila perawat unavailable' },
  { text: 'Rasa helpless bila kena serang waktu malam' },
];

const AFTER = [
  { text: 'Rawat sendiri bila-bila masa tanpa tunggu sesiapa' },
  { text: 'Tiada queue, tiada slot — guna terus bila perlu' },
  { text: 'Bayar RM90 SEKALI sahaja — seumur hidup' },
  { text: 'Jimat ribuan ringgit jangka panjang' },
  { text: 'Perlindungan berterusan 24/7' },
  { text: 'Lindungi seluruh keluarga sendiri' },
  { text: 'Rasa berdaya — ada alat perlindungan dalam genggaman' },
];

export default function RawatSendiriComparisonSection() {
  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Header */}
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
          Kehidupan Sebelum vs Selepas{' '}
          <span style={{ color: '#FEF3C7' }}>Ada Pengisian E-Syifa&apos;</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '680px', margin: '0 auto 2.5rem auto',
        }}>
          Bukan pasal berhenti pergi perawat. Pasal{' '}
          <strong style={{ color: '#FDE047' }}>berhenti bergantung sepenuhnya</strong>{' '}
          — dan mula ada kuasa perlindungan sendiri.
        </p>

        {/* Comparison grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem', textAlign: 'left',
        }}>

          {/* BEFORE */}
          <div style={{
            background: 'rgba(248,113,113,0.06)',
            border: '1.5px solid rgba(248,113,113,0.25)',
            borderRadius: '20px', padding: '1.75rem',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(248,113,113,0.15)',
                border: '2px solid rgba(248,113,113,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>😮</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#FCA5A5', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sebelum</div>
                <div style={{ fontSize: '0.78rem', color: '#F87171', opacity: 0.8 }}>Bergantung Sepenuhnya Pada Perawat</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {BEFORE.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  background: 'rgba(248,113,113,0.06)',
                  border: '1px solid rgba(248,113,113,0.12)',
                  borderRadius: '10px', padding: '0.65rem 0.85rem',
                }}>
                  <span style={{ color: '#F87171', fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>✗</span>
                  <span style={{ fontSize: '0.875rem', color: '#FCA5A5', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER */}
          <div style={{
            background: 'rgba(74,222,128,0.06)',
            border: '2px solid rgba(74,222,128,0.3)',
            borderRadius: '20px', padding: '1.75rem',
            position: 'relative',
          }}>
            {/* Winner badge */}
            <div style={{
              position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(90deg, #FDE047, #4ADE80)',
              color: '#042E23', fontSize: '0.68rem', fontWeight: 900,
              padding: '0.2rem 1rem', borderRadius: '0 0 10px 10px',
              letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              ✨ Kehidupan Baru
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              marginBottom: '1.5rem', marginTop: '0.5rem',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(74,222,128,0.15)',
                border: '2px solid rgba(74,222,128,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>🛡️</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#4ADE80', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Selepas</div>
                <div style={{ fontSize: '0.78rem', color: '#86EFAC', opacity: 0.9 }}>Ada Pengisian E-Syifa&apos; Sendiri</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {AFTER.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  background: 'rgba(74,222,128,0.06)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  borderRadius: '10px', padding: '0.65rem 0.85rem',
                }}>
                  <span style={{ color: '#4ADE80', fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>✓</span>
                  <span style={{ fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.5, fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom summary */}
        <div style={{
          marginTop: '2.5rem',
          background: 'linear-gradient(135deg, #065F46 0%, #042E23 100%)',
          border: '2px solid #FDE047',
          borderRadius: '16px', padding: '1.75rem',
          maxWidth: '600px', margin: '2.5rem auto 0',
        }}>
          <p style={{ margin: 0, fontSize: '1.05rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
            <span style={{ color: '#FDE047' }}>RM90</span> sekali sahaja —
            berbanding <span style={{ color: '#FCA5A5', textDecoration: 'line-through' }}>ribuan ringgit</span> setahun.
            <br />
            <span style={{ color: '#4ADE80', fontSize: '0.95rem', fontWeight: 600 }}>
              Satu keputusan yang mengubah cara anda melindungi keluarga — selamanya.
            </span>
          </p>
        </div>

      </div>
    </section>
  );
}
