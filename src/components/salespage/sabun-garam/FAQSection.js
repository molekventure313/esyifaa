'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Sabun ini selamat untuk kulit sensitif?',
    a: 'Ya. Garam Himalaya bersifat semulajadi dan lembut untuk kebanyakan jenis kulit. Jika ada alahan kulit yang sangat teruk, disarankan uji pada kawasan kecil terlebih dahulu.',
  },
  {
    q: 'Berapa lama satu unit 200g boleh tahan?',
    a: 'Penggunaan harian oleh seorang dewasa biasanya bertahan 4-6 minggu. Jika dikongsi dengan seisi keluarga, biasanya bertahan sekitar 3-4 minggu.',
  },
  {
    q: 'Boleh ke saya gunakan untuk anak-anak?',
    a: 'Ya, selamat untuk kanak-kanak. Garam himalaya adalah bahan semulajadi dan ayat ruqyah syar\'iyyah yang diisikan sangat bermanfaat untuk menenangkan anak-anak yang sering meracau atau menangis malam.',
  },
  {
    q: 'Berapa lama sebelum terasa kesannya?',
    a: 'Bergantung kepada tahap gangguan dan tindak balas badan masing-masing. Ramai pelanggan mula merasakan badan lebih ringan dan tidur lebih lena seawal beberapa kali mandian.',
  },
  {
    q: 'COD — bagaimana proses penghantarannya?',
    a: 'Selepas pesanan direkodkan, kami akan proses dalam masa 1-2 hari bekerja. Kami akan hubungi anda melalui WhatsApp sebelum posmen membuat penghantaran. Anda hanya bayar tunai kepada kurier apabila barang sampai.',
  },
  {
    q: 'Boleh bayar secara online jika tidak mahu COD?',
    a: 'Boleh. Anda boleh memilih kaedah FPX Online Banking semasa mengisi borang tempahan. Bayaran diproses secara selamat dan segera.',
  },
];

export default function SabunFAQSection() {
  const [open, setOpen] = useState(null);
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#081C15',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '740px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#FBBF24',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ❓ Soalan Lazim
          </span>
          <h2 style={{
            fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.3rem 0 0',
            letterSpacing: '-0.02em',
          }}>
            Ada Soalan? Kami Jawab.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                background: '#0D221B',
                border: `1px solid ${isOpen ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.15s ease',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.35rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: ff,
                  }}
                >
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: isOpen ? '#FBBF24' : '#64748B',
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 1.35rem 1.15rem',
                    fontSize: '0.88rem',
                    color: '#94A3B8',
                    lineHeight: 1.65,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '0.75rem',
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
