'use client';

const FAQS = [
  {
    q: 'Sabun ni selamat untuk kulit sensitif?',
    a: 'Ya. Garam Himalaya bersifat semulajadi dan lembut untuk kebanyakan jenis kulit. Jika ada alahan kulit yang teruk, sila uji pada kawasan kecil dahulu.',
  },
  {
    q: 'Berapa lama satu unit 200g boleh tahan?',
    a: 'Bergantung pada kekerapan penggunaan. Penggunaan harian oleh seorang dewasa biasanya tahan 4-6 minggu. Jika dikongsi dengan keluarga, mungkin lebih cepat habis.',
  },
  {
    q: 'Boleh ke saya guna untuk anak-anak?',
    a: 'Ya, selamat untuk kanak-kanak. Garam himalaya adalah bahan semulajadi. Tenaga ruqyah yang diisikan juga selamat dan bermanfaat untuk kanak-kanak.',
  },
  {
    q: 'Berapa lama nak rasa kesannya?',
    a: 'Bergantung pada tahap gangguan. Ada yang rasa ringan selepas beberapa kali guna, ada yang ambil masa beberapa minggu. Kekalkan penggunaan harian untuk hasil terbaik.',
  },
  {
    q: 'COD — macam mana proses penghantaran?',
    a: 'Selepas order diterima, kami proses dalam 1-2 hari bekerja. Kami akan hubungi anda melalui WhatsApp untuk sahkan alamat sebelum hantar. Bayar kepada posmen/rider masa terima barang.',
  },
  {
    q: 'Boleh beli guna FPX jika tak mahu COD?',
    a: 'Boleh. Anda boleh pilih FPX semasa buat tempahan. Bayar terus online, kami proses selepas pembayaran disahkan.',
  },
];

export default function SabunFAQSection() {
  const [open, setOpen] = require('react').useState(null);
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background: '#042E23', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(253,224,71,0.1)',
            border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            ❓ Soalan Lazim
          </span>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0', letterSpacing: '-0.02em',
          }}>
            Ada Soalan? Kami Jawab.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: '#031E17',
              border: `1px solid ${open === i ? 'rgba(253,224,71,0.45)' : 'rgba(74,222,128,0.15)'}`,
              borderRadius: '12px', overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '1.1rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: ff,
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FEF3C7', lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ fontSize: '1.1rem', color: '#FDE047', flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.1rem', fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
