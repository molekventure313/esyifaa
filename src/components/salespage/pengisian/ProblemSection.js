'use client';

const PROBLEMS = [
  { icon: '🌙', title: 'Diserang Waktu Malam Tanpa Pertolongan', desc: 'Perawat tidak boleh dihubungi tengah malam. Tapi gangguan tidak menunggu waktu pejabat — serangan berlaku bila jin mahu.' },
  { icon: '🔄', title: 'Ulang Alik Ke Perawat Tidak Putus-Putus', desc: 'Sembuh sekejap, datang balik. Kena pergi jumpa perawat lagi. Kos, masa dan tenaga terkuras — tapi akar masalah tidak selesai.' },
  { icon: '💔', title: 'Ahli Keluarga Tidak Ada Perlindungan', desc: 'Anak-anak, suami, isteri — mereka juga terdedah. Satu serangan boleh menjejas seluruh keluarga. Anda tidak boleh jaga semua orang serentak.' },
  { icon: '🧠', title: 'Terlupa Baca Wirid Di Saat Paling Perlukan', desc: 'Masa panik, fikiran kosong. Semua amalan hafalan hilang. Barang berisian bertindak balas sendiri — tanpa perlu anda ingat apa-apa.' },
];

export default function PengisianProblemSection() {
  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
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
            ⚠️ Kenapa Perlu Pengisian?
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Bila Tiada Barang Berisian — Anda Tidak Bersedia
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Gangguan tidak menunggu anda bersedia. Sihir, jin asyik dan serangan mistik berlaku pada waktu yang paling tidak dijangka. Tanpa perlindungan yang sentiasa bersama anda, anda terdedah.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#042E23', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3 }}>{p.title}</div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#A7F3D0', lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
