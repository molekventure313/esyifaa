'use client';

const BENEFITS = [
  {
    icon: '🗡️',
    title: 'Merungkai Simpulan Sihir Pemisah',
    desc: 'Menghapuskan kesan sihir tafriq, sihir pelalau atau sihir penunduk pihak ketiga yang berniat meruntuhkan rumahtangga anda.',
  },
  {
    icon: '🧊',
    title: 'Menyejukkan Hati Yang Panas Baran',
    desc: 'Meredakan amarah yang meluap-luap. Pasangan yang dulu pantang ditegur akan kembali sabar, tenang dan mudah mendengar bicara.',
  },
  {
    icon: '💞',
    title: 'Memulihkan Rasa Rindu & Kasih Sayang',
    desc: 'Menghidupkan kembali rasa cinta yang pernah pudar. Bertentang mata timbul rasa manis dan hubungan intim kembali mesra.',
  },
  {
    icon: '🏡',
    title: 'Suami/Isteri Suka Berada Di Rumah',
    desc: 'Pasangan tidak lagi mengelak atau kerap keluar malam tanpa hala tuju. Rumah terasa selesa, aman dan dirindui.',
  },
  {
    icon: '🍲',
    title: 'Meja Makan Menjadi Sumber Keberkatan',
    desc: 'Setiap suapan yang masuk ke dalam tubuh membawa ketenangan dan membuang segala aura negatif serta bisikan syaitan.',
  },
  {
    icon: '🚪',
    title: 'Mengusir Gangguan Jin Dasim',
    desc: 'Menghalang jin perosak rumahtangga daripada mencucuk jarum kebencian dan syak wasangka dalam fikiran suami isteri.',
  },
  {
    icon: '👶🏻',
    title: 'Anak-Anak Lembut Hati & Dengar Kata',
    desc: 'Anak-anak yang kerap bergaduh atau degil akan menjadi lebih tenang, hormat pada ibu bapa dan mudah diasuh.',
  },
  {
    icon: '🕊️',
    title: 'Ikhtiar Senyap Tanpa Jatuhkan Maruah',
    desc: 'Anda tidak perlu bertegang leher memaksa pasangan berubat. Lakukan ikhtiar ini secara peribadi dengan penuh doa dan tawakal.',
  },
];

export default function GaramBenefitsSection() {
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
            ✨ Manfaat Menyeluruh
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            8 Manfaat Garam Pengasihan Masakan ESyifaa{' '}
            <span style={{ color: '#EA580C' }}>Untuk Memulihkan Rumahtangga Anda</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Bukan sekadar penambah rasa masakan — ini adalah ikhtiar rohaniah yang membelai jiwa sekeluarga dari dalam.
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
                background: '#FFFDFB',
                border: '1.5px solid #FED7AA',
                borderRadius: '18px',
                padding: '1.6rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{
                fontSize: '1.5rem',
                flexShrink: 0,
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#FFEDD5',
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
