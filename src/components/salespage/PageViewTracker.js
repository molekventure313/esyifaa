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

  useEffect(() => {
    if (!slug) return;
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, marketer_code: marketerCode }),
    }).catch(() => {}); // Silent fail
  }, [slug, marketerCode]);

  return null;
}

export default function PageViewTracker({ slug }) {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner slug={slug} />
    </Suspense>
  );
}
