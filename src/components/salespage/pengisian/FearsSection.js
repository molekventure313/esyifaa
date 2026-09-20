'use client';

const FEARS = [
  {
    icon: '📉',
    title: 'Gangguan Makin Berakar Bila Dibiarkan',
    desc: 'Setiap hari tanpa benteng ruqyah, jin dan racun sihir membina sarang lebih dalam di saraf dan sendi. Apa yang awalnya ringan akan menjadi penyakit misteri yang sukar diubati.',
  },
  {
    icon: '🔗',
    title: 'Pintu Rezeki & Kerjaya Terus Terkunci',
    desc: 'Sihir penghalang rezeki menyebabkan usaha gigih anda sia-sia. Perniagaan tiba-tiba sunyi, pelanggan lari tanpa sebab, dan wang simpanan bocor begitu sahaja.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Keluarga & Anak Kecil Jadi Mangsa Tempias',
    desc: 'Bila rumah tiada benteng dan diri anda dipenuhi aura gelap sihir, anak-anak kecil yang bersih mudah histeria, sawan tangis waktu malam, dan kerap jatuh sakit.',
  },
  {
    icon: '🧠',
    title: 'Akal & Emosi Terhakis — Jadi Panas Baran',
    desc: 'Bisikan was-was dan panik malam berpanjangan menyebabkan anxiety kronik, insomnia dan kemurungan. Lama-kelamaan anda hilang kawalan terhadap fikiran sendiri.',
  },
  {
    icon: '💔',
    title: 'Masjid Rumahtangga Runtuh Dalam Sekelip Mata',
    desc: 'Sihir pemisah (tafriq) bertindak secara senyap. Suami isteri mula membenci satu sama lain, hilang nafsu di bilik tidur, dan kerap berbalah sehingga berakhir dengan penceraian.',
  },
  {
    icon: '💸',
    title: 'Bakar Duit Ribuan Ringgit Tanpa Kesudahan',
    desc: 'Tanpa kaedah merawat diri sendiri di rumah, anda akan terus dipermainkan oleh kitaran sihir berulang — terpaksa mengeluarkan wang belanja rawatan luar berkali-kali.',
  },
];

export default function PengisianFearsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFF5F5',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FECACA',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        
        <span style={{
          display: 'inline-block',
          fontSize: '0.8rem', fontWeight: 800, color: '#DC2626',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          background: '#FFFFFF',
          border: '1.5px solid #FCA5A5',
          padding: '0.4rem 1.15rem', borderRadius: '999px',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
        }}>
          ⚠️ Sila Beri Perhatian: Perkara Ini Boleh Melarat!
        </span>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 2.3rem)',
          fontWeight: 900, color: '#991B1B',
          marginTop: '0.25rem', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Apa Yang Bakal Terjadi Jika Sihir &amp; Gangguan Berulang Dibiarkan?
        </h2>

        <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          Jangan ambil mudah dan anggap gangguan akan hilang sendiri. Pengalaman kami merawat ratusan pesakit membuktikan —{' '}
          <strong style={{ color: '#DC2626' }}>semakin lama ditangguhkan, semakin parah kerosakannya pada jasad dan rumahtangga.</strong>
        </p>

        {/* Hadith Callout Box (Clean Light) */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid #F87171',
          borderRadius: '16px',
          padding: '1.35rem 1.75rem',
          maxWidth: '780px',
          margin: '0 auto 2.5rem auto',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08)',
        }}>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: '#7F1D1D', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 600 }}>
            &ldquo;Sesungguhnya syaitan itu berjalan di dalam tubuh anak Adam mengikut aliran darah.&rdquo;
          </p>
          <span style={{ fontSize: '0.82rem', color: '#DC2626', fontWeight: 800 }}>
            — Hadith Sahih al-Bukhari (No. 3281) &amp; Muslim (No. 2175)
          </span>
        </div>

        {/* 6 Fears Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', textAlign: 'left', marginBottom: '2.5rem' }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1.5px solid #FED7D7',
              borderRadius: '16px', padding: '1.5rem 1.35rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <span style={{
                  fontSize: '1.6rem', lineHeight: 1, flexShrink: 0,
                  background: '#FEF2F2', borderRadius: '10px',
                  padding: '0.4rem', display: 'inline-flex',
                }}>{f.icon}</span>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991B1B', lineHeight: 1.35 }}>
                  {f.title}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Penyelesaian callout (Light Green Contrast) */}
        <div style={{
          background: '#F0FDF4',
          border: '1.5px solid #86EFAC',
          borderLeft: '5px solid #059669',
          borderRadius: '14px',
          padding: '1.4rem 1.6rem',
          display: 'flex', gap: '1.1rem',
          alignItems: 'flex-start', textAlign: 'left',
          maxWidth: '820px', margin: '0 auto',
          boxShadow: '0 4px 15px rgba(5, 150, 105, 0.06)',
        }}>
          <span style={{ fontSize: '2rem', flexShrink: 0 }}>🛡️</span>
          <div>
            <p style={{ margin: '0 0 0.35rem 0', fontSize: '1.02rem', color: '#064E3B', fontWeight: 800 }}>
              Putuskan Kitaran Ini: Miliki Benteng Yang Sentiasa Bersama Jasad Anda
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: 1.75 }}>
              Dengan memasakkan ayat-ayat ruqyah pemutus sihir dan pembakar jin ke dalam barang peribadi anda,
              anda kini ada alat ikhtiar 24 jam untuk membatalkan serangan serta-merta tanpa perlu menunggu perawat luar.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
