import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * PixelProviderServer — Server Component.
 * Injects HQ Meta Pixel ONLY when there is no marketer code (?m=) in URL.
 * If ?m= is present, MarketerPixelProvider (client component) handles pixel injection.
 */

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
    return 'lead';
  }
}

export default async function PixelProviderServer() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const hasMarketer = headersList.get('x-has-marketer') === '1';
  const slug = pathname.replace(/^\//, '').split('/')[0] || '';

  // Skip pixel untuk purchase pages DAN marketer links
  const trackingType = await getTrackingType(slug);
  if (trackingType === 'purchase' || hasMarketer) return null;

  // Fetch HQ Pixel ID
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
    // Fail silently
  }

  if (!pixelId) return null;

  // Inject HQ pixel script — server sudah pastikan ini hanya render bila tiada ?m=
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
