'use client';

const PROBLEMS = [
  {
    icon: '💸',
    title: 'Habis Duit Setiap Kali Ada Gangguan',
    desc: 'RM200, RM300, RM500 setiap sesi rawatan. Setiap kali ada masalah baru — kena bayar lagi. Dah habis ribuan ringgit, tapi gangguan masih belum selesai.',
  },
  {
    icon: '⏳',
    title: 'Kena Tunggu Slot Perawat — Kadang Berhari-Hari',
    desc: 'Perawat sibuk, ada queue panjang. Anda kena tunggu 3, 5, 7 hari sebelum boleh berjumpa. Sementara itu, anda dan keluarga terdedah kepada gangguan.',
  },
  {
    icon: '🔄',
    title: 'Masalah Berulang — Tiada Perlindungan Antara Sesi',
    desc: 'Selesai rawatan, rasa lega. Tapi bila balik rumah — jin datang balik. Sihir dihantar semula. Sebab tiada perlindungan berterusan antara sesi rawatan.',
  },
  {
    icon: '😰',
    title: 'Bila Perawat Unavailable — Anda Terkapai-Kapai',
    desc: 'Serangan datang tengah malam. Perawat tiada. Cuti, sakit, atau sibuk. Anda terpaksa tahan seorang diri tanpa ada bantuan atau alat perlindungan.',
  },
  {
    icon: '📉',
    title: 'Bergantung Sepenuhnya Pada Orang Lain',
    desc: 'Setiap keputusan — kena tanya perawat. Setiap masalah — kena tunggu perawat. Anda tidak berdaya untuk lindungi diri dan keluarga sendiri.',
  },
];

export default function RawatSendiriProblemSection() {
  return (
    <section style={{
      background: '#0B382D', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FCA5A5',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ⚠️ Masalah Sebenar
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          5 Perkara Yang Berlaku Bila Anda{' '}
          <span style={{ color: '#FDE047' }}>Bergantung Sepenuhnya Pada Perawat</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '680px', margin: '0 auto 2.5rem auto',
        }}>
          Bergantung pada perawat bukan salah. Tapi ia tidak boleh jadi satu-satunya penyelesaian —
          terutama untuk kes berulang yang memerlukan perlindungan berterusan.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem', textAlign: 'left',
        }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '14px', padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Number badge */}
              <div style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 900, color: '#FDE047',
              }}>
                {i + 1}
              </div>

              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
              <div style={{
                fontWeight: 800, color: '#FCA5A5',
                marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3,
                paddingRight: '2rem',
              }}>
                {p.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div style={{
          marginTop: '2.5rem',
          background: 'rgba(253,224,71,0.07)',
          border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '14px', padding: '1.5rem 2rem',
          maxWidth: '680px', margin: '2.5rem auto 0',
        }}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
            💡 Ada penyelesaian yang lebih baik —{' '}
            <span style={{ color: '#FDE047' }}>bukan berhenti pergi perawat, tapi berhenti bergantung sepenuhnya.</span>
            {' '}Dengan pengisian E-Syifa&apos;, anda boleh rawat sendiri, lindungi keluarga, dan tidak perlu tunggu sesiapa.
          </p>
        </div>

      </div>
    </section>
  );
}
