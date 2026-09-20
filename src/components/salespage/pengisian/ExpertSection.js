'use client';

export default function PengisianExpertSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          📖 Sandaran Syarak &amp; Kredibiliti Perawat
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Konsep Membaca Pada Objek — Amalan Sah Dituntun Al-Quran &amp; Sunnah
        </h2>

        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '740px', margin: '0 auto 2.75rem auto' }}>
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
              background: 'rgba(253,224,71,0.06)',
              border: '1.5px solid rgba(253,224,71,0.3)',
              borderRadius: '16px', padding: '1.8rem 1.6rem', textAlign: 'right',
            }}>
              <div style={{
                fontSize: '1.15rem', fontFamily: 'serif',
                color: '#FDE047', lineHeight: 2.2, marginBottom: '1rem', direction: 'rtl',
              }}>
                {d.arabic}
              </div>
              <div style={{ borderTop: '1px solid rgba(253,224,71,0.2)', paddingTop: '1rem', textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: '#FEF3C7', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {d.terjemah}
                </p>
                <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 700 }}>
                  {d.sumber}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith Keharusan Ruqyah */}
        <div style={{
          background: 'rgba(74,222,128,0.07)',
          border: '1.5px solid rgba(74,222,128,0.28)',
          borderRadius: '16px', padding: '1.5rem 1.8rem', marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '1.75rem' }}>🕌</span>
          <p style={{ margin: '0.6rem 0 0.4rem 0', fontSize: '1.02rem', color: '#FEF3C7', fontStyle: 'italic', lineHeight: 1.75 }}>
            &ldquo;Tunjukkan ruqyah-ruqyah kalian kepadaku. Tiada mengapa dengan ruqyah selama tidak mengandungi syirik di dalamnya.&rdquo;
          </p>
          <span style={{ fontSize: '0.82rem', color: '#6EE7B7', fontWeight: 700 }}>
            — Hadith Riwayat Sahih Muslim (No. 2200)
          </span>
        </div>

        {/* Penegasan Bebas Syirik & Tangkal */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '16px', padding: '1.5rem 1.8rem', textAlign: 'left',
          display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>🛡️</span>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', color: '#FDE047', fontSize: '1.05rem', fontWeight: 800 }}>
              Jaminan Syarak: 100% Bersih Dari Khodam, Jin &amp; Tangkal Wafaq
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#D1FAE5', lineHeight: 1.75 }}>
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
