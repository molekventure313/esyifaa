import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * PixelProviderServer — Server Component.
 * Runs on every request (no CDN/browser cache).
 *
 * FIX: Checks tracking_type for current page slug.
 * If 'purchase' → return null (FPX pixel handles its own init via checkout form).
 * Only injects Pixel UTAMA (Lead) for 'lead' type pages.
 */

// Check tracking_type for current slug from salespages table
async function getTrackingType(slug) {
  if (!slug) return 'lead';
  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('salespages')
      .select('tracking_type')
      .eq('slug', slug)
      .maybeSingle();
    return data?.tracking_type || 'lead';
  } catch {
    return 'lead'; // fail safe — default to lead
  }
}

export default async function PixelProviderServer() {
  // ── 1. Read current pathname from middleware-forwarded header ──────────────
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const slug = pathname.replace(/^\//, '').split('/')[0] || '';

  // ── 2. Check tracking_type — skip main pixel for purchase pages ───────────
  //    Purchase pages use FPX pixel only (injected by checkout form)
  const trackingType = await getTrackingType(slug);
  if (trackingType === 'purchase') return null;

  // ── 3. Fetch Pixel UTAMA ID ───────────────────────────────────────────────
  let pixelId = null;

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('tracking_config')
      .select('meta_pixel_id, is_active')
      .limit(1)
      .maybeSingle();

    if (data?.is_active && data?.meta_pixel_id) {
      pixelId = data.meta_pixel_id;
    }
  } catch {
    // Fail silently — pixel won't fire but page still loads
  }

  if (!pixelId) return null;

  // ── 4. Inject Pixel UTAMA (Lead pages only) ───────────────────────────────
  const pixelScript = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
    fbq('track', 'ViewContent');
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: pixelScript }}
    />
  );
}
