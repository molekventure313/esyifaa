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
    desc: 'Gangguan jin boleh merosakkan kasih sayang antara suami isteri. Pertengkaran berulang dan rasa benci tanpa sebab adalah antara tanda jelas.',
  },
  {
    icon: '🩺',
    title: 'Bergantung Ubat Selamanya',
    desc: 'Sakit yang berpunca dari rohani tidak akan selesai dengan rawatan fizikal semata-mata. Duit habis, tapi kesembuhan belum kunjung tiba.',
  },
  {
    icon: '🧠',
    title: 'Mental & Emosi Makin Terganggu',
    desc: 'Bisikan, keresahan, rasa panik dan susah fokus — jika dibiarkan, boleh menjejaskan kerjaya, ibadah dan kehidupan harian.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Anak-Anak Turut Terkesan',
    desc: 'Gangguan dalam rumah tangga boleh merebak kepada anak-anak. Anak mudah jatuh sakit, takut dan kerap meracau malam.',
  },
  {
    icon: '⏳',
    title: 'Masa Terus Berlalu Tanpa Penyelesaian',
    desc: 'Setiap hari tanpa rawatan adalah hari gangguan terus melemahkan anda. Bertangguh bererti memberi peluang untuk masalah bertambah parah.',
  },
];

export default function SabunFearsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#E11D48',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚠️ Bahaya Jika Dibiarkan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Jangan Abaikan — Masalah Ini Boleh{' '}
            <span style={{ color: '#E11D48' }}>Makin Melarat</span>
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '580px',
            margin: '0 auto',
          }}>
            Gangguan rohani seperti saka, sihir dan santau tidak akan hilang sendiri.
            Jika dibiarkan berlarutan, ia boleh menjejaskan keharmonian hidup anda sekeluarga.
          </p>
        </div>

        {/* Fears grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.1rem',
          marginBottom: '2rem',
        }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.4rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}>
              <span style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                lineHeight: 1,
                padding: '0.5rem',
                background: '#FFF1F2',
                borderRadius: '12px',
              }}>
                {f.icon}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0F172A', marginBottom: '0.3rem' }}>
                  {f.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith note */}
        <div style={{
          padding: '1.5rem 1.75rem',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '14px',
          maxWidth: '720px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}>
          <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.86rem', fontWeight: 700, color: '#047857' }}>
            Sabda Nabi ﷺ:
          </p>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#1E293B', lineHeight: 1.7, fontStyle: 'italic' }}>
            &ldquo;Berubatlah kamu, kerana sesungguhnya Allah tidak menciptakan penyakit kecuali Dia juga menciptakan penawarnya.&rdquo;
          </p>
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>
            (HR. Abu Dawud & At-Tirmidzi)
          </p>
        </div>

      </div>
    </section>
  );
}
