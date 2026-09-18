'use client';

const FEARS = [
  {
    icon: '🩸',
    title: 'Gangguan Jin Bertapak Dalam Saluran Darah',
    desc: 'Nabi ﷺ bersabda jin bergerak dalam tubuh anak Adam melalui saluran darah. Makin lama dibiarkan, makin sukar untuk dikeluarkan dan semakin payah untuk beribadah.',
  },
  {
    icon: '😱',
    title: 'Histeria, Meracau & Hilang Kawalan Diri',
    desc: 'Bermula daripada rasa takut dan cemas biasa, akhirnya bertukar menjadi kerasukan histeria di mana jasad dikawal sepenuhnya oleh makhluk halus.',
  },
  {
    icon: '💔',
    title: 'Hubungan Suami Isteri & Keluarga Musnah',
    desc: 'Gangguan jin asyik (jin yang mencintai manusia) atau sihir pemisah akan membuatkan anda benci pasangan, panas hati dan menuntut perceraian tanpa sebab.',
  },
  {
    icon: '🩺',
    title: 'Penyakit Misteri Menahun & Kos Rawatan Melambung',
    desc: 'Duit habis beribu-ribu untuk ubat tahan sakit dan pemeriksaan pakar, tetapi doktor mengesahkan organ fizikal anda normal sedangkan derita berterusan.',
  },
  {
    icon: '👶🏻',
    title: 'Badi & Gangguan Merebak Kepada Anak-Anak',
    desc: 'Anak kecil yang batinnya masih lemah mudah terkena tempias aura negatif ibu bapa. Mereka kerap sakit malam, cengeng dan murung.',
  },
  {
    icon: '📉',
    title: 'Kerjaya, Rezeki & Ketenangan Hidup Terjejas',
    desc: 'Hilang fokus kerja, sering membuat keputusan salah, hilang kawan dan sentiasa berada dalam keadaan muram dan ketakutan.',
  },
];

export default function KasturiFearsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FEF2F2',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FECACA',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF',
            border: '1.5px solid #FCA5A5',
            color: '#B91C1C',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚠️ Jangan Pandang Ringan!
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Kesan Buruk Jika Gangguan &amp; Sihir Dibiar{' '}
            <span style={{ color: '#DC2626' }}>Tanpa Benteng Pendinding</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Jangan tunggu sehingga badan rebah atau rumahtangga hancur baru nak mencari penawar. Ambil langkah pencegahan sebelum gangguan menjadi semakin parah!
          </p>
        </div>

        {/* Fears Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.15rem',
          marginBottom: '2.5rem',
        }}>
          {FEARS.map((f, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #FECDD3',
              borderRadius: '18px',
              padding: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.04)',
            }}>
              <span style={{
                fontSize: '1.6rem',
                flexShrink: 0,
                lineHeight: 1,
                padding: '0.55rem',
                background: '#FFF1F2',
                borderRadius: '12px',
                border: '1px solid #FFE4E6',
              }}>
                {f.icon}
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#991B1B', marginBottom: '0.35rem' }}>
                  {f.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hadith Peringatan */}
        <div style={{
          padding: '1.6rem 2rem',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '2px solid #F87171',
          borderRadius: '18px',
          maxWidth: '760px',
          margin: '0 auto',
          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.08)',
        }}>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.86rem', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hadith Sahih Riwayat Bukhari &amp; Muslim:
          </p>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.98rem', color: '#1E293B', lineHeight: 1.75, fontStyle: 'italic' }}>
            &ldquo;Sesungguhnya syaitan itu berjalan di dalam tubuh anak Adam melalui saluran peredaran darah.&rdquo;
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            Bentengkan tubuh anda dengan amalan ruqyah dan wangian yang dibenci syaitan.
          </p>
        </div>

      </div>
    </section>
  );
}
