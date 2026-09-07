import PixelProviderServer from '@/components/salespage/PixelProviderServer';

export const metadata = {
  title: 'Sabun Garam Himalaya Pengisian — Usir Saka, Sihir & Santau | ESyifaa',
  description: 'Sabun Garam Himalaya 200g diisikan tenaga ayat ruqyah syar\'iyyah selama 3 hari. Berkesan untuk saka, sihir, santau, sakit urat, sakit badan & penyakit misteri. RM39 + postage RM5.',
};

export default function SabunGaramLayout({ children }) {
  return (
    <>
      <PixelProviderServer />
      {children}
    </>
  );
}
