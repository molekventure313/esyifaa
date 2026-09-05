import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: "Pengisian E-Syifa' — Isi Barang Anda Dengan Ayat Ruqyah Syar'iyyah | RM90",
  description: "Perawat ESyifaa buat pengisian ayat ruqyah jarak jauh pada barang anda (cincin, tasbih, dll) selama 3 hari berturut-turut. Pelarasan setiap minggu percuma selamanya.",
};

export default function PengisianWasapLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
