'use client';

const PACKAGE_ITEMS = [
  {
    icon: '🔥',
    title: 'Video Rawatan Menyeluruh',
    desc: 'Membersihkan diri dari segala gangguan jin yang bersarang dalam badan',
  },
  {
    icon: '⛓️',
    title: 'Rawatan Memutuskan Ikatan Jin Saka',
    desc: 'Memutuskan ikatan-ikatan perjanjian yang telah dibuat dengan jin-jin saka',
  },
  {
    icon: '🔗',
    title: 'Rawatan Memutuskan Buhulan Sihir',
    desc: 'Memutuskan segala ikatan & buhulan sihir yang ada dalam badan',
  },
  {
    icon: '🧲',
    title: 'Rawatan Pertalian Barang Sihir',
    desc: 'Memutuskan pertalian & ikatan diri anda dengan barang-barang sihir',
  },
  {
    icon: '💧',
    title: 'Video Air Tawar, Air Mandian & Garam Mandian',
    desc: 'Video khusus untuk buat air tawar, air mandian & garam mandian sendiri di rumah',
  },
  {
    icon: '🧂',
    title: 'Video Garam Pagar Rumah',
    desc: 'Video untuk buat garam pagar rumah — lindungi rumah dari gangguan jin & sihir',
  },
  {
    icon: '🐍',
    title: 'Rawatan Sakit & Bisa Badan',
    desc: 'Rawatan khusus untuk sakit & bisa-bisa badan yang disebabkan oleh gangguan jin',
  },
  {
    icon: '🛡️',
    title: 'Rawatan Pagar, Benteng & Perlindungan Diri',
    desc: 'Perlindungan menyeluruh diri dari serangan jin, sihir & gangguan spiritual',
  },
  {
    icon: '⭐',
    title: 'Amalan Ringkas Harian',
    desc: 'BONUS: Booster pendinding — amalan ringkas harian untuk kekalkan perlindungan',
    isBonus: true,
  },
];

export default function EVideoPaymentSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          💳 Apa Yang Anda Dapat
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.5rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pakej E-Video Rawatan ESyifaa
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#A7F3D0', marginBottom: '2rem' }}>
          Bukan satu video — ini pakej lengkap rawatan &amp; perlindungan menyeluruh.
        </p>

        {/* Main price card */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid #FDE047',
          borderRadius: '24px', padding: '2rem 1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(253,224,71,0.1) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{ fontSize: '0.75rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Pakej Digital Lengkap — Sekali Bayar
          </div>

          <div style={{ marginBottom: '0.4rem' }}>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>
              RM150
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#D1FAE5', marginBottom: '1.75rem' }}>
            Sekali bayar · Guna seumur hidup · Dihantar via WhatsApp
          </div>

          {/* Package items list */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.65rem',
            marginBottom: '1.75rem', textAlign: 'left',
          }}>
            {PACKAGE_ITEMS.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                background: item.isBonus
                  ? 'rgba(253,224,71,0.1)'
                  : 'rgba(255,255,255,0.06)',
                border: item.isBonus
                  ? '1px solid rgba(253,224,71,0.35)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '0.75rem 1rem',
                position: 'relative',
              }}>
                {item.isBonus && (
                  <div style={{
                    position: 'absolute', top: '-1px', right: '0.75rem',
                    background: '#FDE047', color: '#042E23',
                    fontSize: '0.6rem', fontWeight: 900,
                    padding: '0.1rem 0.6rem', borderRadius: '0 0 6px 6px',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    BONUS
                  </div>
                )}
                <span style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: '0.875rem',
                    color: item.isBonus ? '#FDE047' : '#FEF3C7',
                    marginBottom: '0.2rem',
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#A7F3D0', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total count */}
          <div style={{
            background: 'rgba(253,224,71,0.12)',
            border: '1px solid rgba(253,224,71,0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem',
            marginBottom: '1.5rem', textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#FEF3C7', fontWeight: 700 }}>
              🎬 <span style={{ color: '#FDE047' }}>8 Video Rawatan + 1 Amalan Bonus</span>{' '}
              — semua untuk{' '}
              <span style={{ color: '#4ADE80' }}>RM150 sahaja. Guna seumur hidup.</span>
            </p>
          </div>

          {/* CTA */}
          <a href="#borang" onClick={scrollToForm} style={{
            display: 'inline-block', padding: '1.15rem 2.6rem',
            fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
            border: '2px solid #FEF08A', letterSpacing: '-0.01em',
          }}>
            🎬 Dapatkan Pakej E-Video RM150 Sekarang
          </a>

          <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic', marginBottom: 0 }}>
            Bayar via FPX · Selamat · Dihantar via WhatsApp dalam 24 jam
          </p>
        </div>

        {/* Delivery info */}
        <div style={{
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: '14px', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '0.85rem', alignItems: 'flex-start', textAlign: 'left',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📱</span>
          <div>
            <div style={{ fontWeight: 800, color: '#60A5FA', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Cara Terima Pakej E-Video
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>
              Selepas bayaran berjaya, perawat ESyifaa akan hubungi anda melalui{' '}
              <strong style={{ color: '#FEF3C7' }}>WhatsApp dalam masa 24 jam</strong>{' '}
              dan hantar semua video rawatan secara langsung. Simpan — boleh guna
              berulang kali seumur hidup, tanpa kos tambahan.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
