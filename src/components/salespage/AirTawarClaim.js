'use client';

import useSalesContact, { buildWaLink, HQ_WHATSAPP_SABUN } from '@/components/salespage/useSalesContact';

// TQ page — claim Air Tawar Jarak Jauh PERCUMA (offer Sabun Garam — semua pembeli di SP HQ).
// No. WhatsApp ikut sistem SP: order HQ → no. HQ Sabun, order marketer (?m=) → no. marketer.
// Marketer belum isi no. WhatsApp → guna no. HQ Sabun (claim tak boleh tersekat).
// Sengaja TIDAK fire event Lead — pelanggan dah pun membeli.

export default function AirTawarClaim({ productName, fullName, orderId }) {
  const { ready, number } = useSalesContact({ hqNumber: HQ_WHATSAPP_SABUN });
  const waNumber = number || HQ_WHATSAPP_SABUN;
  const ref = orderId ? String(orderId).slice(0, 8).toUpperCase() : '';
  const message = [
    'Assalamualaikum, saya dah beli',
    productName || 'Sabun Garam',
    fullName ? `(nama: ${fullName})` : '',
    ref ? `— no. order ${ref}.` : '.',
    'Saya nak claim Air Tawar Jarak Jauh PERCUMA 💧',
  ].filter(Boolean).join(' ').replace(' .', '.');

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0C4A6E 0%, #075985 100%)', border: '2px solid #38BDF8', borderRadius: '18px',
      padding: '1.5rem 1.25rem', marginBottom: '2rem', textAlign: 'center', boxShadow: '0 12px 30px rgba(14,165,233,0.25)',
    }}>
      <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>💧</div>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7DD3FC', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
        Bonus Pakej Anda
      </div>
      <h2 style={{ fontSize: 'clamp(1.2rem, 3.4vw, 1.55rem)', fontWeight: 900, color: '#FFFFFF', margin: '0.3rem 0 0.6rem', lineHeight: 1.3 }}>
        Claim Air Tawar Jarak Jauh PERCUMA
      </h2>
      <p style={{ fontSize: '0.92rem', color: '#E0F2FE', lineHeight: 1.65, margin: '0 0 1.1rem' }}>
        Lengkapkan ikhtiar anda — <strong>pembersihan luaran</strong> dengan mandian Sabun Garam, <strong>pembersihan dalaman</strong> dengan Air Tawar yang dibacakan ruqyah oleh perawat.
      </p>

      <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.86rem', color: '#F0F9FF', lineHeight: 1.7 }}>
        <div>1️⃣ Tekan butang hijau di bawah</div>
        <div>2️⃣ Hantar gambar botol air mineral anda sendiri</div>
        <div>3️⃣ Perawat bacakan ayat ruqyah dari jarak jauh — minum &amp; amalkan</div>
      </div>

      {ready ? (
        <a
          href={buildWaLink(waNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.6rem', borderRadius: '50px',
            background: 'linear-gradient(180deg, #25D366 0%, #128C7E 100%)', color: '#FFFFFF', fontWeight: 900, fontSize: '1rem',
            textDecoration: 'none', boxShadow: '0 8px 22px rgba(37,211,102,0.4)', border: '2px solid #86EFAC',
          }}
        >
          💬 Saya Dah Beli — Claim Air Tawar Percuma
        </a>
      ) : (
        <div style={{ height: '56px' }} />
      )}
      <div style={{ fontSize: '0.75rem', color: '#BAE6FD', marginTop: '0.75rem' }}>Tiada caj tambahan · Bonus untuk semua pembeli</div>
    </div>
  );
}
