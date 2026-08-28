'use client';

export default function EVideoClosingSection() {
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

        <span style={{ fontSize: '2rem' }}>🎬</span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
          fontWeight: 900, color: '#FEF3C7',
          marginTop: '0.5rem', marginBottom: '0.85rem',
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Dapatkan E-Video Rawatan{' '}
          <span style={{ color: '#FDE047' }}>Anda Hari Ini</span>
        </h2>

        <p style={{
          fontSize: '1.05rem', color: '#D1FAE5',
          lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 1rem',
        }}>
          RM150 sekali sahaja — kemudian rawat diri, lindungi keluarga &amp; rumah,
          buat air tawar &amp; garam sendiri, seumur hidup.
        </p>

        <p style={{
          fontSize: '0.95rem', color: '#FDE047', fontWeight: 700,
          lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 2.5rem',
        }}>
          Digital. Tanpa pos. Dihantar terus ke WhatsApp anda dalam masa 24 jam.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

          <a href="#borang" onClick={scrollToForm} style={{
            display: 'inline-block', padding: '1.15rem 2.8rem',
            fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
            border: '2px solid #FEF08A', letterSpacing: '-0.01em',
          }}>
            🎬 Tempah E-Video RM150 — Mula Rawat Sendiri
          </a>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Bayar via FPX · Selamat · 256-bit SSL · Dihantar via WA dalam 24 jam
          </p>

        </div>

        {/* Final trust list */}
        <div style={{
          marginTop: '3rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          alignItems: 'center',
        }}>
          {[
            '🎬 8 video rawatan + 1 amalan bonus — pakej lengkap',
            '🔄 Guna tanpa had — seumur hidup, tanpa kos tambahan',
            '👪 Boleh dikongsi seluruh keluarga',
            '💯 2 jaminan refund — tiada risiko',
            '📖 100% Ruqyah Syar\'iyyah — Al-Quran & Doa Sahih sahaja',
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
