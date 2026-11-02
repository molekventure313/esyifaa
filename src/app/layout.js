import localFont from 'next/font/local';
import { unstable_cache } from 'next/cache';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { createAdminClient } from '@/lib/supabase/admin';
import ClientPixelProvider from '@/components/salespage/ClientPixelProvider';
import SocialProofToast from '@/components/salespage/SocialProofToast';


// Font disimpan dalam projek (src/app/fonts, subset latin, variable) — build TIDAK lagi muat turun
// dari Google Fonts (pernah gagal di Netlify: respons Google pelik → "Cannot read properties of null").
const inter = localFont({
  src: './fonts/inter-latin-var.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = localFont({
  src: './fonts/jakarta-latin-var.woff2',
  weight: '200 800',
  variable: '--font-jakarta',
  display: 'swap',
});

// Heading font (--font-heading dalam globals.css) — dulu @import Google Fonts (render-blocking)
const outfit = localFont({
  src: './fonts/outfit-latin-var.woff2',
  weight: '100 900',
  variable: '--font-outfit',
  display: 'swap',
  preload: false,
});

export const metadata = {
  title: "MV SYIFAA' | Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau & Saka",
  description: "Rawatan secara jarak jauh menggunakan bacaan ayat-ayat al-Quran dan doa berlandaskan syarak untuk membantu anda kembali tenang.",
};

// ─── Cached DB queries — revalidate setiap 1 jam ────────────────────────────
// Pixel ID hampir tidak berubah — selamat di-cache.
// Bila admin/marketer update pixel, API panggil revalidateTag('pixels') → terus live.
const PIXEL_CACHE = { revalidate: 3600, tags: ['pixels'] };

const getCachedPixelId = unstable_cache(
  async () => {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from('tracking_config')
        .select('meta_pixel_id, is_active')
        .limit(1)
        .maybeSingle();

      if (data?.is_active && data?.meta_pixel_id) {
        return data.meta_pixel_id;
      }
    } catch (e) {
      console.warn('layout: failed to fetch pixel_id', e?.message);
    }
    return null;
  },
  ['layout-pixel-id'],
  PIXEL_CACHE
);

// Map marketer_code (lowercase) → meta_pixel_id — supaya pixel marketer boleh
// fire terus dari <head> tanpa tunggu /api/pixel-resolve
const getCachedMarketerPixels = unstable_cache(
  async () => {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from('profiles')
        .select('marketer_code, meta_pixel_id')
        .eq('role', 'marketer')
        .not('marketer_code', 'is', null)
        .not('meta_pixel_id', 'is', null);
      const map = {};
      (data || []).forEach(r => {
        const code = (r.marketer_code || '').toLowerCase().trim();
        if (code && r.meta_pixel_id) map[code] = String(r.meta_pixel_id).trim();
      });
      return map;
    } catch (e) {
      console.warn('layout: failed to fetch marketer pixels', e?.message);
      return {};
    }
  },
  ['layout-marketer-pixels'],
  PIXEL_CACHE
);

// Map kod fighter (lowercase) → meta_pixel_id — SP fighter (?f=) fire pixel fighter SAHAJA
const getCachedFighterPixels = unstable_cache(
  async () => {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from('fighter_settings')
        .select('meta_pixel_id, profiles!inner(marketer_code, role, is_active)')
        .not('meta_pixel_id', 'is', null);
      const map = {};
      (data || []).forEach(r => {
        const p = r.profiles;
        const code = (p?.marketer_code || '').toLowerCase().trim();
        if (code && p.role === 'independent' && p.is_active !== false) map[code] = String(r.meta_pixel_id).trim();
      });
      return map;
    } catch (e) {
      return {};
    }
  },
  ['layout-fighter-pixels'],
  PIXEL_CACHE
);

// Inline pixel bootstrap — jalan masa HTML di-parse, SEBELUM React hydrate.
// PageView fire secepat mungkin supaya Landing Page View (Meta) tak tercicir.
// Logik sama dgn ClientPixelProvider + MarketerPixelProvider:
//  - ?m= atau /m/ → pixel marketer SAHAJA (HQ skip)
//  - ?f= atau /f/ → pixel fighter SAHAJA (HQ skip)
//  - /fsp-checkout, /payment-success → skip (FPX pixel handle)
//  - lain-lain → HQ pixel
function buildPixelBootstrap(hqPixelId, marketerPixels, fighterPixels) {
  const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  return `(function(){try{
var HQ=${json(hqPixelId || null)},MK=${json(marketerPixels || {})},FK=${json(fighterPixels || {})};
var p=location.pathname,q=new URLSearchParams(location.search),m=(q.get('m')||'').toLowerCase().trim(),fc=(q.get('f')||'').toLowerCase().trim();
var id=null,isMk=!!m||p.indexOf('/m/')===0,isF=!!fc||p.indexOf('/f/')===0;
if(isF){id=fc?FK[fc]||null:null;if(id)window.__fkPixelCode=fc;}
else if(isMk){id=m?MK[m]||null:null;}
else if(p.indexOf('/fsp-checkout')!==0&&p.indexOf('/payment-success')!==0&&p.indexOf('/f-tq')!==0){id=HQ;}
if(!id)return;
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init',id);fbq('track','PageView');
window.__pixelBooted=id;if(isMk)window.__mkPixelCode=m;
}catch(e){}})();`;
}


export default async function RootLayout({ children }) {
  // Fetch HQ pixel ID + marketer pixel map (cached) — pixel di-init inline dalam <head>
  const [pixelIdRaw, marketerPixels, fighterPixels] = await Promise.all([
    getCachedPixelId(),
    getCachedMarketerPixels(),
    getCachedFighterPixels(),
  ]);

  return (
    <html lang="ms" className={`${inter.variable} ${jakarta.variable} ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <script dangerouslySetInnerHTML={{ __html: buildPixelBootstrap(pixelIdRaw, marketerPixels, fighterPixels) }} />
      </head>
      <body>
        {/* ClientPixelProvider — fallback sahaja; skip bila fbq dah di-init inline dalam <head>.
            Skip bila ?m= (marketer) atau FPX pages */}
        <ClientPixelProvider hqPixelId={pixelIdRaw} />
        {/* SocialProofToast — popup order sebenar, HANYA di SP produk berkenaan
            (SP Sabun → order sabun, dll). Laluan lain (dashboard, homepage, checkout) → tiada popup */}
        <SocialProofToast />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
