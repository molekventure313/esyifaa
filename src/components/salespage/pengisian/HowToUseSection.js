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
      background: '#031E17',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            📋 Panduan Praktikal
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Cara Guna Item Pengisian Bila Diserang Gangguan
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Sangat mudah dan tidak memerlukan sebarang kemahiran ilmu batin. Sesiapa sahaja termasuk suri rumah dan warga emas boleh mengamalkannya dengan selamat.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: '#042E23', border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: '18px', padding: '1.6rem 1.3rem',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.2rem' }}>{s.icon}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 900, color: '#4ADE80',
                  background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
                  padding: '0.2rem 0.6rem', borderRadius: '999px',
                }}>
                  Langkah {s.step}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#FDE047', fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.35 }}>
                {s.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#D1FAE5', lineHeight: 1.65, flex: 1 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Panduan PDF Note */}
        <div style={{
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: '14px', padding: '1.1rem 1.6rem', textAlign: 'center',
          maxWidth: '740px', margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#FEF3C7', lineHeight: 1.65 }}>
            📖 <strong>Nota Tambahan:</strong> Perawat kami akan menghantar panduan audio &amp; teks bertulis secara terperinci melalui WhatsApp selepas proses pengisian selesai. Anda akan dibimbing sepenuhnya!
          </p>
        </div>

      </div>
    </section>
  );
}
