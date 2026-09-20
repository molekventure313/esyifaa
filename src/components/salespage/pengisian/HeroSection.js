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
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem 3.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(254, 243, 199, 0.12)',
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🌿 ESyifaa · Pengisian Ayat Ruqyah Jarak Jauh
        </div>

        {/* Social Proof Stars Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', marginBottom: '1.5rem',
        }}>
          <span style={{ color: '#FDE047', fontSize: '1.05rem', letterSpacing: '2px' }}>⭐⭐⭐⭐⭐</span>
          <span style={{ fontSize: '0.85rem', color: '#FEF3C7', fontWeight: 700 }}>
            Dinilai 4.9/5 oleh 850+ Pesakit Yang Telah Berikhtiar
          </span>
        </div>

        {/* H1 — Headline Arahan Pengguna */}
        <h1 style={{
          fontSize: 'clamp(1.7rem, 4.2vw, 2.75rem)',
          fontWeight: 900, color: '#FEF3C7',
          lineHeight: 1.25, letterSpacing: '-0.025em',
          marginBottom: '1.25rem',
        }}>
          Alhamdulillah Gangguan Jin &amp; Sihir Yang Dihantar Berulang kali pulih...{' '}
          <span style={{ color: '#FDE047' }}>Selepas Guna Item Pengisian E-Syifa</span>
        </h1>

        {/* H4 — Subheadline Cadangan Disahkan */}
        <h4 style={{
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          fontWeight: 600, color: '#A7F3D0',
          lineHeight: 1.65, maxWidth: '720px',
          margin: '0 auto 1.75rem auto',
        }}>
          Rawat diri sendiri 24 jam di rumah tanpa perlu ulang-alik ke pusat rawatan dan membakar ribuan ringgit.
        </h4>

        {/* Problem framing */}
        <p style={{
          fontSize: '0.98rem', color: '#D1FAE5',
          lineHeight: 1.75, maxWidth: '680px',
          margin: '0 auto 1.75rem auto',
          opacity: 0.9,
        }}>
          Perawat boleh bantu buang jin — tapi bila balik ke rumah, sihir dihantar semula dan gangguan datang balik.{' '}
          <strong style={{ color: '#FEF3C7' }}>Satu sesi rawatan tidak pernah cukup untuk kes sihir dendam &amp; saka kronik.</strong>
        </p>

        {/* Solution callout box */}
        <div style={{
          background: 'rgba(253,224,71,0.08)',
          border: '2px solid rgba(253,224,71,0.35)',
          borderRadius: '16px',
          padding: '1.25rem 1.75rem',
          maxWidth: '680px',
          margin: '0 auto 2.25rem auto',
          textAlign: 'left',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FDE047', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            ✨ Penyelesaian Sebenar
          </div>
          <p style={{ margin: 0, fontSize: '0.96rem', color: '#FEF3C7', lineHeight: 1.65, fontWeight: 600 }}>
            <strong style={{ color: '#FDE047' }}>Pengisian E-Syifa&apos; Pada Item Peribadi Anda</strong> —
            dipasakkan bacaan ayat ruqyah syar&apos;iyyah selama 3 hari.
            Ibarat ada perawat peribadi di sisi anda.
            <span style={{ color: '#4ADE80' }}> Rawat sendiri, tanpa had, selamat seumur hidup.</span>
          </p>
        </div>

        {/* Trust pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0.6rem', marginBottom: '2.5rem',
        }}>
          {[
            '✅ 100% Jarak Jauh — Tak Perlu Pos Barang',
            '📖 100% Patuh Syariah & Al-Quran',
            '🔄 Pelarasan Mingguan Percuma',
            '⏱️ Siap Dalam 3 Hari Berturut',
          ].map((item, i) => (
            <span key={i} style={{
              background: 'rgba(167,243,208,0.1)',
              border: '1px solid rgba(167,243,208,0.25)',
              color: '#A7F3D0', fontSize: '0.82rem',
              fontWeight: 600, padding: '0.35rem 0.95rem',
              borderRadius: '999px',
            }}>{item}</span>
          ))}
        </div>

        {/* Visual Focus */}
        <div style={{
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #065F46, #021812)',
          border: '3px solid #FDE047',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2.5rem auto',
          boxShadow: '0 0 50px rgba(253,224,71,0.2), 0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '3rem' }}>💎</span>
          <span style={{ fontSize: '0.65rem', color: '#FDE047', fontWeight: 800, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
            ITEM PENGISIAN
          </span>
        </div>

        {/* CTA Button */}
        <div>
          <a
            href="#borang"
            onClick={scrollToForm}
            style={{
              display: 'inline-block', padding: '1.2rem 2.8rem',
              fontSize: '1.12rem', fontWeight: 800, color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
              border: '2px solid #FEF08A', letterSpacing: '-0.01em',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👉🏻 Tempah Pengisian Item Anda Sekarang
          </a>
          <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7' }}>
            🔒 Bayaran Selamat Melalui FPX Online Banking · Pelarasan Mingguan Percuma
          </p>
        </div>

      </div>
    </section>
  );
}
