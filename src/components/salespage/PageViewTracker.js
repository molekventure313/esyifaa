'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * PageViewTrackerInner — Client component untuk record page view.
 * @param {string} slug - Slug salespage (e.g. 'sihir', 'saka')
 */
function PageViewTrackerInner({ slug }) {
  const searchParams = useSearchParams();
  const marketerCode = searchParams.get('m') || '';

  const isFighter = searchParams.has('f');   // SP fighter — tak dikira dalam statistik HQ

  useEffect(() => {
    if (!slug || isFighter) return;
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, marketer_code: marketerCode }),
    }).catch(() => {}); // Silent fail
  }, [slug, marketerCode, isFighter]);

  return null;
}

export default function PageViewTracker({ slug }) {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner slug={slug} />
    </Suspense>
  );
}
