// Jenis pergerakan stok untuk paparan (client & server). Kombinasi movement_type + reference_type → satu "kind".
//   masuk          in / batch                    — stok masuk dari pembekal
//   keluar         out / order                   — order (auto)
//   return         return / return               — parcel COD return (auto)
//   rosak          out / adjustment, nota ROSAK  — stok rosak dari return
//   tolak          out / adjustment (lain)       — pelarasan tolak (kiraan fizikal / hilang)
//   tambah         return|in / adjustment        — pelarasan tambah (kiraan fizikal / terjumpa)
export const KINDS = {
  masuk:  { label: 'Stok masuk',     short: 'Masuk',  sign: 1,  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  keluar: { label: 'Keluar (order)', short: 'Keluar', sign: -1, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  return: { label: 'Return',         short: 'Return', sign: 1,  color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  rosak:  { label: 'Rosak',          short: 'Rosak',  sign: -1, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  tolak:  { label: 'Pelarasan −',    short: 'Pel. −', sign: -1, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  tambah: { label: 'Pelarasan +',    short: 'Pel. +', sign: 1,  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
};
export const KIND_KEYS = Object.keys(KINDS);

export function kindOf(m) {
  const t = m.movement_type, r = m.reference_type;
  if (r === 'adjustment') {
    if (t === 'out') return /^ROSAK/i.test(m.notes || '') ? 'rosak' : 'tolak';
    return 'tambah';
  }
  if (t === 'in') return 'masuk';
  if (t === 'return') return 'return';
  if (t === 'out') return 'keluar';
  return 'tambah';   // 'adjustment' lama — tidak dikira dalam baki
}

// Kesan pada baki (sama seperti view stock_summary: movement_type 'adjustment' = 0)
export const deltaOf = m => (m.movement_type === 'in' || m.movement_type === 'return' ? m.qty : m.movement_type === 'out' ? -m.qty : 0);

// Rekod manual yang boleh diedit / dipadam (sama dengan EDITABLE_TYPES di /api/stock/movements)
export const isManual = m => m.movement_type === 'in' || m.movement_type === 'adjustment' || (m.movement_type === 'return' && m.reference_type === 'adjustment');

export const PACKAGING_PREFIX = 'KTK-';
export const isPackaging = sku => String(sku || '').startsWith(PACKAGING_PREFIX);
export const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
