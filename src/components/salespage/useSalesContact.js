'use client';

import { useEffect, useState } from 'react';

// No. WhatsApp HQ — SATU nombor untuk SEMUA SP HQ (section WhatsApp, butang WA, Air Tawar, Pengisian, Ruqyah Harian, Tasbih)
export const HQ_WHATSAPP = '601149794073';
// Dulu SP Pengisian guna nombor berasingan — kini sama dengan HQ (nama dikekalkan supaya import sedia ada tak rosak)
export const HQ_WHATSAPP_PENGISIAN = HQ_WHATSAPP;

export const buildWaLink = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

// Satu fetch setiap kod marketer (dikongsi kalau section dirender lebih dari sekali)
const pending = {};

/**
 * Nombor WhatsApp untuk SP semasa.
 * - SP HQ (tiada ?m= dan bukan /m/) → hqNumber (default HQ_WHATSAPP; Pengisian → HQ_WHATSAPP_PENGISIAN)
 * - SP marketer → no. WhatsApp marketer; null kalau belum isi → JANGAN papar section/butang WA
 * Sebelum `ready`, jangan render apa-apa (elak nombor HQ berkelip di SP marketer).
 */
export default function useSalesContact({ hqNumber = HQ_WHATSAPP } = {}) {
  const [state, setState] = useState({ ready: false, number: null, isMarketer: false });

  useEffect(() => {
    const code = (new URLSearchParams(window.location.search).get('m') || '').toLowerCase().trim();
    const isMarketer = !!code || window.location.pathname.startsWith('/m/');

    if (!isMarketer) { setState({ ready: true, number: hqNumber, isMarketer: false }); return; }
    if (!code)       { setState({ ready: true, number: null, isMarketer: true }); return; }

    pending[code] ??= fetch(`/api/public/marketer-contact?m=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(j => j.whatsapp || null)
      .catch(() => null);

    let alive = true;
    pending[code].then(number => { if (alive) setState({ ready: true, number, isMarketer: true }); });
    return () => { alive = false; };
  }, [hqNumber]);

  return state;
}

/**
 * Rekod klik butang WhatsApp section — UTM + marketer + SP, dan fire Meta Pixel `Lead`.
 * sendBeacon: tak tunggu jawapan & tetap sampai walaupun browser terus buka WhatsApp.
 * Pixel: di SP marketer hanya pixel marketer di-init, di SP HQ hanya pixel HQ — `track` ikut itu.
 */
export function trackWaClick({ product } = {}) {
  try {
    const q = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace(/^\/m\//, '/');
    const payload = JSON.stringify({
      source:        path.split('/').filter(Boolean)[0] || null,
      marketer_code: q.get('m') || null,
      utm_source:    q.get('utm_source'),
      utm_medium:    q.get('utm_medium'),
      utm_campaign:  q.get('utm_campaign'),
      utm_content:   q.get('utm_content'),
      utm_term:      q.get('utm_term'),
      fbclid:        q.get('fbclid'),
    });
    const sent = navigator.sendBeacon?.('/api/track-wa-click', new Blob([payload], { type: 'application/json' }));
    if (!sent) fetch('/api/track-wa-click', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
  } catch (_) { /* jangan ganggu klik */ }

  try { window.fbq?.('track', 'Lead', { content_name: product ? `WhatsApp — ${product}` : 'WhatsApp' }); } catch (_) {}
}

/**
 * Butang WhatsApp tambahan di SP (selain section "Nak order melalui WhatsApp?").
 * - SP HQ → nombor hardcode butang tu (hqNumber), tak berubah
 * - SP marketer (/m/… atau ?m=) → nombor marketer / teamsale; tiada nombor → butang disembunyikan
 * Klik → rekod klik + UTM (wa_clicks) & Meta Pixel `Lead` (sama dgn section WhatsApp).
 * `hidden` = true sebelum nombor marketer sedia / bila tiada nombor (guna visibility supaya layout tak lompat).
 */
export function useWaButton({ hqNumber, message, product }) {
  const { ready, number } = useSalesContact({ hqNumber });
  return {
    href: buildWaLink(number || hqNumber, message),
    hidden: !ready || !number,
    onClick: () => trackWaClick({ product }),
  };
}
