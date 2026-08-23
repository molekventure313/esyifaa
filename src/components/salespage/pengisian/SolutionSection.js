'use client';

const BENEFITS = [
  { icon: '♾️', title: 'Rawatan Tanpa Had — Seumur Hidup', desc: 'Tidak ada had bilangan rawatan. Guna setiap hari, setiap minggu — kekuatan barang berisian tidak pernah habis atau perlu diisi semula.' },
  { icon: '⚡', title: 'Bertindak Balas Bila-Bila Masa Diserang', desc: 'Diserang malam-malam? Tidak perlu tunggu appointment. Tidak perlu tunggu perawat. Guna barang berisian anda terus ketika itu juga.' },
  { icon: '🏠', title: 'Rawat Di Rumah Sendiri — Tiada Perlu Keluar', desc: 'Dalam keselesaan rumah anda sendiri. Tiada perlu keluar, tiada perlu buat appointment, tiada perlu tunggu giliran.' },
  { icon: '💧', title: 'Buat Air Penawar Sendiri Bila Perlu', desc: 'Gunakan barang berisian untuk buat air penawar sendiri — tidak perlu bergantung pada orang lain untuk dapatkan air berisian.' },
  { icon: '🚿', title: 'Buat Air Mandian Ruqyah Sendiri', desc: 'Boleh digunakan untuk buat air mandian — membersihkan badan dan melindungi diri dari gangguan luar.' },
  { icon: '🛡️', title: 'Perlindungan 24 Jam Setiap Hari', desc: 'Ibarat ada perawat private di rumah. Perlindungan berterusan tanpa henti — siang atau malam.' },
  { icon: '👨‍👩‍👧', title: 'Boleh Bantu Seluruh Keluarga', desc: 'Satu barang berisian boleh membantu semua ahli keluarga — isteri, suami, anak-anak. Jimat kos berbanding rawatan berasingan.' },
  { icon: '💰', title: 'Jimat Kos Jangka Panjang', desc: 'Bayar sekali sahaja, guna seumur hidup. Bandingkan dengan kos berulang kali ke perawat — penjimatan yang luar biasa.' },
  { icon: '📖', title: '100% Ruqyah Syar\'iyyah', desc: 'Diisi oleh perawat ESyifaa dengan bacaan Al-Quran dan doa berlandaskan syarak semata-mata. Tiada unsur syirik.' },
  { icon: '🔄', title: 'Kekuatan Sentiasa Penuh — Pelarasan Mingguan', desc: 'Perawat ESyifaa buat pelarasan setiap minggu secara automatik. Berbeza dengan air penawar — kekuatan tidak pernah berkurang.' },
];

export default function PengisianSolutionSection() {
  return (
    <section style={{
      background: '#FFFFFF', color: '#0F172A',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Penyelesaian
        </span>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#042E23',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pengisian E-Syifa&apos; — Perawat Private Anda Yang Sentiasa Bersama
        </h2>
        <p style={{ fontSize: '1rem', color: '#4B5563', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2rem auto' }}>
          Satu pelaburan. Rawatan tanpa had. Boleh guna seumur hidup. Tidak perlu tunggu appointment.
          Tidak perlu ulang alik. Tidak perlu bergantung pada orang lain —{' '}
          <strong style={{ color: '#047857' }}>setiap kali diserang, rawat terus.</strong>
        </p>

        {/* Brand badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          background: 'linear-gradient(135deg, #042E23 0%, #065F46 100%)',
          border: '2px solid #FDE047', borderRadius: '16px',
          padding: '1rem 2rem', marginBottom: '3rem',
          boxShadow: '0 8px 24px rgba(4,46,35,0.2)',
        }}>
          <span style={{ fontSize: '2rem' }}>💎</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FDE047' }}>Pengisian E-Syifa&apos;</div>
            <div style={{ fontSize: '0.78rem', color: '#A7F3D0', fontWeight: 600 }}>Ruqyah Syar&apos;iyyah · 4 Lapisan Ayat · Pelarasan Mingguan</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            10 Kelebihan Utama
          </span>
          <h3 style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.8rem)',
            fontWeight: 800, color: '#042E23',
            marginTop: '0.4rem', marginBottom: '0.5rem',
          }}>
            Kenapa Pengisian E-Syifa&apos; Berbeza Dari Yang Lain?
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', textAlign: 'left' }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: '12px', padding: '1.2rem',
              display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '1.5rem', flexShrink: 0,
                background: '#ECFDF5', borderRadius: '10px',
                padding: '0.35rem', display: 'inline-flex', lineHeight: 1,
              }}>{b.icon}</span>
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontWeight: 800, fontSize: '0.88rem', color: '#042E23' }}>{b.title}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.55 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
