import { createAdminClient } from '@/lib/supabase/admin';

// CDN cache 5 minit — dipanggil setiap page load (checkout forms)
const CDN_CACHE = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

// Public endpoint — returns fpx_pixel_id only (no secret tokens)
// Used by client-side components for fbq('trackSingle', pixelId, ...)
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('tracking_config')
      .select('fpx_pixel_id, fpx_is_active')
      .limit(1)
      .maybeSingle();

    if (error || !data?.fpx_is_active || !data?.fpx_pixel_id) {
      return Response.json({ fpx_pixel_id: null }, { headers: CDN_CACHE });
    }

    return Response.json({ fpx_pixel_id: data.fpx_pixel_id }, { headers: CDN_CACHE });
  } catch (e) {
    console.warn('fpx-pixel-id: DB query failed:', e?.message);
    return Response.json({ fpx_pixel_id: null });
  }
}
