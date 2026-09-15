'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PixelLogic({ slug }) {
  const searchParams = useSearchParams();
  const [pixelId, setPixelId] = useState(null);

  useEffect(() => {
    const code = searchParams.get('m');
    if (!code) return;

    fetch(`/api/pixel-resolve?slug=${slug}&m=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.pixel_id) {
          setPixelId(data.pixel_id);
        }
      })
      .catch(err => console.error('Error fetching marketer pixel:', err));
  }, [searchParams, slug]);

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

export default function MarketerPixelProvider({ slug }) {
  return (
    <Suspense fallback={null}>
      <PixelLogic slug={slug} />
    </Suspense>
  );
}
