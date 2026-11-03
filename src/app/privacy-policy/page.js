export const metadata = {
  title: 'Dasar Privasi | E-Syifa',
  description: 'Dasar Privasi E-Syifa — cara kami mengumpul, menggunakan dan melindungi data peribadi anda.',
};

const UPDATED = '4 November 2026';
const WA_NUMBER = '601135172611';

const SECTIONS = [
  {
    title: '1. Pengenalan',
    body: [
      'E-Syifa ("kami") menghormati privasi anda. Dasar ini menerangkan data peribadi yang kami kumpul apabila anda melayari e-syifa.com, membuat tempahan atau menghubungi kami, serta cara data itu digunakan dan dilindungi selaras dengan Akta Perlindungan Data Peribadi 2010 (Malaysia).',
    ],
  },
  {
    title: '2. Data yang kami kumpul',
    list: [
      'Maklumat tempahan: nama, nombor telefon, alamat penghantaran dan produk yang ditempah.',
      'Maklumat pembayaran: status dan rujukan transaksi FPX. Butiran akaun bank anda diproses terus oleh penyedia pembayaran dan tidak disimpan oleh kami.',
      'Maklumat yang anda kongsi melalui WhatsApp atau borang di laman kami.',
      'Data teknikal: alamat IP, jenis peranti dan pelayar, halaman yang dilawati, serta parameter kempen (UTM) untuk mengukur keberkesanan iklan.',
    ],
  },
  {
    title: '3. Cara kami menggunakan data',
    list: [
      'Memproses, menghantar dan mengesahkan tempahan anda (termasuk COD).',
      'Menghubungi anda tentang tempahan dan memberi bimbingan cara guna produk.',
      'Menambah baik laman web, produk dan perkhidmatan kami.',
      'Mengukur dan menambah baik prestasi iklan kami di Facebook dan Instagram.',
      'Mematuhi keperluan undang-undang.',
    ],
  },
  {
    title: '4. Kuki & Meta Pixel',
    body: [
      'Laman kami menggunakan kuki dan Meta Pixel (Facebook) untuk mengukur lawatan dan tempahan yang datang daripada iklan. Meta mungkin menerima data teknikal seperti tindakan di laman dan maklumat peranti. Anda boleh mengawal iklan yang dipaparkan melalui tetapan iklan akaun Facebook anda, atau menyekat kuki melalui tetapan pelayar.',
    ],
  },
  {
    title: '5. Perkongsian data',
    body: ['Kami tidak menjual data peribadi anda. Data hanya dikongsi dengan pihak yang perlu untuk menjalankan perkhidmatan kami:'],
    list: [
      'Syarikat kurier (contohnya NinjaVan) untuk penghantaran dan kutipan COD.',
      'Penyedia pembayaran (CHIP) untuk memproses bayaran FPX.',
      'Penyedia hosting dan pangkalan data yang menyimpan data laman kami secara selamat.',
      'Meta Platforms untuk pengukuran iklan, seperti di atas.',
      'Pihak berkuasa, jika dikehendaki oleh undang-undang.',
    ],
  },
  {
    title: '6. Penyimpanan & keselamatan',
    body: [
      'Data disimpan dalam sistem yang dilindungi dengan kawalan akses. Kami menyimpan data selama yang perlu untuk tujuan di atas, termasuk keperluan perakaunan dan undang-undang, kemudian memadam atau menyahnamakan data tersebut.',
    ],
  },
  {
    title: '7. Hak anda',
    body: [
      'Anda boleh meminta untuk melihat, membetulkan atau memadam data peribadi anda, atau menarik balik persetujuan untuk dihubungi bagi tujuan pemasaran. Hubungi kami melalui WhatsApp di bawah dan kami akan membalas dalam tempoh yang munasabah.',
    ],
  },
  {
    title: '8. Pemadaman data',
    body: [
      'Untuk memadam data anda, hantar mesej WhatsApp dengan nama dan nombor telefon yang digunakan semasa tempahan, bersama perkataan "PADAM DATA". Kami akan mengesahkan permintaan dan memadam data dalam masa 30 hari, kecuali data yang perlu disimpan di bawah undang-undang.',
    ],
  },
  {
    title: '9. Perubahan dasar',
    body: ['Kami mungkin mengemas kini dasar ini dari semasa ke semasa. Versi terkini sentiasa dipaparkan di halaman ini bersama tarikh kemas kini.'],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #06231C 0%, #0B382D 50%, #041813 100%)',
        padding: '2.5rem 1rem',
        fontFamily: 'var(--font-inter), sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          background: '#FFFDF7',
          border: '3px solid #E9C46A',
          borderRadius: '24px',
          padding: '2.5rem 1.75rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          color: '#09201B',
          lineHeight: 1.7
        }}
      >
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#047857', marginBottom: '0.5rem' }}>E-Syifa</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem 0', letterSpacing: '-0.02em', color: '#09201B' }}>
          Dasar Privasi
        </h1>
        <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: '#5b6b66' }}>
          Privacy Policy · Dikemas kini: {UPDATED}
        </p>

        {SECTIONS.map((s) => (
          <section key={s.title} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#064E3B' }}>{s.title}</h2>
            {s.body?.map((p) => (
              <p key={p} style={{ margin: '0 0 0.75rem 0', color: '#1F2D29' }}>{p}</p>
            ))}
            {s.list && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {s.list.map((li) => (
                  <li key={li} style={{ marginBottom: '0.35rem', color: '#1F2D29' }}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section style={{ marginTop: '2rem', padding: '1.25rem', background: '#ECF7F1', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#064E3B' }}>10. Hubungi kami</h2>
          <p style={{ margin: 0, color: '#1F2D29' }}>
            E-Syifa · e-syifa.com
            <br />
            WhatsApp:{' '}
            <a href={`https://wa.me/${WA_NUMBER}`} style={{ color: '#047857', fontWeight: 700 }}>
              +60 11-3517 2611
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
