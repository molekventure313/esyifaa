'use client';

const POINTS = [
  { icon: '📖', text: 'Diisikan dengan ayat-ayat ruqyah Al-Quran, doa dan zikir pilihan' },
  { icon: '📿', text: '4 lapisan ayat ruqyah — Al-Fatihah, Ayat Kursi, Al-Falaq & An-Nas ditiupkan ke dalam garam' },
  { icon: '🧂', text: 'Garam himalaya asli 200g — bersifat semulajadi & digunakan dalam amalan ruqyah' },
  { icon: '🛡️', text: 'Bertindak sebagai ikhtiar perlindungan — usir sihir, saka, santau dari badan' },
  { icon: '💊', text: 'Bantu melegakan sakit urat, sengal badan & penyakit misteri secara rohani' },
  { icon: '🏠', text: 'Boleh diguna oleh seluruh ahli keluarga — sesuai untuk dewasa & kanak-kanak' },
];

export default function SabunSolutionSection({ solutionImage = null }) {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            🧼 Penyelesaian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.65rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Apa Itu Sabun Garam Himalaya Pengisian?
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#475569',
            lineHeight: 1.75,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Sabun Garam Himalaya Pengisian adalah sabun garam himalaya asli yang telah melalui proses{' '}
            <strong style={{ color: '#047857' }}>pengisian ruqyah syar&apos;iyyah</strong> oleh perawat
            ESyifaa — sama kaedah seperti air tawar dan minyak pengisian, tetapi dalam bentuk sabun mandian harian yang menyegarkan.
          </p>
        </div>

        {/* Solution Image — gambar atas, teks bawah */}
        {solutionImage && (
          <div style={{
            marginBottom: '2rem',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
            border: '2px solid #D1FAE5',
          }}>
            <img
              src={solutionImage}
              alt="Penyelesaian Sabun Garam Himalaya Pengisian ESyifaa"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Main explanation card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #D1FAE5',
          borderRadius: '18px',
          padding: '2.25rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.05)',
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '2.2rem',
              lineHeight: 1,
              padding: '0.75rem',
              background: '#ECFDF5',
              borderRadius: '14px',
              border: '1px solid #A7F3D0',
            }}>
              🧼
            </span>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', marginBottom: '0.4rem' }}>
                Bukan Sabun Mandian Biasa
              </div>
              <p style={{ margin: 0, fontSize: '0.94rem', color: '#475569', lineHeight: 1.7 }}>
                Sabun biasa hanya membersih secara luaran. Sabun Garam Himalaya Pengisian ESyifaa menggabungkan kebersihan{' '}
                <strong style={{ color: '#059669' }}>fizikal DAN rohani</strong> — setiap kali mandi,
                tenaga ayat ruqyah bertindak membantu membersihkan sisa gangguan sihir, saka dan santau dari badan anda, in shaa Allah.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#047857',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 1rem 0',
            }}>
              Apa Yang Terkandung Dalam Sabun Ini:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {POINTS.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.05rem', flexShrink: 0, marginTop: '2px' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quran dalil note */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #A7F3D0',
          borderRadius: '14px',
          padding: '1.5rem 1.75rem',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.04)',
        }}>
          <p style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#047857', fontWeight: 800 }}>
            وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65 }}>
            &ldquo;Dan Kami turunkan dari Al-Quran itu apa yang menjadi penawar dan rahmat bagi orang-orang yang beriman.&rdquo;
            <br /><span style={{ color: '#64748B', fontSize: '0.78rem' }}>(Surah Al-Isra&apos;: 82)</span>
          </p>
        </div>

      </div>
    </section>
  );
}
