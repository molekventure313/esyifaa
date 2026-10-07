'use client';

import { buildWaLink, trackWaClick, HQ_WHATSAPP_PENGISIAN } from '@/components/salespage/useSalesContact';

/**
 * Counter-rejection "tak percaya kesan pengisian" — cuba air tawar jarak jauh PERCUMA dulu.
 * Diletak terus selepas borang tempahan (pembeli yang dah yakin tak terganggu).
 * WhatsApp SENTIASA ke no. Pengisian HQ (perawat yang buat bacaan) — termasuk di link marketer.
 * Klik → Meta Pixel `Lead` + rekod klik/UTM (wa_clicks), content_name "Air Tawar (Pengisian)".
 */
const MESSAGE = 'Assalamualaikum, saya nak cuba air tawar jarak jauh percuma dulu.';

const STEPS = [
  ['Tekan butang WhatsApp di bawah', null],
  ['Hantar gambar segelas air tawar', 'Air biasa dari rumah anda — itu sahaja.'],
  ['Perawat bacakan ayat ruqyah dari jarak jauh', 'Minum air tersebut & rasai sendiri kesannya.'],
];

export default function AirTawarTrialSection({ background = 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)' }) {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{ background, padding: '0 1.25rem 2.5rem', fontFamily: ff }}>
      <div style={{
        maxWidth: '720px', margin: '0 auto', background: '#FFFFFF',
        border: '2px solid #A7F3D0', borderRadius: '24px',
        padding: '2.75rem 1.75rem 2.5rem', textAlign: 'center',
        boxShadow: '0 15px 40px rgba(4, 120, 87, 0.08)',
      }}>
        <span style={{
          display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
          color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0',
          padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.1rem',
        }}>
          🌊 MASIH RAGU-RAGU? RASAI SENDIRI DULU
        </span>

        <h3 style={{
          fontSize: 'clamp(1.45rem, 3.5vw, 1.85rem)', fontWeight: 900, color: '#0F172A',
          margin: '0 0 0.9rem', letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Tak Percaya Kesan Pengisian? Cuba Air Tawar Jarak Jauh —{' '}
          <span style={{ color: '#059669' }}>PERCUMA</span>
        </h3>

        <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, margin: '0 auto 1.75rem', maxWidth: '560px' }}>
          Kami faham — susah nak percaya sesuatu yang tak nampak dengan mata. Sebab itu kami bagi anda
          rasai sendiri dulu kesan ayat ruqyah dari jarak jauh, sebelum buat keputusan.
        </p>

        {/* Langkah */}
        <div style={{ display: 'grid', gap: '0.7rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          {STEPS.map(([title, sub], i) => (
            <div key={title} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: '30px', height: '30px', borderRadius: '50%',
                background: '#059669', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</span>
              <div style={{ paddingTop: '0.25rem' }}>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{title}</div>
                {sub && <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '0.15rem' }}>{sub}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Jaminan ringkas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem 1rem', marginBottom: '1.6rem' }}>
          {['100% percuma', 'Tiada paksaan', 'Cukup hantar gambar'].map(t => (
            <span key={t} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>✓ {t}</span>
          ))}
        </div>

        <a
          href={buildWaLink(HQ_WHATSAPP_PENGISIAN, MESSAGE)}
          onClick={() => trackWaClick({ product: 'Air Tawar (Pengisian)' })}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            padding: '1rem 2rem', maxWidth: '100%', boxSizing: 'border-box',
            fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 8px 25px rgba(37,211,102,0.35)',
          }}
        >
          💬 Saya Nak Cuba Air Tawar Percuma
        </a>

        <p style={{ margin: '1.1rem auto 0', fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', maxWidth: '520px', lineHeight: 1.6 }}>
          Ramai yang rasa sesuatu selepas minum — seperti sendawa, rasa ringan atau sedikit pening.
          Itu tanda ada sesuatu yang perlu dirawat.
        </p>
      </div>
    </section>
  );
}
