'use client';

const FEARS = [
  {
    emoji: '😔',
    fear: '"Kalau perawat tiada, apa nak jadi dengan kami?"',
    desc: 'Bergantung pada satu orang untuk seluruh keselamatan keluarga adalah risiko besar. Bila perawat sakit, cuti atau bersara — anda terbiar.',
  },
  {
    emoji: '💸',
    fear: '"Entah berapa lagi duit yang kena habis sebelum sembuh..."',
    desc: 'Dah habis RM3,000... RM5,000... RM10,000. Tapi kes masih belum selesai. Tak tahu sampai bila perlu terus bayar untuk sesuatu yang tiada penghujung.',
  },
  {
    emoji: '🌙',
    fear: '"Tengah malam kena serang, tiada apa boleh buat."',
    desc: 'Perawat tidak boleh dihubungi waktu itu. Tiada air penawar. Tiada perlindungan. Terpaksa tahan sendiri sambil menunggu pagi.',
  },
  {
    emoji: '👧',
    fear: '"Anak-anak terdedah bila aku tiada daya nak lindungi."',
    desc: 'Gangguan boleh menyerang sesiapa dalam keluarga — termasuk anak-anak yang tidak berdaya. Tanpa perlindungan berterusan, mereka mudah disasarkan.',
  },
];

export default function RawatSendiriFearsSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #031E17 100%)',
      color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.3)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            💭 Adakah Ini Fikiran Anda?
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.25,
            marginTop: '0.4rem', marginBottom: '0.75rem',
          }}>
            Ketakutan Yang Dihadapi Mereka Yang{' '}
            <span style={{ color: '#FDE047' }}>Masih Bergantung Pada Perawat</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '600px', margin: '0 auto' }}>
            Kalau pernah terfikir perkara di bawah — anda tidak keseorangan.
            Ramai pesakit ESyifaa pernah berada di tempat yang sama.
          </p>
        </div>

        {/* Fear cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(253,224,71,0.15)',
              borderLeft: '4px solid #FDE047',
              borderRadius: '0 14px 14px 0',
              padding: '1.5rem 1.75rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '2.2rem', flexShrink: 0, lineHeight: 1,
                filter: 'grayscale(20%)',
              }}>{f.emoji}</span>
              <div>
                <p style={{
                  margin: '0 0 0.5rem',
                  fontSize: '1rem', fontWeight: 800,
                  color: '#FDE047', lineHeight: 1.4,
                  fontStyle: 'italic',
                }}>
                  {f.fear}
                </p>
                <p style={{
                  margin: 0, fontSize: '0.875rem',
                  color: '#D1FAE5', lineHeight: 1.65,
                }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div style={{
          marginTop: '2.5rem', textAlign: 'center',
          background: 'rgba(74,222,128,0.07)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '16px', padding: '2rem 1.5rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
          <p style={{
            margin: 0, fontSize: '1.05rem', color: '#FEF3C7',
            fontWeight: 700, lineHeight: 1.65, maxWidth: '560px', marginInline: 'auto',
          }}>
            Pengisian E-Syifa&apos; bukan pengganti perawat —{' '}
            <span style={{ color: '#4ADE80' }}>ia adalah kuasa perlindungan yang anda miliki sendiri.</span>
            {' '}Perawat tetap ada bila diperlukan. Tapi kini anda tidak perlu bergantung sepenuhnya.
          </p>
        </div>

      </div>
    </section>
  );
}
