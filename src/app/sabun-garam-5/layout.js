import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Anak Meracau & Gatal Sekeluarga Hilang | ESyifaa',
  description: 'Alhamdulillah anak meracau malam, gatal-gatal badan & rasa berat sekeluarga hilang lepas guna Sabun Pengisian ESyifaa. Selamat untuk seluruh keluarga.',
};

export default function Layout({ children }) {
  return <><PixelProviderServer />{children}</>;
}
