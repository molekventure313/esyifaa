'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * PageViewTracker — Client component untuk record page view.
 * Letak dalam setiap salespage page.js.
 * Fail silently — tidak crash salespage jika tracking gagal.
 *
 * @param {string} slug - Slug salespage (e.g. 'sihir', 'saka')
 */
export default function PageViewTracker({ slug }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams.get('m') || '';

  useEffect(() => {
    if (!slug) return;
    // Fire and forget — tidak perlu await
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, marketer_code: marketerCode }),
    }).catch(() => {}); // Silent fail
  }, [slug, marketerCode]);

  return null; // Tiada UI
}
