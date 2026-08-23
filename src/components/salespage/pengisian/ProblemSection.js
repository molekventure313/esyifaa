'use client';

const PROBLEMS = [
  { icon: '🔄', title: 'Jin Keluar Masa Rawatan... Tapi Datang Balik', desc: 'Perawat bantu buang jin semasa sesi. Tapi apabila balik rumah, sihir dihantar semula. Jin datang lagi. Kitaran ini tidak pernah selesai tanpa perlindungan berterusan.' },
  { icon: '📬', title: 'Sihir Dihantar Berkali-Kali', desc: 'Ada pihak yang sengaja menghantar sihir berulang kali. Setiap kali rawatan selesai, serangan baru datang. Satu sesi rawatan tidak pernah cukup untuk kes sebegini.' },
  { icon: '💸', title: 'Kos & Tenaga Terkuras — Ulang Alik Tak Habis', desc: 'Setiap kali serangan baru, kena pergi semula berjumpa perawat. Kos tambang, kos rawatan, masa terbuang — dan masalah tetap berulang tanpa penghujung.' },
  { icon: '💧', title: 'Air Penawar Habis, Perlindungan Terputus', desc: 'Air yang dibacakan berkesan, tapi ia habis. Bila habis, tiada perlindungan. Terpaksa tunggu dapatkan bekalan baru — sementara itu anda terdedah kepada serangan.' },
  { icon: '🌙', title: 'Diserang Waktu Malam — Tiada Apa Nak Buat', desc: 'Serangan datang tengah malam. Perawat tidak boleh dihubungi waktu itu. Tiada air penawar. Tiada perlindungan. Anda terpaksa tahan seorang diri hingga pagi.' },
  { icon: '😰', title: 'Kes Berat Perlukan Rawatan Berterusan', desc: 'Kes sihir berat atau saka lama tidak boleh selesai dengan satu atau dua sesi rawatan. Ia memerlukan rawatan yang konsisten, berterusan — sesuatu yang mahal jika bergantung pada perawat.' },
];

export default function PengisianProblemSection() {
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
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ⚠️ Kenali Masalah Anda
        </div>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Kenapa Rawatan Luar Sahaja Tidak Cukup Untuk Kes Berat &amp; Berulang?
        </h2>
        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          Ramai pesakit rasa lega selepas rawatan — tapi gangguan datang balik. Ini bukan salah perawat.
          Ini realiti kes sihir &amp; gangguan berat yang memerlukan{' '}
          <strong style={{ color: '#FDE047' }}>perlindungan berterusan.</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#064E3B', border: '1px solid rgba(253,224,71,0.2)',
              borderRadius: '14px', padding: '1.5rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3 }}>{p.title}</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
