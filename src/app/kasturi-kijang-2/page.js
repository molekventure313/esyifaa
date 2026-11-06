import KasturiKijangPageContent from '@/components/salespage/kasturi-kijang/PageContent';
import { HL } from '@/components/salespage/kasturi-kijang/heroStyle';

// PILIHAN 2 — Angle: Anak Meracau Malam
// Formula FSP: [Alhamdulillah] + [3 masalah] → [lega] lepas guna [Produk]. Section lain dikongsi dengan /kasturi-kijang.

const HEADLINE = (
  <>
    &ldquo;Alhamdulillah, anak yang selalu meracau, menangis waktu maghrib &amp; tak lena tidur{' '}
    <span style={HL}>kini lebih tenang selepas dicalit Kasturi Kijang E-Syifa&rsquo;</span>&rdquo;
  </>
);

const SUB = <>Calitan nipis di ubun-ubun &amp; tapak kaki sebelum maghrib — ikhtiar pendinding si kecil, dan mak ayah pun dapat tidur malam semula 👇🏻</>;

export default function KasturiKijang2Page() {
  return (
    <KasturiKijangPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="kasturi-kijang-2"
    />
  );
}
