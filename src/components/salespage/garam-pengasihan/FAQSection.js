'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: '1. Siapa yang patut berikhtiar dengan Garam Pengasihan Masakan ini?',
    a: 'Garam ini khusus buat para isteri atau suami yang sedang berdepan ujian keretakan rumahtangga, pasangan yang tiba-tiba panas baran, dingin di bilik tidur, disyaki terkena pengaruh orang ketiga atau sihir pemisah (tafriq), serta pasangan yang berdegil dan menolak untuk berubat.',
  },
  {
    q: '2. Adakah ini amalan syirik, ilmu guna-guna atau jampi bomoh?',
    a: 'Minta dijauhkan sama sekali! Garam Pengasihan Masakan ESyifaa adalah 100% Ruqyah Syar\'iyyah yang berlandaskan Al-Quran dan As-Sunnah. Ia diisi khusus dengan ayat-ayat pembatal sihir (Surah Yunus, Taha, Al-Baqarah) dan ayat-ayat mahabbah (kasih sayang) Al-Quran. Tiada sebarang jin, wafak, tangkal atau jampi serapah khurafat.',
  },
  {
    q: '3. Perlukah saya beritahu pasangan saya sebelum menggunakannya?',
    a: 'Tidak perlu sama sekali. Keistimewaan utama produk ini adalah ia bertindak secara senyap tanpa perlu menjatuhkan ego pasangan atau mencetuskan pergaduhan. Anda hanya perlu menjadikannya sebahagian daripada garam masakan harian di dapur.',
  },
  {
    q: '4. Adakah anak-anak boleh makan masakan yang diletakkan garam ini?',
    a: 'Sangat boleh dan amat digalakkan! Kerana ia diisi dengan ayat-ayat suci Al-Quran, ia membawa keberkatan dan ketenangan rohani. Ramai ibu bapa memberi maklum balas anak-anak mereka menjadi lebih lembut hati, mudah mendengar kata, rajin solat dan kurang merajuk.',
  },
  {
    q: '5. Berapa lama masa yang diambil untuk melihat perubahan pada pasangan?',
    a: 'Setiap individu dan tahap gangguan berbeza-beza. Ada pelanggan yang mula melihat suami/isteri mula berlembut dan mesra seawal 3 ke 7 hari penggunaan. Untuk kesan menyeluruh dan pembersihan racun sihir yang telah lama bertapak, kami sarankan amalkan sekurang-kurangnya 21 hingga 40 hari secara istiqamah.',
  },
  {
    q: '6. Bagaimana jika selepas guna langsung tiada sebarang perubahan?',
    a: 'Anda dilindungi dengan Jaminan Pulangan Wang 30 Hari kami. Jika selepas 30 hari anda mengamalkannya dan mendapati tiada sebarang perubahan positif pada rumahtangga anda, hubungi pihak kami dan kami akan memulangkan semula wang anda tanpa sebarang pertikaian.',
  },
  {
    q: '7. Bagaimana cara penghantaran dan berapa lama barang akan sampai?',
    a: 'Kami menggunakan kurier NinjaVan & J&T Express. Penghantaran mengambil masa 1 hingga 3 hari bekerja untuk Semenanjung, dan 3 hingga 5 hari untuk Sabah & Sarawak. Anda boleh pilih bayaran secara online (FPX) atau bayar tunai kepada posmen semasa barang sampai (COD). Bungkusan juga dibungkus kemas dan berprivasi penuh.',
  },
];

export default function GaramFAQSection() {
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
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
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
            Ada Sebarang Keraguan? Kami Jawab Segalanya Di Sini
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Jawapan telus kepada persoalan paling kerap ditanya oleh para pelanggan sebelum mendapatkan Garam Pengasihan Masakan ESyifaa.
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
                  border: isOpen ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  background: isOpen ? '#FFFDFB' : '#FFFFFF',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isOpen ? '0 4px 15px rgba(234, 88, 12, 0.05)' : 'none',
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
                    color: isOpen ? '#EA580C' : '#94A3B8',
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
                    borderTop: '1px dashed #FED7AA',
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
