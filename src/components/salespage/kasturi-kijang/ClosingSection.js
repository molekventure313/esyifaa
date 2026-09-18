'use client';

export default function KasturiClosingSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderTop: '1px solid #FCD34D',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
          🦌✨🤲🏻
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.35rem)',
          fontWeight: 900,
          color: '#78350F',
          marginBottom: '1rem',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}>
          Jangan Biarkan Gangguan Halus Terus Meragut Ketenangan &amp; Tidur Malam Anda
        </h2>

        <p style={{
          fontSize: '1.05rem',
          color: '#92400E',
          lineHeight: 1.8,
          marginBottom: '2.25rem',
        }}>
          Tidur yang lena, jiwa yang tenang dan rumah yang damai adalah nikmat paling mahal. Kembalikan keselesaan hidup anda dan keluarga berpandukan sunnah wangian yang dicintai Nabi SAW. Amalkan Minyak Kasturi Kijang Asli E-Syifa&apos; hari ini.
        </p>

        <button
          onClick={scrollToForm}
          style={{
            padding: '1.15rem 2.8rem',
            fontSize: '1.12rem',
            fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(217, 119, 6, 0.4)',
            fontFamily: ff,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 35px rgba(217, 119, 6, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(217, 119, 6, 0.4)';
          }}
        >
          👉🏻 Tempah Minyak Kasturi Kijang Sekarang
        </button>

        <p style={{ margin: '1.25rem 0 0 0', fontSize: '0.85rem', color: '#78350F', fontWeight: 600 }}>
          🔒 Jaminan Wang Dikembalikan 100% · Boleh Bayar Masa Terima (COD)
        </p>

      </div>
    </section>
  );
}
