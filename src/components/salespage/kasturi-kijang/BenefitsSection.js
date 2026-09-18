'use client';

const BENEFITS = [
  {
    icon: '🛡️',
    title: 'Benteng Aktif Daripada Sihir & Saka',
    desc: 'Menghalang lintasan sihir, santau angin dan gangguan saka keturunan daripada mudah menembusi tubuh dan fikiran.',
  },
  {
    icon: '🛌',
    title: 'Menghapuskan Kena Himpit & Mimpi Ngeri',
    desc: 'Tidur menjadi lebih lena, tiada lagi mimpi buruk dipatuk ular atau dikejar lembaga hitam. Bangun pagi badan terasa segar.',
  },
  {
    icon: '⚡',
    title: 'Membakar Jin Asyik & Gangguan Makhluk Halus',
    desc: 'Bauan kasturi amat menyeksakan bagi jin yang bersarang di dalam tubuh, memaksa mereka melemah dan keluar dengan izin Allah.',
  },
  {
    icon: '🕊️',
    title: 'Meredakan Keresahan Jiwa & Anxiety',
    desc: 'Aromaterapinya merangsang ketenangan minda, melapangkan dada yang sempit dan menstabilkan degupan jantung yang kencang.',
  },
  {
    icon: '👶🏻',
    title: 'Melindungi Anak Kecil Meracau Malam',
    desc: 'Cukup sekadar calitan nipis di ubun-ubun dan bantal anak untuk menghindarkan pandangan makhluk halus yang mengganggu tidur mereka.',
  },
  {
    icon: '💆🏻‍♂️',
    title: 'Melegakan Tengkuk Berat & Pening Kepala',
    desc: 'Sapu pada bahagian tengkuk, dahi dan sendi yang tegang. Terasa angin keluar dan tubuh beransur-ansur menjadi ringan.',
  },
  {
    icon: '✨',
    title: 'Menaikkan Seri Wajah & Aura Positif',
    desc: 'Menyingkirkan aura kusam akibat gangguan rohani. Wajah kelihatan lebih bersih, tenang dan disenangi orang sekeliling.',
  },
  {
    icon: '🕌',
    title: 'Wangian Sunnah Bebas Alkohol & Sah Solat',
    desc: 'Pati pekat yang boleh terus disapu sebelum mendirikan solat, menghadiri majlis ilmu atau beriktikaf di masjid.',
  },
];

export default function KasturiBenefitsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ✨ Khasiat &amp; Kelebihan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            8 Manfaat Minyak Kasturi Kijang E-Syifa’{' '}
            <span style={{ color: '#059669' }}>Untuk Perlindungan Rohani &amp; Kesihatan Anda</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Bukan sekadar minyak wangi biasa — ia adalah benteng perlindungan aktif yang mengikut sunnah perubatan Rasulullah ﷺ.
          </p>
        </div>

        {/* 8 Benefits Grid (4x2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {BENEFITS.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '18px',
                padding: '1.6rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.02)',
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {b.icon}
              </div>
              <div>
                <h4 style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: '#0F172A',
                  margin: '0 0 0.35rem 0',
                  lineHeight: 1.35
                }}>
                  {b.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6 }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
