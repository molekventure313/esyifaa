'use client';

const USES = [
  {
    icon: '🔥',
    num: '01',
    title: 'Rawatan Peribadi — Musnahkan Jin Dalam Badan',
    desc: 'Play video untuk diri sendiri. Duduk tenang, kuatkan volume, biarkan bacaan ayat-ayat ruqyah bekerja. Sesuai untuk rawatan harian atau bila ada tanda-tanda gangguan.',
    steps: ['Duduk atau berbaring dengan tenang', 'Kuatkan volume peranti', 'Play video & biarkan bacaan mengalir', 'Ulang setiap hari atau bila diperlukan'],
    color: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
    tagColor: '#F87171',
  },
  {
    icon: '🏠',
    num: '02',
    title: 'Rawatan Rumah — Hancurkan Gangguan Dalam Rumah',
    desc: 'Pasang video dalam rumah. Tinggalkan ia play sementara anda keluar atau tidur. Ayat-ayat ruqyah akan mengalir dan membersihkan rumah dari gangguan jin &amp; sihir.',
    steps: ['Letak peranti di tengah rumah', 'Kuatkan volume seperlunya', 'Play video &amp; tinggalkan ia berjalan', 'Boleh play berulang kali atau overnight'],
    color: 'rgba(74,222,128,0.08)',
    borderColor: 'rgba(74,222,128,0.25)',
    tagColor: '#4ADE80',
  },
  {
    icon: '💧',
    num: '03',
    title: 'Buat Air Tawar Sendiri',
    desc: 'Letak bekas air di hadapan peranti semasa video diplay. Air akan menyerap bacaan ruqyah — boleh diminum atau digunakan untuk mandian penawar.',
    steps: ['Isi bekas dengan air bersih', 'Letak di hadapan peranti', 'Kuatkan volume, play video', 'Air sedia — boleh diminum atau untuk mandian'],
    color: 'rgba(96,165,250,0.08)',
    borderColor: 'rgba(96,165,250,0.25)',
    tagColor: '#60A5FA',
  },
  {
    icon: '🧂',
    num: '04',
    title: 'Buat Garam Mandian &amp; Garam Pagar',
    desc: 'Sama seperti air tawar — letak garam di hadapan video semasa play. Garam yang telah menyerap bacaan ruqyah boleh digunakan untuk mandian penawar atau pagar rumah.',
    steps: ['Letak garam dalam bekas', 'Hadapkan ke peranti', 'Play video — biarkan bacaan mengalir', 'Guna untuk mandian atau taburkan sekeliling rumah'],
    color: 'rgba(167,243,208,0.07)',
    borderColor: 'rgba(167,243,208,0.2)',
    tagColor: '#A7F3D0',
  },
  {
    icon: '🐍',
    num: '05',
    title: 'Musnahkan &amp; Keluarkan Bisa Dalam Badan',
    desc: 'Khusus untuk kes santau, bisa sihir, atau racun ghaib yang masuk melalui makanan/minuman. Rawatan intensif via video — boleh dilakukan berulang kali sehingga bisa keluar.',
    steps: ['Play video di tempat tenang', 'Fokus pada bahagian yang rasa sakit/berat', 'Biarkan bacaan bekerja — mungkin rasa loya/sendawa', 'Ulang sehingga tanda-tanda berkurangan'],
    color: 'rgba(253,224,71,0.07)',
    borderColor: 'rgba(253,224,71,0.25)',
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
            Satu Video —{' '}
            <span style={{ color: '#FDE047' }}>Lima Kegunaan Berbeza</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto' }}>
            E-Video Rawatan ESyifaa bukan sekadar untuk rawatan diri.
            Ia adalah alat perlindungan menyeluruh untuk anda dan keluarga.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {USES.map((u, i) => (
            <div key={i} style={{
              background: u.color,
              border: `1.5px solid ${u.borderColor}`,
              borderRadius: '18px', padding: '1.75rem',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '1.5rem', alignItems: 'start',
            }}>
              {/* Number + Icon */}
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 900, color: u.tagColor,
                  letterSpacing: '0.1em', marginBottom: '0.3rem',
                }}>
                  {u.num}
                </div>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${u.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem',
                }}>
                  {u.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{
                  fontWeight: 800, fontSize: '1rem', color: u.tagColor,
                  marginBottom: '0.5rem', lineHeight: 1.3,
                  dangerouslySetInnerHTML: undefined,
                }}>
                  <span dangerouslySetInnerHTML={{ __html: u.title }} />
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: u.desc }} />
              </div>

              {/* Steps */}
              <div style={{
                background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                padding: '1rem', minWidth: '200px',
                display: 'none', // hidden on mobile, shown on larger screens via inline
              }}>
              </div>
            </div>
          ))}
        </div>

        {/* Steps for each use shown below on mobile */}
        <div style={{ marginTop: '2rem' }}>
          {USES.map((u, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${u.borderColor}`,
              borderRadius: '12px', padding: '1rem 1.25rem',
              marginBottom: '0.75rem',
              display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{u.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: u.tagColor, marginBottom: '0.4rem' }}
                  dangerouslySetInnerHTML={{ __html: u.title }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {u.steps.map((s, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#A7F3D0' }}>
                      <span style={{ color: u.tagColor, fontWeight: 700, flexShrink: 0 }}>{j + 1}.</span>
                      <span dangerouslySetInnerHTML={{ __html: s }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
