'use client';

const POINTS = [
  { icon: '📖', text: 'Diisikan dengan ayat-ayat ruqyah Al-Quran, doa dan zikir pilihan' },
  { icon: '🔄', text: 'Proses pengisian selama 3 hari berturut-turut oleh perawat ESyifaa' },
  { icon: '🧂', text: 'Garam himalaya asli 200g — bersifat semulajadi & digunakan dalam ruqyah tradisi' },
  { icon: '🛡️', text: 'Bertindak sebagai "perisai" semasa mandi — usir sihir, saka, santau dari badan' },
  { icon: '💊', text: 'Bantu sembuhkan sakit urat, sakit badan & penyakit misteri secara rohani' },
  { icon: '🏠', text: 'Boleh diguna oleh seluruh ahli keluarga — sesuai untuk dewasa & kanak-kanak' },
];

export default function SabunSolutionSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #031E17 0%, #042E23 100%)',
      padding: '4rem 1rem', fontFamily: ff,
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(253,224,71,0.1)',
            border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            🧼 Penyelesaian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Apa Itu Sabun Garam Himalaya Pengisian?
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.75, maxWidth: '640px', margin: '0 auto' }}>
            Sabun Garam Himalaya Pengisian adalah sabun garam himalaya asli yang telah melalui proses
            <strong style={{ color: '#FDE047' }}> pengisian ruqyah syar&apos;iyyah</strong> oleh perawat
            ESyifaa — sama kaedah seperti air tawar dan minyak pengisian, tetapi dalam bentuk sabun mandi.
          </p>
        </div>

        {/* Main explanation card */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #042E23 100%)',
          border: '2px solid rgba(253,224,71,0.35)', borderRadius: '20px',
          padding: '2.25rem 2rem', marginBottom: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>🧼</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FDE047', marginBottom: '0.4rem' }}>
                Bukan Sabun Biasa
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                Sabun biasa hanya bersih secara fizikal. Sabun Garam Himalaya Pengisian ESyifaa bersih
                secara <strong style={{ color: '#FDE047' }}>fizikal DAN rohani</strong> — setiap kali anda mandi,
                tenaga ruqyah bertindak membasuh sihir, saka dan santau dari badan anda in shaa Allah.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(253,224,71,0.2)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
              Apa Yang Ada Dalam Sabun Ini:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
              {POINTS.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>{p.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.5 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quran dalil note */}
        <div style={{
          background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '14px', padding: '1.25rem 1.5rem', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', color: '#FDE047', fontWeight: 800 }}>
            وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0', lineHeight: 1.6 }}>
            &ldquo;Dan Kami turunkan dari Al-Quran itu apa yang menjadi ubat penawar dan rahmat bagi orang-orang yang beriman.&rdquo;
            <br /><em style={{ color: '#6EE7B7', fontSize: '0.78rem' }}>(Surah Al-Isra&apos;: 82)</em>
          </p>
        </div>

      </div>
    </section>
  );
}
