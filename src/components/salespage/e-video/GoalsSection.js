'use client';

const GOALS = [
  {
    icon: '🛡️',
    title: 'Rawatan Tanpa Bergantung Pada Sesiapa',
    desc: 'Ada gangguan? Play video. Tiada perlu PM perawat, tiada perlu tunggu slot, tiada perlu bayar lagi. Anda yang pegang kawalan.',
    highlight: false,
  },
  {
    icon: '👪',
    title: 'Lindungi Seluruh Keluarga — Semua Dalam Satu Pakej',
    desc: 'Pakej E-Video boleh digunakan untuk merawat dan melindungi semua ahli keluarga — suami, isteri, anak-anak. Kongsi pakej dalam group keluarga.',
    highlight: true,
  },
  {
    icon: '🏠',
    title: 'Rumah Sentiasa Bersih Dari Gangguan',
    desc: 'Play video dalam rumah setiap minggu — atau bila rasa ada sesuatu. Rumah anda sentiasa terlindung dari gangguan jin, sihir, dan ain.',
    highlight: false,
  },
  {
    icon: '💧',
    title: 'Bekalan Air Tawar Tak Pernah Habis',
    desc: 'Selagi ada video, anda boleh buat air tawar bila-bila masa. Tiada perlu minta dari perawat. Buat sendiri, setiap hari jika perlu.',
    highlight: true,
  },
  {
    icon: '💰',
    title: 'Bayar RM150 Sekali — Guna Seumur Hidup',
    desc: 'Berbanding ratusan atau ribuan ringgit untuk rawatan berulang — RM150 sekali sahaja untuk perlindungan tanpa had, selama-lamanya.',
    highlight: false,
  },
];

export default function EVideoGoalsSection() {
  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#4ADE80',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ✨ Bayangkan Ini...
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.25,
            marginTop: '0.4rem', marginBottom: '0.75rem',
          }}>
            Apa Yang Berlaku Bila Anda Ada{' '}
            <span style={{ color: '#FDE047' }}>E-Video Rawatan Sendiri</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto' }}>
            Ini bukan impian — ini realiti pesakit yang sudah ada alat rawatan sendiri.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem',
        }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: g.highlight
                ? 'linear-gradient(135deg, rgba(253,224,71,0.08) 0%, rgba(253,224,71,0.04) 100%)'
                : 'rgba(255,255,255,0.03)',
              border: g.highlight
                ? '1.5px solid rgba(253,224,71,0.35)'
                : '1px solid rgba(74,222,128,0.15)',
              borderRadius: '16px', padding: '1.5rem',
              position: 'relative',
            }}>
              {g.highlight && (
                <div style={{
                  position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                  background: '#FDE047', color: '#042E23', fontSize: '0.65rem',
                  fontWeight: 800, padding: '0.15rem 0.75rem', borderRadius: '0 0 8px 8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Kegunaan Terbaik
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  fontSize: '1.75rem', flexShrink: 0,
                  background: g.highlight ? 'rgba(253,224,71,0.12)' : 'rgba(74,222,128,0.08)',
                  borderRadius: '12px', padding: '0.5rem',
                  display: 'inline-flex', lineHeight: 1,
                }}>
                  {g.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3,
                    color: g.highlight ? '#FDE047' : '#4ADE80',
                    marginBottom: '0.5rem',
                  }}>
                    {g.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                    {g.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
