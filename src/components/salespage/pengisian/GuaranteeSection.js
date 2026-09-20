'use client';

const GUARANTEES = [
  {
    icon: '🛡️',
    badge: 'JAMINAN 1 — HASIL & KEBERKESANAN',
    title: '30 Hari Pulangan Wang 100% Penuh',
    desc: 'Kami yakin dengan keberkatan kalamullah. Jika selepas 30 hari mengamalkan item pengisian ini mengikut bimbingan perawat dan anda dapati langsung tiada sebarang perubahan positif pada ketenangan diri atau gangguan anda — hubungi kami. Wang anda akan dipulangkan 100% tanpa sebarang pertikaian.',
    steps: ['Guna item selama 30 hari', 'Tiada sebarang perubahan positif', 'WhatsApp kami → Wang dipulangkan 100%'],
    color: '#22C55E',
  },
  {
    icon: '📖',
    badge: 'JAMINAN 2 — KESUCIAN SYARAK',
    title: '100% Bebas Jin, Khodam & Khurafat',
    desc: 'Pengisian ESyifaa dijamin menggunakan HANYA ayat-ayat suci Al-Quran, doa ma\'thurat dan Asma\'ul Husna. Sifar unsur khodam, jin pelindung, wafak atau tangkal jampi pemujaan. Jika ada sebarang unsur khurafat — kami pulangkan wang anda serta-merta.',
    steps: ['100% Al-Quran & Sunnah', 'Sifar Khodam & Jin', 'Patuh Syariah Sepenuhnya'],
    color: '#FDE047',
  },
];

export default function PengisianGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #042E23 0%, #021812 100%)',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>

        <span style={{
          display: 'inline-block',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.35rem 1.1rem', borderRadius: '50px',
          marginBottom: '1rem',
        }}>
          🛡️ Sifar Risiko Untuk Anda
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.25rem', marginBottom: '0.6rem',
          letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          Dua Jaminan Teguh Yang Kami Pegang
        </h2>

        <p style={{
          color: '#A7F3D0', fontSize: '1rem',
          lineHeight: 1.7, marginBottom: '2.5rem',
          maxWidth: '640px', margin: '0 auto 2.75rem',
        }}>
          Kami berkhidmat atas dasar amanah agama dan niat ikhlas membantu mereka yang dizalimi gangguan ghaib. Anda berikhtiar dengan tenang tanpa sebarang risiko kewangan.
        </p>

        {/* Two guarantee cards */}
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {GUARANTEES.map((g, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, #1E3A2F 0%, #14532D 100%)',
              border: `2px solid ${g.color}`,
              borderRadius: '20px', padding: '2rem 1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              textAlign: 'left', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Icon */}
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>
                {g.icon}
              </div>

              {/* Badge */}
              <div style={{
                display: 'inline-block', marginBottom: '0.85rem',
                background: `${g.color}22`, border: `1px solid ${g.color}66`,
                borderRadius: '999px', padding: '0.3rem 0.9rem',
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: g.color, letterSpacing: '0.05em' }}>
                  {g.badge}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.1rem', fontWeight: 800, color: '#FEF3C7',
                margin: '0 0 0.75rem', lineHeight: 1.35,
              }}>
                {g.title}
              </h3>

              <p style={{
                fontSize: '0.88rem', color: '#D1FAE5',
                lineHeight: 1.7, margin: '0 0 1.25rem',
                flex: 1,
              }}>
                {g.desc}
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {g.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${g.color}33`,
                    borderRadius: '10px', padding: '0.5rem 0.85rem',
                  }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: g.color, color: '#042E23',
                      fontWeight: 800, fontSize: '0.7rem',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '0.82rem', color: '#D1FAE5', fontWeight: 600 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
