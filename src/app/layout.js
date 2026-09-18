import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
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

export const metadata = {
  title: "MV SYIFAA' | Rawatan Jarak Jauh Gangguan Jin, Sihir, Santau & Saka",
  description: "Rawatan secara jarak jauh menggunakan bacaan ayat-ayat al-Quran dan doa berlandaskan syarak untuk membantu anda kembali tenang.",
};

// ─── Cached DB queries — revalidate setiap 5 minit ──────────────────────────
// Pixel ID hampir tidak berubah — selamat di-cache
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
  { revalidate: 300 } // 5 minit
);


export default async function RootLayout({ children }) {
  // Fetch HQ pixel ID — pass to ClientPixelProvider sebagai prop
  // Client akan decide sama ada nak init pixel atau skip (cek ?m= dan FPX pages)
  const pixelIdRaw = await getCachedPixelId();

  return (
    <html lang="ms" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* ClientPixelProvider — handle HQ pixel client-side
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
