import { Inter, Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { unstable_cache } from 'next/cache';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { createAdminClient } from '@/lib/supabase/admin';
import ClientPixelProvider from '@/components/salespage/ClientPixelProvider';
import SocialProofToast from '@/components/salespage/SocialProofToast';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Heading font (--font-heading dalam globals.css) — dulu @import Google Fonts (render-blocking)
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
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

// Inline pixel bootstrap — jalan masa HTML di-parse, SEBELUM React hydrate.
// PageView fire secepat mungkin supaya Landing Page View (Meta) tak tercicir.
// Logik sama dgn ClientPixelProvider + MarketerPixelProvider:
//  - ?m= atau /m/ → pixel marketer SAHAJA (HQ skip)
//  - /fsp-checkout, /payment-success → skip (FPX pixel handle)
//  - lain-lain → HQ pixel
function buildPixelBootstrap(hqPixelId, marketerPixels) {
  const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  return `(function(){try{
var HQ=${json(hqPixelId || null)},MK=${json(marketerPixels || {})};
var p=location.pathname,m=(new URLSearchParams(location.search).get('m')||'').toLowerCase().trim();
var id=null,isMk=!!m||p.indexOf('/m/')===0;
if(isMk){id=m?MK[m]||null:null;}
else if(p.indexOf('/fsp-checkout')!==0&&p.indexOf('/payment-success')!==0){id=HQ;}
if(!id)return;
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init',id);fbq('track','PageView');
window.__pixelBooted=id;if(isMk)window.__mkPixelCode=m;
}catch(e){}})();`;
}


export default async function RootLayout({ children }) {
  // Fetch HQ pixel ID + marketer pixel map (cached) — pixel di-init inline dalam <head>
  const [pixelIdRaw, marketerPixels] = await Promise.all([
    getCachedPixelId(),
    getCachedMarketerPixels(),
  ]);

  return (
    <html lang="ms" className={`${inter.variable} ${jakarta.variable} ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <script dangerouslySetInnerHTML={{ __html: buildPixelBootstrap(pixelIdRaw, marketerPixels) }} />
      </head>
      <body>
        {/* ClientPixelProvider — fallback sahaja; skip bila fbq dah di-init inline dalam <head>.
            Skip bila ?m= (marketer) atau FPX pages */}
        <ClientPixelProvider hqPixelId={pixelIdRaw} />
        {/* SocialProofToast — popup notifikasi pembeli terkini
            Self-skips untuk dashboard / checkout pages */}
        <SocialProofToast />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
