'use client';

const INCLUDES = [
  { icon: '🎬', text: '1 Video Rakaman Ruqyah Syariyyah' },
  { icon: '🔄', text: 'Guna Tanpa Had — Seumur Hidup' },
  { icon: '🔥', text: 'Rawatan Diri Peribadi' },
  { icon: '🏠', text: 'Rawatan &amp; Perlindungan Rumah' },
  { icon: '💧', text: 'Buat Air Tawar Sendiri' },
  { icon: '🧂', text: 'Buat Garam Mandian &amp; Pagar' },
  { icon: '🐍', text: 'Rawatan Bisa / Santau Dalam Badan' },
  { icon: '👪', text: 'Boleh Dikongsi Seluruh Keluarga' },
];

export default function EVideoPaymentSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          💳 Pakej &amp; Harga
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          E-Video Rawatan ESyifaa
        </h2>

        {/* Main price card */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid #FDE047',
          borderRadius: '24px', padding: '2.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(253,224,71,0.1) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          {/* Label */}
          <div style={{ fontSize: '0.75rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Pakej Digital — Sekali Bayar
          </div>

          {/* Price */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>
              RM150
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#D1FAE5', marginBottom: '1.5rem' }}>
            Sekali bayar · Guna seumur hidup · Dihantar via WhatsApp
          </div>

          {/* Includes grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left',
          }}>
            {INCLUDES.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(253,224,71,0.08)',
                border: '1px solid rgba(253,224,71,0.2)',
                borderRadius: '8px', padding: '0.5rem 0.75rem',
                fontSize: '0.82rem', color: '#FEF3C7', fontWeight: 600,
              }}>
                <span>{item.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <a href="#borang" onClick={scrollToForm} style={{
            display: 'inline-block', padding: '1.15rem 2.6rem',
            fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
            background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
            border: '2px solid #FEF08A', letterSpacing: '-0.01em',
          }}>
            🎬 Dapatkan E-Video RM150 Sekarang
          </a>

          <p style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#6EE7B7', fontStyle: 'italic', marginBottom: 0 }}>
            Bayar via FPX · Selamat · Dihantar via WhatsApp dalam 24 jam
          </p>
        </div>

        {/* Delivery info */}
        <div style={{
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: '14px', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '0.85rem', alignItems: 'flex-start', textAlign: 'left',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📱</span>
          <div>
            <div style={{ fontWeight: 800, color: '#60A5FA', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Cara Terima Video
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>
              Selepas bayaran berjaya, perawat ESyifaa akan hubungi anda melalui{' '}
              <strong style={{ color: '#FEF3C7' }}>WhatsApp dalam masa 24 jam</strong>{' '}
              dan hantar E-Video Rawatan secara langsung. Simpan video tersebut — boleh guna
              berulang kali tanpa had.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
