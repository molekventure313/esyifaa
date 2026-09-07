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
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '740px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            ❓ Soalan Lazim
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0',
            letterSpacing: '-0.02em',
          }}>
            Ada Soalan? Kami Jawab.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                background: '#FFFFFF',
                border: `1.5px solid ${isOpen ? '#10B981' : '#E2E8F0'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: isOpen ? '0 4px 15px rgba(16, 185, 129, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.15rem 1.4rem',
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
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: isOpen ? '#047857' : '#0F172A', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1.25rem',
                    color: isOpen ? '#059669' : '#94A3B8',
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                    fontWeight: 600,
                  }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 1.4rem 1.25rem',
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: 1.7,
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '0.85rem',
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
