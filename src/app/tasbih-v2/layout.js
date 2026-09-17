export const dynamic = 'force-dynamic';
import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: "Tasbih E-Syifa' | Rawatan Ruqyah Kendiri Tanpa Had — Untuk Kes Berulang & Berat",
  description: "Tasbih diisi bacaan ruqyah syar'iyyah. Rawat diri sendiri 24/7, buat air penawar & mandian sendiri. Sesuai untuk kes sihir berulang, gangguan berat & perlindungan jangka panjang.",
};

export default function TasbihV2Layout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
