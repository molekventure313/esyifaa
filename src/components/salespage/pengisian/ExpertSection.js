'use client';

export default function PengisianExpertSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          📖 Dalil &amp; Asas
        </div>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Bacaan Pada Barang — Amalan Yang Disokong Al-Quran &amp; Sunnah
        </h2>
        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          Konsep &ldquo;pengisian&rdquo; atau membaca pada sesuatu objek untuk dijadikan penawar
          adalah amalan yang diiktiraf dalam tradisi Islam. Qias kepada bacaan pada air, minyak
          dan kain yang disebutkan dalam kitab-kitab ulama silam.
        </p>

        {/* Dalil cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {[
            {
              arabic: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
              terjemah: '"Dan Kami turunkan dari Al-Quran sesuatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman."',
              sumber: 'Surah Al-Isra\' (17:82)',
            },
            {
              arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
              terjemah: '"Dan apabila aku sakit, Dialah (Allah) yang menyembuhkanku."',
              sumber: 'Surah Ash-Shu\'ara (26:80)',
            },
          ].map((d, i) => (
            <div key={i} style={{
              background: 'rgba(253,224,71,0.06)', border: '1.5px solid rgba(253,224,71,0.3)',
              borderRadius: '16px', padding: '1.75rem 1.5rem', textAlign: 'right',
            }}>
              <div style={{
                fontSize: '1.1rem', fontFamily: 'serif',
                color: '#FDE047', lineHeight: 2.2, marginBottom: '1rem', direction: 'rtl',
              }}>
                {d.arabic}
              </div>
              <div style={{ borderTop: '1px solid rgba(253,224,71,0.2)', paddingTop: '1rem', textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.875rem', color: '#FEF3C7', lineHeight: 1.7, fontStyle: 'italic' }}>{d.terjemah}</p>
                <span style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 700 }}>{d.sumber}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith */}
        <div style={{
          background: 'rgba(74,222,128,0.07)', border: '1.5px solid rgba(74,222,128,0.28)',
          borderRadius: '14px', padding: '1.5rem 1.8rem', marginBottom: '1.5rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📖</span>
          <p style={{ margin: '0.6rem 0 0.4rem 0', fontSize: '1rem', color: '#FEF3C7', fontStyle: 'italic', lineHeight: 1.75 }}>
            &ldquo;Gunakanlah ruqyah (bacaan doa perlindungan) selama ia tidak mengandungi syirik.&rdquo;
          </p>
          <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700 }}>Hadith Riwayat Muslim</span>
        </div>

        {/* Explanation */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(253,224,71,0.2)',
          borderRadius: '14px', padding: '1.4rem 1.6rem', textAlign: 'left',
          display: 'flex', gap: '1rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#D1FAE5', lineHeight: 1.7 }}>
            <strong style={{ color: '#FDE047' }}>Konsep Pengisian E-Syifa&apos;</strong> adalah qias kepada amalan membaca bacaan ruqyah pada air penawar.
            Bezanya — air habis, barang yang diisikan <em>tidak pernah habis</em>. Bacaan yang dipasakkan kekal selagi barang dijaga dengan baik,
            dan perawat ESyifaa buat pelarasan setiap minggu secara automatik.
          </p>
        </div>
      </div>
    </section>
  );
}
