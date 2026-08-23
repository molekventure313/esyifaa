'use client';

const FEARS = [
  { icon: '📉', title: 'Gangguan Makin Parah Bila Dibiarkan', desc: 'Setiap hari tanpa rawatan, gangguan mengakar lebih dalam. Apa yang boleh diselesaikan awal, menjadi semakin sukar apabila ditangguh.' },
  { icon: '🔗', title: 'Sihir Penghalang Rezeki Terus Mengikat', desc: 'Selagi sihir tidak dinyahkan sepenuhnya, pintu rezeki kekal terkunci. Perniagaan terus sunyi. Peluang datang tapi hilang begitu sahaja.' },
  { icon: '👨‍👩‍👧', title: 'Keluarga & Anak-Anak Turut Terdedah', desc: 'Gangguan di dalam rumah boleh merebak kepada ahli keluarga lain — terutama anak-anak yang lebih sensitif dan mudah terdedah kepada gangguan ghaib.' },
  { icon: '🧠', title: 'Mental & Emosi Terhakis Perlahan-Lahan', desc: 'Serangan berulang tanpa perlindungan menyebabkan tekanan, anxiety, dan kemurungan. Lama-kelamaan, kekuatan diri semakin lemah dan tidak terasa.' },
  { icon: '💔', title: 'Rumahtangga Retak Kerana Campur Tangan Sihir', desc: 'Sihir pemisah yang tidak dirawat boleh membuatkan pasangan berubah hati secara perlahan. Perbalahan tanpa sebab. Perasaan dingin. Rumah tangga perlahan-lahan hancur.' },
  { icon: '💰', title: 'Kos Rawatan Berulang Terus Membebankan', desc: 'Tanpa cara rawatan sendiri, anda terpaksa terus bergantung pada perawat luar. Kos bertimbun. Jika ada perlindungan sendiri, semua ini boleh dielakkan.' },
];

export default function PengisianFearsSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #0B382D 0%, #1A0A0A 100%)',
      color: '#FFFFFF', padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          ⚠️ Amaran Penting
        </span>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Jika Gangguan Berulang Ini Tidak Diselesaikan Segera...
        </h2>
        <p style={{ fontSize: '1rem', color: '#FCA5A5', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          Ramai yang buat-buat tak kisah. Tapi pengalaman pesakit kami menunjukkan —{' '}
          <strong style={{ color: '#FDE047' }}>semakin lama dibiarkan, semakin teruk akibatnya.</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.2rem', textAlign: 'left', marginBottom: '2rem' }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(248,113,113,0.07)', border: '1.5px solid rgba(248,113,113,0.25)',
              borderRadius: '14px', padding: '1.4rem 1.2rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '1.6rem', lineHeight: 1, flexShrink: 0,
                  background: 'rgba(248,113,113,0.12)', borderRadius: '10px',
                  padding: '0.35rem', display: 'inline-flex',
                }}>{f.icon}</span>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FCA5A5', lineHeight: 1.35 }}>{f.title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#FEF3C7', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Penyelesaian callout */}
        <div style={{
          background: 'rgba(253,224,71,0.07)', border: '1px solid rgba(253,224,71,0.35)',
          borderLeft: '4px solid #FDE047', borderRadius: '12px',
          padding: '1.4rem 1.6rem', display: 'flex', gap: '1rem',
          alignItems: 'flex-start', textAlign: 'left',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💎</span>
          <div>
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: '#FEF3C7', fontWeight: 800 }}>
              Penyelesaian: Perlindungan Yang Sentiasa Bersama
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#A7F3D0', lineHeight: 1.75 }}>
              Dengan Pengisian E-Syifa&apos; pada barang anda, anda tidak perlu bergantung pada perawat untuk setiap serangan.
              Rawat sendiri, bila-bila masa, di mana sahaja — tanpa had.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
