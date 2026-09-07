import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Bisikan, Emosi Tak Terkawal & Susah Tidur | ESyifaa',
  description: 'Alhamdulillah bisikan halus, emosi tak terkawal & susah tidur reda lepas mandi Sabun Garam Himalaya Pengisian ESyifaa. RM39 + postage RM5.',
};

export default function Layout({ children }) {
  return <><PixelProviderServer />{children}</>;
}
