'use client';

export default function AnnouncementBar() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #991B1B 0%, #B91C1C 50%, #991B1B 100%)',
      color: '#FFFFFF',
      padding: '0.65rem 1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      boxShadow: '0 2px 10px rgba(153, 27, 27, 0.25)',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>📢 IKHTIAR RUMAHTANGGA:</span>
        <span style={{ color: '#FEF08A' }}>POS PERCUMA &amp; COD (BARANG SAMPAI BARU BAYAR) DISEDIAKAN SELURUH MALAYSIA 👍🏻</span>
      </div>
    </div>
  );
}
