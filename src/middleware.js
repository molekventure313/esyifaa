import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  // Forward marketer param — server components baca header ini untuk skip HQ pixel
  if (request.nextUrl.searchParams.has('m')) {
    requestHeaders.set('x-has-marketer', '1');
  }
  const pathname = request.nextUrl.pathname;

  // ── PUBLIC ROUTES: SEMAK DULU — skip Supabase auth sepenuhnya ────────────
  // Setiap klik FB Ads ke /sabun-garam dll terus pass tanpa network call
  const PUBLIC_EXACT = new Set([
    '/', '/login', '/setup', '/daftar-perawat', '/daftar-marketer',
    '/terima-kasih', '/tasbih-esyifa',
  ]);

  const PUBLIC_PREFIXES = [
    '/m/',
    '/wa',
    '/pengisian-esyifa',
    '/pengisian-wasap',
    '/sabun-garam',
    '/rawat-sendiri',
    '/e-video',
    '/sihir',
    '/saka',
    '/penyakit-misteri',
    '/gangguan-berulang',
    '/gangguan-mistik',
    '/belum-zuriat',
    '/kedai-tutup',
    '/fsp',
    '/fsp-checkout',
    '/garam-pengasihan',
    '/kasturi-kijang',
    '/payment-success',
    '/tasbih-v2',
    // Public APIs — tidak perlukan auth
    '/api/submissions',
    '/api/orders',
    '/api/payments',
    '/api/tracking',
    '/api/track-visit',
    '/api/public',
    '/api/setup',
    '/api/register-perawat',
    '/api/register-marketer',
    '/api/settings',
    '/api/perawat',
    '/api/pixel',
  ];

  const isPublicRoute =
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p));

  if (isPublicRoute) {
    // Terus benarkan — TIADA Supabase call, tiada latency tambahan
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── PROTECTED ROUTES sahaja (dashboard/admin/*, dashboard/perawat/*) ─────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvygzimtwhezxulvydrn.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3PZP6cp7K4VpTTMEGM2UlQ_u8ldC3dz';

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Hanya route yang perlukan auth — sales page public tak lalu middleware langsung
// (tiada edge function invocation untuk setiap klik iklan)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pengisian-item/:path*',
    '/api/:path*',
  ],
};
