'use client';

import { HQ_WHATSAPP } from '@/components/salespage/useSalesContact';

export default function FspAirTawarSection() {
  const waNumber = HQ_WHATSAPP;
  const pretext = encodeURIComponent('Saya nak scan guna air tawar');
  const waUrl = `https://wa.me/${waNumber}?text=${pretext}`;

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
        color: '#0F172A',
        padding: '4.5rem 1rem',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
        textAlign: 'center',
        borderTop: '2px solid #BBF7D0',
        borderBottom: '2px solid #BBF7D0',
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Label */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(5, 150, 105, 0.12)', border: '1px solid #6EE7B7',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>💧</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Masih Ragu-Ragu? Cuba Dahulu
          </span>
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)',
          fontWeight: 800,
          color: '#042E23',
          marginBottom: '1rem',
          lineHeight: 1.3,
          letterSpacing: '-0.02em'
        }}>
          Dapatkan <span style={{ color: '#059669' }}>Scanning Air Tawar</span> Percuma
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '1.05rem', lineHeight: 1.7, color: '#374151',
          marginBottom: '1.5rem', maxWidth: '640px', margin: '0 auto 1.5rem auto'
        }}>
          Jika anda masih ragu-ragu sama ada ada gangguan atau tidak — dapatkan scanning air tawar percuma dari perawat kami.
        </p>

        {/* How it works callout */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #6EE7B7',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 30px rgba(5,150,105,0.1)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>💧</span>
            <div>
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#042E23', fontSize: '1rem' }}>
                Bagaimana Scanning Air Tawar Berfungsi?
              </p>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Perawat kami akan berikan bacaan kepada segelas air tawar biasa. Jika ada gangguan dalam badan,{' '}
                <strong style={{ color: '#059669' }}>badan akan bereaksi secara semula jadi</strong> apabila meminum air tersebut —
                seperti rasa pening, sesak, atau sedikit tidak selesa. Ini tanda nyata ada sesuatu yang perlu dirawat.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #D1FAE5' }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>✅</span>
            <div>
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#042E23', fontSize: '1rem' }}>
                100% Percuma & Tanpa Sebarang Obligasi
              </p>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Tiada bayaran. Tiada paksaan untuk teruskan rawatan. Ia sekadar panduan awal buat anda.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #D1FAE5' }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>📲</span>
            <div>
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: 800, color: '#042E23', fontSize: '1rem' }}>
                Hubungi Perawat Terus via WhatsApp
              </p>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.65 }}>
                Klik butang di bawah — mesej akan terhantar terus kepada perawat kami. Mudah, cepat, tanpa pertanyaan rumit.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.1rem 2.2rem',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(37,211,102,0.4)',
            border: '2px solid #34D399',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 35px rgba(37,211,102,0.5)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,211,102,0.4)';
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp Perawat — Minta Scanning Air Tawar
        </a>

        <p style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>
          Mesej: "Saya nak scan guna air tawar" akan terhantar terus kepada perawat kami.
        </p>

      </div>
    </section>
  );
}
