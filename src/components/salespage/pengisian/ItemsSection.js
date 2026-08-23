'use client';

const ITEMS = [
  { icon: '💍', title: 'Cincin', desc: 'Paling berkesan — sentiasa di jari anda. Sentuhan terus dengan kulit memberikan kesan perlindungan yang berterusan.', badge: '⭐ Paling Popular', badgeColor: '#FDE047', badgeText: '#042E23' },
  { icon: '📿', title: 'Tasbih', desc: 'Selalu dalam tangan ketika berzikir. Pengisian menjadikan setiap genggaman sebagai sumber kekuatan dan perlindungan.', badge: null },
  { icon: '⌚', title: 'Jam Tangan / Gelang', desc: 'Dipakai setiap hari, sentiasa di pergelangan tangan. Perlindungan yang tidak pernah tertanggal.', badge: '✅ Popular', badgeColor: '#4ADE80', badgeText: '#042E23' },
  { icon: '🔑', title: 'Barang Lain Yang Selalu Digunakan', desc: 'Rantai, beg, telefon case, atau apa-apa sahaja yang sentiasa bersama anda. Bebas pilih barang yang paling bermakna.', badge: null },
];

export default function PengisianItemsSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💎 Barang Yang Boleh Diisi
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Pilih Barang Yang Paling Selalu Bersama Anda
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto' }}>
            Perawat ESyifaa buat pengisian secara <strong style={{ color: '#FDE047' }}>jarak jauh</strong> — anda tidak perlu pos atau hantar barang ke mana-mana.
            Pilih barang yang selalu berada bersama anda untuk perlindungan maksimum.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {ITEMS.map((item, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '16px', padding: '1.5rem',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
              {item.badge && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: item.badgeColor, color: item.badgeText,
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '0.2rem 0.6rem', borderRadius: '999px',
                }}>
                  {item.badge}
                </div>
              )}
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{item.title}</div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#A7F3D0', lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          background: 'rgba(253,224,71,0.07)', border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#FEF3C7', lineHeight: 1.6 }}>
            📋 Nyatakan nama &amp; jenis barang anda semasa mengisi borang tempahan.
            Perawat akan buat pengisian berdasarkan maklumat yang anda berikan.
          </p>
        </div>
      </div>
    </section>
  );
}
