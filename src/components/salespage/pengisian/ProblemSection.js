'use client';

const PROBLEMS = [
  {
    icon: '🔄',
    title: 'Jin Keluar Masa Rawatan... Tapi Datang Balik',
    desc: 'Perawat bantu buang jin semasa sesi. Tapi sebaik balik ke rumah, sihir dihantar semula oleh penghantar dengki. Kitaran ini tak pernah putus tanpa benteng berterusan di rumah.',
  },
  {
    icon: '📬',
    title: 'Sihir Dihantar Berkali-Kali Tanpa Henti',
    desc: 'Bila ada orang berniat jahat atau sihir pemisah bertubi-tubi, setiap kali rawatan selesai, serangan baru dihantar. Satu atau dua sesi rawatan tidak mampu melawan sihir dendam sebegini.',
  },
  {
    icon: '💸',
    title: 'Kos & Tenaga Terkuras — Ulang-Alik Berubat',
    desc: 'Setiap kali serangan baru, terpaksa cari perawat luar. Duit minyak, kos rawatan ratusan ringgit, masa terbuang — dan masalah tetap kembali berulang tanpa kesudahan.',
  },
  {
    icon: '💧',
    title: 'Air Penawar Habis, Perlindungan Terputus',
    desc: 'Air yang dibacakan ruqyah memang berkesan, tapi air ada tarikh habis. Bila habis stok, benteng terputus dan anda kembali terdedah kepada serangan ghaib.',
  },
  {
    icon: '🌙',
    title: 'Diserang Tengah Malam — Perawat Tak Boleh Dihubungi',
    desc: 'Kerap diserang jam 2 hingga 4 pagi semasa tidur lena (sesak dada, lebam misteri, kena tindih). Waktu itu perawat sedang tidur, klinik tutup, anda terpaksa menanggung azab bersendirian.',
  },
  {
    icon: '😰',
    title: 'Saka & Sihir Kronik Memerlukan Ikhtiar Harian',
    desc: 'Gangguan keturunan atau sihir berat yang sudah bertapak bertahun-tahun dalam darah mustahil selesai sekelip mata. Ia perlukan benteng ruqyah yang sentiasa bersentuhan dengan tubuh.',
  },
];

export default function PengisianProblemSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#0B382D',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ⚠️ 6 Realiti Pahit Yang Kerap Berulang
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
          fontWeight: 800, color: '#FDE047',
          marginTop: '0.4rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Kenapa Rawatan Luar Sahaja Tak Pernah Selesai Untuk Kes Berat &amp; Berulang?
        </h2>

        <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 2.75rem auto' }}>
          Ramai pesakit rasa lega seketika — tapi selang beberapa hari, gangguan datang balik. Ini bukan salah perawat.
          Ini hakikat sihir dendam &amp; saka yang memerlukan{' '}
          <strong style={{ color: '#FDE047' }}>benteng perlindungan harian yang sentiasa bersama jasad anda.</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#064E3B',
              border: '1px solid rgba(253,224,71,0.25)',
              borderRadius: '16px', padding: '1.6rem 1.4rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '0.98rem', lineHeight: 1.35 }}>
                {p.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#D1FAE5', lineHeight: 1.65 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
