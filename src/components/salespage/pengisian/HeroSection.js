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
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 40%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '4.5rem 1.25rem 3.5rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #A7F3D0',
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#FFFFFF', border: '1.5px solid #6EE7B7',
          padding: '0.45rem 1.25rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.8rem', fontWeight: 800, color: '#065F46',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          boxShadow: '0 2px 10px rgba(5, 150, 105, 0.08)',
        }}>
          🌿 ESyifaa · Pengisian Ayat Ruqyah Jarak Jauh
        </div>

        {/* Social Proof Stars Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.45rem', marginBottom: '1.5rem',
        }}>
          <span style={{ color: '#D97706', fontSize: '1.1rem', letterSpacing: '2px' }}>⭐⭐⭐⭐⭐</span>
          <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 700 }}>
            Dinilai <strong style={{ color: '#0F172A' }}>4.9/5</strong> oleh 850+ Pesakit Yang Telah Berikhtiar
          </span>
        </div>

        {/* H1 — Headline Arahan Pengguna (High Contrast & Clear) */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4.3vw, 2.85rem)',
          fontWeight: 900, color: '#0F172A',
          lineHeight: 1.25, letterSpacing: '-0.025em',
          marginBottom: '1.25rem',
        }}>
          Alhamdulillah Gangguan Jin &amp; Sihir Yang Dihantar Berulang kali pulih...{' '}
          <span style={{ color: '#047857' }}>Selepas Guna Item Pengisian E-Syifa</span>
        </h1>

        {/* H4 — Subheadline Cadangan Disahkan */}
        <h4 style={{
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          fontWeight: 600, color: '#1E293B',
          lineHeight: 1.65, maxWidth: '720px',
          margin: '0 auto 1.5rem auto',
        }}>
          Rawat diri sendiri 24 jam di rumah tanpa perlu ulang-alik ke pusat rawatan dan membakar ribuan ringgit.
        </h4>

        {/* Problem framing */}
        <p style={{
          fontSize: '1rem', color: '#475569',
          lineHeight: 1.75, maxWidth: '680px',
          margin: '0 auto 1.75rem auto',
        }}>
          Perawat boleh bantu buang jin — tapi bila balik ke rumah, sihir dihantar semula dan gangguan datang balik.{' '}
          <strong style={{ color: '#0F172A' }}>Satu sesi rawatan tidak pernah cukup untuk kes sihir dendam &amp; saka kronik.</strong>
        </p>

        {/* Solution callout box (Light, High Contrast) */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #10B981',
          borderRadius: '16px',
          padding: '1.25rem 1.75rem',
          maxWidth: '680px',
          margin: '0 auto 2.25rem auto',
          textAlign: 'left',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            ✨ Penyelesaian Sebenar
          </div>
          <p style={{ margin: 0, fontSize: '0.98rem', color: '#0F172A', lineHeight: 1.65, fontWeight: 600 }}>
            <strong style={{ color: '#047857' }}>Pengisian E-Syifa&apos; Pada Item Peribadi Anda</strong> —
            dipasakkan bacaan ayat ruqyah syar&apos;iyyah selama 3 hari berturut-turut.
            Ibarat ada perawat peribadi di sisi anda.
            <span style={{ color: '#059669' }}> Rawat sendiri, tanpa had, selamat seumur hidup.</span>
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
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#065F46', fontSize: '0.84rem',
              fontWeight: 700, padding: '0.4rem 1rem',
              borderRadius: '999px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}>{item}</span>
          ))}
        </div>

        {/* Visual Focus (Light Card) */}
        <div style={{
          width: '130px', height: '130px', borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF, #ECFDF5)',
          border: '3px solid #10B981',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2.5rem auto',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
        }}>
          <span style={{ fontSize: '2.8rem' }}>💎</span>
          <span style={{ fontSize: '0.65rem', color: '#065F46', fontWeight: 900, letterSpacing: '0.05em', marginTop: '0.2rem' }}>
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
              boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)',
              border: '2px solid #FEF08A', letterSpacing: '-0.01em',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👉🏻 Tempah Pengisian Item Anda Sekarang
          </a>
          <p style={{ marginTop: '0.85rem', fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
            🔒 Bayaran Selamat Melalui FPX Online Banking · Pelarasan Mingguan Percuma
          </p>
        </div>

      </div>
    </section>
  );
}
