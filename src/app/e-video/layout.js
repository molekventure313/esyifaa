import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: "E-Video Rawatan Ruqyah — Perawat Peribadi Dalam Telefon Anda | RM150",
  description: "Dapatkan rakaman video ruqyah syar'iyyah ESyifaa. Rawat diri sendiri, lindungi rumah, buat air tawar & garam — bila-bila masa, tanpa bergantung pada perawat. RM150 sekali, guna seumur hidup.",
};

export default function EVideoLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
