import KasturiKijangPageContent from '@/components/salespage/kasturi-kijang/PageContent';
import { HL } from '@/components/salespage/kasturi-kijang/heroStyle';

// PILIHAN 4 — Angle: Tengkuk & Bahu Berat
// Formula FSP: [Alhamdulillah] + [3 masalah] → [lega] lepas guna [Produk]. Section lain dikongsi dengan /kasturi-kijang.

const HEADLINE = (
  <>
    &ldquo;Alhamdulillah, tengkuk berat, bahu tegang &amp; sakit yang berpindah-randah{' '}
    <span style={HL}>terasa lebih ringan lepas disapu Kasturi Kijang E-Syifa&rsquo;</span>&rdquo;
  </>
);

const SUB = <>Sapu di tengkuk, belikat &amp; sendi yang tegang — ramai yang rasa &ldquo;angin keluar&rdquo; dan badan beransur ringan, dengan izin Allah 👇🏻</>;

export default function KasturiKijang4Page() {
  return (
    <KasturiKijangPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="kasturi-kijang-4"
    />
  );
}
