'use client';

export default function PengisianExpertSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F0FDF4',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#FFFFFF', border: '1.5px solid #86EFAC',
          padding: '0.4rem 1.15rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.8rem', fontWeight: 800, color: '#065F46',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
        }}>
          📖 Sandaran Syarak &amp; Kredibiliti Perawat
        </div>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
          fontWeight: 900, color: '#064E3B',
          marginTop: '0.3rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Konsep Membaca Pada Objek — Amalan Sah Dituntun Al-Quran &amp; Sunnah
        </h2>

        <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '740px', margin: '0 auto 2.75rem auto' }}>
          Kaedah &ldquo;pengisian&rdquo; atau meniupkan doa ruqyah pada sesuatu medium fizikal adalah amalan masyhur ulama mu&apos;tabar.
          Ia diqiaskan kepada amalan meniup dan membaca pada air minuman, minyak zaitun, pakaian dan debu tanah yang sabit dalam hadis-hadis sahih.
        </p>

        {/* Dalil cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {[
            {
              arabic: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
              terjemah: '"Dan Kami turunkan dari Al-Quran sesuatu yang menjadi penawar (syifa\') dan rahmat bagi orang-orang yang beriman."',
              sumber: 'Surah Al-Isra\' (17:82)',
            },
            {
              arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
              terjemah: '"Dan apabila aku sakit, Dialah (Allah) yang menyembuhkan aku."',
              sumber: 'Surah Asy-Syu\'ara (26:80)',
            },
          ].map((d, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '2px solid #86EFAC',
              borderRadius: '18px', padding: '1.8rem 1.6rem', textAlign: 'right',
              boxShadow: '0 4px 15px rgba(5, 150, 105, 0.06)',
            }}>
              <div style={{
                fontSize: '1.3rem', fontFamily: 'serif',
                color: '#065F46', lineHeight: 2.3, marginBottom: '1rem', direction: 'rtl',
                fontWeight: 700,
              }}>
                {d.arabic}
              </div>
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.92rem', color: '#1E293B', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {d.terjemah}
                </p>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 800 }}>
                  {d.sumber}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith Keharusan Ruqyah */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #6EE7B7',
          borderRadius: '16px', padding: '1.6rem 2rem', marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}>
          <span style={{ fontSize: '1.8rem' }}>🕌</span>
          <p style={{ margin: '0.6rem 0 0.4rem 0', fontSize: '1.05rem', color: '#0F172A', fontStyle: 'italic', lineHeight: 1.75, fontWeight: 600 }}>
            &ldquo;Tunjukkan ruqyah-ruqyah kalian kepadaku. Tiada mengapa dengan ruqyah selama tidak mengandungi syirik di dalamnya.&rdquo;
          </p>
          <span style={{ fontSize: '0.84rem', color: '#047857', fontWeight: 800 }}>
            — Hadith Riwayat Sahih Muslim (No. 2200)
          </span>
        </div>

        {/* Penegasan Bebas Syirik & Tangkal */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderLeft: '5px solid #065F46',
          borderRadius: '16px', padding: '1.6rem 1.8rem', textAlign: 'left',
          display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        }}>
          <span style={{ fontSize: '2.2rem', flexShrink: 0 }}>🛡️</span>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', color: '#064E3B', fontSize: '1.08rem', fontWeight: 900 }}>
              Jaminan Syarak: 100% Bersih Dari Khodam, Jin &amp; Tangkal Wafaq
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#334155', lineHeight: 1.75 }}>
              Pusat Rawatan ESyifaa berpegang teguh pada manhaj Ahli Sunnah Wal Jamaah.
              Proses pengisian dijalankan melalui solat hajat, zikir khusus dan bacaan ayat-ayat suci Al-Quran semata-mata.
              Tiada jampi serapah pemujaan, tiada wafak tulisan ghaib, tiada khodam penjaga. Barang tersebut hanyalah medium fizikal yang menyimpan keberkatan ayat Al-Quran, dan hakikat kesembuhan kekal mutlak milik Allah SWT.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
