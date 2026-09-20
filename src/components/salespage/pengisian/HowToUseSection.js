'use client';

const STEPS = [
  {
    step: '01',
    icon: '💍',
    title: 'Sentuhkan Pada Kawasan Sakit / Nadi',
    desc: 'Bila terasa seram sejuk, dada sesak atau bahu berat, pegang item anda atau sentuhkan terus pada kulit (kawasan dada, dahi atau tengkuk).',
  },
  {
    step: '02',
    icon: '🤲',
    title: 'Niatkan Kesembuhan & Zikir Asas',
    desc: 'Niatkan memohon perlindungan Allah SWT. Baca Bismillah 3 kali, surah Al-Fatihah, dan hembuskan pada item tersebut mengikut panduan ringkas perawat.',
  },
  {
    step: '03',
    icon: '💧',
    title: 'Gunakan Terus / Celup Buat Penawar',
    desc: 'Untuk rawatan segera: Sapukan ke seluruh anggota tubuh. Untuk rawatan dalaman: Celupkan ke dalam bekas air minuman bersih selama beberapa minit untuk dijadikan air penawar syifa\'.',
  },
  {
    step: '04',
    icon: '✨',
    title: 'Kekuatan Aktif Membakar Gangguan',
    desc: 'Molekul ruqyah yang terpasak akan bertindak balas serta-merta — biasanya pesakit akan sendawa, menguap atau berpeluh sejuk menandakan bisa gangguan sedang keluar.',
  },
];

export default function PengisianHowToUseSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F0FDF4',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            📋 Panduan Praktikal
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#064E3B',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Cara Guna Item Pengisian Bila Diserang Gangguan
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Sangat mudah dan tidak memerlukan sebarang kemahiran ilmu batin. Sesiapa sahaja termasuk suri rumah dan warga emas boleh mengamalkannya dengan selamat.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '1.5px solid #A7F3D0',
              borderRadius: '18px', padding: '1.75rem 1.35rem',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.4rem' }}>{s.icon}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 900, color: '#065F46',
                  background: '#ECFDF5', border: '1px solid #A7F3D0',
                  padding: '0.25rem 0.65rem', borderRadius: '999px',
                }}>
                  Langkah {s.step}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35 }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, flex: 1 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Panduan PDF Note (Light High Contrast Card) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #10B981',
          borderRadius: '16px', padding: '1.35rem 1.8rem', textAlign: 'center',
          maxWidth: '780px', margin: '0 auto',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#064E3B', lineHeight: 1.65, fontWeight: 600 }}>
            📖 <strong>Bimbingan Percuma:</strong> Perawat kami akan menghantar panduan audio &amp; teks bertulis secara terperinci melalui WhatsApp selepas proses pengisian selesai. Anda akan dibimbing sepenuhnya dari A hingga Z!
          </p>
        </div>

      </div>
    </section>
  );
}
