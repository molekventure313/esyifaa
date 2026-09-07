import SabunGaramPageContent from '@/components/salespage/sabun-garam/PageContent';

// PILIHAN 3 — Angle: Penyakit Misteri / Doktor Tak Jumpa Punca
// Formula FSP: [Alhamdulillah] + [3 masalah] → [selesai] lepas guna [Produk]

const HEADLINE = (
  <>
    Alhamdulillah sakit misteri yang doktor pun tak tahu punca{' '}
    <span style={{ color: '#059669' }}>
      makin pulih lepas guna Sabun Pengisian Ruqyah ESyifaa
    </span>
  </>
);

const SUB = 'Bila masalah fizikal yang tak kunjung sembuh — mungkin punca sebenarnya rohani. Sabun ini rawatan dari dua arah: fizikal & rohani serentak.';

export default function SabunGaram3Page() {
  return (
    <SabunGaramPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="sabun-garam-3"
    />
  );
}
