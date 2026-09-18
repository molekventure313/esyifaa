'use client';

const PROBLEMS = [
  {
    icon: '⚡',
    title: 'Cepat Melenting & Panas Baran',
    desc: 'Benda kecil pun boleh jadi punca pergaduhan besar. Bercakap sepatah dua mesti berakhir dengan herdikan, sindiran atau hempas pintu.',
  },
  {
    icon: '👀',
    title: 'Bertentang Mata Rasa Benci & Meluat',
    desc: 'Bila pandang muka pasangan, rasa panas hati dan menyampah tanpa sebab yang jelas. Hilang rasa kasih, sentuhan dan nafkah batin dingin berbulan-bulan.',
  },
  {
    icon: '🔄',
    title: 'Pasangan Berubah 180° Secara Tiba-tiba',
    desc: 'Dulu seorang yang sangat penyayang dan bertanggungjawab, kini jadi pemarah, kerap mengelak, suka keluar rumah dan dingin terhadap anak isteri.',
  },
  {
    icon: '💔',
    title: 'Ancaman Orang Ketiga & Sihir Pemisah',
    desc: 'Pasangan mudah terpikat dan tunduk pada orang luar. Hatinya seperti diikat sehingga sanggup mengabaikan rumahtangga yang dibina bertahun-tahun.',
  },
  {
    icon: '🛑',
    title: 'Pasangan Ego & Tolak Keras Ajakan Berubat',
    desc: 'Bila diajak jumpa perawat atau ustaz, pasangan mengamuk dan menuduh anda yang mereka-reka cerita. Anda tersepit dan tak tahu nak buat apa lagi.',
  },
  {
    icon: '🏠',
    title: 'Suasana Rumah Sentiasa Muram & Panas',
    desc: 'Masuk saja ke dalam rumah, dada terasa sempit dan berat. Tiada gelak tawa, anak-anak jadi mangsa tempat melepaskan amarah dan tekanan.',
  },
];

export default function GaramProblemSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFDFB',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            😟 Anda Sedang Alami Situasi Ini?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Hati Yang Panas, Rumahtangga Yang Makin Retak..{' '}
            <span style={{ color: '#DC2626' }}>Setiap Hari Penuh Air Mata</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Jangan anggap ia sekadar masalah salah faham biasa. Apabila rumahtangga tiba-tiba retak tanpa punca munasabah, seringkali ada pengaruh sihir pemisah atau gangguan Jin Dasim yang sedang meracuni hati pasangan anda.
          </p>
        </div>

        {/* Problems Grid (3x2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {PROBLEMS.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #F1F5F9',
                borderRadius: '18px',
                padding: '1.6rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{
                fontSize: '1.6rem',
                flexShrink: 0,
                width: '48px',
                height: '48px',
                background: '#FEF2F2',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FEE2E2',
              }}>
                {p.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: '#0F172A',
                  marginBottom: '0.35rem',
                  lineHeight: 1.35
                }}>
                  {p.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Footnote */}
        <div style={{
          background: '#FFF1F2',
          border: '1.5px solid #FECDD3',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          maxWidth: '740px',
          margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#9F1239', lineHeight: 1.6, fontWeight: 600 }}>
            ⚠️ <em>&ldquo;Yang paling menyakitkan ialah bila kita cuba berlembut, pasangan makin memijak. Bila kita ajak berubat, dia menolak mentah-mentah.&rdquo;</em>
          </p>
        </div>

      </div>
    </section>
  );
}
