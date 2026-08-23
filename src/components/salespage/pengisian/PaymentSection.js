'use client';

const INCLUDES = [
  { icon: '🔥', text: 'Pengisian Ayat Ruqyah Pembakar & Pemusnah Jin' },
  { icon: '✂️', text: 'Pengisian Ayat Pembatal Sihir' },
  { icon: '🛡️', text: 'Pengisian Ayat Benteng Sihir & Gangguan Jin' },
  { icon: '💚', text: 'Pengisian Ayat-ayat Kesembuhan' },
  { icon: '🔄', text: 'Pelarasan & Pengisian Semula Setiap Minggu (PERCUMA Selamanya)', highlight: true },
  { icon: '📋', text: 'Monitoring Hasil Pengisian (7 hari pertama)' },
  { icon: '📞', text: 'Konsultasi Ringkas Via WhatsApp Sebelum Pengisian' },
];

export default function PengisianPaymentSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💎 Pakej Pengisian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Satu Pakej. Empat Lapisan Perlindungan. RM90 Sahaja.
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
            Bayar sekali, nikmati perlindungan seumur hidup dengan pelarasan mingguan automatik dari perawat ESyifaa.
          </p>
        </div>

        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {/* Card */}
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
            border: '3px solid rgba(253,224,71,0.5)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(253,224,71,0.06)',
          }}>
            {/* Top banner */}
            <div style={{
              background: 'linear-gradient(90deg, #FDE047, #F59E0B)',
              color: '#042E23', fontWeight: 800,
              textAlign: 'center', padding: '0.6rem',
              fontSize: '0.85rem', letterSpacing: '0.02em',
            }}>
              ✨ Termasuk Pelarasan Mingguan Selamanya
            </div>

            {/* Price area */}
            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid rgba(74,222,128,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6EE7B7', marginBottom: '0.5rem' }}>
                Pakej Pengisian Ayat Ruqyah
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#6EE7B7', textDecoration: 'line-through' }}>RM250</span>
                <span style={{ fontSize: '3.2rem', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>RM90</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0' }}>
                Sekali bayar · Pelarasan mingguan percuma selamanya
              </p>
            </div>

            {/* Includes list */}
            <div style={{ padding: '1.75rem 2rem' }}>
              {INCLUDES.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  marginBottom: i < INCLUDES.length - 1 ? '0.85rem' : 0,
                }}>
                  <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{
                    fontSize: '0.9rem', lineHeight: 1.5,
                    color: item.highlight ? '#FDE047' : '#D1FAE5',
                    fontWeight: item.highlight ? 700 : 400,
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA inside card */}
            <div style={{ padding: '0 2rem 2rem' }}>
              <a href="#borang" onClick={scrollToForm} style={{
                display: 'block', textAlign: 'center',
                padding: '1.1rem', borderRadius: '50px',
                fontSize: '1.05rem', fontWeight: 800,
                color: '#042E23',
                background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(234,179,8,0.4)',
                border: '2px solid #FEF08A',
              }}>
                💎 Tempah Pengisian RM90 Sekarang
              </a>
            </div>
          </div>

          {/* Value note */}
          <div style={{
            marginTop: '1.5rem', textAlign: 'center',
            background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '12px', padding: '1rem 1.5rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#A7F3D0', fontStyle: 'italic', lineHeight: 1.6 }}>
              &ldquo;Nilai sebenar perkhidmatan ini adalah RM250 — namun ESyifaa menawarkan pada RM90 sahaja
              kerana kami percaya perlindungan ruqyah patut mudah diakses oleh semua pesakit.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
