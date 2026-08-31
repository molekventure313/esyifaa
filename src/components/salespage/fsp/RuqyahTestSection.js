'use client';

import { useState } from 'react';

// ─── YouTube placeholder ──────────────────────────────────────────────────────
// Ganti YOUTUBE_VIDEO_ID dengan ID video YouTube ruqyah anda
// Contoh: 'dQw4w9WgXcQ' dari https://www.youtube.com/watch?v=dQw4w9WgXcQ
const YOUTUBE_VIDEO_ID = 'kkXGJBATCNI'; // ← Air Tawar Ruqyah ESyifaa

const STEPS = [
  {
    num: '①',
    icon: '🥛',
    title: 'Sediakan Air',
    desc: 'Ambil segelas air kosong. Letak di hadapan anda. Boleh guna air paip, air masak atau air mineral.',
  },
  {
    num: '②',
    icon: '🔊',
    title: 'Kuatkan Volume',
    desc: 'Pastikan volume peranti anda pada tahap maksimum. Air perlu dapat "dengar" bacaan ruqyah yang dibacakan.',
  },
  {
    num: '③',
    icon: '▶️',
    title: 'Play Video & Tunggu',
    desc: 'Play video di bawah. Duduk tenang. Jangan tutup. Biarkan bacaan ayat-ayat ruqyah mengalir sepenuhnya.',
  },
];

const REACTION_EXAMPLES = [
  'Sendawa tiba-tiba',
  'Rasa loya atau mual',
  'Kepala pening atau berdenyut',
  'Badan tiba-tiba rasa panas atau sejuk',
  'Otot tiba-tiba bergerak atau menggigil',
  'Rasa mengantuk berat atau mata terasa berat',
];

export default function FspRuqyahTestSection() {
  const [played, setPlayed] = useState(false);

  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #031E17 0%, #042E23 100%)',
      color: '#FFFFFF',
      padding: '5rem 1rem',
      fontFamily: ff,
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            padding: '0.4rem 1.2rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            🎯 Masih Ragu-Ragu Dengan Rawatan Jarak Jauh?
          </div>

          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
            fontWeight: 900, color: '#FEF3C7',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            marginTop: '0.25rem', marginBottom: '1rem',
          }}>
            Tak Perlu Percaya Kata Kami —{' '}
            <span style={{ color: '#FDE047' }}>Cuba Sendiri &amp; Rasai Sendiri.</span>
          </h2>

          <p style={{
            fontSize: '1.05rem', color: '#A7F3D0',
            lineHeight: 1.75, maxWidth: '600px', margin: '0 auto',
          }}>
            Ini bukan demo. Ini ujian sebenar — untuk anda lakukan{' '}
            <strong style={{ color: '#FEF3C7' }}>sekarang, dalam masa 5 minit.</strong>
          </p>
        </div>

        {/* ── 3 Steps ────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2.5rem',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(253,224,71,0.2)',
              borderRadius: '16px', padding: '1.5rem 1.25rem',
              textAlign: 'center', position: 'relative',
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                background: '#FDE047', color: '#042E23',
                fontWeight: 900, fontSize: '0.78rem',
                padding: '0.15rem 0.85rem', borderRadius: '999px',
                letterSpacing: '0.05em',
              }}>
                Langkah {i + 1}
              </div>

              <div style={{ fontSize: '2.2rem', marginBottom: '0.65rem', marginTop: '0.5rem' }}>
                {s.icon}
              </div>
              <div style={{
                fontWeight: 800, fontSize: '0.95rem',
                color: '#FDE047', marginBottom: '0.5rem',
              }}>
                {s.title}
              </div>
              <p style={{
                margin: 0, fontSize: '0.83rem',
                color: '#D1FAE5', lineHeight: 1.6,
              }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── YouTube Embed / Placeholder ────────────────────────────── */}
        <div style={{
          background: '#021812',
          border: '2px solid rgba(253,224,71,0.3)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          {YOUTUBE_VIDEO_ID ? (
            /* ── Real YouTube embed ── */
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                title="Video Ruqyah ESyifaa"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', border: 'none',
                }}
              />
            </div>
          ) : (
            /* ── Placeholder (belum ada video) ── */
            <div style={{
              aspectRatio: '16/9',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '1rem', padding: '2rem',
              background: 'linear-gradient(135deg, #021812 0%, #042E23 100%)',
              textAlign: 'center',
            }}>
              {/* Play icon */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(253,224,71,0.15)',
                border: '3px solid rgba(253,224,71,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'default',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#FDE047">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>

              <div>
                <p style={{
                  margin: '0 0 0.4rem', fontWeight: 800,
                  fontSize: '1.05rem', color: '#FDE047',
                }}>
                  Video Ruqyah ESyifaa
                </p>
                <p style={{
                  margin: 0, fontSize: '0.85rem', color: '#6EE7B7',
                  fontStyle: 'italic', opacity: 0.85,
                }}>
                  [ Video akan dimuatkan sebentar lagi — in shaa Allah ]
                </p>
              </div>

              {/* Admin note — invisible in production via CSS comment */}
              <div style={{
                background: 'rgba(253,224,71,0.08)',
                border: '1px dashed rgba(253,224,71,0.3)',
                borderRadius: '10px', padding: '0.75rem 1.25rem',
                fontSize: '0.78rem', color: '#FDE047', maxWidth: '400px',
              }}>
                📌 Admin: Set <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 4px', borderRadius: '4px' }}>YOUTUBE_VIDEO_ID</code> dalam{' '}
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 4px', borderRadius: '4px' }}>FspRuqyahTestSection.js</code>{' '}
                baris 8 untuk embed video ruqyah
              </div>
            </div>
          )}
        </div>

        {/* ── Reactions ──────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(248,113,113,0.06)',
          border: '1.5px solid rgba(248,113,113,0.25)',
          borderRadius: '20px', padding: '2rem 1.75rem',
          marginBottom: '2rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.35)',
              padding: '0.35rem 1rem', borderRadius: '50px', marginBottom: '0.85rem',
              fontSize: '0.75rem', fontWeight: 800, color: '#FCA5A5',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              ⚠️ Perhatikan Badan Anda
            </div>
            <h3 style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.45rem)',
              fontWeight: 800, color: '#FEF3C7',
              lineHeight: 1.3, margin: '0 0 0.6rem',
            }}>
              Semasa Atau Selepas Menonton Video &amp; Minum Air —<br />
              Adakah Anda Rasa Apa-Apa?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#FCA5A5', margin: 0, fontWeight: 600 }}>
              Contoh tindak balas yang biasa dilaporkan:
            </p>
          </div>

          {/* Examples grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.6rem', marginBottom: '1.5rem',
          }}>
            {REACTION_EXAMPLES.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: '10px', padding: '0.65rem 0.85rem',
              }}>
                <span style={{
                  color: '#FCA5A5', fontSize: '0.85rem', flexShrink: 0, fontWeight: 700,
                }}>•</span>
                <span style={{ fontSize: '0.85rem', color: '#FEF3C7', lineHeight: 1.45 }}>{r}</span>
              </div>
            ))}
          </div>

          {/* General statement — KEY MESSAGE */}
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '2px solid rgba(248,113,113,0.4)',
            borderRadius: '14px', padding: '1.25rem 1.5rem',
            textAlign: 'center',
          }}>
            <p style={{
              margin: 0, fontSize: '1rem', fontWeight: 800,
              color: '#FEF3C7', lineHeight: 1.65,
            }}>
              — atau{' '}
              <span style={{ color: '#FCA5A5' }}>
                tiba-tiba ada rasa tidak selesa, sakit,
                atau apa-apa reaksi selepas minum air tersebut
              </span>{' '}
              —
            </p>
            <p style={{
              margin: '0.5rem 0 0', fontSize: '0.9rem',
              color: '#FCA5A5', fontStyle: 'italic', fontWeight: 600,
            }}>
              itu sudah cukup sebagai tanda.
            </p>
          </div>
        </div>

        {/* ── "Apa Ini Bermakna?" Callout ───────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid #FDE047',
          borderRadius: '20px', padding: '2rem 1.75rem',
          marginBottom: '2.5rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px',
            background: 'radial-gradient(circle, rgba(253,224,71,0.12) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(253,224,71,0.15)', border: '1px solid rgba(253,224,71,0.4)',
            padding: '0.3rem 0.9rem', borderRadius: '50px',
            fontSize: '0.72rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💡 Apa Ini Bermakna?
          </div>

          <p style={{
            margin: '0 0 0.85rem', fontSize: '1.05rem',
            color: '#FEF3C7', fontWeight: 700, lineHeight: 1.7,
            maxWidth: '580px', marginInline: 'auto',
          }}>
            Tindak balas ini{' '}
            <span style={{ color: '#FDE047' }}>bukan kebetulan.</span>
          </p>

          <p style={{
            margin: '0 0 0.75rem', fontSize: '0.95rem',
            color: '#D1FAE5', lineHeight: 1.75,
            maxWidth: '560px', marginInline: 'auto',
          }}>
            Dalam ilmu ruqyah syar&apos;iyyah, ini dikenali sebagai
            {' '}<strong style={{ color: '#FEF3C7' }}>&ldquo;gerak balas ruqyah&rdquo;</strong>{' '}
            — petanda jelas bahawa ada sesuatu dalam diri anda yang
            bertindak balas kepada ayat-ayat Al-Quran yang dibacakan.
          </p>

          <p style={{
            margin: 0, fontSize: '0.95rem',
            color: '#4ADE80', fontWeight: 700, lineHeight: 1.65,
          }}>
            Ini bukan penyakit biasa. Ini perlukan rawatan ruqyah.{' '}
            <span style={{ color: '#FDE047' }}>Jangan abaikan tanda ini.</span>
          </p>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '0.95rem', color: '#A7F3D0',
            lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 600,
          }}>
            Air yang anda sediakan tadi boleh diminum sekarang —
            in shaa Allah sudah terkena bacaan ayat ruqyah. 💧
          </p>

          <a
            href="#borang"
            onClick={scrollToForm}
            style={{
              display: 'inline-block',
              padding: '1.15rem 2.6rem',
              fontSize: '1.1rem', fontWeight: 800, color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(234,179,8,0.45)',
              border: '2px solid #FEF08A', letterSpacing: '-0.01em',
            }}
          >
            💳 Saya Rasa Tindak Balas — Mahu Rawatan Sekarang
          </a>

          <p style={{
            marginTop: '0.85rem', fontSize: '0.8rem',
            color: '#6EE7B7', fontStyle: 'italic',
          }}>
            Bayar RM50 via FPX · Selamat · Perawat hubungi anda dalam 24 jam
          </p>
        </div>

      </div>
    </section>
  );
}
