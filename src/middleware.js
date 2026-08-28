import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Inject x-pathname into REQUEST headers so server components
  // (layout.js) can read it via headers() — response headers are NOT readable there
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvygzimtwhezxulvydrn.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3PZP6cp7K4VpTTMEGM2UlQ_u8ldC3dz';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  const isPublicRoute = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/setup' ||
    request.nextUrl.pathname === '/daftar-perawat' ||
    request.nextUrl.pathname === '/terima-kasih' ||
    request.nextUrl.pathname === '/tasbih-esyifa' ||
    request.nextUrl.pathname.startsWith('/wa') ||
    request.nextUrl.pathname.startsWith('/pengisian-esyifa') ||
    request.nextUrl.pathname.startsWith('/rawat-sendiri') ||
    request.nextUrl.pathname.startsWith('/e-video') ||
    request.nextUrl.pathname.startsWith('/sihir') ||
    request.nextUrl.pathname.startsWith('/saka') ||
    request.nextUrl.pathname.startsWith('/penyakit-misteri') ||
    request.nextUrl.pathname.startsWith('/gangguan-berulang') ||
    request.nextUrl.pathname.startsWith('/gangguan-mistik') ||
    request.nextUrl.pathname.startsWith('/belum-zuriat') ||
    request.nextUrl.pathname.startsWith('/kedai-tutup') ||
    request.nextUrl.pathname.startsWith('/fsp') ||
    request.nextUrl.pathname.startsWith('/fsp-checkout') ||
    request.nextUrl.pathname.startsWith('/payment-success') ||
    request.nextUrl.pathname.startsWith('/tasbih-esyifa') ||
    request.nextUrl.pathname.startsWith('/tasbih-v2') ||
    request.nextUrl.pathname.startsWith('/api/submissions') ||
    request.nextUrl.pathname.startsWith('/api/payments') ||
    request.nextUrl.pathname.startsWith('/api/tracking') ||
    request.nextUrl.pathname.startsWith('/api/public') ||          // ← public APIs (wasap numbers etc)
    request.nextUrl.pathname.startsWith('/api/setup') ||
    request.nextUrl.pathname.startsWith('/api/register-perawat') ||
    request.nextUrl.pathname.startsWith('/api/settings') ||
    request.nextUrl.pathname.startsWith('/api/perawat') ||
    request.nextUrl.pathname.startsWith('/api/pixel-init') ||
    request.nextUrl.pathname.startsWith('/api/pixel-fpx-init') ||  // ← FPX pixel init script
    request.nextUrl.pathname.startsWith('/api/pixel-debug') ||     // ← debug endpoint
    request.nextUrl.pathname === '/api/tracking/fpx-pixel-id';     // ← public FPX pixel ID

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
