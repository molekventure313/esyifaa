'use client';

const ITEMS = [
  {
    icon: '💍',
    title: 'Cincin Perak / Batu Permata',
    desc: 'Paling popular dan sangat disyorkan. Sentiasa melekat di jari dan bersentuhan terus dengan kulit serta saluran darah untuk perlindungan benteng berterusan.',
    badge: '⭐ Paling Popular',
    badgeColor: '#FDE047',
    badgeText: '#042E23',
  },
  {
    icon: '📿',
    title: 'Tasbih Zikir',
    desc: 'Sangat sesuai digenggam ketika berzikir dan membaca ayat Ruqyah. Setiap biji tasbih menjadi penguat aura benteng ketika anda diserang gangguan.',
    badge: '✅ Sangat Disyorkan',
    badgeColor: '#A7F3D0',
    badgeText: '#042E23',
  },
  {
    icon: '⌚',
    title: 'Jam Tangan / Gelang',
    desc: 'Dipakai sepanjang hari ketika keluar rumah, ke tempat kerja atau berniaga. Melindungi titik nadi pergelangan tangan dari serangan santau dan angin sihir.',
    badge: '🔥 Pilihan Ramai',
    badgeColor: '#FEF08A',
    badgeText: '#042E23',
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
      background: '#042E23',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid rgba(254, 243, 199, 0.15)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💎 Fleksibiliti Pilihan Item
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Pilih Barang Yang Paling Kerap Berada Bersama Anda
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            Pengisian dijalankan secara <strong style={{ color: '#FDE047' }}>jarak jauh</strong> — anda langsung tidak perlu pos atau menghantar barang anda ke mana-mana.
            Cukup sekadar nyatakan jenis barang dan nama pemilik semasa mengisi borang tempahan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {ITEMS.map((item, i) => (
            <div key={i} style={{
              background: '#031E17', border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: '18px', padding: '1.6rem 1.4rem',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column',
            }}>
              {item.badge && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: item.badgeColor, color: item.badgeText,
                  fontSize: '0.68rem', fontWeight: 800,
                  padding: '0.2rem 0.6rem', borderRadius: '999px',
                }}>
                  {item.badge}
                </div>
              )}
              <div style={{ fontSize: '2.3rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '1.05rem', lineHeight: 1.35 }}>
                {item.title}
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#A7F3D0', lineHeight: 1.65, flex: 1 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          background: 'rgba(253,224,71,0.08)',
          border: '1px solid rgba(253,224,71,0.3)',
          borderRadius: '14px', padding: '1.1rem 1.6rem', textAlign: 'center',
          maxWidth: '740px', margin: '0 auto',
        }}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#FEF3C7', lineHeight: 1.65 }}>
            📋 <strong>Tak perlu pening kepala:</strong> Anda boleh buat pengisian untuk diri sendiri atau hadiahkan kepada pasangan dan anak-anak. Semasa tempahan di bawah, anda cuma perlu taipkan nama item tersebut.
          </p>
        </div>

      </div>
    </section>
  );
}
