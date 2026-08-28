'use client';

export default function EVideoSolutionSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#4ADE80',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ✨ Penyelesaian
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.25,
            marginTop: '0.4rem', marginBottom: '0.75rem',
          }}>
            Apa Itu{' '}
            <span style={{ color: '#FDE047' }}>E-Video Rawatan ESyifaa?</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.75, maxWidth: '620px', margin: '0 auto' }}>
            Produk digital pertama ESyifaa — rakaman video bacaan ayat-ayat ruqyah syar&apos;iyyah
            yang dibacakan khas oleh perawat berpengalaman ESyifaa.
          </p>
        </div>

        {/* Main explanation card */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #042E23 100%)',
          border: '2px solid rgba(253,224,71,0.35)',
          borderRadius: '20px', padding: '2.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Icon side */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'radial-gradient(circle, #065F46, #021812)',
                border: '3px solid #FDE047',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 0 40px rgba(253,224,71,0.15)',
              }}>
                <span style={{ fontSize: '2.5rem' }}>🎬</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FDE047' }}>E-Video Rawatan</div>
              <div style={{ fontSize: '0.82rem', color: '#A7F3D0', marginTop: '0.3rem' }}>Ruqyah Syar&apos;iyyah Digital</div>
            </div>

            {/* Explanation side */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FDE047', marginBottom: '0.4rem' }}>
                  🤔 Macam Mana Ia Berfungsi?
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                  Perawat ESyifaa merakamkan bacaan ayat-ayat ruqyah syar&apos;iyyah dalam format video.
                  Apabila anda <strong style={{ color: '#FEF3C7' }}>play video tersebut</strong>,
                  bacaan ayat-ayat Al-Quran mengalir — sama seperti perawat membacakan terus kepada anda.
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FDE047', marginBottom: '0.4rem' }}>
                  🌊 Kenapa Ia Berkesan?
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                  Ayat-ayat Al-Quran adalah kalam Allah — berkesan tidak kira cara ia sampai kepada
                  badan atau benda yang dituju.{' '}
                  <strong style={{ color: '#4ADE80' }}>
                    Rakaman bacaan ruqyah syar&apos;iyyah tetap membawa kekuatan yang sama.
                  </strong>
                </p>
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FDE047', marginBottom: '0.4rem' }}>
                  📱 Anda Dapat Apa?
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                  Selepas bayaran, perawat akan hantar video melalui{' '}
                  <strong style={{ color: '#FEF3C7' }}>WhatsApp dalam masa 24 jam</strong>.
                  Simpan video tersebut — boleh guna berulang kali, seumur hidup, tanpa kos tambahan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patuh syariah callout */}
        <div style={{
          background: 'rgba(74,222,128,0.07)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '14px', padding: '1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'flex-start',
          maxWidth: '680px', margin: '0 auto',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📖</span>
          <div>
            <div style={{ fontWeight: 800, color: '#4ADE80', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              100% Ruqyah Syar&apos;iyyah — Tiada Unsur Syirik
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>
              Semua bacaan dalam E-Video adalah ayat-ayat Al-Quran dan doa-doa yang berlandaskan
              Sunnah Nabi SAW. Tiada ayat karut, tiada bomoh, tiada unsur syirik — 100% halal dan selamat digunakan.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
