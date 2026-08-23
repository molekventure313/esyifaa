import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: "Pengisian E-Syifa' — Isi Barang Anda Dengan Ayat Ruqyah Syar'iyyah | RM90",
  description: "Perawat ESyifaa buat pengisian ayat ruqyah jarak jauh pada barang anda (cincin, tasbih, dll) selama 7 hari. Pelarasan setiap minggu percuma selamanya. Bayar RM90 via FPX.",
};

export default function PengisianEsyifaLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
