'use client';

const FAQS = [
  {
    q: 'E-Video ni macam mana pesakit boleh guna?',
    a: 'Mudah sahaja — play video tersebut. Untuk rawatan diri, duduk tenang dan play. Untuk rawatan rumah, pasang video di tengah rumah. Untuk buat air tawar, letak bekas air di hadapan peranti semasa video diplay. Tiada cara yang salah selagi video diplay dengan niat yang betul.',
  },
  {
    q: 'Berkesan ke rawatan guna video berbanding rawatan terus?',
    a: 'Ayat-ayat Al-Quran adalah kalam Allah — berkesan tidak kira cara ia sampai. Rakaman bacaan ruqyah syariyyah membawa kekuatan yang sama. Ramai pesakit melaporkan tindak balas (sendawa, loya, badan panas) semasa guna E-Video — tanda ia sedang bekerja.',
  },
  {
    q: 'Boleh guna untuk semua kes — sihir, saka, jin, santau?',
    a: 'Ya. E-Video Rawatan ESyifaa mengandungi bacaan ayat-ayat ruqyah yang menyeluruh untuk pelbagai jenis gangguan. Sesuai untuk kes sihir, saka, gangguan jin, asyik, badi, dan bisa santau.',
  },
  {
    q: 'Berapa lama perlu guna video setiap kali?',
    a: 'Tiada had masa yang ditetapkan. Untuk rawatan diri, boleh play 15-30 minit atau habis video. Untuk rawatan rumah, boleh tinggalkan ia play selama beberapa jam atau overnight. Untuk buat air tawar, cukup play sampai habis sekali.',
  },
  {
    q: 'Boleh kongsi video ni dengan orang lain?',
    a: 'Boleh dikongsi dengan ahli keluarga dalam satu rumah. Namun, tidak digalakkan untuk disebarkan kepada umum tanpa kebenaran perawat.',
  },
  {
    q: 'Macam mana nak terima video selepas bayar?',
    a: 'Sebaik bayaran FPX berjaya, perawat ESyifaa akan hubungi anda melalui WhatsApp dan hantar video dalam masa 24 jam. Pastikan nombor WhatsApp yang anda masukkan dalam borang adalah betul dan aktif.',
  },
];

export default function EVideoFAQSection() {
  return (
    <section style={{
      background: '#0B382D', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.4)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ❓ Soalan Lazim
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FEF3C7',
            marginTop: '0.4rem', marginBottom: '0.5rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Soalan Lazim — E-Video Rawatan
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(253,224,71,0.15)',
              borderRadius: '14px', padding: '1.5rem',
            }}>
              <div style={{
                fontWeight: 800, fontSize: '0.95rem', color: '#FDE047',
                marginBottom: '0.6rem', lineHeight: 1.35,
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              }}>
                <span style={{
                  background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.3)',
                  borderRadius: '50%', width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 900, flexShrink: 0, marginTop: '0.1rem',
                }}>
                  Q
                </span>
                {faq.q}
              </div>
              <div style={{
                fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7,
                paddingLeft: '2rem',
              }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
