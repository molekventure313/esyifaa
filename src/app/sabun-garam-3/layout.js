import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Sakit Misteri Doktor Tak Jumpa Punca | ESyifaa',
  description: 'Alhamdulillah sakit misteri yang doktor pun tak tahu punca makin pulih lepas guna Sabun Pengisian Ruqyah ESyifaa. RM39 + postage RM5. COD & FPX.',
};

export default function Layout({ children }) {
  return <><PixelProviderServer />{children}</>;
}
