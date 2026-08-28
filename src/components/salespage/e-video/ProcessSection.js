'use client';

const STEPS = [
  {
    num: '01',
    icon: '💳',
    title: 'Bayar RM150 via FPX',
    desc: 'Isi nama dan nombor WhatsApp anda dalam borang di bawah, kemudian teruskan ke pembayaran FPX (internet banking). Selamat &amp; terjamin.',
    note: null,
  },
  {
    num: '02',
    icon: '📱',
    title: 'Perawat Hantar Video Via WhatsApp',
    desc: 'Sebaik bayaran berjaya, perawat ESyifaa akan hubungi anda melalui WhatsApp dan hantar E-Video Rawatan dalam masa 24 jam.',
    note: '⚠️ Pastikan nombor WhatsApp anda betul semasa mengisi borang.',
  },
  {
    num: '03',
    icon: '🎬',
    title: 'Simpan & Guna Seumur Hidup',
    desc: 'Simpan video di telefon atau Google Drive anda. Guna bila-bila masa untuk rawatan diri, rumah, air tawar, garam — tanpa had, tanpa kos tambahan.',
    note: '✅ Kongsi dengan ahli keluarga untuk perlindungan menyeluruh.',
  },
];

export default function EVideoProcessSection() {
  return (
    <section style={{
      background: '#0B382D', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          📋 Cara Mendapatkan E-Video
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          3 Langkah Mudah —{' '}
          <span style={{ color: '#FDE047' }}>Siap Dalam 24 Jam</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '560px', margin: '0 auto 2.5rem auto',
        }}>
          Proses yang ringkas dan telus. Tiada kerumitan, tiada soal siasat panjang.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', left: '33px', top: '60px', bottom: '60px',
            width: '2px', background: 'rgba(253,224,71,0.2)',
            display: 'none', // hidden on small screens
          }} />

          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(253,224,71,0.2)',
              borderRadius: '18px', padding: '1.75rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              textAlign: 'left',
            }}>
              {/* Step badge */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDE047, #EAB308)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(234,179,8,0.3)',
                }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{s.icon}</span>
                </div>
                <div style={{
                  marginTop: '0.3rem', fontSize: '0.65rem', fontWeight: 900,
                  color: '#FDE047', letterSpacing: '0.05em',
                }}>
                  {s.num}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FDE047', marginBottom: '0.4rem' }}>
                  {s.title}
                </div>
                <p style={{ margin: '0', fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: s.desc }} />
                {s.note && (
                  <p style={{
                    margin: '0.5rem 0 0', fontSize: '0.82rem',
                    color: s.note.startsWith('✅') ? '#4ADE80' : '#FCA5A5',
                    fontWeight: 600,
                  }}>
                    {s.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '14px', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '0.85rem', alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>🔒</span>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65, textAlign: 'left' }}>
            Bayaran diproses dengan selamat oleh CHIP Payments (256-bit SSL).{' '}
            <strong style={{ color: '#4ADE80' }}>Maklumat anda tidak dikongsi dengan mana-mana pihak ketiga.</strong>
          </p>
        </div>

      </div>
    </section>
  );
}
