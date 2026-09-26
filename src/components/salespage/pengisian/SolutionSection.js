'use client';

const BENEFITS = [
  { icon: '♾️', title: 'Rawatan Mandiri Seumur Hidup Tanpa Had', desc: 'Tiada kuota atau had penggunaan. Guna setiap hari, bila-bila masa — kekuatan bacaan tidak pernah luput.' },
  { icon: '⚡', title: 'Tindak Balas Pantas Bila Diserang Malam', desc: 'Kena tindih atau sesak dada jam 3 pagi? Tak perlu tunggu siang, tak perlu cari perawat. Terus guna item di tangan anda.' },
  { icon: '🏠', title: 'Rawat Sendiri Dari Rumah Penuh Privasi', desc: 'Semua ikhtiar dilakukan dalam keselesaan rumah sendiri. Tidak perlu bersusah payah beratur atau keluar jauh.' },
  { icon: '💧', title: 'Boleh Hasilkan Air Penawar Sendiri', desc: 'Gunakan item berisian untuk memasak air penawar syifa\' sendiri bila anak demam panas atau emosi terganggu.' },
  { icon: '🚿', title: 'Boleh Hasilkan Air Mandian Ruqyah', desc: 'Rendamkan seketika dalam baldi mandian untuk membuang bisa-bisa angin saka dan sihir dari liang roma.' },
  { icon: '🛡️', title: 'Dinding Perlindungan Ghaib 24 Jam', desc: 'Ibarat mempunyai perawat peribadi di sisi. Menjadi benteng aktif menghalang sihir baru dihantar semula.' },
  { icon: '👨‍👩‍👧', title: 'Manfaat Untuk Seisi Keluarga', desc: 'Satu item berisian boleh dikongsi khasiatnya untuk merawat pasangan dan anak-anak yang meragam tanpa kos tambahan.' },
  { icon: '💰', title: 'Jimat Ribuan Ringgit Kos Berulang', desc: 'Hanya sekali bayar upah pengisian, nikmati ikhtiar berterusan seumur hidup tanpa membakar duit setiap bulan.' },
  { icon: '📖', title: '100% Ruqyah Syar\'iyyah Bebas Syirik', desc: 'Diisi dengan bacaan suci Al-Quran dan doa mustajab Rasulullah SAW. Hati tenang berikhtiar tanpa was-was.' },
  { icon: '🔄', title: 'Pelarasan Mingguan Automatik Percuma', desc: 'Perawat ESyifaa memperbaharui dan menguatkan bacaan setiap minggu secara jarak jauh agar tenaga syifa\' sentiasa segar.' },
];

export default function PengisianSolutionSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        
        <span style={{
          display: 'inline-block',
          fontSize: '0.78rem', fontWeight: 800, color: '#047857',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '0.35rem 1rem', borderRadius: '999px',
          marginBottom: '0.85rem',
        }}>
          💡 Solusi Muktamad
        </span>

        <h2 style={{
          fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
          fontWeight: 900, color: '#042E23',
          marginTop: '0.25rem', marginBottom: '0.75rem',
          letterSpacing: '-0.025em', lineHeight: 1.25,
        }}>
          Pengisian E-Syifa&apos; — Perawat Peribadi Yang Sentiasa Bersama Anda
        </h2>

        <p style={{ fontSize: '1.02rem', color: '#4B5563', lineHeight: 1.75, maxWidth: '740px', margin: '0 auto 2.5rem auto' }}>
          Satu ikhtiar yang membebaskan anda daripada kebergantungan rawatan luar.
          Tidak perlu tunggu temujanji, tidak perlu menempuh kesesakan —{' '}
          <strong style={{ color: '#047857' }}>setiap kali diserang, anda ada kuasa merawat diri sendiri serta-merta.</strong>
        </p>

        {/* ── Apa Itu Pengisian E-Syifa'? ── */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          border: '2px solid #BBF7D0',
          borderRadius: '20px', padding: '2rem 2.25rem',
          textAlign: 'left',
          maxWidth: '820px', margin: '0 auto 3.5rem auto',
          boxShadow: '0 8px 30px rgba(4, 46, 35, 0.06)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#042E23', color: '#FDE047',
            padding: '0.35rem 1rem', borderRadius: '50px',
            fontSize: '0.75rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            💎 Bagaimana Pengisian Berfungsi?
          </div>

          <p style={{ fontSize: '1.02rem', color: '#042E23', lineHeight: 1.8, marginBottom: '1.25rem', fontWeight: 600 }}>
            Pengisian E-Syifa&apos; adalah kaedah di mana{' '}
            <span style={{ color: '#047857' }}>getaran bacaan ayat-ayat ruqyah pemusnah jin, pembatal sihir dan benteng ghaib dipasakkan ke dalam barang peribadi anda</span>{' '}
            secara jarak jauh.
          </p>

          <p style={{ fontSize: '0.94rem', color: '#374151', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Sama prinsipnya seperti air ruqyah &amp; minyak syifa&apos; — tetapi{' '}
            <strong style={{ color: '#DC2626' }}>jauh lebih padu &amp; tahan lama</strong> kerana:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { text: 'Diisi melalui wirid ruqyah khusus dan ayat-ayat suci Al-Quran semata-mata.' },
              { text: 'Didoakan spesifik mengikut nama dan masalah gangguan berulang yang anda hadapi.' },
              { text: 'Dipasakkan 4 lapisan ayat: Pembakar Jin, Pembatal Sihir, Benteng Dinding, & Kesembuhan.' },
              { text: 'Pelarasan mingguan secara automatik — PERCUMA selagi perawat masih hidup (*tertakluk pada terma & syarat) supaya aura kekuatan syifa sentiasa segar.' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: '#042E23', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: '#FDE047', fontWeight: 900, marginTop: '2px',
                }}>✓</span>
                <span style={{ fontSize: '0.92rem', color: '#042E23', lineHeight: 1.6, fontWeight: 500 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 10 Manfaat Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            10 Manfaat Menyeluruh
          </span>
          <h3 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.85rem)',
            fontWeight: 800, color: '#042E23',
            marginTop: '0.3rem', marginBottom: '0.5rem',
          }}>
            Apa Yang Anda Bakal Nikmati Apabila Memiliki Item Berisian Ini?
          </h3>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.1rem', textAlign: 'left' }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{
              background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: '16px', padding: '1.35rem',
              display: 'flex', gap: '0.9rem', alignItems: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <span style={{
                fontSize: '1.6rem', flexShrink: 0,
                background: '#ECFDF5', borderRadius: '12px',
                padding: '0.4rem', display: 'inline-flex', lineHeight: 1,
              }}>{b.icon}</span>
              <div>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 800, fontSize: '0.92rem', color: '#042E23' }}>{b.title}</p>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
