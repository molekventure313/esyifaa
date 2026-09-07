'use client';

const PROBLEMS = [
  { icon: '🌑', title: 'Gangguan Saka Turun-Temurun', desc: 'Penyakit yang berulang tanpa punca, diwarisi dalam keluarga, pemeriksaan perubatan tiada apa-apa.' },
  { icon: '🪢', title: 'Sihir & Santau Yang Dipukul', desc: 'Dikenakan oleh pihak tertentu — dihantar melalui makanan, minuman atau angin.' },
  { icon: '💢', title: 'Sakit Urat & Sendi Kronik', desc: 'Badan rasa kaku, urat tegang, sendi ngilu dan sakit berpindah-pindah tanpa punca jelas.' },
  { icon: '🫁', title: 'Sakit Badan Tanpa Sebab', desc: 'Badan rasa penat & berat seperti memikul beban walaupun baru bangun tidur.' },
  { icon: '🧩', title: 'Penyakit Misteri', desc: 'Simptom pelik yang berulang-ulang dan sukar sembuh dengan kaedah rawatan biasa.' },
  { icon: '😰', title: 'Emosi & Mental Terganggu', desc: 'Mudah marah, resah, panik, rasa seperti diperhatikan atau ada tekanan berat di dada.' },
];

export default function SabunProblemSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#061510',
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
            ⚠️ Adakah Anda Mengalami Ini?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Simptom Yang Mungkin Bukan Penyakit Biasa
          </h2>
          <p style={{ fontSize: '0.96rem', color: '#94A3B8', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Jika anda dah berulang-ulang berikhtiar secara fizikal tapi tiada perubahan —
            mungkin punca sebenarnya melibatkan rohani.
          </p>
        </div>

        {/* Problem grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#0D221B',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              padding: '1.4rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '1.6rem',
                flexShrink: 0,
                lineHeight: 1,
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }}>
                {p.icon}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F1F5F9', marginBottom: '0.3rem' }}>
                  {p.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.7 }}>
            Jika anda alami <strong style={{ color: '#FBBF24' }}>2 atau lebih</strong> dari simptom di atas —
            ada kemungkinan wujud gangguan rohani yang perlu ditangani dengan kaedah ruqyah syar&apos;iyyah.
          </p>
        </div>

      </div>
    </section>
  );
}
