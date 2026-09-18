'use client';

const FEARS = [
  {
    icon: '💔',
    title: 'Kehancuran Rumahtangga & Perceraian',
    desc: 'Masjid yang dibina dengan susah payah selama bertahun-tahun musnah dalam sekelip mata hanya kerana racun sihir pemisah dan api kemarahan yang tidak dirawat.',
  },
  {
    icon: '👥',
    title: 'Pihak Ketiga Bersorak Kemenangan',
    desc: 'Orang yang dengki dan berniat jahat akan berjaya merebut pasangan anda. Mereka gembira melihat anda menangis dan merana seorang diri.',
  },
  {
    icon: '👶🏻',
    title: 'Anak-Anak Membesar Dalam Trauma',
    desc: 'Anak-anak hilang kasih sayang ibu bapa yang lengkap. Emosi mereka terjejas, hilang fokus belajar dan membawa luka batin hingga ke alam dewasa.',
  },
  {
    icon: '🧊',
    title: 'Hati Pasangan Menjadi Keras & Mati',
    desc: 'Bila sihir dan kebencian dibiarkan bertapak terlalu lama, hati pasangan akan beku sepenuhnya. Saat itu, kemaafan dan rayuan anda tidak lagi bererti buatnya.',
  },
  {
    icon: '💸',
    title: 'Krisis Kewangan & Tuntutan Hak Berpanjangan',
    desc: 'Perebutan nafkah, harta sepencarian dan hak penjagaan anak yang menelan kos ribuan ringgit serta merobek maruah dan ketenangan hidup.',
  },
  {
    icon: '⏳',
    title: 'Penyesalan Seumur Hidup',
    desc: 'Menyesal kerana bertangguh untuk berikhtiar ketika pintu hati pasangan masih boleh dilembutkan. Jangan biarkan nasi menjadi bubur.',
  },
];

export default function GaramFearsSection() {
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
            ⚠️ Sila Beri Perhatian Serius!
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Jika Dibiarkan Berterusan.. Perkara Ini Boleh{' '}
            <span style={{ color: '#DC2626' }}>Membawa Ke Titik Tiada Jalan Kembali</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Iblis dan syaitan meletakkan singgahsananya di atas air, dan tenteranya yang paling dipuji adalah mereka yang berjaya <strong>memisahkan suami dan isteri</strong>. Jangan biarkan rumahtangga anda jadi mangsa seterusnya!
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

        {/* Hadith Matlamat Iblis Memisahkan Pasangan */}
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
            Hadith Sahih Riwayat Imam Muslim:
          </p>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.98rem', color: '#1E293B', lineHeight: 1.75, fontStyle: 'italic' }}>
            &ldquo;Sesungguhnya Iblis meletakkan singgahsananya di atas air, kemudian dia mengutus pasukannya... Maka yang paling tinggi kedudukannya di sisi Iblis adalah yang paling besar fitnahnya. Salah seorang syaitan datang seraya berkata: <em>&lsquo;Aku tidak membiarkannya sehingga aku berjaya memisahkan antara dia dengan isterinya.&rsquo;</em> Maka Iblis mendekatkannya dan berkata: <em>&lsquo;Sebaik-baik tentera adalah kamu!&rsquo;</em>&rdquo;
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            (Sahih Muslim, No. 2813)
          </p>
        </div>

      </div>
    </section>
  );
}
