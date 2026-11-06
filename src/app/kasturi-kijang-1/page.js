import KasturiKijangPageContent from '@/components/salespage/kasturi-kijang/PageContent';
import { HL } from '@/components/salespage/kasturi-kijang/heroStyle';

// PILIHAN 1 — Angle: Kena Himpit & Mimpi Ngeri
// Formula FSP: [Alhamdulillah] + [3 masalah] → [lega] lepas guna [Produk]. Section lain dikongsi dengan /kasturi-kijang.

const HEADLINE = (
  <>
    &ldquo;Alhamdulillah, kena himpit, mimpi dikejar &amp; terjaga cemas tengah malam{' '}
    <span style={HL}>dah jarang berlaku sejak calit Kasturi Kijang E-Syifa&rsquo; di bantal</span>&rdquo;
  </>
);

const SUB = <>Calit di nadi &amp; bantal sebelum tidur, baca doa — tidur lebih tenang, in shaa Allah. Bangun pagi badan rasa ringan, bukan penat macam berperang semalaman 👇🏻</>;

export default function KasturiKijang1Page() {
  return (
    <KasturiKijangPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="kasturi-kijang-1"
    />
  );
}
