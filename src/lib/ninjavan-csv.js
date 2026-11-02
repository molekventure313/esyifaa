// CSV NinjaVan (bulk upload) — dikongsi export HQ & export Fighter (akaun NinjaVan sendiri).
// Order = rekod gaya submissions (source, problem, notes, qty, address, phone, payment_type, amount_paid).
import { productOf } from '@/lib/products';
import { addonQtyOf, orderQty } from '@/lib/marketer-calc';

export const HQ_SHIPPER_ORDER_NO = '10198183';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse combined address string → { street, poskod, daerah, negeri }
 *  Format from SabunCheckoutForm: "No. 12, Jln Setia 3, 81300, Skudai, Johor"
 */
export function parseAddressParts(combined) {
  if (!combined) return { street: '', poskod: '', daerah: '', negeri: '' };

  const parts = combined.split(',').map(p => p.trim()).filter(Boolean);

  // Find poskod — 5-digit number
  const poskodIdx = parts.findIndex(p => /^\d{5}$/.test(p));

  if (poskodIdx === -1) {
    // Old single-field format — put everything in street
    return { street: combined, poskod: '', daerah: '', negeri: '' };
  }

  return {
    street:  parts.slice(0, poskodIdx).join(', '),
    poskod:  parts[poskodIdx],
    daerah:  parts[poskodIdx + 1] || '',
    negeri:  parts[poskodIdx + 2] || '',
  };
}

/** Alamat order — kolum dedicated (order baru), fallback parse dari problem text (order lama:
 *  "Alamat: No 12, Jln..., 81300, Skudai, Johor | Pakej: ...") */
export function addressStringOf(s) {
  if (s.address) return s.address;
  const alamatMatch = (s.problem || '').match(/Alamat:\s*([^|]+)/);
  return alamatMatch ? alamatMatch[1].trim() : '';
}

/** Format phone to Malaysian format: 0123456789 (strip +60) */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60')) return '0' + digits.slice(2);
  if (digits.startsWith('0')) return digits;
  return digits;
}

/** Kuantiti — lihat orderQty (lib/marketer-calc): teks pakej dulu, column qty fallback */
const parseQuantity = orderQty;

// Nama produk dalam column UNIT (label parcel untuk packing)
const UNIT_NAMES = {
  'sabun-garam':      'Sabun Garam Himalaya ESyifaa (200g)',
  'garam-pengasihan': 'Garam Pengasihan Masakan ESyifaa (250g)',
  'kasturi-kijang':   "Minyak Kasturi Kijang E-Syifa'",
};
const UNIT_WORD = { 'sabun-garam': 'UNIT', 'garam-pengasihan': 'PEK', 'kasturi-kijang': 'BOTOL' };
const ADDON_LINES = {
  sabun:   ['sabun-garam',      '+ Sabun Garam Himalaya (200g)'],
  kasturi: ['kasturi-kijang',   "+ Kasturi Kijang E-Syifa'"],
  garam:   ['garam-pengasihan', '+ Garam Pengasihan Masakan (250g)'],
  kasturiGift: [null,          "+ Kasturi Kijang E-Syifa' (FREE GIFT)"],
};

/** Column UNIT: produk utama + qty + add-on (ikut produk sebenar order, bukan sentiasa sabun) */
export function unitCellOf(s) {
  const main = productOf(s.source) || 'sabun-garam';   // COD lama tanpa source → sabun
  const q = addonQtyOf(s);
  const lines = [UNIT_NAMES[main], `${parseQuantity(s)} ${UNIT_WORD[main]}`];
  for (const [flag, [key, line]] of Object.entries(ADDON_LINES)) {
    if (q[flag] && key !== main) lines.push(q[flag] > 1 ? `${line} x${q[flag]}` : line);
  }
  return lines.join('\n');
}

/** Generate NinjaVan CSV string from array of submission records */
export function generateNinjaVanCSV(orders, shipperNo = HQ_SHIPPER_ORDER_NO) {
  const headers = [
    'REQUESTED TRACKING NUMBER', 'NAME', 'CONTACT', 'ADDRESS',
    'STATE', 'CITY', 'POSTCODE', 'WEIGHT(KG)', 'SHIPPER ORDER NO',
    'PAYMENT METHOD', 'UNIT', '', 'CASH ON DELIVERY',
  ];

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yy = String(today.getFullYear()).slice(-2);

  const rows = orders.map((s, index) => {
    // A: Tracking number — DDMMYYXX
    const tracking = `${dd}${mm}${yy}${String(index % 100).padStart(2, '0')}`;

    const addr = parseAddressParts(addressStringOf(s));

    // C: Phone
    const phone = formatPhone(s.phone);

    // K: UNIT cell — produk sebenar + qty + add-on jika ada
    const unitCell = unitCellOf(s);

    // J: Payment method
    const paymentMethod = s.payment_type === 'cod'
      ? 'COD - Barang Sampai Baru Bayar'
      : 'FPX - Pembayaran Online';

    // M: Cash on delivery
    let codAmount = '0';
    if (s.payment_type === 'cod') {
      // Parse amount from amount_paid column or notes
      const amtParsed = s.amount_paid
        ? parseFloat(s.amount_paid)
        : (() => {
          const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
          return m ? parseFloat(m[1]) : 0;
        })();
      codAmount = amtParsed.toFixed(2);
    }

    return [
      tracking,          // A
      s.full_name || '', // B
      phone,             // C
      addr.street,       // D — jalan/rumah
      addr.daerah,       // E — header says STATE but actually bandar/daerah
      addr.negeri,       // F — header says CITY but actually negeri
      addr.poskod,       // G
      '1',               // H — weight (kg), tetap 1
      shipperNo,         // I
      paymentMethod,     // J
      unitCell,          // K
      '',                // L — kosong
      codAmount,         // M
    ];
  });

  const allRows = [headers, ...rows];

  // Wrap every cell in double-quotes; escape internal double-quotes as ""
  return allRows
    .map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\r\n');
}
