'use client';

const AYAT = [
  {
    icon: '🔥',
    title: '1. Ayat Pembakar & Pemusnah Jin',
    desc: 'Surah As-Saffat, Al-Jinn, dan ayat-ayat azab yang membakar serta menghalau entiti jin kafir dan saka yang cuba mendiami jasad atau mengganggu fikiran.',
    borderColor: 'rgba(239,68,68,0.35)',
  },
  {
    icon: '✂️',
    title: '2. Ayat Pembatal Sihir & Pemutus Ikatan',
    desc: 'Surah Yunus (ayat 81-82), Surah Taha (ayat 69), dan Surah Al-A\'raf yang menghancurkan ikatan buhul sihir pemisah, sihir penutup jodoh dan sihir rezeki.',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  {
    icon: '🛡️',
    title: '3. Ayat Benteng & Dinding Pertahanan',
    desc: 'Ayat Kursi, Surah Al-Baqarah (ayat 1-5 & 284-286), serta Al-Mu\'awwidzat yang memancarkan benteng ghaib di sekeliling pemakai untuk menepis serangan berulang.',
    borderColor: 'rgba(74,222,128,0.35)',
  },
  {
    icon: '💚',
    title: '4. Ayat Kesembuhan & Ketenangan Jiwa',
    desc: 'Ayat-ayat Asy-Syifa\' yang melegakan ketegangan urat, membuang bisa angin dalam dada, dan mengembalikan kedamaian hati daripada rasa takut atau panik.',
    borderColor: 'rgba(52,211,153,0.35)',
  },
];

export default function PengisianHowItWorksSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#031E17',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(74, 222, 128, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            📖 Fungsi Elemen &amp; Tindak Balas
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Lapisan Ayat Ruqyah — Perlindungan Lengkap 360 Darjah
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto' }}>
            Bukan sekadar bacaan sepintas lalu — ini adalah gabungan 4 lapisan ayat ruqyah syar&apos;iyyah yang diwiridkan selama 3 hari berturut-turut untuk membakar, membatalkan, membentengi dan menyembuhkan secara serentak.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {AYAT.map((a, i) => (
            <div key={i} style={{
              background: '#042E23', border: `2px solid ${a.borderColor}`,
              borderRadius: '18px', padding: '1.6rem 1.4rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '1rem', lineHeight: 1.35 }}>
                {a.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                {a.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pelarasan callout */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid rgba(16,185,129,0.5)',
          borderRadius: '18px', padding: '1.75rem 2rem',
          boxShadow: '0 0 35px rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
          maxWidth: '840px', margin: '0 auto',
        }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>🔄</span>
          <div>
            <div style={{ fontWeight: 800, color: '#FEF3C7', fontSize: '1.12rem', marginBottom: '0.5rem' }}>
              Keistimewaan Utama: Pelarasan &amp; Pengisian Semula Setiap Minggu (Percuma)
            </div>
            <p style={{ margin: 0, color: '#D1FAE5', fontSize: '0.92rem', lineHeight: 1.7 }}>
              Kebanyakan air ruqyah atau mandian akan kehabisan khasiat apabila airnya habis.
              Namun dengan Pengisian E-Syifa&apos;, perawat kami akan menjalankan <strong style={{ color: '#FDE047' }}>pelarasan zikir secara automatik pada setiap minggu</strong> dari jauh. Tenaga ruqyah pada item anda sentiasa dicas pada tahap maksimum tanpa sebarang caj tambahan selamanya.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
