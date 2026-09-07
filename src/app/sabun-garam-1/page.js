import SabunGaramPageContent from '@/components/salespage/sabun-garam/PageContent';

// PILIHAN 1 — Angle: Saka / Sihir / Santau (gangguan rohani)
// Formula FSP: [Alhamdulillah] + [3 masalah] → [selesai] lepas guna [Produk]

const HEADLINE = (
  <>
    Alhamdulillah saka, sihir & santau yang bertahun-tahun menyeksa{' '}
    <span style={{ color: '#059669' }}>
      akhirnya keluar selepas mandi Sabun Pengisian ESyifaa
    </span>
  </>
);

const SUB = 'Badan terasa ringan, bisikan senyap, tidur menjadi lena — ramai pelanggan kami dah rasai perubahan ini. Anda seterusnya, in shaa Allah.';

export default function SabunGaram1Page() {
  return (
    <SabunGaramPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="sabun-garam-1"
    />
  );
}
