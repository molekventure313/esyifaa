'use client';

const USES = [
  {
    icon: '🔥',
    title: 'Rawatan Peribadi',
    desc: 'Musnahkan jin yang bersarang dalam badan. Rawat diri sendiri bila-bila masa, setiap kali gangguan datang — tanpa perlu bergantung pada perawat.',
    color: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
    tagColor: '#F87171',
  },
  {
    icon: '🏠',
    title: 'Rawatan & Perlindungan Rumah',
    desc: 'Pasang video dalam rumah. Bersihkan gangguan jin, sihir & ain yang bersarang di dalam rumah. Benteng perlindungan rumah anda setiap masa.',
    color: 'rgba(74,222,128,0.06)',
    borderColor: 'rgba(74,222,128,0.2)',
    tagColor: '#4ADE80',
  },
  {
    icon: '💧',
    title: 'Buat Air Tawar & Air Mandian Sendiri',
    desc: 'Letak bekas air di hadapan peranti semasa video diplay. Buat bekalan air penawar dan air mandian sendiri di rumah — selalu ada, tanpa perlu minta dari perawat.',
    color: 'rgba(96,165,250,0.06)',
    borderColor: 'rgba(96,165,250,0.2)',
    tagColor: '#60A5FA',
  },
  {
    icon: '🧂',
    title: 'Buat Garam Mandian & Garam Pagar',
    desc: 'Letak garam di hadapan video semasa play. Guna untuk mandian penawar atau taburkan sekeliling rumah sebagai pagar perlindungan dari gangguan jin & sihir.',
    color: 'rgba(167,243,208,0.05)',
    borderColor: 'rgba(167,243,208,0.18)',
    tagColor: '#A7F3D0',
  },
  {
    icon: '🐍',
    title: 'Musnahkan Bisa & Santau Dalam Badan',
    desc: 'Rawatan intensif untuk kes santau, bisa sihir atau racun ghaib yang masuk melalui makanan/minuman. Ulang rawatan sehingga bisa keluar dari badan.',
    color: 'rgba(253,224,71,0.05)',
    borderColor: 'rgba(253,224,71,0.2)',
    tagColor: '#FDE047',
  },
];

export default function EVideoHowItWorksSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4.5rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.3)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            🎬 5 Kegunaan E-Video
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.25,
            marginTop: '0.4rem', marginBottom: '0.75rem',
          }}>
            Satu Pakej —{' '}
            <span style={{ color: '#FDE047' }}>Lima Kegunaan Berbeza</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto' }}>
            E-Video Rawatan ESyifaa bukan sekadar untuk rawatan diri.
            Ia adalah alat perlindungan menyeluruh untuk anda dan keluarga.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.1rem',
        }}>
          {USES.map((u, i) => (
            <div key={i} style={{
              background: u.color,
              border: `1.5px solid ${u.borderColor}`,
              borderRadius: '16px', padding: '1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${u.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', flexShrink: 0,
              }}>
                {u.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 800, fontSize: '0.95rem',
                  color: u.tagColor, marginBottom: '0.4rem', lineHeight: 1.3,
                }}>
                  {u.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.845rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                  {u.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
