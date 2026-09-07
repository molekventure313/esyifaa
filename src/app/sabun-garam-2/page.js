import SabunGaramPageContent from '@/components/salespage/sabun-garam/PageContent';

// PILIHAN 2 — Angle: Sakit Fizikal (Lenguh Urat / Sakit Badan)
// Formula FSP: [Alhamdulillah] + [3 masalah] → [selesai] lepas guna [Produk]

const HEADLINE = (
  <>
    Alhamdulillah lenguh urat, sakit badan & rasa berat bertahun-tahun{' '}
    <span style={{ color: '#4ADE80' }}>
      lega selepas amalkan Sabun Garam Himalaya Pengisian
    </span>
  </>
);

const SUB = 'Bahu yang tegang, badan yang lesu dan sakit yang datang tanpa sebab — mula hilang selepas mandi dengan sabun ini. In shaa Allah, rasai perbezaannya.';

export default function SabunGaram2Page() {
  return (
    <SabunGaramPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="sabun-garam-2"
    />
  );
}
