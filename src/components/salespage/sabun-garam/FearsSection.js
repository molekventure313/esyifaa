'use client';

const FEARS = [
  {
    icon: '📈',
    title: 'Gangguan Makin Mengakar',
    desc: 'Sihir, saka dan santau yang dibiarkan semakin kuat bertapak. Makin lama dibiarkan, makin dalam ia mengikat tubuh dan jiwa.',
  },
  {
    icon: '💔',
    title: 'Hubungan Rumahtangga Retak',
    desc: 'Gangguan jin boleh rosakkan rasa kasih sayang antara suami isteri. Pertengkaran berulang, rasa benci tanpa sebab — semua ini tanda gangguan.',
  },
  {
    icon: '🩺',
    title: 'Bergantung Ubat Selamanya',
    desc: 'Sakit yang berpunca dari rohani tidak akan sembuh dengan ubat fizikal semata-mata. Duit habis, tapi masalah tak selesai kerana punca sebenar tak dirawat.',
  },
  {
    icon: '🧠',
    title: 'Mental & Emosi Makin Terganggu',
    desc: 'Bisikan, keresahan, rasa panik, susah fokus — jika dibiarkan, boleh menjejaskan kerja, ibadah dan kehidupan harian.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Anak-Anak Turut Terkesan',
    desc: 'Gangguan dalam sesebuah keluarga boleh merebak kepada anak-anak. Anak mudah sakit, takut, meracau — tanda rumah perlu perlindungan.',
  },
  {
    icon: '⏳',
    title: 'Masa Terus Berlalu Tanpa Penyelesaian',
    desc: 'Setiap hari tanpa rawatan adalah hari gangguan terus melemahkan anda. Bertangguh bererti memberi lebih banyak masa untuk masalah membesar.',
  },
];

export default function SabunFearsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#081C15',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#FB7185',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚠️ Bahaya Jika Dibiarkan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Jangan Abaikan — Masalah Ini Boleh{' '}
            <span style={{ color: '#FB7185' }}>Makin Melarat</span>
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Gangguan rohani seperti saka, sihir dan santau tidak akan pergi sendiri.
            Jika dibiarkan berlarutan, ia boleh melemahkan kualiti hidup anda dan keluarga.
          </p>
        </div>

        {/* Fears grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: '#0D221B',
              border: '1px solid rgba(244, 63, 94, 0.12)',
              borderRadius: '14px',
              padding: '1.4rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                lineHeight: 1,
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }}>
                {f.icon}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F1F5F9', marginBottom: '0.3rem' }}>
                  {f.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith note — clean subtle luxury */}
        <div style={{
          padding: '1.5rem 1.75rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          maxWidth: '720px',
          margin: '0 auto',
        }}>
          <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.88rem', fontWeight: 700, color: '#FBBF24' }}>
            Sabda Nabi ﷺ:
          </p>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.94rem', color: '#E2E8F0', lineHeight: 1.7, fontStyle: 'italic' }}>
            &ldquo;Berubatlah kamu, kerana sesungguhnya Allah tidak menciptakan penyakit kecuali Dia juga menciptakan penawarnya.&rdquo;
          </p>
          <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>
            (HR. Abu Dawud & At-Tirmidzi)
          </p>
        </div>

      </div>
    </section>
  );
}
