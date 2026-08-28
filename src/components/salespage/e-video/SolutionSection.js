'use client';

const DIFF_ROWS = [
  {
    label: 'Untuk siapa?',
    biasa: 'Tatapan umum — sesiapa sahaja',
    evideo: 'Rawatan khusus kepada pembeli',
  },
  {
    label: 'Tindak balas jin?',
    biasa: 'Mungkin ya, mungkin tidak — tiada kepastian',
    evideo: 'Jin AKAN bertindak balas — sama seperti rawatan berdepan',
  },
  {
    label: 'Boleh ulang?',
    biasa: 'Ya, tapi tiada kuasa rawatan sebenar',
    evideo: 'Ulang sendiri bila-bila masa, tanpa bayar extra',
  },
  {
    label: 'Kekuatan rawatan',
    biasa: 'Rendah — generik, tiada niat khusus untuk anda',
    evideo: 'Sama seperti rawatan berdepan dengan perawat',
  },
];

const REACTIONS = [
  'Sendawa tiba-tiba (walaupun tidak makan/minum)',
  'Rasa loya, mual atau perut tidak selesa',
  'Badan tiba-tiba rasa panas atau sejuk mendadak',
  'Otot bergerak, menggigil atau menerkam',
  'Rasa mengantuk berat atau keluar air mata',
];

export default function EVideoSolutionSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '4.5rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#FCA5A5',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ⚡ Bukan Ruqyah YouTube Biasa
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            fontWeight: 800, color: '#FEF3C7',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            marginTop: '0.4rem', marginBottom: '1rem',
          }}>
            E-Video Rawatan ESyifaa:{' '}
            <span style={{ color: '#FDE047' }}>Rawatan Sebenar —</span>
            <br />
            Hanya Melalui Medium Video.
          </h2>
        </div>

        {/* ── "Salah faham biasa" callout ────────────────────────── */}
        <div style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderLeft: '4px solid #F87171',
          borderRadius: '0 14px 14px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
          display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>❌</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FCA5A5', marginBottom: '0.3rem' }}>
              Salah faham biasa:
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#FEF3C7', fontStyle: 'italic', lineHeight: 1.6 }}>
              &ldquo;Macam YouTube je? Banyak video ruqyah percuma kat sana...&rdquo;
            </p>
          </div>
        </div>

        {/* ── Hakikat sebenar ────────────────────────────────────── */}
        <div style={{
          background: 'rgba(74,222,128,0.07)',
          border: '1.5px solid rgba(74,222,128,0.3)',
          borderLeft: '4px solid #4ADE80',
          borderRadius: '0 14px 14px 0',
          padding: '1.5rem 1.75rem',
          marginBottom: '2.5rem',
          display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>✅</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#4ADE80', marginBottom: '0.6rem' }}>
              Hakikat sebenar:
            </div>
            <p style={{ margin: '0 0 0.6rem', fontSize: '1rem', color: '#FEF3C7', lineHeight: 1.75, fontWeight: 600 }}>
              E-Video ESyifaa bukan rakaman ruqyah am untuk tatapan umum.
            </p>
            <p style={{ margin: '0 0 0.6rem', fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.75 }}>
              Ia adalah <strong style={{ color: '#FEF3C7' }}>rawatan ruqyah syar&apos;iyyah yang SEBENAR</strong>{' '}
              — dihantar melalui medium video khusus kepada anda sebagai pembeli.
            </p>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4ADE80', lineHeight: 1.75, fontWeight: 700 }}>
              Kekuatannya SAMA seperti rawatan berdepan dengan perawat.
              Jin dalam badan AKAN bertindak balas — sama seperti anda duduk
              berdepan dengan perawat dalam sesi rawatan langsung.
            </p>
          </div>
        </div>

        {/* ── Comparison table ───────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px', overflow: 'hidden',
          marginBottom: '2.5rem',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#6EE7B7' }}>
              Perbandingan
            </div>
            <div style={{
              padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800,
              color: '#94A3B8', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}>
              📺 YouTube / Ruqyah Biasa
            </div>
            <div style={{
              padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 800,
              color: '#FDE047', textAlign: 'center',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(253,224,71,0.05)',
            }}>
              🎬 E-Video ESyifaa
            </div>
          </div>

          {/* Rows */}
          {DIFF_ROWS.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: i < DIFF_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <div style={{
                padding: '0.9rem 1rem', fontSize: '0.82rem',
                fontWeight: 700, color: '#A7F3D0',
              }}>
                {row.label}
              </div>
              <div style={{
                padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#94A3B8',
                lineHeight: 1.5, borderLeft: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}>
                {row.biasa}
              </div>
              <div style={{
                padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#FEF3C7',
                lineHeight: 1.5, fontWeight: 600,
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                background: 'rgba(253,224,71,0.03)',
              }}>
                {row.evideo}
              </div>
            </div>
          ))}
        </div>

        {/* ── Macam mana ia berfungsi ────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #042E23 100%)',
          border: '1.5px solid rgba(74,222,128,0.25)',
          borderRadius: '18px', padding: '2rem 1.75rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            marginBottom: '1.25rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>🤔</span>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4ADE80' }}>
              Macam Mana Video Boleh Rawat Sebenar?
            </div>
          </div>

          <p style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', color: '#D1FAE5', lineHeight: 1.75 }}>
            Ramai yang tanya soalan ini.
          </p>

          <p style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', color: '#FEF3C7', lineHeight: 1.75, fontWeight: 600 }}>
            Jawapannya: Medium tidak menghalang kekuatan bacaan ruqyah.
          </p>

          <p style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', color: '#D1FAE5', lineHeight: 1.75 }}>
            Sama seperti air yang dibacakan ayat Al-Quran tetap membawa
            kekuatan walaupun tidak dibaca langsung di hadapan pesakit —
            E-Video rawatan ini membawa kekuatan yang sama melalui medium video.{' '}
            <strong style={{ color: '#4ADE80' }}>
              Perawat ESyifaa membuat rawatan khusus yang disalurkan melalui video.
              Apabila anda play — rawatan itu sampai kepada anda.
            </strong>
          </p>

          <p style={{ margin: 0, fontSize: '1rem', color: '#FDE047', lineHeight: 1.75, fontWeight: 800 }}>
            Jin dalam badan AKAN merasakan kesan tersebut.
          </p>
        </div>

        {/* ── Tindak balas yang akan berlaku ─────────────────────── */}
        <div style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1.5px solid rgba(248,113,113,0.2)',
          borderRadius: '18px', padding: '2rem 1.75rem',
          marginBottom: '2rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FEF3C7', marginBottom: '0.3rem' }}>
              Apa Yang Akan Berlaku Semasa Anda Play E-Video?
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#FCA5A5' }}>
              Jika ada gangguan jin, sihir, atau bisa dalam badan — anda mungkin rasa:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {REACTIONS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: '10px', padding: '0.65rem 1rem',
              }}>
                <span style={{ color: '#FCA5A5', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '0.875rem', color: '#FEF3C7' }}>{r}</span>
              </div>
            ))}
            {/* General */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(248,113,113,0.1)',
              border: '1.5px solid rgba(248,113,113,0.3)',
              borderRadius: '10px', padding: '0.65rem 1rem',
            }}>
              <span style={{ color: '#F87171', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>•</span>
              <span style={{ fontSize: '0.875rem', color: '#FEF3C7', fontWeight: 700 }}>
                atau apa-apa rasa tidak selesa atau sakit selepas rawatan
              </span>
            </div>
          </div>

          <div style={{
            background: 'rgba(253,224,71,0.08)',
            border: '1px solid rgba(253,224,71,0.25)',
            borderRadius: '12px', padding: '1rem 1.25rem',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#FEF3C7', fontWeight: 700, lineHeight: 1.65 }}>
              Ini bukan kebetulan.{' '}
              <span style={{ color: '#FDE047' }}>
                Ini tanda rawatan sedang berlaku — jin bertindak balas
                kepada rawatan yang sampai melalui video.
              </span>
            </p>
          </div>
        </div>

        {/* ── Keistimewaan — boleh ulang ─────────────────────────── */}
        <div style={{
          background: 'rgba(253,224,71,0.07)',
          border: '2px solid rgba(253,224,71,0.3)',
          borderRadius: '18px', padding: '2rem 1.75rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>💡</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FDE047', marginBottom: '1rem' }}>
            Keistimewaan Paling Besar E-Video
          </div>

          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#FEF3C7', lineHeight: 1.75 }}>
            Setiap kali gangguan datang balik — anda tidak perlu:
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.45rem',
            alignItems: 'center', marginBottom: '1.25rem',
          }}>
            {['PM perawat semula', 'Tunggu slot rawatan', 'Bayar extra'].map((t, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.88rem', color: '#FCA5A5', fontWeight: 600,
              }}>
                <span>❌</span> {t}
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: '12px', padding: '1rem 1.5rem',
            display: 'inline-block',
          }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4ADE80', fontWeight: 800, lineHeight: 1.65 }}>
              Hanya <span style={{ color: '#FDE047' }}>PLAY VIDEO semula</span>.
              Rawatan berlaku. Selesai.
              <br />
              <span style={{ fontSize: '0.88rem', color: '#D1FAE5', fontWeight: 600 }}>
                Ini yang menjadikan E-Video berbeza dari sebarang rawatan lain.
              </span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
