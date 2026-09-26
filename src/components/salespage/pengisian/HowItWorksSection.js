'use client';

const AYAT = [
  {
    icon: '🔥',
    title: '1. Ayat Pembakar & Pemusnah Jin',
    desc: 'Surah As-Saffat, Al-Jinn, dan ayat-ayat azab yang membakar serta menghalau entiti jin kafir dan saka yang cuba mendiami jasad atau mengganggu fikiran.',
    accentColor: '#DC2626',
    bgColor: '#FEF2F2',
  },
  {
    icon: '✂️',
    title: '2. Ayat Pembatal Sihir & Pemutus Ikatan',
    desc: 'Surah Yunus (ayat 81-82), Surah Taha (ayat 69), dan Surah Al-A\'raf yang menghancurkan ikatan buhul sihir pemisah, sihir penutup jodoh dan sihir rezeki.',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
  },
  {
    icon: '🛡️',
    title: '3. Ayat Benteng & Dinding Pertahanan',
    desc: 'Ayat Kursi, Surah Al-Baqarah (ayat 1-5 & 284-286), serta Al-Mu\'awwidzat yang memancarkan benteng ghaib di sekeliling pemakai untuk menepis serangan berulang.',
    accentColor: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    icon: '💚',
    title: '4. Ayat Kesembuhan & Ketenangan Jiwa',
    desc: 'Ayat-ayat Asy-Syifa\' yang melegakan ketegangan urat, membuang bisa angin dalam dada, dan mengembalikan kedamaian hati daripada rasa takut atau panik.',
    accentColor: '#0284C7',
    bgColor: '#F0F9FF',
  },
];

export default function PengisianHowItWorksSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F0FDF4',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            📖 Fungsi Elemen &amp; Tindak Balas
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#064E3B',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Lapisan Ayat Ruqyah — Perlindungan Lengkap 360 Darjah
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto' }}>
            Bukan sekadar bacaan sepintas lalu — ini adalah gabungan 4 lapisan ayat ruqyah syar&apos;iyyah yang diwiridkan untuk membakar, membatalkan, membentengi dan menyembuhkan secara serentak.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {AYAT.map((a, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: `2px solid ${a.bgColor === '#FEF2F2' ? '#FECACA' : a.bgColor === '#FFFBEB' ? '#FDE68A' : a.bgColor === '#ECFDF5' ? '#A7F3D0' : '#BAE6FD'}`,
              borderRadius: '18px', padding: '1.75rem 1.4rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '14px',
                background: a.bgColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1rem',
              }}>{a.icon}</div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.05rem', lineHeight: 1.35 }}>
                {a.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65 }}>
                {a.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pelarasan callout (Clean Light Card) */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #10B981',
          borderRadius: '20px', padding: '1.8rem 2.2rem',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.12)',
          display: 'flex', alignItems: 'flex-start', gap: '1.35rem',
          maxWidth: '860px', margin: '0 auto', textAlign: 'left',
        }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>🔄</span>
          <div>
            <div style={{ fontWeight: 900, color: '#064E3B', fontSize: '1.15rem', marginBottom: '0.45rem' }}>
              Keistimewaan Utama: Pelarasan &amp; Pengisian Semula Setiap Minggu (Percuma Selagi Perawat Masih Hidup)
            </div>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.94rem', lineHeight: 1.75 }}>
              Kebanyakan air ruqyah atau mandian akan kehabisan khasiat apabila airnya habis.
              Namun dengan Pengisian E-Syifa&apos;, perawat kami akan menjalankan <strong style={{ color: '#047857' }}>pelarasan zikir secara automatik pada setiap minggu</strong> dari jauh. Tenaga ruqyah pada item anda sentiasa dicas pada tahap maksimum tanpa sebarang caj tambahan selagi perawat masih hidup.
            </p>
            <p style={{ margin: '0.65rem 0 0 0', fontSize: '0.76rem', color: '#64748B', fontStyle: 'italic' }}>
              *Tertakluk pada Terma &amp; Syarat
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
