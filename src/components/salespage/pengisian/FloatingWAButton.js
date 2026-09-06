'use client';

import { useState, useEffect } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const FALLBACK_NUMBER  = '601135172611';
const LS_KEY           = 'esyifaa_wa_idx';
const buildWaLink      = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

const DEFAULT_PRETEXT = 'Saya nak dapatkan Pengisian Item E-Syifa';

export default function FloatingWAButton({ pretext = DEFAULT_PRETEXT }) {
  const [visible, setVisible]   = useState(false);
  const [waLink, setWaLink]     = useState(buildWaLink(FALLBACK_NUMBER, pretext));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // WA rotator — baca idx semasa tanpa advance
    const initWa = async () => {
      try {
        const res     = await fetch('/api/public/wasap');
        const json    = await res.json();
        const numbers = (json.success && json.data?.length > 0)
          ? json.data.map(d => d.number)
          : [FALLBACK_NUMBER];
        const idx = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
        setWaLink(buildWaLink(numbers[idx % numbers.length], pretext));
      } catch {
        setWaLink(buildWaLink(FALLBACK_NUMBER, pretext));
      }
    };
    initWa();

    // Show after 200px scroll
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pretext]);

  if (!visible) return null;

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.25rem',
      zIndex: 999, display: 'flex', flexDirection: 'column',
      alignItems: 'flex-end', gap: '0.5rem', fontFamily: ff,
    }}>
      {/* Tooltip label — papar bila expanded */}
      {expanded && (
        <div style={{
          background: '#042E23', border: '1.5px solid rgba(37,211,102,0.4)',
          borderRadius: '12px', padding: '0.75rem 1.1rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          maxWidth: '200px', textAlign: 'right',
        }}>
          <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#FEF3C7' }}>
            Ada soalan?
          </p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#A7F3D0', lineHeight: 1.4 }}>
            WhatsApp kami sekarang — balas dalam 30 minit
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              marginTop: '0.65rem',
              padding: '0.5rem 1rem', borderRadius: '50px',
              fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Mulakan WhatsApp
          </a>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        aria-label="Ada soalan? WhatsApp kami"
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          border: '2px solid rgba(255,255,255,0.25)',
          boxShadow: '0 6px 24px rgba(37,211,102,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#FFFFFF',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {expanded ? (
          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>✕</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </button>

      {/* Pulse ring (only when collapsed) */}
      {!expanded && (
        <style>{`
          @keyframes wa-pulse {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      )}
    </div>
  );
}
