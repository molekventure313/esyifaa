'use client';

import { useEffect } from 'react';

// FPX pages — HQ pixel skip, FPX pixel handled by checkout form
const FPX_PATHS = ['/fsp-checkout', '/payment-success'];

/**
 * ClientPixelProvider — fires HQ Meta Pixel client-side.
 * Cek ?m= DULU sebelum init — kalau marketer link, skip (MarketerPixelProvider handle).
 * 100% reliable kerana client-side check, tiada dependency pada server headers.
 */
export default function ClientPixelProvider({ hqPixelId }) {
  useEffect(() => {
    if (!hqPixelId || typeof window === 'undefined') return;

    // Marketer link — MarketerPixelProvider yang handle pixel
    const hasMarketer = new URLSearchParams(window.location.search).has('m');
    if (hasMarketer) return;

    // FPX pages — HQ pixel jangan fire, FPX pixel handled by FspChipCheckoutForm
    const isFpxPage = FPX_PATHS.some(p => window.location.pathname.startsWith(p));
    if (isFpxPage) return;

    // Pixel dah init — skip
    if (window.fbq) return;

    // Init HQ pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', hqPixelId);
    window.fbq('track', 'PageView');
  }, [hqPixelId]);

  return null;
}