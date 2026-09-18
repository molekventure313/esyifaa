'use client';

const TESTIMONIALS = [
  {
    name: 'Encik Azlan, 34 tahun',
    location: 'Bangi, Selangor',
    status: 'Masalah Kerap Kena Himpit & Mimpi Ngeri',
    avatar: '👨🏻',
    quote: 'Dah 6 bulan setiap malam tidur rasa ditindih dan selalu mimpi ular besar patuk kaki. Bangun tidur je badan ada lebam-lebam biru. Ustaz cadangkan sapu minyak kasturi kijang ruqyah ni di nadi dan calit sikit di bantal. Malam pertama guna, tidur lena sampai azan subuh! Dah tak ada mimpi pelik dan lebam pun hilang.',
    tag: 'Hilang Kena Himpit & Mimpi Ular',
  },
  {
    name: 'Puan Shikin, 29 tahun',
    location: 'Seremban, Negeri Sembilan',
    status: 'Ibu Kepada Anak 2 Tahun',
    avatar: '👩🏻',
    quote: 'Anak saya yang umur 2 tahun kerap meracau setiap kali masuk waktu maghrib dan tengah malam. Menangis macam nampak benda menakutkan di siling. Lepas saya calit kasturi kijang E-Syifa ni di ubun-ubun dan belakang telinga dia, masyaAllah anak terus berhenti menangis dan tidur dengan sangat tenang. Memang standby botol ni di rumah.',
    tag: 'Anak Berhenti Meracau Malam',
  },
  {
    name: 'Kak Salmah, 47 tahun',
    location: 'Ipoh, Perak',
    status: 'Tengkuk Berat & Kerap Sesak Dada',
    avatar: '🧕🏻',
    quote: 'Bila petang je rasa seram sejuk, tengkuk jadi tegang dan dada rasa sempit macam ada orang hempap. Doktor kata anxiety biasa tapi ubat tak jalan. Bila sapu kasturi ruqyah ni di tengkuk dan hidu aromanya yang wangi, terus sendawa banyak kali dan kepala rasa ringan serta-merta. Rasa terlindung sangat.',
    tag: 'Tengkuk Ringan & Dada Lapang',
  },
  {
    name: 'Ustaz Halim, 42 tahun',
    location: 'Kuala Terengganu',
    status: 'Pengamal Rawatan Islam',
    avatar: '👳🏻‍♂️',
    quote: 'Dalam hadith sahih, Nabi sebut kasturi adalah sebaik-baik wangian. Jin dan syaitan fasik memang tak tahan dengan aroma kasturi kijang tulen yang diruqyah. Semasa saya buat sesi rawatan, bila disapu kasturi ni pesakit yang ada jin dalam badan akan rasa panas dan kepanasan. Sangat elok dijadikan pendinding diri sekeluarga.',
    tag: 'Jin Panas & Menjauhkan Diri',
  },
];

export default function KasturiTestimonialSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem 4rem',
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
            💬 Pengalaman Benar Pengguna
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            &ldquo;Aroma Wangi Yang Menenangkan Jiwa..{' '}
            <span style={{ color: '#047857' }}>Tapi Ditakuti Oleh Makhluk Halus</span>&rdquo;
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            Ribuan pengguna telah merasai sendiri perbezaan tidur yang lena dan perlindungan batin selepas berikhtiar dengan Minyak Kasturi Kijang E-Syifa’.
          </p>
        </div>

        {/* Testimonial Cards */}
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
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: '20px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(5, 150, 105, 0.04)',
              }}
            >
              <div style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                background: '#047857',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '99px',
                marginBottom: '1rem',
              }}>
                ✓ {t.tag}
              </div>

              <p style={{
                margin: '0 0 1.25rem 0',
                fontSize: '0.94rem',
                lineHeight: 1.65,
                color: '#334155',
                fontStyle: 'italic',
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderTop: '1px dashed #A7F3D0',
                paddingTop: '0.85rem',
              }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{t.avatar}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                    {t.location} · <span style={{ color: '#64748B' }}>{t.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div style={{
          textAlign: 'center',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#065F46', fontWeight: 600 }}>
            🛡️ 100% Menggunakan pati asli bebas alkohol — sesuai dipakai bila-bila masa termasuk ketika solat dan tidur.
          </p>
        </div>

      </div>
    </section>
  );
}
