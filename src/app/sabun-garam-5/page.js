import SabunGaramPageContent from '@/components/salespage/sabun-garam/PageContent';

// PILIHAN 5 — Angle: Keluarga (Anak Meracau / Gatal / Berat Sekeluarga)
// Formula FSP: [Alhamdulillah] + [3 masalah] → [selesai] lepas guna [Produk]

const HEADLINE = (
  <>
    Alhamdulillah anak meracau malam, gatal-gatal badan & rasa berat sekeluarga{' '}
    <span style={{ color: '#4ADE80' }}>
      hilang lepas guna Sabun Pengisian ESyifaa
    </span>
  </>
);

const SUB = 'Selamat untuk seluruh ahli keluarga — mandi bersama, dilindungi bersama. Tenaga ruqyah bertindak setiap hari, in shaa Allah.';

export default function SabunGaram5Page() {
  return (
    <SabunGaramPageContent
      heroHeadline={HEADLINE}
      heroSubheadline={SUB}
      source="sabun-garam-5"
    />
  );
}
