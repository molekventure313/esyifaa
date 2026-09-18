'use client';

export default function AnnouncementBar() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #064E3B 0%, #047857 50%, #064E3B 100%)',
      color: '#FFFFFF',
      padding: '0.65rem 1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      boxShadow: '0 2px 10px rgba(6, 78, 59, 0.25)',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>🌿 WANGIAN SUNNAH PENDINDING GANGGUAN:</span>
        <span style={{ color: '#FDE047' }}>POS PERCUMA &amp; COD (BARANG SAMPAI BARU BAYAR) DISEDIAKAN SELURUH MALAYSIA 👍🏻</span>
      </div>
    </div>
  );
}
