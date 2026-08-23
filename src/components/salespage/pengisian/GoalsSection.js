'use client';

const GOALS = [
  { icon: '⚡', title: 'Boleh Rawat Diri Sendiri Bila Diserang — Tanpa Tunggu', desc: 'Sebaik sahaja berasa diserang atau tidak selesa, anda boleh terus bertindak. Tidak perlu hubungi perawat, tidak perlu tunggu appointment.' },
  { icon: '🌙', title: 'Perlindungan 24/7 — Malam Pun Selamat', desc: 'Serangan paling kerap berlaku waktu malam. Dengan barang berisian di tangan, anda bersedia setiap masa — siang atau malam.' },
  { icon: '💰', title: 'Jimat Kos — Tidak Perlu Ulang Alik Ke Perawat', desc: 'Kos perjalanan, kos rawatan, masa terbuang — semua ini berkurangan drastik apabila anda mampu rawat sendiri di rumah.' },
  { icon: '💧', title: 'Buat Air Penawar Sendiri Bila Perlu', desc: 'Tidak perlu bergantung pada orang lain untuk dapatkan air berisian. Buat sendiri, bila-bila masa, menggunakan barang yang telah diisikan.' },
  { icon: '🏡', title: 'Rasa Lebih Tenang & Selamat Di Rumah', desc: 'Mengetahui anda ada perlindungan yang sentiasa bersama memberikan ketenangan jiwa. Rumah terasa lebih selamat dan terlindung.' },
];

export default function PengisianGoalsSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🎯 Perubahan Yang Anda Akan Rasa
        </div>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          5 Perubahan Yang Anda Akan Alami Bila Ada Barang Berisian
        </h2>
        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '660px', margin: '0 auto 2.5rem auto' }}>
          Bukan janji kosong — ini berdasarkan pengalaman pesakit yang dah ada Pengisian E-Syifa&apos;.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '2px solid #FDE047',
              borderRadius: '12px', padding: '1.2rem 1.4rem',
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: '#ECFDF5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
              }}>{g.icon}</div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 800, fontSize: '1rem', color: '#042E23' }}>{g.title}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
