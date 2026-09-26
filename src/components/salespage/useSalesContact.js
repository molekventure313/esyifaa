'use client';

import { useEffect, useState } from 'react';

// No. WhatsApp HQ — dipakai section "Nak order melalui WhatsApp?" & butang terapung di SP HQ
export const HQ_WHATSAPP = '601118939984';

export const buildWaLink = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

// Satu fetch setiap kod marketer (section + butang terapung kongsi hasil yang sama)
const pending = {};

/**
 * Nombor WhatsApp untuk SP semasa.
 * - SP HQ (tiada ?m= dan bukan /m/) → HQ_WHATSAPP
 * - SP marketer → no. WhatsApp marketer; null kalau belum isi → JANGAN papar section/butang WA
 * Sebelum `ready`, jangan render apa-apa (elak nombor HQ berkelip di SP marketer).
 */
export default function useSalesContact() {
  const [state, setState] = useState({ ready: false, number: null, isMarketer: false });

  useEffect(() => {
    const code = (new URLSearchParams(window.location.search).get('m') || '').toLowerCase().trim();
    const isMarketer = !!code || window.location.pathname.startsWith('/m/');

    if (!isMarketer) { setState({ ready: true, number: HQ_WHATSAPP, isMarketer: false }); return; }
    if (!code)       { setState({ ready: true, number: null, isMarketer: true }); return; }

    pending[code] ??= fetch(`/api/public/marketer-contact?m=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(j => j.whatsapp || null)
      .catch(() => null);

    let alive = true;
    pending[code].then(number => { if (alive) setState({ ready: true, number, isMarketer: true }); });
    return () => { alive = false; };
  }, []);

  return state;
}
