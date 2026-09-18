'use client';

const COMPARISON = [
  {
    feature: 'Keperluan Membawa Pasangan',
    others: '❌ Wajib bawa pasangan (Pasangan biasanya tolak & mengamuk)',
    esyifaa: '✅ Cukup secubit dari dapur tanpa perlu pasangan tahu',
  },
  {
    feature: 'Penerimaan Pasangan',
    others: '❌ Ego tercalar, mencetuskan pergaduhan besar',
    esyifaa: '✅ Dimakan berselera dalam hidangan harian tanpa curiga',
  },
  {
    feature: 'Kesan Kepada Ahli Keluarga',
    others: '❌ Hanya fokus pada individu, anak-anak terabai',
    esyifaa: '✅ Seisi rumah turut menikmati manfaat & ketenangan',
  },
  {
    feature: 'Status Keberkatan & Syarak',
    others: '⚠️ Risiko bomoh guna-guna, jampi atau tangkal syirik',
    esyifaa: '✅ 100% Ruqyah Syar\'iyyah berlandaskan Al-Quran & Sunnah',
  },
  {
    feature: 'Kos & Yuran Rawatan',
    others: '❌ Ratusan hingga ribuan ringgit sekali rawatan',
    esyifaa: '✅ Pakej jimat serendah RM45 tahan berminggu-minggu',
  },
];

export default function GaramComparisonSection() {
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
            ⚖️ Perbandingan Kaedah
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.4vw, 2.3rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0.3rem 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}>
            Mengapa Garam Pengasihan Masakan{' '}
            <span style={{ color: '#EA580C' }}>Jauh Lebih Praktikal &amp; Berkesan?</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Bandingkan sendiri mengapa ribuan isteri dan suami memilih kaedah ini berbanding rawatan konvensional yang menyulitkan.
          </p>
        </div>

        {/* Comparison Table */}
        <div style={{
          border: '1.5px solid #FED7AA',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.05)',
          marginBottom: '3rem',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr 1.2fr',
            background: '#FFEDD5',
            padding: '1.1rem 1.25rem',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: '#9A3412',
            borderBottom: '1.5px solid #FED7AA',
          }}>
            <div>Ciri / Situasi</div>
            <div>Cara Biasa / Paksa</div>
            <div style={{ color: '#C2410C' }}>Garam Pengasihan ESyifaa</div>
          </div>

          {/* Table Rows */}
          {COMPARISON.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr 1.2fr',
                padding: '1.1rem 1.25rem',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                background: idx % 2 === 0 ? '#FFFFFF' : '#FFFDFB',
                borderBottom: idx !== COMPARISON.length - 1 ? '1px solid #F1F5F9' : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.feature}</div>
              <div style={{ color: '#64748B', paddingRight: '0.5rem' }}>{row.others}</div>
              <div style={{ color: '#047857', fontWeight: 600, paddingLeft: '0.5rem', background: '#F0FDF4', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                {row.esyifaa}
              </div>
            </div>
          ))}
        </div>

        {/* COD & Delivery Assurance Box */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '2px solid #FDBA74',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🚚📦</span>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#9A3412' }}>
            Tiada Online Banking? Boleh Pilih Cash On Delivery (COD)!
          </h3>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#7C2D12', maxWidth: '640px', lineHeight: 1.65 }}>
            Anda tak perlu risau kena tipu barang tak sampai. <strong>Beli dulu dan bayar kepada abang posmen (NinjaVan / J&amp;T) semasa parcel sampai di pintu rumah anda</strong>. Penghantaran pantas 1–4 hari bekerja ke seluruh Semenanjung, Sabah &amp; Sarawak.
          </p>
        </div>

      </div>
    </section>
  );
}
