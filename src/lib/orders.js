import { PRODUCTS, productOf } from '@/lib/products';
import { orderQty, addonsOf } from '@/lib/marketer-calc';

const UNIT_WORD = { 'sabun-garam': 'Unit', 'garam-pengasihan': 'Pek', 'kasturi-kijang': 'Botol' };

// Padam order (COD/FPX) dengan bersih — dikongsi oleh admin (single + bulk) dan marketer.
//
// Stok: buang SEMUA stock_movements yang dirujuk order ini ('out' auto-deduct + 'return'),
// supaya kesan bersih order pada stok = 0. (Buang 'out' sahaja akan pulangkan stok
// dua kali untuk order yang dah di-return.)
export async function deleteOrders(adminClient, ids) {
  if (!ids.length) return;

  // Cases dulu (FK constraint)
  await adminClient.from('cases').delete().in('submission_id', ids);

  await adminClient
    .from('stock_movements')
    .delete()
    .in('reference_id', ids)
    .in('movement_type', ['out', 'return']);

  const { error } = await adminClient.from('submissions').delete().in('id', ids);
  if (error) throw error;
}

// Format satu order (submission) untuk paparan — dikongsi Pengurusan Order admin & Orders marketer.
// Alamat, label produk (pakej + add-on), amaun (amount_paid / [AMOUNT] dalam notes), info kes.
export function formatOrder(s) {
  const caseRecord = Array.isArray(s.cases) ? s.cases[0] : s.cases;

  // Extract address: guna column address (COD), atau parse dari problem field
  let displayAddress = s.address || null;
  if (!displayAddress && s.problem) {
    const m = s.problem.match(/Alamat:\s*(.+?)(?:\s*\||$)/i);
    if (m) displayAddress = m[1].trim();
  }

  // Label produk: produk utama + kuantiti (Unit/Pek/Botol) + add-on & hadiah — sama logik dgn label NinjaVan
  let produkLabel = null;
  const productKey = productOf(s.source) || (s.payment_type === 'cod' ? 'sabun-garam' : null);
  if (productKey) {
    const addons = addonsOf(s);
    produkLabel = `${PRODUCTS.find(p => p.key === productKey).label} — ${orderQty(s)} ${UNIT_WORD[productKey]}`;
    if (addons.kasturi && productKey !== 'kasturi-kijang') produkLabel += ' + Kasturi Kijang';
    if (addons.sabun   && productKey !== 'sabun-garam')    produkLabel += ' + Sabun Garam';
    if (addons.garam   && productKey !== 'garam-pengasihan') produkLabel += ' + Garam Masakan';
    if (addons.kasturiGift) produkLabel += ' + 🎁 Kasturi (Free Gift)';
  } else if (s.payment_type === 'fpx_payment') {
    produkLabel = (s.source || '').includes('pengisian') || (s.source || '').includes('fsp')
      ? 'Pengisian ESyifaa'
      : (s.source === 'e-video' ? 'E-Video' : (s.source || 'Produk digital'));
  }

  // Revenue for this record — parse dari notes (handle "RM95" COD & "MYR 95.00" FPX format)
  let amountDisplay = s.amount_paid ? parseFloat(s.amount_paid) : null;
  if (!amountDisplay && s.notes) {
    const m = s.notes.match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9]+(?:\.[0-9]+)?)\]/i);
    if (m) amountDisplay = parseFloat(m[1]);
  }

  return {
    id: s.id,
    full_name: s.full_name,
    phone: s.phone,
    address: displayAddress,
    problem: s.problem,
    source: s.source,
    payment_type: s.payment_type,
    payment_status: s.payment_status || 'pending',
    chip_bill_id: s.chip_bill_id,
    amount_paid: amountDisplay,
    produk_label: produkLabel,
    ninjavan_exported_at: s.ninjavan_exported_at || null,
    returned_at: s.returned_at || null,
    qty: orderQty(s),
    created_at: s.created_at,
    // Case info
    case_id: caseRecord?.id || null,
    case_status: caseRecord?.status || null,
    assigned_to: caseRecord?.assigned_to || null,
    practitioner_name: caseRecord?.practitioner?.full_name || null,
    marketer_id: s.marketer_id || null,
  };
}
