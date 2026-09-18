'use client';

export default function GaramAuthoritySection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            📖 Berlandaskan Al-Quran &amp; Sunnah
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Hakikat Sihir Pemisah &amp; Ikhtiar Ruqyah Yang Dibenarkan Syarak
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Dalam Islam, sihir pemisah (*sihir tafriq*) adalah nyata dan telah dirakamkan dalam Al-Quran sejak ribuan tahun lalu. Penawarnya juga ada di dalam Al-Quran dan doa yang diajarkan baginda Nabi ﷺ.
          </p>
        </div>

        {/* 2 Core Proofs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>

          {/* Proof 1: Surah Al-Baqarah 102 */}
          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#DBEAFE',
                color: '#1E40AF',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '99px',
                marginBottom: '1rem',
              }}>
                📜 Dalil Al-Quran: Sihir Pemisah Itu Nyata
              </div>
              <p style={{ fontSize: '1rem', color: '#1E293B', lineHeight: 1.8, fontStyle: 'italic', margin: '0 0 1rem 0' }}>
                &ldquo;...Maka mereka belajar daripada kedua malaikat itu suatu sihir yang dengannya mereka dapat <strong>memisahkan antara seorang suami dengan isterinya</strong>...&rdquo;
              </p>
            </div>
            <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                (Surah Al-Baqarah: Ayat 102)
              </span>
            </div>
          </div>

          {/* Proof 2: Jin Dasim & Sunnah Garam */}
          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '99px',
                marginBottom: '1rem',
              }}>
                🧂 Khasiat Garam &amp; Ruqyah Syar&apos;iyyah
              </div>
              <p style={{ fontSize: '0.94rem', color: '#1E293B', lineHeight: 1.75, margin: '0 0 1rem 0' }}>
                Garam bukit dikenali para ulama dan perawat thibbun nabawi sebagai <strong>penyerap gelombang negatif dan racun rohani</strong>. Nabi ﷺ sendiri pernah meruqyah air bercampur garam untuk menyembuhkan sengatan binatang berbisa.
              </p>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Bila dibacakan ayat pembatal sihir &amp; doa mahabbah, zarah garam menyerap getaran mukjizat Al-Quran lalu bertindak dari dalam tubuh pemakannya.
              </p>
            </div>
            <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                (HR. At-Thabrani &amp; Baihaqi)
              </span>
            </div>
          </div>

        </div>

        {/* Shariah Compliance Alert */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '2px solid #6EE7B7',
          borderRadius: '16px',
          padding: '1.4rem 1.75rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#065F46', marginBottom: '0.2rem' }}>
              100% Bersih Dari Unsur Syirik, Tangkal &amp; Minyak Guna-Guna
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#047857', lineHeight: 1.55 }}>
              Ini BUKAN minyak pengasih bomoh atau jampi serapah. Ia adalah garam bukit tulen yang diperdengarkan bacaan Surah Al-Baqarah, Ayat Kursi, Taha, Yusuf dan doa-doa Nabi SAW oleh para perawat bertauliah ESyifaa.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
