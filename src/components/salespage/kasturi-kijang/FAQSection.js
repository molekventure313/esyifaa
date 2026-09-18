'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: '1. Siapa yang patut berikhtiar dengan Minyak Kasturi Kijang E-Syifa\'?',
    a: 'Minyak ini amat disyorkan buat sesiapa yang kerap mengalami mimpi buruk/menakutkan, lebam misteri di badan, ditindih semasa tidur, dada sesak atau resah menjelang waktu Asar/Maghrib, bahu dan tengkuk terasa berat tanpa sebab perubatan, panas baran tidak tentu pasal, serta anak kecil yang kerap menangis meragam waktu malam.',
  },
  {
    q: '2. Adakah minyak ini mengandungi alkohol dan sah dibawa solat?',
    a: 'Minyak Kasturi Kijang Asli E-Syifa\' adalah 100% BEBAS ALKOHOL dan bebas bahan kimia sintetik merbahaya. Ia 100% suci, sah dibawa solat dan wudhu. Malah memakai wangian kasturi adalah sunnah baginda Nabi SAW yang sangat dicintai.',
  },
  {
    q: '3. Bagaimana minyak wangi kasturi ini boleh menghalau gangguan halus & sihir?',
    a: 'Rasulullah SAW bersabda bahawa syaitan bergerak di dalam tubuh anak Adam melalui saluran darah. Jin dan syaitan amat benci dan terseksa dengan bauan wangi terutamanya Kasturi Kijang asli. Ditambah dengan bacaan ayat-ayat Ruqyah Syar\'iyyah, ia menjadi pendinding dan pemusnah tapak jin dalam tubuh.',
  },
  {
    q: '4. Adakah baunya terlalu menyengat sehingga memeningkan kepala?',
    a: 'Tidak sama sekali. Ini adalah pati kasturi gred terpilih yang menghasilkan haruman klasik, lembut, menenangkan jiwa dan tahan lama pada pakaian serta kulit tanpa bau tajam kimia tiruan.',
  },
  {
    q: '5. Bolehkah disapu pada bayi atau kanak-kanak?',
    a: 'Sangat selamat. Untuk bayi atau kanak-kanak yang kerap diganggu atau meragam malam, anda boleh calitkan sedikit pada bantal tidur, pakaian mereka, atau pada tapak kaki mereka sebelum tidur.',
  },
  {
    q: '6. Bagaimana jika selepas guna langsung tiada sebarang perubahan?',
    a: 'Kami menawarkan Jaminan Pulangan Wang 100% selama 30 Hari. Jika anda berikhtiar mengikut panduan dan mendapati tiada sebarang perubahan positif, hubungi kami dan kami akan pulangkan wang anda tanpa banyak soal.',
  },
  {
    q: '7. Bagaimana cara penghantaran dan berapa lama barang akan sampai?',
    a: 'Kami menggunakan kurier NinjaVan & J&T Express. Penghantaran mengambil masa 1 hingga 3 hari bekerja untuk Semenanjung, dan 3 hingga 5 hari untuk Sabah & Sarawak. Anda boleh bayar secara online (FPX) atau bayar tunai kepada posmen apabila barang sampai (COD). Bungkusan dibungkus selamat dengan bubble wrap tebal.',
  },
];

export default function KasturiFAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
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
            ❓ Soalan Lazim (F.A.Q)
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Ada Sebarang Persoalan? Segalanya Terjawab Di Sini
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Jawapan telus dan jelas kepada soalan-soalan yang kerap diajukan oleh para pengguna Minyak Kasturi Kijang Ruqyah E-Syifa&apos;.
          </p>
        </div>

        {/* Accordion FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  border: isOpen ? '1.5px solid #D97706' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  background: isOpen ? '#FFFDF8' : '#FFFFFF',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isOpen ? '0 4px 15px rgba(217, 119, 6, 0.08)' : 'none',
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  style={{
                    width: '100%',
                    padding: '1.2rem 1.4rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: ff,
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A', paddingRight: '1rem' }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: isOpen ? '#D97706' : '#94A3B8',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 1.4rem 1.3rem 1.4rem',
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: 1.7,
                    borderTop: '1px dashed #FDE68A',
                    marginTop: '0.2rem',
                    paddingTop: '0.9rem',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
