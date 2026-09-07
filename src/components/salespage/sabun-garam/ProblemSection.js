'use client';

const PROBLEMS = [
  { icon: '🌑', title: 'Gangguan Saka Turun-Temurun', desc: 'Penyakit yang berulang tanpa punca, diwarisi dalam keluarga, doktor tak jumpa apa-apa.' },
  { icon: '🪢', title: 'Sihir & Santau Yang Dipukul', desc: 'Dikenakan oleh musuh atau orang terdekat — makan, minum atau melalui angin.' },
  { icon: '💢', title: 'Sakit Urat & Sendi Kronik', desc: 'Badan rasa kaku, urat sakit, sendi berbunyi, sakit berpindah-pindah walaupun dah jumpa doktor.' },
  { icon: '🫁', title: 'Sakit Badan Tanpa Sebab', desc: 'Badan rasa penat & berat walaupun baru bangun tidur. Doktor kata tiada masalah.' },
  { icon: '🧩', title: 'Penyakit Misteri', desc: 'Simptom pelik yang tak logik, berulang-ulang, rawatan perubatan tiada kesan.' },
  { icon: '😰', title: 'Emosi & Mental Terganggu', desc: 'Mudah marah, sedih, panik, rasa ada yang ikut atau rasa tekanan yang berat di kepala & dada.' },
];

export default function SabunProblemSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#042E23', padding: '4rem 1rem',
      fontFamily: ff,
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ⚠️ Adakah Anda Mengalami Ini?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Simptom Yang Mungkin Bukan Penyakit Biasa
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Jika anda dah berulang-ulang jumpa doktor tapi keadaan tak berubah —
            mungkin punca sebenarnya bukan fizikal.
          </p>
        </div>

        {/* Problem grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '14px', padding: '1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>{p.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FEF3C7', marginBottom: '0.3rem' }}>
                  {p.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0', lineHeight: 1.55 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: '2rem', padding: '1.25rem 1.5rem', textAlign: 'center',
          background: 'rgba(253,224,71,0.06)', border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '14px',
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#FEF3C7', lineHeight: 1.7 }}>
            Jika anda alami <strong style={{ color: '#FDE047' }}>2 atau lebih</strong> dari simptom di atas —
            ada kemungkinan ada gangguan rohani yang perlu ditangani dengan kaedah ruqyah syar&apos;iyyah.
          </p>
        </div>

      </div>
    </section>
  );
}
