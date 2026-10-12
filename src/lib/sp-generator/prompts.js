// SP Generator — prompt AI (Framework FSP 10%). Server sahaja.
import { ANGLE_SECTIONS, HOOK_TYPES, TONES } from '@/lib/sp-generator/schema';
import { SP_PRODUCTS } from '@/lib/sp-generator/products';

export const SYSTEM_PROMPT = `Anda copywriter salespage direct-response terbaik di Malaysia, pakar "Framework FSP 10%" (salespage conversion rate 10%).
Anda menulis untuk E-Syifa' — produk & servis ikhtiar berasaskan Ruqyah Syar'iyyah (Al-Quran & Sunnah).

Aliran psikologi FSP: Sedar masalah → Rasa takut → Percaya penyelesaian → Yakin produk → Ambil tindakan.

GAYA BAHASA:
- Bahasa Melayu Malaysia harian yang mesra & mudah (macam bercakap dengan kakak/abang), ayat pendek, terus ke point.
- Spesifik & bergambar (situasi sebenar: "jam 3 pagi terjaga dada sesak"), bukan umum.
- Emoji secukupnya (👇🏻 ✅ 😣), jangan berlebihan.
- Dalam headline, balut frasa penyelesaian / nama produk dengan **...** untuk warna sorotan (maksimum 1 sorotan setiap medan).

PERATURAN WAJIB (patuh 100%):
1. Guna HANYA fakta produk yang diberi. JANGAN reka harga, bahan, kajian, statistik, nama pakar/ustaz, sijil, bilangan pelanggan atau tawaran yang tiada dalam fakta.
2. JANGAN tulis testimoni, nama pelanggan atau petikan "kata pelanggan" — testimoni sebenar dipapar berasingan oleh HQ.
3. Bahasa IKHTIAR: "ikhtiar", "dengan izin Allah", "in shaa Allah", "bantu legakan". DILARANG: "dijamin sembuh", "sembuh 100%", "pasti", janji kesembuhan, dakwaan merawat penyakit kronik/kritikal (kanser, diabetes, dll), atau suruh berhenti ubat/rawatan doktor. Kesembuhan hanya daripada Allah.
4. Tiada unsur syirik, khurafat atau menakut-nakutkan secara melampau. Fears = akibat realistik jika masalah dibiarkan.
5. Semua copy MESTI selari dengan angle & audience marketer — setiap section sambung cerita yang sama.
6. Patuhi had aksara setiap medan.`;

const SECTION_RULES = {
  announcement: 'Satu ayat pendek untuk bar atas: kelebihan utama / tawaran yang BENAR dari fakta (COD, FPX, pos, pakej) + emoji.',
  hero: `Above-the-fold — tentukan sama ada prospek terus scroll.
- headline (H1): ikut JENIS HOOK yang dipilih. Formula asas: "[Testimoni terbaik] / [3 masalah utama] yang dah lega lepas guna [produk]". Balut bahagian penyelesaian dengan **...**.
- sub (H4): apa yang prospek akan RASA/ALAMI selepas guna (gambarkan hasil dalam kehidupan harian), boleh akhiri dengan 👇🏻.
- badge: nama produk ringkas + kategori.
- cta: teks butang beli (cth "👉🏻 BELI SEKARANG").`,
  problems: `Agitate masalah — buat prospek rasa "Ini pasal aku!".
- title: 3 masalah utama yang audience lalui setiap hari (akhiri dengan ..).
- story: cerita situasi & struggle harian, termasuk "dah cuba macam-macam tapi tak lega".
- lead: "Anda ada masalah ni? 👇🏻" atau seumpama.
- items: TEPAT 6 masalah — ayat pendek, spesifik ikut angle.`,
  fears: `Agitate lebih dalam — "kalau tak selesai, ini yang akan jadi".
- title: amaran supaya beri perhatian sebab perkara ini boleh melarat.
- desc: worst case yang prospek tak mahu berlaku (kepada diri, keluarga, ibadah, kerja).
- items: 3 akibat realistik jika dibiarkan (title pendek + text 1-2 ayat).`,
  solution: `Perkenalkan penyelesaian.
- headline: "[Nama produk] bantu [selesaikan masalah 1, 2 & 3]" — balut nama produk dengan **...**.
- desc: hasil / impak yang dijangka selepas guna (bahasa ikhtiar).
- points: 3-4 sebab ringkas kenapa produk ini jawapannya — guna FAKTA produk (cara ia berfungsi, kelebihan).`,
  benefits: `Senarai manfaat — "ini semua yang anda dapat".
- title: "[N] Manfaat [Nama Produk] untuk bantu anda [capai goal 1 & 2]" — N mesti sama dengan bilangan items.
- items: 8 manfaat (6-10). Setiap satu: hasil + konteks harian, dikaitkan dengan angle. Hanya berdasarkan fakta produk.`,
  goals: `Gambarkan kehidupan SELEPAS guna produk.
- title: ajak prospek bayangkan hidup selepas amalkan produk.
- items: 4-5 perubahan positif (emosi, keluarga, ibadah, tidur, kerja) ikut angle.`,
  cta: `Tolakan terakhir tepat sebelum pakej & borang.
- headline: "Jangan tunggu lagi, [selesaikan masalah 1 & 2] dengan [Nama Produk] sekarang".
- desc: ajak pilih pakej sekarang (sebut COD/FPX jika ada dalam fakta). JANGAN sebut harga yang tiada dalam fakta.`,
  closing: `Penutup emosional di hujung SP.
- headline: ajak ambil langkah pertama untuk diri & keluarga.
- text: 2-3 ayat menyentuh hati ikut angle, ingatkan bahawa ikhtiar + doa, kesembuhan daripada Allah.
- cta: teks butang beli.`,
};

function angleText(productKey, angle) {
  const p = SP_PRODUCTS[productKey];
  const hook = HOOK_TYPES.find(h => h.key === angle?.hook);
  const tone = TONES.find(t => t.key === angle?.tone);
  return `PRODUK: ${p.label}
FAKTA PRODUK (satu-satunya sumber fakta):
${p.facts}

ANGLE MARKETER:
- Target audience: ${angle?.audience || '-'}
- Masalah utama yang ditonjolkan: ${angle?.problem || '-'}
- Jenis hook: ${hook ? `${hook.label} — contoh formula: "${hook.hint}"` : '-'}
- Nada: ${tone?.label || 'Lembut & empati'}
- Cerita / maklumat tambahan marketer: ${angle?.story || '-'}`;
}

export const BRIEF_SCHEMA = {
  type: 'object',
  properties: {
    core_message: { type: 'string', description: 'Mesej teras SP dalam 1 ayat' },
    audience: { type: 'string', description: 'Ringkasan siapa audience & situasi mereka' },
    pains: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 6, description: 'Masalah/pain utama ikut angle (paling sakit dahulu)' },
    fears: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4, description: 'Ketakutan jika dibiarkan' },
    goals: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5, description: 'Impian / hasil yang audience mahu' },
    voice: { type: 'string', description: 'Panduan nada & gaya bahasa untuk semua section' },
    meta_title: { type: 'string', description: 'Tajuk tab browser SP (maks 70 aksara)' },
    meta_description: { type: 'string', description: 'Deskripsi ringkas SP (maks 160 aksara)' },
  },
  required: ['core_message', 'audience', 'pains', 'fears', 'goals', 'voice', 'meta_title', 'meta_description'],
};

export function briefPrompt(productKey, angle) {
  return `${angleText(productKey, angle)}

TUGAS: Rangka STRATEGI angle untuk salespage FSP ini (belum tulis copy penuh). Kenal pasti mesej teras, pain, fears & goals audience yang paling relevan dengan angle di atas. Hantar melalui tool.`;
}

export function sectionPrompt(productKey, angle, brief, key, { current, instruction } = {}) {
  const def = ANGLE_SECTIONS[key];
  const base = `${angleText(productKey, angle)}

STRATEGI ANGLE (pegang ini untuk konsisten dengan section lain):
${JSON.stringify(brief || {}, null, 1)}

SECTION: ${def.fsp} ${def.label}
PANDUAN FSP:
${SECTION_RULES[key]}`;
  if (current) {
    return `${base}

VERSI SEMASA (yang marketer mahu ubah):
${JSON.stringify(current, null, 1)}

ARAHAN MARKETER: ${instruction || 'Tulis semula supaya lebih kuat & menarik.'}
TUGAS: Tulis semula section ini ikut arahan marketer, kekalkan peraturan wajib. Hantar melalui tool.`;
  }
  return `${base}

TUGAS: Tulis copy untuk section ini sahaja. Hantar melalui tool.`;
}
