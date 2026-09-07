'use client';

export default function SabunClosingSection() {
  const scrollToForm = () => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #031E17 0%, #021812 100%)',
      padding: '5rem 1rem', fontFamily: ff, textAlign: 'center', color: '#FFFFFF',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <span style={{
          display: 'inline-block', background: 'rgba(253,224,71,0.1)',
          border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px',
          fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '1.25rem',
        }}>
          🧼 Jangan Tangguh Lagi
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 900, color: '#FEF3C7',
          marginTop: '0.25rem', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Setiap Hari Tanpa Perlindungan —{' '}
          <span style={{ color: '#F87171' }}>Gangguan Terus Bertapak</span>
        </h2>

        <p style={{ fontSize: '1.05rem', color: '#D1FAE5', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>
          Sihir, saka dan santau tidak pergi sendiri. Ia perlu diusir secara aktif.
          Dengan Sabun Garam Himalaya Pengisian ESyifaa, anda boleh{' '}
          <strong style={{ color: '#FDE047' }}>rawat diri sendiri setiap kali mandi</strong> —
          tanpa perlu bergantung pada sesi rawatan, tanpa kos tambahan, in shaa Allah sembuh.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              display: 'inline-block', padding: '1.15rem 2.6rem',
              fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              borderRadius: '50px', border: '2px solid #FEF08A',
              boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
              cursor: 'pointer', fontFamily: ff,
            }}
          >
            🧼 Tempah Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Dari RM39 + postage RM5 · COD & FPX · Selamat & Patuh Syariah
          </p>
        </div>

      </div>
    </section>
  );
}
