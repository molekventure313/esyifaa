'use client';

export default function EVideoHeroSection() {
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
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.5rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          🎬 ESyifaa · E-Video Rawatan Ruqyah
        </div>

        <h1 style={{
          fontSize: 'clamp(1.7rem, 4.5vw, 2.9rem)',
          fontWeight: 900, color: '#FEF3C7',
          lineHeight: 1.2, letterSpacing: '-0.02em',
          marginBottom: '1.25rem',
        }}>
          Perawat Peribadi Dalam{' '}
          <span style={{ color: '#FDE047' }}>Telefon Anda</span>
          {' '}— Rawatan Ruqyah Bila-Bila Masa, Di Mana Sahaja.
        </h1>

        <p style={{
          fontSize: '1.05rem', color: '#A7F3D0',
          lineHeight: 1.75, maxWidth: '660px',
          margin: '0 auto 1.5rem auto',
        }}>
          Tidak perlu tunggu slot. Tidak perlu bergantung pada perawat.{' '}
          <strong style={{ color: '#FEF3C7' }}>
            Pakej lengkap video rawatan ruqyah syar&apos;iyyah — guna seumur hidup, tanpa kos tambahan.
          </strong>
        </p>

        <div style={{
          background: 'rgba(253,224,71,0.08)',
          border: '2px solid rgba(253,224,71,0.4)',
          borderRadius: '16px', padding: '1.25rem 1.75rem',
          maxWidth: '640px', margin: '0 auto 2rem auto', textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FDE047', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ✨ Produk Digital Pertama ESyifaa
          </div>
          <p style={{ margin: 0, fontSize: '1rem', color: '#FEF3C7', lineHeight: 1.65, fontWeight: 600 }}>
            <strong style={{ color: '#FDE047' }}>E-Video Rawatan</strong>{' '}
            — pakej lengkap video rawatan ruqyah syar&apos;iyyah oleh perawat berpengalaman.
            <span style={{ color: '#4ADE80' }}>{' '}Rawat diri, putuskan ikatan sihir &amp; saka, lindungi rumah, buat air tawar &amp; garam sendiri — semua dalam satu pakej.</span>
          </p>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0.6rem', marginBottom: '2.5rem',
        }}>
          {[
            '📱 Digital — Dihantar Via WA',
            '🔄 Guna Tanpa Had & Tanpa Kos',
            '🏠 Untuk Badan, Rumah & Air',
            '⏱️ Terima Dalam 24 Jam',
          ].map((item, i) => (
            <span key={i} style={{
              background: 'rgba(167,243,208,0.1)',
              border: '1px solid rgba(167,243,208,0.25)',
              color: '#A7F3D0', fontSize: '0.82rem',
              fontWeight: 600, padding: '0.3rem 0.9rem',
              borderRadius: '999px',
            }}>{item}</span>
          ))}
        </div>

        <div style={{
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #065F46, #021812)',
          border: '3px solid #FDE047',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2.5rem auto',
          boxShadow: '0 0 60px rgba(253,224,71,0.12), 0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '3rem' }}>🎬</span>
          <span style={{ fontSize: '0.6rem', color: '#FDE047', fontWeight: 800, letterSpacing: '0.04em', marginTop: '0.2rem', textAlign: 'center', lineHeight: 1.3 }}>
            E-VIDEO RAWATAN
          </span>
        </div>

        <a href="#borang" onClick={scrollToForm} style={{
          display: 'inline-block', padding: '1.15rem 2.6rem',
          fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
          background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
          borderRadius: '50px', textDecoration: 'none',
          boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
          border: '2px solid #FEF08A', letterSpacing: '-0.01em',
        }}>
          🎬 Tempah E-Video RM150 Sekarang
        </a>

        <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
          Bayar via FPX · Dihantar via WhatsApp dalam 24 jam · 100% Patuh Syariah
        </p>
      </div>
    </section>
  );
}
