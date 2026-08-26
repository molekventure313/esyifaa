import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: "Berhenti Bergantung Pada Perawat — Rawat Diri Sendiri Dengan Pengisian E-Syifa' | RM90",
  description: "Dah penat habis ribuan ringgit berjumpa perawat? Pengisian E-Syifa' beri anda kuasa merawat diri dan keluarga sendiri — bila-bila masa, tanpa bergantung pada sesiapa. RM90 sahaja.",
};

export default function RawatSendiriLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
