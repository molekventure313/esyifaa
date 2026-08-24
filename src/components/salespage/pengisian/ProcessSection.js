'use client';

const STEPS = [
  { no: '01', icon: '💳', label: 'TEMPAH & BAYAR', title: 'Isi Borang & Bayar RM90 via FPX', desc: 'Isi borang ringkas di bawah. Nyatakan nama dan jenis barang anda. Bayar RM90 terus melalui FPX Online Banking — selamat dan segera.' },
  { no: '02', icon: '📞', label: 'PERAWAT HUBUNGI', title: 'Perawat Hubungi Via WhatsApp', desc: 'Dalam masa 24 jam, perawat ESyifaa akan menghubungi anda melalui WhatsApp untuk mengesahkan maklumat barang dan memberi panduan awal.' },
  { no: '03', icon: '⭐', label: 'PENGISIAN 3 HARI', title: 'Proses Pengisian Ayat Ruqyah Dijalankan', desc: 'Perawat menjalankan pengisian ayat ruqyah secara jarak jauh selama 3 hari berturut-turut. Anda tidak perlu buat apa-apa — cukup simpan barang bersama anda.' },
  { no: '04', icon: '🎉', label: 'SIAP & GUNA', title: 'Selepas 3 Hari — Terus Guna', desc: 'Selepas 3 hari, barang anda sudah siap diisikan. Boleh terus gunakan untuk rawat diri, ahli keluarga dan sebagai perlindungan harian yang berterusan.' },
];

export default function PengisianProcessSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            🗓️ Proses Tempahan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            4 Langkah Mudah — Dari Tempahan Hingga Mula Guna
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto' }}>
            Proses yang mudah dan telus. Dari tempahan hingga barang anda siap diisikan — semua dalam 3 hari.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '16px', padding: '1.5rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}>
              {/* Step number + icon */}
              <div style={{
                minWidth: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #065F46, #047857)',
                border: '2px solid rgba(74,222,128,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
                boxShadow: '0 0 15px rgba(74,222,128,0.2)',
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 900, color: '#4ADE80',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {step.no} · {step.label}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '0.975rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {step.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>
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
