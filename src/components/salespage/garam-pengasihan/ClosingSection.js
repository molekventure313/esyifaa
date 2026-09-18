'use client';

export default function GaramClosingSection() {
  const scrollToForm = () => {
    document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #FFF7ED 0%, #FED7AA 100%)',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderTop: '1px solid #FDBA74',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
          🤲🏻💍
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.35rem)',
          fontWeight: 900,
          color: '#9A3412',
          marginBottom: '1rem',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}>
          Jangan Biarkan Masjid Yang Dibina Bertahun-Tahun Musnah Dalam Sekelip Mata
        </h2>

        <p style={{
          fontSize: '1.05rem',
          color: '#7C2D12',
          lineHeight: 1.8,
          marginBottom: '2.25rem',
        }}>
          Rumahtangga adalah amanah yang sangat berharga. Jika hari ini hati pasangan anda terasa jauh, jangan berputus asa daripada rahmat Allah. Jadikan Garam Pengasihan Masakan ESyifaa sebagai wasilah ikhtiar doa dan kasih sayang anda dari dapur.
        </p>

        <button
          onClick={scrollToForm}
          style={{
            padding: '1.15rem 2.8rem',
            fontSize: '1.12rem',
            fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(180deg, #EA580C 0%, #C2410C 100%)',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(234, 88, 12, 0.4)',
            fontFamily: ff,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 35px rgba(234, 88, 12, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(234, 88, 12, 0.4)';
          }}
        >
          👉🏻 Tempah Garam Pengasihan Masakan Hari Ini
        </button>

        <p style={{ margin: '1.25rem 0 0 0', fontSize: '0.85rem', color: '#9A3412', fontWeight: 600 }}>
          🔒 Jaminan Wang Dikembalikan 100% · Boleh Bayar Masa Terima (COD)
        </p>

      </div>
    </section>
  );
}
