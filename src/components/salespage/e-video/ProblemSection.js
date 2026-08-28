'use client';

const PROBLEMS = [
  {
    icon: '⏳',
    title: 'Kena Tunggu Slot Perawat',
    desc: 'Ada gangguan sekarang, tapi perawat busy. Kena tunggu 3, 5, 7 hari. Sementara tu anda dan keluarga terdedah — tiada siapa yang boleh tolong segera.',
  },
  {
    icon: '💸',
    title: 'Bayar Setiap Kali Ada Masalah',
    desc: 'Setiap sesi rawatan kena bayar semula. RM200, RM300, RM500. Masalah berulang, kos berulang. Tiada hujungnya selagi tiada perlindungan berterusan.',
  },
  {
    icon: '🔄',
    title: 'Gangguan Datang Balik Selepas Rawatan',
    desc: 'Rawatan selesai, rasa lega. Tapi minggu depan, gangguan datang balik. Sebab tiada perlindungan aktif antara sesi — badan dan rumah terdedah semula.',
  },
  {
    icon: '🌙',
    title: 'Waktu Malam Diserang — Tiada Bantuan',
    desc: 'Gangguan sering menyerang waktu malam. Perawat tidak boleh dihubungi. Tiada air penawar. Tiada rawatan. Terpaksa tahan seorang diri sehingga pagi.',
  },
  {
    icon: '📍',
    title: 'Terikat — Perawat Jauh Atau Tidak Available',
    desc: 'Anda di Sabah, perawat di Semenanjung. Atau perawat cuti, sakit, bersara. Bergantung pada satu orang untuk keselamatan anda adalah risiko besar.',
  },
];

export default function EVideoProblemSection() {
  return (
    <section style={{
      background: '#0B382D', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FCA5A5',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ⚠️ Realiti Rawatan Biasa
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          5 Had Rawatan Biasa Yang{' '}
          <span style={{ color: '#FDE047' }}>Perlu Anda Tahu</span>
        </h2>

        <p style={{
          fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65,
          maxWidth: '680px', margin: '0 auto 2.5rem auto',
        }}>
          Rawatan dengan perawat memang berkesan — tapi ia ada had.
          Dan had-had ini boleh menjejaskan keselamatan anda &amp; keluarga.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.25rem', textAlign: 'left',
        }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '14px', padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '1rem', right: '1rem',
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 900, color: '#FDE047',
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: '#FCA5A5', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3, paddingRight: '2rem' }}>
                {p.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '2.5rem',
          background: 'rgba(253,224,71,0.07)',
          border: '1px solid rgba(253,224,71,0.25)',
          borderRadius: '14px', padding: '1.5rem 2rem',
          maxWidth: '680px', margin: '2.5rem auto 0',
        }}>
          <p style={{ margin: 0, fontSize: '1rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
            💡 E-Video Rawatan ESyifaa hadir untuk{' '}
            <span style={{ color: '#FDE047' }}>selesaikan semua had ini</span>{' '}
            — rawatan ruqyah yang ada dalam genggaman anda, 24/7, tanpa bergantung pada sesiapa.
          </p>
        </div>
      </div>
    </section>
  );
}
