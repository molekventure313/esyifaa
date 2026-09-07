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
      background: '#FFFFFF',
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
            color: '#BE123C',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚠️ Adakah Anda Mengalami Ini?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Simptom Yang Mungkin Bukan Penyakit Biasa
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#64748B', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto' }}>
            Jika anda dah berulang-ulang berikhtiar secara fizikal tapi tiada perubahan —
            mungkin punca sebenarnya melibatkan rohani.
          </p>
        </div>

        {/* Problem grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.1rem',
        }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.4rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}>
              <span style={{
                fontSize: '1.6rem',
                flexShrink: 0,
                lineHeight: 1,
                padding: '0.5rem',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}>
                {p.icon}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0F172A', marginBottom: '0.3rem' }}>
                  {p.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
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
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#92400E', lineHeight: 1.7 }}>
            Jika anda alami <strong style={{ color: '#B45309' }}>2 atau lebih</strong> dari simptom di atas —
            ada kemungkinan wujud gangguan rohani yang perlu ditangani dengan kaedah ruqyah syar&apos;iyyah.
          </p>
        </div>

      </div>
    </section>
  );
}
