import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Usir Saka, Sihir & Santau | ESyifaa',
  description: 'Alhamdulillah saka, sihir & santau yang bertahun menyeksa akhirnya keluar selepas mandi Sabun Pengisian ESyifaa. RM39 + postage RM5. COD & FPX.',
};

export default function Layout({ children }) {
  return <><PixelProviderServer />{children}</>;
}
