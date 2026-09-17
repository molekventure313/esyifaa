'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PixelLogic() {
  const searchParams = useSearchParams();
  const [pixelId, setPixelId] = useState(null);

  useEffect(() => {
    const code = searchParams.get('m');
    if (!code) return;

    fetch(`/api/pixel-resolve?m=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.pixel_id) setPixelId(data.pixel_id);
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;
    
    // Load fbq library if not already loaded (HQ pixel skipped it when ?m= present)
    if (!window.fbq) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    }
    
    // Init ONLY marketer pixel — no HQ pixel
    window.fbq('init', pixelId);
    // trackSingle: fire PageView untuk marketer pixel SAHAJA — walaupun HQ pixel terbuka
    window.fbq('trackSingle', pixelId, 'PageView');
  }, [pixelId]);

  return null;
}

export default function MarketerPixelProvider() {
  return (
    <Suspense fallback={null}>
      <PixelLogic />
    </Suspense>
  );
}
