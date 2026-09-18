'use client';

export default function KasturiAuthoritySection() {
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
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            📖 Sunnah &amp; Perubatan Islam
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Mengapa Minyak Kasturi Kijang Menjadi Ketakutan Jin &amp; Syaitan?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Keistimewaan kasturi telah disebut dalam hadith Rasulullah ﷺ dan menjadi rujukan para ulama thibbun nabawi sejak kurun berzaman.
          </p>
        </div>

        {/* 2 Core Proofs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>

          {/* Proof 1: Hadith Nabi */}
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
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
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '99px',
                marginBottom: '1rem',
              }}>
                📜 Hadith Sahih: Sebaik-Baik Wangian
              </div>
              <p style={{ fontSize: '1.05rem', color: '#064E3B', lineHeight: 1.8, fontStyle: 'italic', margin: '0 0 1rem 0', fontWeight: 600 }}>
                &ldquo;Sebaik-baik wangian adalah minyak kasturi (Al-Misk).&rdquo;
              </p>
              <p style={{ fontSize: '0.86rem', color: '#047857', lineHeight: 1.6, margin: 0 }}>
                Nabi Muhammad ﷺ sendiri amat menyukai wangian kasturi dan sentiasa memakainya sebelum solat dan menyertai perhimpunan para sahabat.
              </p>
            </div>
            <div style={{ borderTop: '1px solid #A7F3D0', paddingTop: '0.85rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857' }}>
                (Sahih Muslim, No. 2252)
              </span>
            </div>
          </div>

          {/* Proof 2: Pandangan Ibnul Qayyim */}
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
                🌿 Kitab Zaadul Ma&apos;ad (Ibnul Qayyim)
              </div>
              <p style={{ fontSize: '0.94rem', color: '#1E293B', lineHeight: 1.75, margin: '0 0 1rem 0' }}>
                <em>&ldquo;Kasturi adalah santapan bagi roh, menguatkan organ dalaman, menenangkan debaran jantung dan mengusir angin jahat. <strong>Syaitan sangat membenci aroma kasturi</strong> kerana syaitan dicipta daripada unsur yang menyukai bau busuk.&rdquo;</em>
              </p>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Bila tubuh dibasahi aroma kasturi kijang yang telah diruqyah, makhluk halus akan merasa panas membakar dan menjauhkan diri.
              </p>
            </div>
            <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.85rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                (Zaadul Ma&apos;ad fi Hadyi Khairil &apos;Ibaad, Jilid 4)
              </span>
            </div>
          </div>

        </div>

        {/* Shariah Compliance Alert */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '2px solid #34D399',
          borderRadius: '16px',
          padding: '1.4rem 1.75rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '2.2rem', lineHeight: 1, flexShrink: 0 }}>🕌</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#065F46', marginBottom: '0.2rem' }}>
              100% Bebas Alkohol · Suci &amp; Sah Dibawa Solat
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#047857', lineHeight: 1.55 }}>
              Pati pekat kasturi kijang asli gred tinggi tanpa campuran bahan terlarang atau alkohol. Selamat disapu pada kulit bayi, kanak-kanak mahupun orang dewasa pada bila-bila masa.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
