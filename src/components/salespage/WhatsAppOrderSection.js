'use client';

import useSalesContact, { buildWaLink } from '@/components/salespage/useSalesContact';

/**
 * Section "Nak order melalui Whatsapp?" — diletak selepas borang order.
 * SP HQ → no. HQ. SP marketer → no. marketer sendiri; kalau marketer belum isi → section TIDAK dipapar.
 *
 * @param product     nama produk dalam mesej WA (cth: 'Sabun Garam Himalaya')
 * @param background  warna latar section (sambung dari borang order di atas)
 */
export default function WhatsAppOrderSection({ product, background = '#F0FDF4' }) {
  const { ready, number, isMarketer } = useSalesContact();
  if (!ready || !number) return null;

  const ff = 'var(--font-inter), -apple-system, sans-serif';
  const message = `Assalamualaikum${isMarketer ? '' : ' ustaz'}, saya nak order ${product} melalui WhatsApp`;

  return (
    <section style={{
      background,
      padding: '0 1.25rem 4.5rem',
      fontFamily: ff,
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        background: '#FFFFFF',
        border: '2px solid #CBD5E1',
        borderRadius: '24px',
        padding: '3rem 2rem 2.75rem',
        textAlign: 'center',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
      }}>
        {/* WhatsApp Circular Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 14px rgba(37, 211, 102, 0.28)',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.39C16.31 14.26 15.1 13.67 14.87 13.58C14.65 13.5 14.48 13.46 14.31 13.71C14.15 13.96 13.67 14.52 13.52 14.69C13.38 14.85 13.23 14.88 12.98 14.75C12.73 14.63 11.93 14.36 10.98 13.52C10.24 12.86 9.74 12.05 9.6 11.8C9.45 11.55 9.58 11.42 9.71 11.29C9.82 11.18 9.96 11 10.08 10.85C10.21 10.71 10.25 10.61 10.33 10.44C10.42 10.28 10.37 10.13 10.31 10.01C10.25 9.88 9.75 8.65 9.54 8.15C9.34 7.66 9.14 7.73 8.98 7.72C8.83 7.71 8.66 7.71 8.5 7.71C8.33 7.71 8.06 7.77 7.83 8.02C7.6 8.27 6.96 8.87 6.96 10.09C6.96 11.31 7.85 12.49 7.97 12.65C8.1 12.82 9.72 15.32 12.2 16.39C12.79 16.65 13.25 16.8 13.61 16.92C14.2 17.11 14.74 17.08 15.17 17.02C15.65 16.95 16.64 16.42 16.85 15.83C17.05 15.25 17.05 14.75 16.99 14.65C16.93 14.54 16.81 14.51 16.56 14.39Z" fill="white"/>
          </svg>
        </div>

        {/* Headline */}
        <h3 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 1.95rem)',
          fontWeight: 900,
          color: '#0F172A',
          margin: '0 0 1rem 0',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}>
          Nak order melalui Whatsapp?
        </h3>

        {/* Paragraph */}
        <p style={{
          fontSize: '0.98rem',
          color: '#475569',
          lineHeight: 1.65,
          maxWidth: '520px',
          margin: '0 auto 1.75rem auto',
          fontWeight: 500,
        }}>
          Klik butang hijau di bawah untuk hubungi kami dan order melalui Whatsapp. Sila nyatakan pakej yang anda mahu. Pembayaran boleh dibuat melalui online transfer &amp; QR code.
        </p>

        {/* Green CTA Button */}
        <a
          href={buildWaLink(number, message)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: '#48A856',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.05rem',
            padding: '0.85rem 2.4rem',
            borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(72, 168, 86, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          Whatsapp Kami
        </a>
      </div>
    </section>
  );
}
