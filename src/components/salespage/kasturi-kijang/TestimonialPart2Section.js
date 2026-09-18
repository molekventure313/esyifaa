'use client';

const STORIES = [
  {
    name: 'Tuan Razak, 45 tahun',
    loc: 'Muar, Johor',
    avatar: '👨🏻',
    tag: 'Pemandu Lori Jalan Malam',
    story: 'Saya kerja bawa lori waktu malam selalu lalu jalan sunyi celah bukit. Dulu selalu rasa seram sejuk dan macam ada kelibat duduk di seat sebelah. Lepas amalkan sapu kasturi kijang E-Syifa ni dan letak satu botol dalam lori, rasa berani dan suasana kabin lori jadi sangat tenang. Tak ada lagi gangguan sepanjang perjalanan.',
  },
  {
    name: 'Cikgu Hanis, 36 tahun',
    loc: 'Kuala Kangsar, Perak',
    avatar: '🧕🏻',
    tag: 'Warden Asrama Sekolah',
    story: 'Di asrama sekolah saya kadang-kadang ada kes histeria berjangkit bila malam jumaat. Pernah sekali seorang pelajar tingkatan 2 meronta-ronta kuat. Saya sapukan kasturi kijang ruqyah ni di ubun-ubun dan bawah hidung dia. Budak tu batuk-batuk kecil dan tak sampai 2 minit terus sedar dan lemah. Sekarang saya wajibkan warden simpan sebotol.',
  },
  {
    name: 'Puan Zaharah, 52 tahun',
    loc: 'Klang, Selangor',
    avatar: '🧕🏻',
    tag: 'Ganti Perfume Kimia Kepada Sunnah',
    story: 'Dulu saya suka pakai perfume mahal dari mall tapi kerap pening kepala dan lesu. Bila beralih kepada Minyak Kasturi Kijang E-Syifa ni, bukan saja badan wangi lembut sepanjang hari, malah sakit kepala dan angin dalam badan hilang. Anak-anak pun puji bau umi wangi dan sejuk bila peluk.',
  },
  {
    name: 'Tuan Haji Yusof, 63 tahun',
    loc: 'Alor Setar, Kedah',
    avatar: '👳🏻‍♂️',
    tag: 'Solat Jadi Lebih Khusyuk',
    story: 'Sapu sikit di janggut dan lengan baju sebelum ke masjid. Baunya kekal sampai balik solat terawih. Hati jadi lapang, tiada lagi lintasan fikiran yang mengganggu waktu sujud. Rasa sangat tenang beribadah.',
  },
];

export default function KasturiTestimonialPart2Section() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
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
            🌟 Bukti &amp; Realiti
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Betul Ke Minyak Kasturi Kijang E-Syifa’{' '}
            <span style={{ color: '#047857' }}>Mampu Menjadi Perisai Pendinding Anda?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Lihat apa kata mereka yang telah menjadikan wangian sunnah ini sebahagian daripada amalan perlindungan harian 👇
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
                border: '1.5px solid #BBF7D0',
                borderRadius: '20px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(5, 150, 105, 0.04)',
              }}
            >
              <div>
                <span style={{
                  display: 'inline-block',
                  background: '#DCFCE7',
                  color: '#15803D',
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
