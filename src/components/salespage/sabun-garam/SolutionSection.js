'use client';

const POINTS = [
  { icon: '📖', text: 'Diisikan dengan ayat-ayat ruqyah Al-Quran, doa dan zikir pilihan' },
  { icon: '🔄', text: 'Proses pengisian selama 3 hari berturut-turut oleh perawat ESyifaa' },
  { icon: '🧂', text: 'Garam himalaya asli 200g — bersifat semulajadi & digunakan dalam amalan ruqyah' },
  { icon: '🛡️', text: 'Bertindak sebagai ikhtiar perlindungan — usir sihir, saka, santau dari badan' },
  { icon: '💊', text: 'Bantu melegakan sakit urat, sengal badan & penyakit misteri secara rohani' },
  { icon: '🏠', text: 'Boleh diguna oleh seluruh ahli keluarga — sesuai untuk dewasa & kanak-kanak' },
];

export default function SabunSolutionSection() {
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
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#FBBF24',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🧼 Penyelesaian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Apa Itu Sabun Garam Himalaya Pengisian?
          </h2>
          <p style={{
            fontSize: '0.96rem',
            color: '#94A3B8',
            lineHeight: 1.75,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Sabun Garam Himalaya Pengisian adalah sabun garam himalaya asli yang telah melalui proses{' '}
            <span style={{ color: '#FBBF24', fontWeight: 600 }}>pengisian ruqyah syar&apos;iyyah</span> oleh perawat
            ESyifaa — sama kaedah seperti air tawar dan minyak pengisian, tetapi dalam bentuk sabun mandi harian.
          </p>
        </div>

        {/* Main explanation card */}
        <div style={{
          background: '#0D221B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '2rem 1.75rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '2rem',
              lineHeight: 1,
              padding: '0.65rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
            }}>
              🧼
            </span>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#F8FAFC', marginBottom: '0.4rem' }}>
                Bukan Sabun Mandian Biasa
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.7 }}>
                Sabun biasa hanya membersih secara luaran. Sabun Garam Himalaya Pengisian ESyifaa menggabungkan kebersihan{' '}
                <strong style={{ color: '#34D399' }}>fizikal DAN rohani</strong> — setiap kali mandi,
                tenaga ruqyah bertindak membantu membersihkan kesan sihir, saka dan santau dari badan anda, in shaa Allah.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem' }}>
            <p style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#FBBF24',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 1rem 0',
            }}>
              Apa Yang Terkandung Dalam Sabun Ini:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {POINTS.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.05rem', flexShrink: 0, marginTop: '2px' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.55 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quran dalil note */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '14px',
          padding: '1.5rem 1.75rem',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
        }}>
          <p style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: '#34D399', fontWeight: 700 }}>
            وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ
          </p>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8', lineHeight: 1.65 }}>
            &ldquo;Dan Kami turunkan dari Al-Quran itu apa yang menjadi penawar dan rahmat bagi orang-orang yang beriman.&rdquo;
            <br /><span style={{ color: '#64748B', fontSize: '0.76rem' }}>(Surah Al-Isra&apos;: 82)</span>
          </p>
        </div>

      </div>
    </section>
  );
}
