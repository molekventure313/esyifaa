import KasturiKijangPageContent from '@/components/salespage/kasturi-kijang/PageContent';
import { HL } from '@/components/salespage/kasturi-kijang/heroStyle';

// PILIHAN 3 — Angle: Sesak Dada & Rasa Diperhatikan
// Formula FSP: [Alhamdulillah] + [3 masalah] → [lega] lepas guna [Produk]. Section lain dikongsi dengan /kasturi-kijang.

const HEADLINE = (
  <>
    &ldquo;Alhamdulillah, dada sesak, panik tiba-tiba &amp; rasa macam diperhatikan{' '}
    <span style={HL}>beransur reda bila amalkan Kasturi Kijang E-Syifa&rsquo;</span>&rdquo;
  </>
);

const SUB = <>Hidu aromanya dalam-dalam sambil berzikir — wangian sunnah yang menenangkan, sebagai ikhtiar memohon perlindungan Allah 👇🏻</>;

export default function KasturiKijang3Page() {
  return (
    <KasturiKijangPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="kasturi-kijang-3"
    />
  );
}
