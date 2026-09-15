'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PixelLogic() {
  const searchParams = useSearchParams();
  const [pixelId, setPixelId] = useState(null);

  useEffect(() => {
    const code = searchParams.get('m');
    if (!code) return;

    // No slug needed — 1 global pixel per marketer
    fetch(`/api/pixel-resolve?m=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.pixel_id) setPixelId(data.pixel_id);
      })
      .catch(() => {}); // Silent fail
  }, [searchParams]);

  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;
    
    // Add marketer pixel alongside HQ pixel
    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
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
