'use client';

export default function PengisianHeroSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 45%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '4rem 1.25rem 3.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #A7F3D0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* 1. H1 HEADLINE (Paling Atas — Tiada Badge Jenama Menghalang) */}
        <h1 style={{
          fontSize: 'clamp(1.85rem, 4.5vw, 2.95rem)',
          fontWeight: 900, color: '#0F172A',
          lineHeight: 1.25, letterSpacing: '-0.025em',
          marginBottom: '1.25rem',
        }}>
          Alhamdulillah Gangguan Jin &amp; Sihir Yang Dihantar Berulang kali pulih...{' '}
          <span style={{ color: '#047857' }}>Selepas Guna Item Pengisian E-Syifa</span>
        </h1>

        {/* 2. H4 DESCRIPTION */}
        <h4 style={{
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          fontWeight: 600, color: '#1E293B',
          lineHeight: 1.65, maxWidth: '720px',
          margin: '0 auto 1.5rem auto',
        }}>
          Rawat diri sendiri 24 jam di rumah tanpa perlu ulang-alik ke pusat rawatan dan membakar ribuan ringgit 👇🏻
        </h4>

        {/* 3. RATING BADGE (Tepat Di Bawah H4 Sebagai Pengesahan Segera) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          padding: '0.45rem 1.2rem',
          borderRadius: '9999px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <span style={{ color: '#D97706', fontSize: '1rem', letterSpacing: '2px' }}>⭐⭐⭐⭐⭐</span>
          <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 700 }}>
            Dinilai <strong style={{ color: '#0F172A' }}>4.9/5</strong> oleh 850+ Pesakit Yang Telah Berikhtiar
          </span>
        </div>

        {/* 4. MEDIA VISUAL (Mockup Item Pengisian) */}
        <div style={{
          width: '135px', height: '135px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF, #ECFDF5)',
          border: '3px solid #10B981',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem auto',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.18)',
        }}>
          <span style={{ fontSize: '3rem' }}>💎</span>
          <span style={{ fontSize: '0.65rem', color: '#065F46', fontWeight: 900, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
            ITEM PENGISIAN
          </span>
        </div>

        {/* 5. BUTTON CTA */}
        <div>
          <a
            href="#borang"
            onClick={scrollToForm}
            style={{
              display: 'inline-block', padding: '1.2rem 3rem',
              fontSize: '1.15rem', fontWeight: 900, color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)',
              border: '2px solid #FEF08A', letterSpacing: '-0.01em',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👉🏻 BELI SEKARANG
          </a>
          <p style={{ marginTop: '0.85rem', fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
            🔒 Bayaran Selamat Melalui FPX Online Banking · Pelarasan Mingguan Percuma
          </p>
        </div>

      </div>
    </section>
  );
}
