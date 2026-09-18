'use client';

const COMPARISON = [
  {
    feature: 'Kualiti & Pati Wangian',
    others: '❌ Wangian sintetik campuran alkohol & kimia pelarut',
    esyifaa: '✅ Pati Kasturi Kijang Asli Gred A tulen tanpa alkohol',
  },
  {
    feature: 'Pengisian Ayat Ruqyah',
    others: '❌ Tiada sebarang pengisian rohani / sekadar bau wangi',
    esyifaa: '✅ Diisi 4 lapisan ayat Ruqyah Syar\'iyyah selama 3 hari',
  },
  {
    feature: 'Tindak Balas Terhadap Jin',
    others: '❌ Jin tidak terkesan, ada kalanya jin suka bau kimia',
    esyifaa: '✅ Jin & syaitan amat membenci aroma kasturi & menjauh',
  },
  {
    feature: 'Ketahanan Bau & Mesra Ibadah',
    others: '❌ Bau cepat hilang, was-was untuk dipakai solat',
    esyifaa: '✅ Tahan berhari-hari pada pakaian, 100% sah solat & ihram',
  },
  {
    feature: 'Harga & Tawaran Pakej',
    others: '❌ Mahal di pasaran luar (RM50–RM80 sebotol kecil)',
    esyifaa: '✅ Promosi istimewa: 5 Botol RM40 (RM8 sebotol!)',
  },
];

export default function KasturiComparisonSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}>
            ⚖️ Perbandingan Kualiti
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Mengapa Minyak Kasturi Kijang E-Syifa’{' '}
            <span style={{ color: '#047857' }}>Pilihan Utama Pengamal Rawatan?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Bandingkan sendiri kualiti pati tulen dan keberkatan pengisian ruqyah kami berbanding wangian biasa di pasaran.
          </p>
        </div>

        {/* Comparison Table */}
        <div style={{
          border: '1.5px solid #BBF7D0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.05)',
          marginBottom: '3rem',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr 1.2fr',
            background: '#ECFDF5',
            padding: '1.1rem 1.25rem',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: '#064E3B',
            borderBottom: '1.5px solid #A7F3D0',
          }}>
            <div>Ciri / Manfaat</div>
            <div>Wangian Biasa / Tiruan</div>
            <div style={{ color: '#047857' }}>Kasturi Kijang E-Syifa’</div>
          </div>

          {/* Rows */}
          {COMPARISON.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr 1.2fr',
                padding: '1.1rem 1.25rem',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                background: idx % 2 === 0 ? '#FFFFFF' : '#F0FDF4',
                borderBottom: idx !== COMPARISON.length - 1 ? '1px solid #F1F5F9' : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.feature}</div>
              <div style={{ color: '#64748B', paddingRight: '0.5rem' }}>{row.others}</div>
              <div style={{ color: '#047857', fontWeight: 600, paddingLeft: '0.5rem', background: '#DCFCE7', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                {row.esyifaa}
              </div>
            </div>
          ))}
        </div>

        {/* COD Notice Box */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '2px solid #34D399',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🚚📦</span>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#064E3B' }}>
            Tiada Online Banking? Boleh Pilih Cash On Delivery (COD)!
          </h3>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#047857', maxWidth: '640px', lineHeight: 1.65 }}>
            Anda tak perlu risau kena tipu barang tak sampai. <strong>Beli dulu dan bayar kepada abang posmen semasa bungkusan sampai di pintu rumah anda</strong>. Penghantaran pantas 1–4 hari bekerja ke seluruh Malaysia.
          </p>
        </div>

      </div>
    </section>
  );
}
