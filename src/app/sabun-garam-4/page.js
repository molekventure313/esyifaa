import SabunGaramPageContent from '@/components/salespage/sabun-garam/PageContent';

// PILIHAN 4 — Angle: Emosi, Bisikan & Tidur Terganggu
// Formula FSP: [Alhamdulillah] + [3 masalah] → [selesai] lepas guna [Produk]

const HEADLINE = (
  <>
    Alhamdulillah bisikan halus, emosi tak terkawal & susah tidur{' '}
    <span style={{ color: '#4ADE80' }}>
      reda lepas mandi Sabun Garam Himalaya Pengisian ESyifaa
    </span>
  </>
);

const SUB = 'Daripada mudah marah, rasa anxious dan ada yang ikut — kini hati lapang, tidur nyenyak dan emosi makin stabil. In shaa Allah, anda pun boleh.';

export default function SabunGaram4Page() {
  return (
    <SabunGaramPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="sabun-garam-4"
    />
  );
}
