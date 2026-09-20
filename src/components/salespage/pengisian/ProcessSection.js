'use client';

const STEPS = [
  {
    no: '01',
    icon: '💳',
    label: 'TEMPAH & BAYAR FPX',
    title: 'Pilih Pakej & Isi Borang',
    desc: 'Pilih bilangan item dan nyatakan jenis barang anda (cincin, tasbih, dll). Buat bayaran melalui FPX Online Banking secara selamat dan serta-merta.',
  },
  {
    no: '02',
    icon: '📞',
    label: 'PENGESAHAN WHATSAPP',
    title: 'Perawat Hubungi Dalam 24 Jam',
    desc: 'Perawat bertauliah ESyifaa akan menghantar WhatsApp kepada anda untuk mengesahkan nama penuh pemilik dan memberikan bimbingan niat awal.',
  },
  {
    no: '03',
    icon: '⭐',
    label: 'SOLAT HAJAT & WIRID',
    title: 'Pengisian Khusus Selama 3 Hari',
    desc: 'Perawat menjalankan solat hajat dan wirid ruqyah 4 lapisan secara jarak jauh selama 3 hari berturut-turut. Anda cuma perlu simpan barang tersebut bersama anda.',
  },
  {
    no: '04',
    icon: '🎉',
    label: 'SIAP & TERIMA PANDUAN',
    title: 'Selesai & Terus Amalkan',
    desc: 'Selepas 3 hari, barang anda telah siap terisi. Anda akan menerima panduan lengkap cara guna dan automatik dimasukkan dalam senarai pelarasan mingguan percuma.',
  },
];

export default function PengisianProcessSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            🗓️ Aliran Proses Pengisian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Langkah Telus — Dari Tempahan Hingga Siap Digunakan
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
            Proses yang teratur, berdisiplin dan patuh syariah. Anda sentiasa dimaklumkan mengenai status pengisian barang anda.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: '18px', padding: '1.5rem 1.6rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                minWidth: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #065F46, #047857)',
                border: '2px solid rgba(74,222,128,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', flexShrink: 0,
                boxShadow: '0 0 15px rgba(74,222,128,0.2)',
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 900, color: '#4ADE80',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {step.no} · {step.label}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
