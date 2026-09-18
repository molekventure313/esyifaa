'use client';

const STORIES = [
  {
    name: 'Kak Maria, 41 tahun',
    loc: 'Klang, Selangor',
    avatar: '🧕🏻',
    tag: 'Suami Tak Jadi Keluar Rumah',
    story: 'Pagi tu suami saya dah siap masukkan baju dalam beg, bertegas nak pindah rumah bujang kononnya dah benci tengok muka saya. Saya sediakan sarapan sup mee dan masukkan secubit garam ni sambil menangis berdoa. Lepas dia habiskan semangkuk sup tu, dia termenung lama di meja makan. Tiba-tiba dia panggil anak-anak dan peluk erat sambil menangis. Beg baju tak jadi bawa keluar. Syukur ya Allah...',
  },
  {
    name: 'Puan Roslinda, 35 tahun',
    loc: 'Batu Pahat, Johor',
    avatar: '👩🏻',
    tag: 'Putus Hubungan Orang Ketiga',
    story: 'Suami saya kemaruk dengan budak ofis dia. Telefon tak lepas dari tangan dan saya diteking hari-hari. Saya amalkan masukkan garam pengasihan ni dalam masakan harian kami selama 14 hari berturut-turut. Masuk minggu ke-2, suami saya sendiri yang mengaku dan serahkan telefon pada saya. Dia kata rasa bersalah yang amat sangat dan dah sekat nombor perempuan tu. Kini suami saya fokus 100% pada keluarga.',
  },
  {
    name: 'Ustaz Ridzwan (Perawat Tradisional)',
    loc: 'Kota Bharu, Kelantan',
    avatar: '👳🏻‍♂️',
    tag: 'Saranan Pengamal Perubatan',
    story: 'Dalam kes sihir pemisah (tafriq), 90% pasangan yang terkena memang akan menolak ajakan berubat kerana jin di dalam badan menghasut mereka. Kaedah Garam Pengasihan Masakan ESyifaa ini adalah ikhtiar paling bijak dan berkesan kerana ia merawat pesakit tanpa memerlukan kerelaan atau ego pesakit ditundukkan.',
  },
  {
    name: 'Puan Azimah, 50 tahun',
    loc: 'Ipoh, Perak',
    avatar: '🧕🏻',
    tag: 'Rasa Macam Pengantin Baru',
    story: 'Dah 5 tahun rumahtangga kami macam orang asing duduk serumah. Masing-masing buat hal sendiri. Lepas amalkan garam ni dalam gulai dan masakan, terasa betul perubahannya. Suami mula rajin tolong di dapur, puji masakan dan ajak berbual sebelum tidur. Terasa macam zaman bercinta dulu. Sangat berbaloi berikhtiar.',
  },
];

export default function GaramTestimonialPart2Section() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFDFB',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFEDD5',
            border: '1px solid #FED7AA',
            color: '#C2410C',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            🌟 Bukti Nyata
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Betul Ke Garam Pengasihan Masakan Ini{' '}
            <span style={{ color: '#EA580C' }}>Mampu Menyelamatkan Rumahtangga?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Jom baca kisah-kisah mereka yang hampir putus asa namun diberi sinar kebahagiaan semula selepas berikhtiar 👇
          </p>
        </div>

        {/* Stories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {STORIES.map((s, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #FED7AA',
                borderRadius: '20px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.04)',
              }}
            >
              <div>
                <span style={{
                  display: 'inline-block',
                  background: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '99px',
                  marginBottom: '1rem',
                }}>
                  ★ {s.tag}
                </span>

                <p style={{
                  margin: '0 0 1.25rem 0',
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  color: '#334155',
                  fontStyle: 'italic',
                }}>
                  &ldquo;{s.story}&rdquo;
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderTop: '1px solid #F1F5F9',
                paddingTop: '0.85rem',
              }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{s.avatar}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {s.loc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
