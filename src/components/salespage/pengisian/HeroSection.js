'use client';

export default function PengisianHeroSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF',
      padding: '4.5rem 1rem 3.5rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.5rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          ⭐ 500+ Pesakit Dirawat — Alhamdulillah
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)',
          fontWeight: 900,
          color: '#FEF3C7',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: '1.25rem',
        }}>
          Isikan Barang Anda Dengan{' '}
          <span style={{ color: '#FDE047' }}>Kekuatan Ayat Al-Quran</span>
          {' '}— Rawat Diri &amp; Keluarga Bila-Bila Masa
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: '1.05rem',
          color: '#A7F3D0',
          lineHeight: 1.75,
          maxWidth: '660px',
          margin: '0 auto 1.5rem auto',
        }}>
          Cincin, tasbih, atau mana-mana barang yang selalu anda gunakan.
          Perawat ESyifaa buat <strong style={{ color: '#FDE047' }}>pengisian ayat ruqyah jarak jauh</strong> selama 7 hari —
          selepas siap, barang anda menjadi alat rawatan yang boleh digunakan bila-bila masa.
        </p>

        {/* Trust pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0.6rem', marginBottom: '2.5rem',
        }}>
          {[
            '✅ Jarak Jauh — Tanpa Pos',
            '📖 100% Patuh Syariah',
            '🔄 Pelarasan Setiap Minggu',
            '⏱️ Siap Dalam 7 Hari',
          ].map((item, i) => (
            <span key={i} style={{
              background: 'rgba(167,243,208,0.1)',
              border: '1px solid rgba(167,243,208,0.3)',
              color: '#A7F3D0',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0.3rem 0.9rem',
              borderRadius: '999px',
            }}>
              {item}
            </span>
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #065F46, #021812)',
          border: '3px solid #FDE047',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2.5rem auto',
          boxShadow: '0 0 60px rgba(253,224,71,0.15), 0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '3.5rem' }}>💎</span>
          <span style={{ fontSize: '0.7rem', color: '#FDE047', fontWeight: 800, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
            PENGISIAN RUQYAH
          </span>
        </div>

        {/* CTA */}
        <a
          href="#borang"
          onClick={scrollToForm}
          style={{
            display: 'inline-block',
            padding: '1.15rem 2.6rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#042E23',
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
            border: '2px solid #FEF08A',
            letterSpacing: '-0.01em',
          }}
        >
          💎 Tempah Pengisian RM90 Sekarang
        </a>

        <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
          Bayar via FPX · Selamat · 256-bit SSL
        </p>

      </div>
    </section>
  );
}
