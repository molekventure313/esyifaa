'use client';

export default function SabunClosingSection() {
  const scrollToForm = () => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #061510 0%, #040E0B 100%)',
      padding: '5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      color: '#FFFFFF',
    }}>
      <div style={{ maxWidth: '660px', margin: '0 auto' }}>

        <span style={{
          display: 'inline-block',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: '#FBBF24',
          padding: '0.35rem 0.95rem',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>
          🧼 Jangan Tangguh Lagi
        </span>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.8vw, 2.35rem)',
          fontWeight: 800,
          color: '#F8FAFC',
          marginTop: '0.25rem',
          marginBottom: '1rem',
          letterSpacing: '-0.025em',
          lineHeight: 1.25,
        }}>
          Setiap Hari Tanpa Ikhtiar —{' '}
          <span style={{ color: '#FB7185' }}>Gangguan Terus Bertapak</span>
        </h2>

        <p style={{
          fontSize: '1rem',
          color: '#94A3B8',
          lineHeight: 1.75,
          maxWidth: '540px',
          margin: '0 auto 2rem auto',
        }}>
          Sihir, saka dan santau tidak hilang dengan sendiri. Dengan Sabun Garam Himalaya Pengisian ESyifaa, anda boleh{' '}
          <strong style={{ color: '#F1F5F9' }}>berikhtiar memulihkan diri sendiri setiap kali mandi</strong> —
          mudah, selamat dan patuh syariah, in shaa Allah.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.05rem 2.5rem',
              fontSize: '1.02rem',
              fontWeight: 700,
              color: '#061811',
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.25)',
              cursor: 'pointer',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            🧼 Tempah Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
            Dari RM39 + postage RM5 · Pilihan COD atau FPX · 100% Ruqyah Syar&apos;iyyah
          </p>
        </div>

      </div>
    </section>
  );
}
