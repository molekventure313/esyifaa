'use client';

export default function PengisianClosingSection() {
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
        <span style={{
          display: 'inline-block',
          background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
          color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
          fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '1.25rem',
        }}>
          💎 Jangan Tangguh Lagi
        </span>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
          fontWeight: 900, color: '#FEF3C7',
          marginTop: '0.25rem', marginBottom: '1rem',
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Barang Anda Tunggu Untuk Diisikan
        </h2>

        <p style={{
          fontSize: '1.05rem', color: '#D1FAE5',
          lineHeight: 1.75, marginBottom: '2.5rem',
          maxWidth: '560px', margin: '0 auto 2.5rem auto',
        }}>
          Setiap hari tanpa perlindungan adalah hari anda dan keluarga terdedah.
          Mulakan pengisian hari ini — siap dalam <strong style={{ color: '#FDE047' }}>7 hari</strong>,
          pelarasan setiap minggu, <strong style={{ color: '#4ADE80' }}>selamanya</strong>.
        </p>

        <a href="#borang" onClick={scrollToForm} style={{
          display: 'inline-block', padding: '1.15rem 2.6rem',
          fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
          background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
          borderRadius: '50px', textDecoration: 'none',
          boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
          border: '2px solid #FEF08A',
        }}>
          💎 Tempah Pengisian RM90 Sekarang
        </a>

        <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic' }}>
          Bayar via FPX · Selamat · Patuh Syariah
        </p>
      </div>
    </section>
  );
}
