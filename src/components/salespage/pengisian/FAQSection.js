'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: '1. Adakah pengisian boleh dilakukan dari jarak jauh — tanpa pos barang?',
    a: 'Ya, 100% jarak jauh. Kaedah pengisian adalah sama seperti rawatan doa jarak jauh (solat hajat & wirid ruqyah berasaskan nama pemilik dan maklumat barang). Anda tidak perlu memposkan barang berharga anda ke mana-mana. Cukup simpan barang tersebut bersama anda sepanjang 3 hari proses dijalankan.',
  },
  {
    q: '2. Saya orang biasa dan kurang arif ilmu agama, adakah ia tetap berkesan bila saya yang guna?',
    a: 'Sangat berkesan. Keberkatan bacaan ruqyah telah dipasakkan oleh perawat bertauliah ke dalam medium barang tersebut. Apabila anda memegangnya, tenaga ruqyah itu sedia bertindak balas. Anda cuma perlu mengamalkan niat dan zikir asas (seperti Bismillah dan Al-Fatihah) yang dibimbing oleh perawat.',
  },
  {
    q: '3. Kenapa ada bayaran RM90 sedangkan Al-Quran itu percuma?',
    a: 'Bayaran bukan untuk "menjual ayat Al-Quran", sebaliknya adalah upah (ujrah) komitmen masa dan tenaga perawat yang menjalankan solat hajat khusus, wirid ruqyah intensif selama 3 hari berturut-turut, pemantauan kes, serta perkhidmatan pelarasan mingguan percuma seumur hidup.',
  },
  {
    q: '4. Apakah barang yang paling sesuai dan bolehkah guna barangan emas/perak?',
    a: 'Sangat boleh. Cincin perak, tasbih, jam tangan, gelang atau loket adalah pilihan paling popular. Asasnya, apa-apa barangan peribadi yang halal, suci dan kerap bersentuhan dengan tubuh anda sangat sesuai untuk diisikan.',
  },
  {
    q: '5. Adakah kekuatan bacaan pengisian akan berkurang mengikut peredaran masa?',
    a: 'Tidak. Inilah kelebihan utama Pengisian E-Syifa\'. Perawat kami menjalankan pelarasan dan pengisian semula setiap minggu secara automatik dari jauh. Tenaga ruqyah pada barang anda sentiasa dicas pada tahap maksimum.',
  },
  {
    q: '6. Bolehkah satu barang yang diisi digunakan untuk merawat ahli keluarga lain?',
    a: 'Boleh. Walaupun barang didoakan khusus atas nama pemilik, ia boleh digunakan untuk menghasilkan air penawar atau air mandian syifa\' untuk diminum atau dimandikan oleh pasangan dan anak-anak yang mengalami gangguan.',
  },
  {
    q: '7. Bagaimana jika selepas 30 hari saya dapati langsung tiada perubahan?',
    a: 'Anda dilindungi dengan Jaminan Pulangan Wang 30 Hari 100%. Jika selepas 30 hari anda berikhtiar mengikut panduan dan mendapati tiada sebarang perubahan positif, hubungi perawat kami dan kami akan pulangkan wang anda tanpa sebarang pertikaian.',
  },
  {
    q: '8. Adakah pengisian ini patuh syariah dan bebas daripada khurafat/jin?',
    a: 'Dijamin 100% patuh syariah. ESyifaa berpegang teguh pada amalan Ruqyah Syar\'iyyah berlandaskan Al-Quran dan Sunnah. Tiada khodam, tiada jin dampingan, tiada wafak tangkal, dan tiada amalan khurafat.',
  },
];

export default function PengisianFAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section style={{
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ❓ Soalan Lazim (F.A.Q)
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.5rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Ada Sebarang Persoalan? Kami Jawab Telus Di Sini
          </h2>
          <p style={{ fontSize: '0.96rem', color: '#D1FAE5', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto' }}>
            Jawapan jelas kepada persoalan yang kerap ditanya sebelum membuat tempahan Pengisian E-Syifa&apos;.
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
                  border: isOpen ? '1.5px solid #FDE047' : '1px solid rgba(74,222,128,0.25)',
                  borderRadius: '16px',
                  background: isOpen ? '#064E3B' : '#031E17',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isOpen ? '0 4px 15px rgba(253,224,71,0.08)' : 'none',
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
                  <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#FEF3C7', paddingRight: '1rem' }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '1.25rem',
                    color: isOpen ? '#FDE047' : '#6EE7B7',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 1.4rem 1.3rem 1.4rem',
                    fontSize: '0.9rem',
                    color: '#D1FAE5',
                    lineHeight: 1.7,
                    borderTop: '1px dashed rgba(253,224,71,0.25)',
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
