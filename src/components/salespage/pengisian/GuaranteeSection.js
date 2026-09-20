'use client';

const GUARANTEES = [
  {
    icon: '🛡️',
    badge: 'JAMINAN 1 — HASIL & KEBERKESANAN',
    title: '30 Hari Pulangan Wang 100% Penuh',
    desc: 'Kami yakin dengan keberkatan kalamullah. Jika selepas 30 hari mengamalkan item pengisian ini mengikut bimbingan perawat dan anda dapati langsung tiada sebarang perubahan positif pada ketenangan diri atau gangguan anda — hubungi kami. Wang anda akan dipulangkan 100% tanpa sebarang pertikaian.',
    steps: ['Guna item selama 30 hari', 'Tiada sebarang perubahan positif', 'WhatsApp kami → Wang dipulangkan 100%'],
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  {
    icon: '📖',
    badge: 'JAMINAN 2 — KESUCIAN SYARAK',
    title: '100% Bebas Jin, Khodam & Khurafat',
    desc: 'Pengisian ESyifaa dijamin menggunakan HANYA ayat-ayat suci Al-Quran, doa ma\'thurat dan Asma\'ul Husna. Sifar unsur khodam, jin pelindung, wafak atau tangkal jampi pemujaan. Jika ada sebarang unsur khurafat — kami pulangkan wang anda serta-merta.',
    steps: ['100% Al-Quran & Sunnah', 'Sifar Khodam & Jin', 'Patuh Syariah Sepenuhnya'],
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
];

export default function PengisianGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFBEB',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FDE68A',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>

        <span style={{
          display: 'inline-block',
          fontSize: '0.8rem', fontWeight: 800, color: '#92400E',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          background: '#FEF3C7', border: '1.5px solid #FCD34D',
          padding: '0.4rem 1.2rem', borderRadius: '50px',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
        }}>
          🛡️ Sifar Risiko Untuk Anda
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.35rem)',
          fontWeight: 900, color: '#78350F',
          marginTop: '0.25rem', marginBottom: '0.6rem',
          letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          Dua Jaminan Teguh Yang Kami Pegang
        </h2>

        <p style={{
          color: '#475569', fontSize: '1.02rem',
          lineHeight: 1.7, marginBottom: '2.5rem',
          maxWidth: '640px', margin: '0 auto 2.75rem',
        }}>
          Kami berkhidmat atas dasar amanah agama dan niat ikhlas membantu mereka yang dizalimi gangguan ghaib. Anda berikhtiar dengan tenang tanpa sebarang risiko kewangan.
        </p>

        {/* Two guarantee cards */}
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {GUARANTEES.map((g, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              border: `2px solid ${g.borderColor}`,
              borderRadius: '20px', padding: '2rem 1.8rem',
              boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
              textAlign: 'left', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Icon */}
              <div style={{ fontSize: '2.6rem', marginBottom: '0.75rem', lineHeight: 1 }}>
                {g.icon}
              </div>

              {/* Badge */}
              <div style={{
                display: 'inline-block', marginBottom: '0.85rem',
                background: g.bgColor, border: `1px solid ${g.borderColor}`,
                borderRadius: '999px', padding: '0.3rem 0.9rem',
              }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: g.color, letterSpacing: '0.04em' }}>
                  {g.badge}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.15rem', fontWeight: 900, color: '#0F172A',
                margin: '0 0 0.75rem', lineHeight: 1.35,
              }}>
                {g.title}
              </h3>

              <p style={{
                fontSize: '0.9rem', color: '#475569',
                lineHeight: 1.7, margin: '0 0 1.25rem',
                flex: 1,
              }}>
                {g.desc}
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {g.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px', padding: '0.55rem 0.9rem',
                  }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: g.color, color: '#FFFFFF',
                      fontWeight: 800, fontSize: '0.72rem',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>{step}</span>
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
