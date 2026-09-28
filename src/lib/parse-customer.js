// Smart Entry — pecahkan maklumat pelanggan yang ditampal dari WhatsApp kepada medan borang.
// Berjalan di browser sahaja (tiada AI / tiada hantar data). Hasil MESTI disemak manusia.
//
// Contoh input:
//   Pn Mas Yusof
//   20 Jln Pulai 36
//   Taman Pulai Utama
//   81300 Skudai
//   Johor
//   0137525609
//
// → { full_name, phone, street, poskod, daerah, negeri }

import { MY_STATES } from '@/lib/packages';

// Alias negeri → nama rasmi (sama dgn MY_STATES borang)
const STATE_ALIASES = [
  [/\b(w\.?\s*p\.?\s*)?kuala\s*lumpur\b|\bk\.?\s*l\b/i, 'Wilayah Persekutuan Kuala Lumpur'],
  [/\b(w\.?\s*p\.?\s*)?putrajaya\b/i, 'Wilayah Persekutuan Putrajaya'],
  [/\b(w\.?\s*p\.?\s*)?labuan\b/i, 'Wilayah Persekutuan Labuan'],
  [/\b(pulau\s*pinang|p\.?\s*pinang|penang)\b/i, 'Pulau Pinang'],
  [/\b(negeri\s*sembilan|n\.?\s*sembilan|n9)\b/i, 'Negeri Sembilan'],
  [/\b(melaka|malacca)\b/i, 'Melaka'],
  [/\bjohor\b(?!\s*bahru)|\bjohore\b/i, 'Johor'],   // 'Johor Bahru' = daerah, bukan negeri
  ...MY_STATES
    .filter(s => !/Wilayah|Pulau Pinang|Negeri Sembilan|Melaka|Johor/.test(s))
    .map(s => [new RegExp(`\\b${s.replace(/\s+/g, '\\s*')}\\b`, 'i'), s]),
];

// Label biasa di depan nilai: "Nama:", "No tel:", "Alamat -", ...
const LABEL_RE = /^\s*(nama(\s*penuh)?|name|no\.?\s*(tel(efon)?|hp|phone|fon|wa|whatsapp)|tel(efon)?|phone|hp|whatsapp|wa|alamat(\s*penuh)?|address|poskod|postcode|daerah|bandar|city|negeri|state)\s*[:\-=]\s*/i;

const PHONE_RE = /(\+?6?0?1[0-9][\s\-.]?\d{3,4}[\s\-.]?\d{4})/;
const POSKOD_RE = /\b(\d{5})\b/;

const clean = s => s.replace(LABEL_RE, '').replace(/\s+/g, ' ').replace(/^[,.\s]+|[,.\s]+$/g, '').trim();

function findState(text) {
  for (const [re, name] of STATE_ALIASES) {
    const m = text.match(re);
    // without: teks tanpa padanan (ikut kedudukan sebenar — bukan replace() yang buang padanan pertama)
    if (m) return { name, match: m[0], without: text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length) };
  }
  return null;
}

export function parseCustomerText(raw) {
  const result = { full_name: '', phone: '', street: '', poskod: '', daerah: '', negeri: '' };
  if (!raw || !raw.trim()) return result;

  // Baris → kalau semua dalam satu baris, pecah ikut koma
  let lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 1) lines = lines[0].split(/\s*,\s*/).filter(Boolean);

  // Label eksplisit dikenal pasti dahulu
  const taken = new Set();
  lines.forEach((l, i) => {
    const m = l.match(LABEL_RE);
    if (!m) return;
    const key = m[1].toLowerCase();
    const val = clean(l);
    if (!val) return;
    if (/^(nama|name)/.test(key) && !result.full_name) { result.full_name = val; taken.add(i); }
  });

  // Telefon
  lines.forEach((l, i) => {
    if (result.phone || taken.has(i)) return;
    const m = l.replace(LABEL_RE, '').match(PHONE_RE);
    if (!m) return;
    result.phone = m[1].replace(/[^\d+]/g, '');
    const rest = clean(l.replace(LABEL_RE, '').replace(m[1], ''));
    if (rest) lines[i] = rest; else taken.add(i);
  });

  // Poskod (+ daerah pada baris sama, cth: "81300 Skudai" / "81300 Skudai, Johor")
  let poskodIdx = -1;
  lines.forEach((l, i) => {
    if (result.poskod || taken.has(i)) return;
    const m = clean(l).match(POSKOD_RE);
    if (!m) return;
    result.poskod = m[1];
    poskodIdx = i;
    let rest = clean(l).replace(m[1], ' ');
    const st = findState(rest);
    if (st) { result.negeri = st.name; rest = st.without; }
    rest = clean(rest.replace(/,/g, ' '));
    if (rest) result.daerah = rest;
    else if (st) result.daerah = clean(st.match);   // cth: "53000 Kuala Lumpur" — daerah = nama negeri
    taken.add(i);
  });

  // Negeri pada baris sendiri
  if (!result.negeri) {
    lines.forEach((l, i) => {
      if (result.negeri || taken.has(i)) return;
      const c = clean(l);
      const st = findState(c);
      if (st && clean(st.without).length <= 2) { result.negeri = st.name; taken.add(i); }
    });
  }

  // Daerah pada baris selepas poskod (kalau poskod bersendirian)
  if (!result.daerah && poskodIdx >= 0) {
    const next = poskodIdx + 1;
    if (next < lines.length && !taken.has(next) && !/\d/.test(lines[next])) {
      result.daerah = clean(lines[next]);
      taken.add(next);
    }
  }

  // Nama: baris pertama yang tinggal tanpa nombor (biasanya baris pertama)
  if (!result.full_name) {
    const i = lines.findIndex((l, idx) => !taken.has(idx) && !/\d/.test(l));
    if (i >= 0) { result.full_name = clean(lines[i]); taken.add(i); }
  }

  // Alamat jalan: semua baris selebihnya
  result.street = lines.filter((_, i) => !taken.has(i)).map(clean).filter(Boolean).join(', ');

  // "Johor Bahru" tanpa negeri → Johor
  if (!result.negeri && /johor\s*bahru/i.test(raw)) result.negeri = 'Johor';

  // Negeri lain yang masih tiada — tidak diteka dari poskod (biar manusia pilih)
  return result;
}
