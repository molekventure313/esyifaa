'use client';

export default function RawatSendiriClosingSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #031E17 0%, #021812 100%)',
      color: '#FFFFFF', padding: '5rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <span style={{ fontSize: '2rem' }}>🛡️</span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
          fontWeight: 900, color: '#FEF3C7',
          marginTop: '0.5rem', marginBottom: '0.85rem',
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Selesaikan Kebergantungan Anda{' '}
          <span style={{ color: '#FDE047' }}>Hari Ini</span>
        </h2>

        <p style={{
          fontSize: '1.05rem', color: '#D1FAE5',
          lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 1rem',
        }}>
          RM90 sekali sahaja — kemudian rawat diri &amp; lindungi keluarga seumur hidup.
          Tiada perlu tunggu slot. Tiada perlu bayar lagi.
        </p>

        <p style={{
          fontSize: '0.95rem', color: '#FDE047', fontWeight: 700,
          lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 2.5rem',
        }}>
          Pelarasan pengisian setiap minggu — percuma selamanya.
          Buat air tawar sendiri. Lindungi rumah anda.
        </p>

        {/* Main CTA group */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

          {/* FPX button */}
          <a href="#borang" onClick={scrollToForm} style={{
            display: 'inline-block', padding: '1.15rem 2.8rem',
            fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
            border: '2px solid #FEF08A',
            letterSpacing: '-0.01em',
          }}>
            🛡️ Tempah Pengisian — Mula Rawat Sendiri
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '340px' }}>
            <div style={{ flex: 1, borderTop: '1px solid rgba(167,243,208,0.2)' }} />
            <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontWeight: 600 }}>atau</span>
            <div style={{ flex: 1, borderTop: '1px solid rgba(167,243,208,0.2)' }} />
          </div>

          {/* WA button */}
          <a
            href="https://wa.me/601118939984?text=Saya%20nak%20buat%20pengisian%20item%20RM90"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.6rem', padding: '0.95rem 2rem',
              fontSize: '1rem', fontWeight: 800, color: '#FFFFFF',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(37,211,102,0.4)',
              border: '2px solid rgba(37,211,102,0.5)',
            }}
          >
            💬 Nak Bayar Kat WhatsApp?
          </a>

          <p style={{ marginTop: '0.25rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Bayar via FPX atau WA · Selamat · Patuh Syariah
          </p>

        </div>

        {/* Final reassurance */}
        <div style={{
          marginTop: '3rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          alignItems: 'center',
        }}>
          {[
            '🛡️ Siap dalam 3 hari — terus boleh guna',
            '🔄 Pelarasan pengisian setiap minggu — percuma selamanya',
            '💯 2 jaminan refund — tiada risiko',
            '🤲 100% Ruqyah Syar\'iyyah — Al-Quran & Asma\' Allah sahaja',
          ].map((t, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.82rem', color: '#A7F3D0', fontWeight: 600,
            }}>{t}</span>
          ))}
        </div>

      </div>
    </section>
  );
}
