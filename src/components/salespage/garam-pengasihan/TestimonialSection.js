'use client';

const TESTIMONIALS = [
  {
    name: 'Puan Noraini, 39 tahun',
    location: 'Shah Alam, Selangor',
    status: 'Berkahwin 14 Tahun',
    avatar: '👩🏻',
    quote: 'Dulu suami balik kerja muka masam mencuka. Bila saya tegur je mesti melenting. Dah 8 bulan tidur bilik asing. Saya ikhtiar letak secubit garam ni dalam teh O dan sup ayam dia. Masuk hari ke-5, tiba-tiba dia panggil ajak makan sama-sama dan minta maaf. Ya Allah, mengalir air mata saya...',
    tag: 'Suami Kembali Lembut & Mesra',
  },
  {
    name: 'Puan Syarifah, 43 tahun',
    location: 'Johor Bahru, Johor',
    status: 'Hampir Naik Mahkamah Syariah',
    avatar: '🧕🏻',
    quote: 'Suami saya tiba-tiba berubah hati sampai nak ceraikan saya sebab terkena gangguan wanita luar. Ajak pergi jumpa ustaz dia mengamuk. Syukur sangat ustaz ESyifaa cadangkan garam pengasihan masakan ni. Saya guna senyap-senyap masa masak. Alhamdulillah seminggu lepas tu suami batalkan permohonan cerai dan makin sayang saya.',
    tag: 'Runtuhkan Pengaruh Pihak Ketiga',
  },
  {
    name: 'Encik Faizal, 36 tahun',
    location: 'Kuantan, Pahang',
    status: 'Berkahwin 7 Tahun',
    avatar: '👨🏻',
    quote: 'Bukan isteri je boleh guna, saya seorang suami yang ikhtiar untuk isteri saya. Isteri saya asyik panas baran, anak merengek sikit pun dia herdik. Lepas saya gantikan garam dapur biasa dengan Garam Pengasihan ESyifaa ni, rumah kami jadi sunyi daripada jeritan. Isteri jadi sangat tenang dan rajin senyum.',
    tag: 'Rumahtangga Sejuk & Harmoni',
  },
  {
    name: 'Puan Faridah, 48 tahun',
    location: 'Alor Setar, Kedah',
    status: 'Berkahwin 22 Tahun',
    avatar: '🧕🏻',
    quote: 'Sihir pemisah ni memang wujud. Bertahun-tahun bertengkar benda kecil sampai anak-anak trauma. Alhamdulillah asbab garam pengasihan masakan ni, hati kami berdua seakan dicuci. Bertentang mata dah tak ada rasa meluat atau panas dada. Sangat bersyukur!',
    tag: 'Hilang Rasa Benci & Meluat',
  },
];

export default function GaramTestimonialSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem 4rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#B45309',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            💬 Kisah Benar Pengguna
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            &ldquo;Hati Pasangan Yang Keras Seperti Batu..{' '}
            <span style={{ color: '#EA580C' }}>Akhirnya Lembut Kembali</span>&rdquo;
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Inilah sebahagian luahan para isteri dan suami yang telah berikhtiar menggunakan Garam Pengasihan Masakan ESyifaa dalam hidangan harian mereka.
          </p>
        </div>

        {/* Testimonials Grid (2x2) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFF7ED',
                border: '1.5px solid #FFEDD5',
                borderRadius: '20px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.04)',
                position: 'relative',
              }}
            >
              {/* Badge tag */}
              <div style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                background: '#EA580C',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '99px',
                marginBottom: '1rem',
              }}>
                ✓ {t.tag}
              </div>

              {/* Quote */}
              <p style={{
                margin: '0 0 1.25rem 0',
                fontSize: '0.94rem',
                lineHeight: 1.65,
                color: '#334155',
                fontStyle: 'italic',
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderTop: '1px dashed #FED7AA',
                paddingTop: '0.85rem',
              }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{t.avatar}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 600 }}>
                    {t.location} · <span style={{ color: '#64748B' }}>{t.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Callout trust */}
        <div style={{
          textAlign: 'center',
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400E', fontWeight: 600 }}>
            🔒 Setiap botol diisi khusus dengan niat memulihkan ikatan mahabbah sakinah mawaddah berlandaskan Al-Quran.
          </p>
        </div>

      </div>
    </section>
  );
}
