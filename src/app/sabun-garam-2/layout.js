import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Lenguh Urat & Sakit Badan Lega | ESyifaa',
  description: 'Alhamdulillah lenguh urat, sakit badan & rasa berat yang bertahun lega selepas amalkan Sabun Garam Himalaya Pengisian ESyifaa. RM39 + postage RM5.',
};

export default function Layout({ children }) {
  return <><PixelProviderServer />{children}</>;
}
