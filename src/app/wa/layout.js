import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Scanning & Air Tawar PERCUMA — ESyifaa',
  description: 'Dapatkan scanning gangguan & air tawar percuma daripada perawat ESyifaa. Hubungi kami sekarang melalui WhatsApp.',
};

export default function WaLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
