'use client';

export default function SabunClosingSection() {
  const scrollToForm = () => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
      padding: '5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      color: '#0F172A',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <span style={{
          display: 'inline-block',
          background: '#FFFFFF',
          border: '1px solid #A7F3D0',
          color: '#047857',
          padding: '0.4rem 1.1rem',
          borderRadius: '9999px',
          fontSize: '0.76rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)',
        }}>
          🧼 Jangan Tangguh Lagi
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)',
          fontWeight: 800,
          color: '#0F172A',
          marginTop: '0.25rem',
          marginBottom: '1rem',
          letterSpacing: '-0.025em',
          lineHeight: 1.25,
        }}>
          Setiap Hari Tanpa Ikhtiar —{' '}
          <span style={{ color: '#E11D48' }}>Gangguan Terus Bertapak</span>
        </h2>

        <p style={{
          fontSize: '1.02rem',
          color: '#475569',
          lineHeight: 1.75,
          maxWidth: '560px',
          margin: '0 auto 2.25rem auto',
        }}>
          Sihir, saka dan santau tidak hilang dengan sendiri. Dengan Sabun Garam Himalaya Pengisian ESyifaa, anda boleh{' '}
          <strong style={{ color: '#047857' }}>berikhtiar memulihkan diri sendiri setiap kali mandi</strong> —
          mudah, selamat, menyegarkan dan patuh syariah, in shaa Allah.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={scrollToForm}
            style={{
              padding: '1.1rem 2.6rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              borderRadius: '9999px',
              border: 'none',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              fontFamily: ff,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            🧼 Tempah Sabun Pengisian Sekarang
          </button>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
            Dari RM39 + postage RM5 · Pilihan Bayar Masa Terima (COD) atau FPX · 100% Ruqyah Syar&apos;iyyah
          </p>
        </div>

      </div>
    </section>
  );
}
