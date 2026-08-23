'use client';

const AYAT = [
  { icon: '🔥', title: 'Ayat Ruqyah Pembakar & Pemusnah Jin', desc: 'Ayat-ayat yang membakar dan memusnahkan jin yang menetap atau menyerang. Bertindak balas secara aktif apabila ada gangguan jin yang cuba mendekat.', borderColor: 'rgba(239,68,68,0.3)' },
  { icon: '✂️', title: 'Ayat Pembatal Sihir', desc: 'Memutuskan dan membatalkan ikatan sihir yang pernah dihantar atau sedang aktif. Ayat ini melemahkan setiap serangan sihir dari punca asalnya.', borderColor: 'rgba(245,158,11,0.3)' },
  { icon: '🛡️', title: 'Ayat Benteng Sihir & Gangguan Jin', desc: 'Membina dinding perlindungan di sekeliling barang dan pemiliknya. Jin dan sihir yang cuba mendekat akan dihalang dan dipukul balik.', borderColor: 'rgba(74,222,128,0.3)' },
  { icon: '💚', title: 'Ayat-Ayat Kesembuhan', desc: 'Memulihkan kesan-kesan gangguan yang masih tinggal dalam badan. Membantu proses penyembuhan spiritual dan fizikal secara berterusan.', borderColor: 'rgba(52,211,153,0.3)' },
];

export default function PengisianHowItWorksSection() {
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
            📖 Apa Yang Diisikan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Lapisan Ayat Ruqyah — Perlindungan Menyeluruh
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Setiap barang diisi dengan 4 lapisan ayat ruqyah syar&apos;iyyah yang berbeza fungsi.
            Bukan sekadar bacaan biasa — ini gabungan yang direka untuk merawat, membakar, membatal dan membentengi secara serentak.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {AYAT.map((a, i) => (
            <div key={i} style={{
              background: '#042E23', border: `2px solid ${a.borderColor}`,
              borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3 }}>{a.title}</div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Pelarasan callout */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid rgba(16,185,129,0.5)',
          borderRadius: '16px', padding: '1.75rem',
          boxShadow: '0 0 30px rgba(16,185,129,0.15)',
          display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
        }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 }}>🔄</span>
          <div>
            <div style={{ fontWeight: 800, color: '#FEF3C7', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Kekuatan Tidak Berkurang — Pelarasan Setiap Minggu
            </div>
            <p style={{ margin: 0, color: '#D1FAE5', fontSize: '0.925rem', lineHeight: 1.7 }}>
              Berbeza dengan air penawar atau barang bacaan biasa yang kekuatannya berkurang dengan masa,
              perawat ESyifaa akan buat <strong style={{ color: '#FDE047' }}>pelarasan dan pengisian semula setiap minggu secara automatik</strong>.
              Barang anda sentiasa pada kapasiti penuh.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
