'use client';

export default function PengisianAnnouncementBar() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #B45309 0%, #D97706 50%, #B45309 100%)',
      color: '#FFFFFF',
      padding: '0.65rem 1rem',
      textAlign: 'center',
      fontSize: '0.82rem',
      fontWeight: 800,
      letterSpacing: '0.03em',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      position: 'relative',
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          background: '#FEF3C7',
          color: '#78350F',
          fontSize: '0.68rem',
          fontWeight: 900,
          padding: '0.15rem 0.55rem',
          borderRadius: '999px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Slot Terhad
        </span>
        <span>
          ⚡ PROMOSI PENGENALAN: Baki Terhad Untuk Pengisian Ruqyah Jarak Jauh Bulan Ini (Harga RM90 Sahaja) 💎
        </span>
      </div>
    </div>
  );
}
