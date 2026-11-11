// Semakan maklumat penghantaran (nama, telefon, alamat) — dikongsi checkout, senarai order & push NinjaVan.
// Tiada import server — selamat dipakai di klien.
//
// errors   → NinjaVan pasti tolak / parcel tak boleh dihantar (push disekat)
// warnings → mungkin salah (cth poskod tak sepadan negeri) — admin semak, push masih dibenarkan

export const NEGERI = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Wilayah Persekutuan Kuala Lumpur', 'Wilayah Persekutuan Labuan',
  'Wilayah Persekutuan Putrajaya',
];

// Julat poskod Malaysia (2 digit pertama) → negeri. Kawasan sempadan boleh bertindih (sebab itu amaran sahaja).
const PREFIX = [
  [[1, 2], ['Perlis']],
  [[5, 9], ['Kedah', 'Pulau Pinang']],
  [[10, 14], ['Pulau Pinang', 'Kedah']],
  [[15, 18], ['Kelantan']],
  [[20, 24], ['Terengganu']],
  [[25, 28], ['Pahang']],
  [[30, 36], ['Perak']],
  [[39, 39], ['Pahang']],
  [[40, 48], ['Selangor']],
  [[49, 49], ['Pahang', 'Selangor']],
  [[50, 61], ['Wilayah Persekutuan Kuala Lumpur', 'Selangor']],
  [[62, 62], ['Wilayah Persekutuan Putrajaya']],
  [[63, 68], ['Selangor', 'Wilayah Persekutuan Kuala Lumpur', 'Negeri Sembilan', 'Wilayah Persekutuan Putrajaya']],
  [[69, 69], ['Pahang']],
  [[70, 73], ['Negeri Sembilan']],
  [[75, 78], ['Melaka', 'Negeri Sembilan', 'Johor']],
  [[79, 86], ['Johor']],
  [[87, 87], ['Wilayah Persekutuan Labuan']],
  [[88, 91], ['Sabah']],
  [[93, 98], ['Sarawak']],
];

/** Normalkan nama negeri (cth "KL", "P. Pinang", "N9", "wp kuala lumpur") → nama dalam NEGERI, atau '' */
export function normalizeNegeri(s) {
  const t = String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const alias = {
    'kl': 'Wilayah Persekutuan Kuala Lumpur', 'kuala lumpur': 'Wilayah Persekutuan Kuala Lumpur',
    'wp kuala lumpur': 'Wilayah Persekutuan Kuala Lumpur', 'wilayah persekutuan': 'Wilayah Persekutuan Kuala Lumpur',
    'w p kuala lumpur': 'Wilayah Persekutuan Kuala Lumpur', 'wp kl': 'Wilayah Persekutuan Kuala Lumpur',
    'labuan': 'Wilayah Persekutuan Labuan', 'wp labuan': 'Wilayah Persekutuan Labuan',
    'putrajaya': 'Wilayah Persekutuan Putrajaya', 'wp putrajaya': 'Wilayah Persekutuan Putrajaya',
    'penang': 'Pulau Pinang', 'p pinang': 'Pulau Pinang', 'pinang': 'Pulau Pinang', 'pulau pinang': 'Pulau Pinang',
    'n sembilan': 'Negeri Sembilan', 'n': 'Negeri Sembilan', 'ns': 'Negeri Sembilan', 'negeri sembilan': 'Negeri Sembilan',
    'malacca': 'Melaka', 'johore': 'Johor', 'trengganu': 'Terengganu',
  };
  if (alias[t]) return alias[t];
  return NEGERI.find(n => n.toLowerCase() === t) || NEGERI.find(n => t.includes(n.toLowerCase())) || '';
}

/** Negeri yang mungkin bagi poskod (pertama = paling biasa) */
export function negeriForPoskod(poskod) {
  if (!/^\d{5}$/.test(String(poskod || ''))) return [];
  const p = parseInt(String(poskod).slice(0, 2), 10);
  return PREFIX.find(([[a, b]]) => p >= a && p <= b)?.[1] || [];
}

/** Telefon → digit format 60XXXXXXXXX (sama format simpanan order) */
export function normalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = `6${d}`;
  else if (d.startsWith('1')) d = `60${d}`;
  return d;
}

/** Telefon Malaysia sah: mudah alih 01x (9–10 digit selepas 0) atau talian tetap 0x */
export function phoneIssue(phone) {
  const d = normalizePhone(phone);
  if (!d) return 'Tiada nombor telefon';
  if (!d.startsWith('60')) return 'Nombor telefon bukan Malaysia (mesti 60 / 01…)';
  const local = d.slice(2);
  if (local.startsWith('1')) return local.length >= 9 && local.length <= 10 ? null : 'Nombor telefon tak lengkap / terlebih digit';
  return local.length >= 8 && local.length <= 9 ? null : 'Nombor telefon tak lengkap / terlebih digit';
}

/** Pecah alamat gabungan "jalan, poskod, daerah, negeri" (format checkout) */
export function splitAddress(combined) {
  const text = String(combined || '');
  const parts = text.split(',').map(p => p.trim()).filter(Boolean);
  const idx = parts.findIndex(p => /^\d{5}$/.test(p));
  if (idx === -1) {
    const m = text.match(/\b(\d{5})\b/);   // poskod di tengah teks (alamat lama satu medan)
    return { street: text.trim(), poskod: m?.[1] || '', daerah: '', negeri: '', structured: false };
  }
  return { street: parts.slice(0, idx).join(', '), poskod: parts[idx], daerah: parts[idx + 1] || '', negeri: parts.slice(idx + 2).join(', '), structured: true };
}

export const joinAddress = ({ street, poskod, daerah, negeri }) =>
  [street, poskod, daerah, negeri].map(s => String(s || '').trim().replace(/\s*,\s*$/, '')).filter(Boolean).join(', ');

/**
 * Semak maklumat penghantaran.
 * @param {{ full_name?: string, phone?: string, address?: string }} o
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function checkShipping(o) {
  const errors = [], warnings = [];
  const name = String(o.full_name || '').trim();
  if (name.length < 2) errors.push('Nama penerima kosong');

  const ph = phoneIssue(o.phone);
  if (ph) (/bukan Malaysia/.test(ph) ? warnings : errors).push(ph);

  const addr = String(o.address || '').trim();
  const a = splitAddress(addr);
  // Poskod lain dalam alamat — abaikan nombor lot / rumah (Lot 14122, No. 12157, PT 16213, Batu 10…)
  const codes = [...new Set([...addr.matchAll(/(^|[^\w])(\d{5})(?![\dA-Za-z])/g)]
    .filter(m => !/(lot|no|pt|ptd|ptb|nombor|unit|blok|block|batu|bt|km|jkr|hs\(d\)|grn|#)[\s.:,-]*$/i.test(addr.slice(Math.max(0, m.index - 8), m.index + m[1].length)))
    .map(m => m[2]))];
  if (a.poskod && !codes.includes(a.poskod)) codes.push(a.poskod);
  if (!addr) errors.push('Tiada alamat');
  else if (!a.structured) errors.push(codes.length ? 'Poskod tidak berada di ruang poskod — susun semula alamat' : 'Alamat tiada poskod 5 digit');
  else {
    if (a.street.replace(/[^a-z0-9]/gi, '').length < 6) errors.push('Alamat jalan terlalu pendek');
    if (!a.daerah) warnings.push('Tiada bandar / daerah');
    else if (/^\d[\d\s]*$/.test(a.daerah)) warnings.push(`Bandar / daerah berupa nombor ("${a.daerah}")`);
    const neg = normalizeNegeri(a.negeri);
    if (!a.negeri) errors.push('Tiada negeri');
    else if (!neg) warnings.push(`Negeri tidak dikenali: "${a.negeri}"`);
    if (codes.length > 1) warnings.push(`Lebih dari satu poskod dalam alamat (${codes.join(', ')})`);
    const allowed = negeriForPoskod(a.poskod);
    if (!allowed.length) errors.push(`Poskod ${a.poskod} tidak wujud di Malaysia`);
    else if (neg && !allowed.includes(neg)) warnings.push(`Poskod ${a.poskod} biasanya ${allowed[0]}, bukan ${neg}`);
  }
  return { errors, warnings };
}

// ─── Checkout (borang SP) ───────────────────────────────────────────────────

/** onChange poskod: digit sahaja (maks 5) + isi / betulkan negeri automatik. Pulang patch formData. */
export function poskodPatch(value, currentNegeri) {
  const poskod = String(value || '').replace(/\D/g, '').slice(0, 5);
  const opts = negeriForPoskod(poskod);
  return opts.length && !opts.includes(currentNegeri) ? { poskod, negeri: opts[0] } : { poskod };
}

/** Semakan sebelum hantar order — pulang mesej untuk pelanggan, atau null */
export function checkoutIssue({ dialCode = '+60', phone, poskod, negeri }) {
  if (String(dialCode).replace(/\D/g, '') === '60') {
    const local = String(phone || '').replace(/\D/g, '').replace(/^60/, '').replace(/^0+/, '');
    if (local.length < 8 || local.length > 10) return 'Nombor telefon tidak lengkap — semak semula (cth: 0123456789).';
  }
  const p = String(poskod || '').trim();
  if (!/^\d{5}$/.test(p)) return 'Poskod mesti 5 digit nombor (cth: 81300).';
  const opts = negeriForPoskod(p);
  if (!opts.length) return `Poskod ${p} tidak sah — sila semak semula.`;
  if (negeri && !opts.includes(negeri)) return `Poskod ${p} adalah untuk ${opts.join(' / ')} — sila semak poskod atau negeri anda.`;
  return null;
}

/** Ringkasan satu baris untuk paparan / rekod */
export const shippingIssueText = r => [...r.errors, ...r.warnings].join(' · ');
