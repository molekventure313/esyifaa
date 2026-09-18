'use client';

const PROBLEMS = [
  {
    icon: '🛌',
    title: 'Susah Tidur Malam & Kerap Terjaga Cemas',
    desc: 'Bila baring atas katil, fikiran ligat berputar, mata payah lelap dan dada berdebar-debar tanpa punca. Bangun pagi badan bertambah penat.',
  },
  {
    icon: '🐍',
    title: 'Kena Himpit & Kerap Mimpi Menakutkan',
    desc: 'Sering mimpi jatuh tempat tinggi, dikejar binatang berbisa, bayi menangis atau kubur. Kadangkala sedar tapi tubuh kaku tak boleh bergerak.',
  },
  {
    icon: '🧊',
    title: 'Tengkuk & Belikat Rasa Berat Semacam',
    desc: 'Bahu rasa tegang dan lenguh macam memikul beban batu. Sakit yang berpindah-randah dari pinggang, lutut dan sendi yang ubat doktor tak dapat selesaikan.',
  },
  {
    icon: '⚡',
    title: 'Anxiety, Sesak Dada & Panik Tiba-Tiba',
    desc: 'Terasa seperti ada benda mencengkam di ulu hati, nafas jadi pendek dan selalu diselubungi rasa takut mati atau rasa diperhatikan di tempat gelap.',
  },
  {
    icon: '👶🏻',
    title: 'Anak Kecil Kerap Meracau Waktu Malam',
    desc: 'Anak menangis meraung secara tiba-tiba terutama waktu senja dan tengah malam, seakan-akan melihat makhluk yang menakutkan di sudut rumah.',
  },
  {
    icon: '🔥',
    title: 'Emosi Cepat Baran & Panas Hati',
    desc: 'Perasaan mudah tersinggung, cepat melenting pada pasangan dan anak-anak. Wajah nampak kelam dan hilang seri ketenangan.',
  },
];

export default function KasturiProblemSection() {
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
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            😟 Tanda-Tanda Gangguan Rohani
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.25rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Tubuh Selalu Lemah, Hati Sentiasa Tak Tenang..{' '}
            <span style={{ color: '#DC2626' }}>Adakah Anda Alami Perkara Ini?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Simptom di atas bukanlah sekadar keletihan fizikal biasa. Seringkali ia adalah tanda wujudnya cas tenaga negatif, sihir angin, saka atau jin yang menumpang pada saluran darah dan fikiran anda.
          </p>
        </div>

        {/* Problems Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {PROBLEMS.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '18px',
                padding: '1.6rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{
                fontSize: '1.6rem',
                flexShrink: 0,
                width: '48px',
                height: '48px',
                background: '#FEF2F2',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FEE2E2',
              }}>
                {p.icon}
              </div>
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  color: '#0F172A',
                  marginBottom: '0.35rem',
                  lineHeight: 1.35
                }}>
                  {p.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Note */}
        <div style={{
          background: '#FFF1F2',
          border: '1.5px solid #FECDD3',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          maxWidth: '740px',
          margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#9F1239', lineHeight: 1.6, fontWeight: 600 }}>
            ⚠️ <em>&ldquo;Jika tanda-tanda ini dibiarkan tanpa pendinding diri, makhluk halus akan lebih mudah bertapak kukuh di dalam tubuh dan menguasai fikiran.&rdquo;</em>
          </p>
        </div>

      </div>
    </section>
  );
}
