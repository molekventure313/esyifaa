// SP Generator — schema section (Framework FSP 10%). Selamat untuk client & server.
// Satu definisi untuk: output AI (JSON schema), editor (medan boleh edit) & renderer.
//
// Section ANGLE (ditulis AI / marketer): announcement, hero, problems, fears, solution, benefits, goals, cta, closing
// Section HQ (dikunci, terus dari SP HQ produk): testimoni, authority, fungsi elemen, cara guna, perbandingan,
//   jaminan, borang checkout, WhatsApp, FAQ — harga / fakta / testimoni kekal sama seperti SP HQ.

const str = (max, description) => ({ type: 'string', max, description });
const list = (item, min, max, description) => ({ type: 'list', item, min, max, description });

export const ANGLE_SECTIONS = {
  announcement: {
    label: 'Announcement Bar', fsp: '#1',
    fields: { text: str(90, 'Satu ayat pendek: kelebihan utama/offer + emoji (cth: COD & FPX disediakan 👍🏻)') },
  },
  hero: {
    label: 'Hero Banner', fsp: '#2', image: 'image',
    fields: {
      badge:    str(70, 'Label kecil atas headline: nama produk ringkas + kategori'),
      headline: str(170, 'H1 ikut formula FSP: [testimoni terbaik / 3 masalah utama] yang dah lega. Balut frasa penyelesaian dengan **...** untuk warna sorotan'),
      sub:      str(320, 'H4: apa yang prospek akan RASA/ALAMI selepas guna produk'),
      cta:      str(45, 'Teks butang (cth: 👉🏻 BELI SEKARANG)'),
    },
  },
  problems: {
    label: 'Masalah', fsp: '#4',
    fields: {
      title: str(130, 'H1: 3 masalah utama yang audience lalui setiap hari'),
      story: str(420, 'H4: cerita situasi & struggle harian yang berkaitan'),
      lead:  str(60, 'Ayat pengantar senarai (cth: Anda ada masalah ni? 👇🏻)'),
      items: list(str(95), 6, 6, '6 masalah — ayat pendek, spesifik, "ini pasal aku"'),
    },
  },
  fears: {
    label: 'Ketakutan (Fears)', fsp: '#5',
    fields: {
      title: str(130, 'Amaran: sila beri perhatian sebab perkara ini boleh melarat'),
      desc:  str(320, 'Worst case yang prospek takut jadi kalau dibiarkan'),
      items: list({ title: str(70), text: str(200) }, 3, 3, '3 akibat jika dibiarkan'),
    },
  },
  solution: {
    label: 'Penyelesaian', fsp: '#7', image: 'image',
    fields: {
      headline: str(170, '[Nama produk] bantu [selesaikan masalah 1, 2 & 3]. Balut nama produk dengan **...**'),
      desc:     str(320, 'Expected results / impak lepas guna'),
      points:   list(str(110), 3, 4, '3-4 sebab ringkas kenapa produk ini jawapannya (fakta produk sahaja)'),
    },
  },
  benefits: {
    label: 'Manfaat', fsp: '#8',
    fields: {
      title: str(130, '[N] Manfaat [Nama Produk] untuk bantu anda [capai goal 1 & 2]'),
      items: list(str(140), 6, 10, '8 manfaat (6-10) — dikaitkan dengan angle'),
    },
  },
  goals: {
    label: 'Goals', fsp: '#10',
    fields: {
      title: str(110, 'Bayangkan hidup anda selepas ...'),
      items: list(str(110), 4, 5, '4-5 perubahan positif selepas guna'),
    },
  },
  cta: {
    label: 'CTA (atas borang)', fsp: '#15',
    fields: {
      headline: str(150, 'Jangan tunggu lagi, [selesaikan masalah 1 & 2] dengan [Nama Produk] sekarang'),
      desc:     str(200, 'Pilih pakej anda sekarang sementara harga promosi masih berlangsung!'),
    },
  },
  closing: {
    label: 'Penutup', fsp: '',
    fields: {
      headline: str(140, 'Penutup emosional — ajak ambil langkah pertama'),
      text:     str(320, '2-3 ayat menyentuh hati ikut angle'),
      cta:      str(45, 'Teks butang'),
    },
  },
};

export const ANGLE_KEYS = Object.keys(ANGLE_SECTIONS);

// Susunan penuh SP (ikut aliran psikologi FSP). type: 'angle' | 'hq'
export const SLOTS = [
  { key: 'announcement', type: 'angle' },
  { key: 'hero',         type: 'angle' },
  { key: 'testimoni1',   type: 'hq', label: 'Testimoni Part 1', fsp: '#3' },
  { key: 'problems',     type: 'angle' },
  { key: 'fears',        type: 'angle' },
  { key: 'authority',    type: 'hq', label: 'Authority / Dalil', fsp: '#6' },
  { key: 'solution',     type: 'angle' },
  { key: 'benefits',     type: 'angle' },
  { key: 'extra',        type: 'hq', label: 'Info Produk', fsp: '' },
  { key: 'fungsi',       type: 'hq', label: 'Fungsi Elemen', fsp: '#9' },
  { key: 'goals',        type: 'angle' },
  { key: 'howto',        type: 'hq', label: 'Cara Guna', fsp: '#11' },
  { key: 'testimoni2',   type: 'hq', label: 'Testimoni Part 2', fsp: '#12' },
  { key: 'comparison',   type: 'hq', label: 'Perbandingan / COD', fsp: '#13' },
  { key: 'guarantee',    type: 'hq', label: 'Jaminan', fsp: '#14' },
  { key: 'cta',          type: 'angle' },
  { key: 'checkout',     type: 'hq', label: 'Pakej & Borang Tempahan', fsp: '#15' },
  { key: 'whatsapp',     type: 'hq', label: 'Order WhatsApp', fsp: '#16' },
  { key: 'faq',          type: 'hq', label: 'FAQ', fsp: '#17' },
  { key: 'closing',      type: 'angle' },
];

// Slot yang TAK boleh disembunyikan (teras SP)
export const REQUIRED_SLOTS = ['hero', 'checkout'];

export const HOOK_TYPES = [
  { key: 'testimoni', label: 'Testimoni',     hint: 'Alhamdulillah [masalah] lega lepas guna [produk]' },
  { key: 'soalan',    label: 'Soalan + Pain', hint: 'Suka [aktiviti] tapi [masalah] halang?' },
  { key: 'direct',    label: 'Direct',        hint: '[Produk] ikhtiar terbaik untuk [masalah]' },
  { key: 'caraguna',  label: 'Cara Guna',     hint: 'Cuma amalkan [produk], [masalah] kembali lega' },
  { key: 'offer',     label: 'Offer',         hint: 'Promosi / COD / pos — tonjolkan tawaran' },
];

export const TONES = [
  { key: 'lembut', label: 'Lembut & empati' },
  { key: 'tegas',  label: 'Tegas & mendesak' },
  { key: 'santai', label: 'Santai & mesra' },
];

// Input angle marketer (dibersihkan)
export function cleanAngle(a = {}) {
  const s = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
  return {
    audience: s(a.audience, 300),
    problem:  s(a.problem, 600),
    hook:     HOOK_TYPES.some(h => h.key === a.hook) ? a.hook : 'testimoni',
    tone:     TONES.some(t => t.key === a.tone) ? a.tone : 'lembut',
    story:    s(a.story, 1200),
  };
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$/;
export const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

// ─── JSON Schema untuk output AI (tool input_schema) ────────────────────────
function toJsonSchema(def) {
  if (def.type === 'string') return { type: 'string', description: [def.description, `maks ${def.max} aksara`].filter(Boolean).join(' — ') };
  if (def.type === 'list') {
    return { type: 'array', description: def.description, minItems: def.min, maxItems: def.max, items: toJsonSchema(def.item.type ? def.item : { type: 'object', fields: def.item }) };
  }
  // objek: { title: str(), text: str() }
  const fields = def.fields || def;
  return {
    type: 'object',
    properties: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toJsonSchema(v)])),
    required: Object.keys(fields),
  };
}

export function sectionJsonSchema(key) {
  return toJsonSchema({ type: 'object', fields: ANGLE_SECTIONS[key].fields });
}

// ─── Sanitasi (simpan HANYA medan yang dikenali, potong panjang) ─────────────
function clean(def, v) {
  if (def.type === 'string') return typeof v === 'string' ? v.replace(/\r/g, '').slice(0, def.max * 2).trim() : '';
  if (def.type === 'list') {
    const arr = Array.isArray(v) ? v : [];
    return arr.slice(0, Math.max(def.max, 12)).map(x => clean(def.item.type ? def.item : { type: 'object', fields: def.item }, x));
  }
  const fields = def.fields || def;
  const o = v && typeof v === 'object' ? v : {};
  return Object.fromEntries(Object.entries(fields).map(([k, d]) => [k, clean(d, o[k])]));
}

// Gambar dibenarkan: aset dalam /images/ atau bucket sp-images Supabase sahaja
export function isAllowedImage(url, supabaseUrl) {
  if (!url) return true;
  if (typeof url !== 'string' || url.length > 500) return false;
  if (/^\/images\/[\w\-./ ]+$/.test(url) && !url.includes('..')) return true;
  return !!supabaseUrl && url.startsWith(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/sp-images/`);
}

export function sanitizeContent(raw, supabaseUrl) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  for (const key of ANGLE_KEYS) {
    const def = ANGLE_SECTIONS[key];
    out[key] = clean({ type: 'object', fields: def.fields }, c[key]);
    if (def.image) {
      const img = c[key]?.image;
      out[key].image = img && isAllowedImage(img, supabaseUrl) ? img : null;
    }
  }
  const slotKeys = SLOTS.map(s => s.key);
  out.hidden = (Array.isArray(c.hidden) ? c.hidden : []).filter(k => slotKeys.includes(k) && !REQUIRED_SLOTS.includes(k));
  out.meta = {
    title:       typeof c.meta?.title === 'string' ? c.meta.title.slice(0, 120) : '',
    description: typeof c.meta?.description === 'string' ? c.meta.description.slice(0, 220) : '',
  };
  // Ringkasan strategi angle dari AI (dipakai semula bila tulis semula section)
  out.brief = c.brief && typeof c.brief === 'object' && JSON.stringify(c.brief).length <= 10000 ? c.brief : null;
  return out;
}

// Pecah teks "**sorotan**" → [{ text, hl }]
export function splitHighlight(text) {
  return String(text || '').split(/\*\*(.+?)\*\*/g).map((t, i) => ({ text: t, hl: i % 2 === 1 })).filter(p => p.text);
}
