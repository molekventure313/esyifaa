'use client';

const FAQS = [
  {
    q: 'Adakah pengisian boleh dilakukan dari jarak jauh — tanpa pos barang?',
    a: 'Ya. Pengisian dilakukan secara jarak jauh menggunakan kaedah yang dibenarkan syarak — sama seperti rawatan jarak jauh. Anda tidak perlu pos atau hantar barang ke mana-mana. Cukup nyatakan nama dan jenis barang semasa mendaftar.',
  },
  {
    q: 'Berapa lama proses pengisian?',
    a: 'Proses pengisian mengambil masa 3 hari berturut-turut dari tarikh tempahan. Selepas 3 hari, barang anda sudah siap dan boleh terus digunakan.',
  },
  {
    q: 'Apakah barang yang paling sesuai untuk diisikan?',
    a: 'Apa-apa barang yang selalu bersama anda — cincin, tasbih, jam tangan, gelang, rantai. Semakin kerap barang itu bersama anda, semakin berkesan perlindungannya.',
  },
  {
    q: 'Adakah kekuatan pengisian akan berkurang dengan masa?',
    a: 'Tidak. Perawat ESyifaa akan buat pelarasan dan pengisian semula setiap minggu secara automatik. Barang anda sentiasa pada kapasiti penuh tanpa anda perlu buat apa-apa.',
  },
  {
    q: 'Boleh saya gunakan barang yang sudah diisikan untuk rawat ahli keluarga?',
    a: 'Ya. Barang yang sudah diisikan boleh digunakan untuk rawat diri sendiri dan ahli keluarga. Panduan lengkap cara penggunaan akan diberikan oleh perawat selepas pengisian selesai.',
  },
  {
    q: 'Adakah pengisian ini patuh syariah?',
    a: 'Ya, 100%. Semua ayat yang diisikan adalah daripada Al-Quran dan doa-doa yang sabit daripada Sunnah Rasulullah SAW. Tiada unsur syirik atau amalan bertentangan syarak dalam proses pengisian ini.',
  },
];

export default function PengisianFAQSection() {
  return (
    <section style={{
      background: '#042E23', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ❓ Soalan Lazim
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.5rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Soalan Yang Sering Ditanya
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(253,224,71,0.15)',
              borderRadius: '12px', padding: '1.25rem 1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                {faq.q}
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
