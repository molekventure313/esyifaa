import KasturiKijangPageContent from '@/components/salespage/kasturi-kijang/PageContent';
import { HL } from '@/components/salespage/kasturi-kijang/heroStyle';

// PILIHAN 5 — Angle: Wangian Sunnah Solat & Pendinding
// Formula FSP: [Alhamdulillah] + [3 masalah] → [lega] lepas guna [Produk]. Section lain dikongsi dengan /kasturi-kijang.

const HEADLINE = (
  <>
    &ldquo;Alhamdulillah, solat lebih khusyuk, hati lebih tenang &amp; diri terasa terlindung setiap hari{' '}
    <span style={HL}>dengan wangian sunnah Kasturi Kijang E-Syifa&rsquo;</span>&rdquo;
  </>
);

const SUB = <>Bebas alkohol, sah solat &amp; mesra ihram. Calit sebelum solat, ke masjid atau keluar rumah — pendinding harian yang berbau harum 👇🏻</>;

export default function KasturiKijang5Page() {
  return (
    <KasturiKijangPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="kasturi-kijang-5"
    />
  );
}
