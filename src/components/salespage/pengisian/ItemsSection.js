'use client';

const ITEMS = [
  {
    icon: '💍',
    title: 'Cincin Perak / Batu Permata',
    desc: 'Paling popular dan sangat disyorkan. Sentiasa melekat di jari dan bersentuhan terus dengan kulit serta saluran darah untuk perlindungan benteng berterusan.',
    badge: '⭐ Paling Popular',
    badgeColor: '#FEF3C7',
    badgeBorder: '#FDE047',
    badgeText: '#78350F',
  },
  {
    icon: '📿',
    title: 'Tasbih Zikir',
    desc: 'Sangat sesuai digenggam ketika berzikir dan membaca ayat Ruqyah. Setiap biji tasbih menjadi penguat aura benteng ketika anda diserang gangguan.',
    badge: '✅ Sangat Disyorkan',
    badgeColor: '#ECFDF5',
    badgeBorder: '#6EE7B7',
    badgeText: '#065F46',
  },
  {
    icon: '⌚',
    title: 'Jam Tangan / Gelang',
    desc: 'Dipakai sepanjang hari ketika keluar rumah, ke tempat kerja atau berniaga. Melindungi titik nadi pergelangan tangan dari serangan santau dan angin sihir.',
    badge: '🔥 Pilihan Ramai',
    badgeColor: '#FFFBEB',
    badgeBorder: '#FCD34D',
    badgeText: '#92400E',
  },
  {
    icon: '✨',
    title: 'Minyak Wangi / Rantai / Loket',
    desc: 'Sebarang barangan peribadi kesayangan anda yang kerap dibawa bersama. Tiada sekatan bahan — asalkan ia suci dan sentiasa berada dekat dengan anda.',
    badge: null,
  },
];

export default function PengisianItemsSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAFC',
      color: '#0F172A',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            💎 Fleksibiliti Pilihan Item
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#0F172A',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Pilih Barang Yang Paling Kerap Berada Bersama Anda
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Pengisian dijalankan secara <strong style={{ color: '#047857' }}>jarak jauh</strong> — anda langsung tidak perlu pos atau menghantar barang anda ke mana-mana.
            Cukup sekadar nyatakan jenis barang dan nama pemilik semasa mengisi borang tempahan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {ITEMS.map((item, i) => (
            <div key={i} style={{
              background: '#FFFFFF', border: '1.5px solid #E2E8F0',
              borderRadius: '18px', padding: '1.75rem 1.4rem',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex', flexDirection: 'column',
            }}>
              {item.badge && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: item.badgeColor,
                  border: `1px solid ${item.badgeBorder}`,
                  color: item.badgeText,
                  fontSize: '0.7rem', fontWeight: 800,
                  padding: '0.25rem 0.65rem', borderRadius: '999px',
                }}>
                  {item.badge}
                </div>
              )}
              <div style={{ fontSize: '2.5rem', marginBottom: '0.85rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.1rem', lineHeight: 1.35 }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, flex: 1 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          background: '#F0FDF4',
          border: '1.5px solid #86EFAC',
          borderRadius: '16px', padding: '1.25rem 1.6rem', textAlign: 'center',
          maxWidth: '760px', margin: '0 auto',
          boxShadow: '0 2px 10px rgba(5, 150, 105, 0.05)',
        }}>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#064E3B', lineHeight: 1.65, fontWeight: 500 }}>
            📋 <strong>Tak perlu pening kepala:</strong> Anda boleh buat pengisian untuk diri sendiri atau hadiahkan kepada pasangan dan anak-anak. Semasa tempahan di bawah, anda cuma perlu taipkan nama item tersebut.
          </p>
        </div>

      </div>
    </section>
  );
}
