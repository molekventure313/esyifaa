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
    desc: 'Sakit yang berpunca dari rohani tidak akan sembuh dengan ubat fizikal. Duit habis, tapi masalah tak selesai kerana punca tak dirawat.',
  },
  {
    icon: '🧠',
    title: 'Mental & Emosi Makin Terganggu',
    desc: 'Bisikan, keresahan, rasa panik, susah fokus — jika dibiarkan, boleh menjejaskan kerja, ibadah dan kehidupan harian.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Anak-Anak Turut Terkesan',
    desc: 'Gangguan dalam sesebuah keluarga boleh merebak kepada anak-anak. Anak mudah sakit, takut, meracau — tanda rumah ada masalah.',
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
    <section style={{ background: 'linear-gradient(180deg, #1A0A0A 0%, #2D0D0D 100%)', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
            color: '#FCA5A5', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ⚠️ Bahaya Jika Dibiarkan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Jangan Abaikan — Masalah Ini Boleh{' '}
            <span style={{ color: '#F87171' }}>Makin Teruk</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#FCA5A5', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto', opacity: 0.9 }}>
            Gangguan rohani seperti saka, sihir dan santau tidak akan pergi sendiri.
            Dibiarkan — ia akan terus melemahkan badan, jiwa dan keluarga anda.
          </p>
        </div>

        {/* Fears grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '14px', padding: '1.4rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.75rem', flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FEF3C7', marginBottom: '0.35rem' }}>
                  {f.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#FCA5A5', lineHeight: 1.55, opacity: 0.9 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Urgency note */}
        <div style={{
          padding: '1.4rem 1.75rem', textAlign: 'center',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px',
        }}>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: 800, color: '#FEF3C7' }}>
            🕌 Sabda Nabi ﷺ:
          </p>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#FEF3C7', lineHeight: 1.7, fontStyle: 'italic' }}>
            "Berubatlah kamu, kerana sesungguhnya Allah tidak menciptakan penyakit kecuali Dia juga menciptakan penawarnya."
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#FCA5A5', opacity: 0.8 }}>
            (HR. Abu Dawud & At-Tirmidzi)
          </p>
        </div>

      </div>
    </section>
  );
}
