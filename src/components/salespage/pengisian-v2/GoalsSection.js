'use client';

const GOALS = [
  {
    icon: '🛡️',
    title: 'Rawat Diri Sendiri Bila-Bila Masa',
    desc: 'Tengah malam ada rasa tak kena? Ambil item pengisian, baca Al-Fatihah, letakkan pada badan. Tiada perlu tunggu perawat. Tiada perlu PM sesiapa.',
    highlight: false,
  },
  {
    icon: '👪',
    title: 'Lindungi Seluruh Keluarga — Suami, Isteri, Anak-Anak',
    desc: 'Satu item pengisian boleh digunakan untuk merawat dan melindungi semua ahli keluarga. Anda jadi "ketua perlindungan" dalam rumah anda sendiri.',
    highlight: true,
  },
  {
    icon: '🏠',
    title: 'Rumah Terlindung 24/7',
    desc: 'Dengan air tawar yang anda buat sendiri dari item pengisian, rumah anda sentiasa terlindung. Jin tidak mudah masuk. Sihir tidak mudah menembusi.',
    highlight: false,
  },
  {
    icon: '💰',
    title: 'Jimat Ribuan Ringgit Jangka Panjang',
    desc: 'RM90 sekali sahaja. Selepas itu — rawatan tanpa had, seumur hidup. Bandingkan dengan RM200-RM500 setiap kali berjumpa perawat. Penjimatan besar.',
    highlight: true,
  },
  {
    icon: '🤲',
    title: 'Rasa Berdaya — Tidak Lagi Helpless',
    desc: 'Ada saat kita rasa helpless apabila diserang tapi tiada siapa boleh tolong. Dengan pengisian sendiri, anda tahu ada sesuatu yang boleh anda buat.',
    highlight: false,
  },
];

export default function RawatSendiriGoalsSection() {
  return (
    <section style={{
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#4ADE80',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ✨ Bayangkan Ini...
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.25,
            marginTop: '0.4rem', marginBottom: '0.75rem',
          }}>
            Apa Yang Berlaku Bila Anda{' '}
            <span style={{ color: '#FDE047' }}>Ada Pengisian E-Syifa&apos; Sendiri</span>
          </h2>
          <p style={{
            fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65,
            maxWidth: '600px', margin: '0 auto',
          }}>
            Ini bukan impian. Ini realiti pesakit-pesakit ESyifaa yang sudah ada item pengisian.
          </p>
        </div>

        {/* Goals grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem',
        }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: g.highlight
                ? 'linear-gradient(135deg, rgba(253,224,71,0.08) 0%, rgba(253,224,71,0.04) 100%)'
                : 'rgba(255,255,255,0.03)',
              border: g.highlight
                ? '1.5px solid rgba(253,224,71,0.35)'
                : '1px solid rgba(74,222,128,0.15)',
              borderRadius: '16px', padding: '1.5rem',
              position: 'relative',
            }}>
              {g.highlight && (
                <div style={{
                  position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                  background: '#FDE047', color: '#042E23', fontSize: '0.65rem',
                  fontWeight: 800, padding: '0.15rem 0.75rem', borderRadius: '0 0 8px 8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Paling Popular
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  fontSize: '1.75rem', flexShrink: 0,
                  background: g.highlight ? 'rgba(253,224,71,0.12)' : 'rgba(74,222,128,0.08)',
                  borderRadius: '12px', padding: '0.5rem',
                  display: 'inline-flex', lineHeight: 1,
                }}>
                  {g.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3,
                    color: g.highlight ? '#FDE047' : '#4ADE80',
                    marginBottom: '0.5rem',
                  }}>
                    {g.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                    {g.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial mini quote */}
        <div style={{
          marginTop: '2.5rem', textAlign: 'center',
          background: 'rgba(253,224,71,0.06)',
          border: '1px solid rgba(253,224,71,0.2)',
          borderRadius: '16px', padding: '2rem 1.5rem',
          maxWidth: '680px', margin: '2.5rem auto 0',
        }}>
          <span style={{ fontSize: '2rem' }}>💬</span>
          <p style={{
            margin: '0.75rem 0 0.5rem', fontSize: '1rem',
            color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65,
            fontStyle: 'italic',
          }}>
            &ldquo;Sejak ada item pengisian ni, kami tak rasa helpless dah.
            Kalau ada apa-apa, kami tahu apa nak buat.
            Perawat tetap ada, tapi kami dah tak bergantung sepenuhnya.&rdquo;
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600 }}>
            — Pelanggan ESyifaa, Selangor
          </p>
        </div>

      </div>
    </section>
  );
}
