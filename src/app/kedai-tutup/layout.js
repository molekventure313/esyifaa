export const dynamic = 'force-dynamic';
import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export default function SalespageLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
