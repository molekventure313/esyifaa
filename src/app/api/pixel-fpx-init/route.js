import { createAdminClient } from '@/lib/supabase/admin';

// Returns JavaScript FPX pixel init code — called as external script src
// No auth needed — only returns fpx_pixel_id when FPX tracking is active
export async function GET() {
  let fpxPixelId = null;

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('tracking_config')
      .select('fpx_pixel_id, fpx_is_active')
      .limit(1)
      .maybeSingle();

    if (!error && data?.fpx_is_active && data?.fpx_pixel_id) {
      fpxPixelId = data.fpx_pixel_id;
    }
  } catch (e) {
    console.warn('pixel-fpx-init: DB query failed:', e?.message);
  }

  if (!fpxPixelId) {
    return new Response('/* FPX Pixel: not configured or inactive */', {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // FPX pixel init — no ViewContent/Lead, only Purchase flow tracking
  const pixelScript = `
(function() {
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
  fbq('init', '${fpxPixelId}');
  // trackSingle — 'track' akan fire PageView ke SEMUA pixel (HQ dapat PageView berganda)
  fbq('trackSingle', '${fpxPixelId}', 'PageView');
  // Store fpxPixelId for trackSingle usage
  window.__fpxPixelId = '${fpxPixelId}';
})();
`;

  return new Response(pixelScript, {
    headers: {
      'Content-Type': 'application/javascript',
      // Browser tak cache; CDN cache 5 minit (dipanggil setiap page load produk)
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
