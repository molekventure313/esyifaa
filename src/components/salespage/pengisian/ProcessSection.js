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
    label: 'WIRID RUQYAH KHUSUS',
    title: 'Pengisian Khusus Selama 3 Hari',
    desc: 'Perawat menjalankan wirid ruqyah 4 lapisan secara jarak jauh selama 3 hari pengisian. Anda cuma perlu simpan barang tersebut bersama anda.',
  },
  {
    no: '04',
    icon: '🎉',
    label: 'SIAP & TERIMA PANDUAN',
    title: 'Selesai & Terus Amalkan',
    desc: 'Selepas 3 hari pengisian, barang anda telah siap terisi. Anda akan menerima panduan lengkap cara guna dan automatik dimasukkan dalam senarai pelarasan mingguan percuma selagi perawat masih hidup (*tertakluk pada terma & syarat).',
  },
];

export default function PengisianProcessSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAFC',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            🗓️ Aliran Proses Pengisian
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#0F172A',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Langkah Telus — Dari Tempahan Hingga Siap Digunakan
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto' }}>
            Proses yang teratur, berdisiplin dan patuh syariah. Anda sentiasa dimaklumkan mengenai status pengisian barang anda.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '1.5px solid #E2E8F0',
              borderRadius: '18px', padding: '1.6rem 1.8rem',
              display: 'flex', gap: '1.35rem', alignItems: 'flex-start',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                minWidth: '56px', height: '56px', borderRadius: '16px',
                background: '#ECFDF5',
                border: '1.5px solid #86EFAC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', flexShrink: 0,
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 900, color: '#059669',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {step.no} · {step.label}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.08rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.65 }}>
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
