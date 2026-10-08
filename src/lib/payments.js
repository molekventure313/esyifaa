// Selesaikan order FPX — dikongsi oleh webhook CHIP (bayaran online) & mark-paid manual
// (pelanggan bayar melalui WhatsApp / transfer, marketer/admin sahkan di dashboard).
//
// Kes perawat TIDAK dicipta di sini — kes hanya untuk SP rawatan (borang lead, /api/submissions).

import { deductStock } from '@/lib/stock';
import { parseAmount, orderQty, addonsOf } from '@/lib/marketer-calc';
import { PRODUCTS, productOf } from '@/lib/products';
import { logActivity } from '@/lib/utils/logger';
import { isRuqyahHarian, RH_NAME } from '@/lib/ruqyah-harian';
import { sendGroupNotification, buildOrderMessage } from '@/lib/notifications/wasapbot';

// Label produk untuk notifikasi / log
export function productLabelOf(submission) {
  const key = productOf(submission.source);
  if (key) return PRODUCTS.find(p => p.key === key).label;
  if (isRuqyahHarian(submission.source)) return RH_NAME;
  return (submission.source || '').includes('pengisian') || (submission.source || '').includes('fsp')
    ? 'Pengisian ESyifaa' : (submission.source || 'Produk digital');
}

// Tolak stok untuk order produk fizikal (produk utama + add-on + hadiah percuma)
export async function deductOrderStock(supabase, submission, label) {
  if (!productOf(submission.source)) return;   // produk digital — tiada stok
  const ref = submission.id;
  await deductStock({ adminClient: supabase, source: submission.source, qty: orderQty(submission), referenceId: ref, notes: `${label} — RM${parseAmount(submission)}` });

  const addons = addonsOf(submission);
  const extra = [
    [addons.kasturiGift, 'addon-kasturi',       'Free Gift — Kasturi Kijang'],
    [addons.kasturi,     'addon-kasturi',       'Add-On — Kasturi Kijang'],
    [addons.sabun,       'sabun-garam',         'Add-On — Sabun Garam'],
    [addons.garam,       'addon-garam-masakan', 'Add-On — Garam Masakan Pengasihan'],
  ];
  for (const [on, source, note] of extra) {
    if (on) await deductStock({ adminClient: supabase, source, qty: 1, referenceId: ref, notes: `${label} ${note}` });
  }
}

/**
 * Tandakan order FPX sebagai selesai + kesan sampingan (stok, batal duplikat, log).
 * Selamat untuk panggilan berganda — hanya panggilan pertama yang ubah status & tolak stok.
 *
 * @param opts.via        'chip' | 'manual'
 * @param opts.billId     (chip) id bil CHIP
 * @param opts.chipStatus (chip) status dari CHIP
 * @param opts.actor      (manual) { id, name, role }
 * @param opts.reference  (manual) no. rujukan / nota bayaran (pilihan)
 * @returns { amount, skipped? }
 */
export async function completeFpxOrder({ supabase, submission, via, billId = null, chipStatus = null, actor = null, reference = '' }) {
  const amount = parseAmount(submission);
  const paidAt = new Date().toISOString();
  const clean = v => String(v || '').replace(/[\[\]]/g, '').trim().slice(0, 120);

  const tags = via === 'chip'
    ? ` [STATUS: paid] [CHIP_STATUS: ${chipStatus}] [PAID_AT: ${paidAt}]`
    : ` [STATUS: paid] [PAID_VIA: manual] [PAID_BY: ${clean(actor?.name || actor?.id)}] [PAID_AT: ${paidAt}]`
      + (clean(reference) ? ` [PAYMENT_REF: ${clean(reference)}]` : '');

  // 1. Status → completed — BERSYARAT (belum completed) supaya klik berganda / webhook serentak
  //    tak tolak stok dua kali. Tiada baris dikemas kini → dah diproses oleh request lain.
  const { data: updated, error } = await supabase
    .from('submissions')
    .update({ payment_status: 'completed', notes: `${submission.notes || ''}${tags}`, ...(billId ? { chip_bill_id: billId } : {}) })
    .eq('id', submission.id)
    .neq('payment_status', 'completed')
    .select('id');
  if (error) throw error;
  if (!updated?.length) return { amount, skipped: true };

  // 2. Batal order pending lain dari pelanggan sama (by phone)
  try {
    await supabase
      .from('submissions')
      .update({ payment_status: 'cancelled' })
      .eq('phone', submission.phone)
      .eq('payment_status', 'pending')
      .neq('id', submission.id);
  } catch (e) { console.warn('Auto-cancel pending duplicates skipped:', e.message); }

  // 3. Tolak stok (produk fizikal)
  try {
    await deductOrderStock(supabase, submission, via === 'chip' ? 'FPX Order' : 'FPX Manual');
  } catch (e) { console.error('Stock deduct FPX error (non-blocking):', e.message); }

  // 4. Log aktiviti
  try {
    await logActivity(supabase, {
      userId: actor?.id || null,
      actionType: via === 'chip' ? 'chip_payment_success' : 'manual_payment_confirmed',
      entityType: 'submission',
      entityId: submission.id,
      newValues: { payment_status: 'completed', via, bill_id: billId, reference: clean(reference) || null },
      description: via === 'chip'
        ? `💳 Bayaran FPX RM${amount} disahkan — ${submission.full_name} (${submission.phone})`
        : `✅ Bayaran RM${amount} ditanda PAID secara manual oleh ${actor?.role || 'user'} ${actor?.name || ''} — ${submission.full_name} (${submission.phone})${clean(reference) ? ` · Ref: ${clean(reference)}` : ''}`,
      ipAddress: via === 'chip' ? (submission.ip_address || 'webhook') : 'dashboard',
    });
  } catch (_) {}

  return { amount };
}

// Notifikasi WasapBot bayaran berjaya
export async function notifyFpxPaid(submission, amount, via = 'chip', actorName = '') {
  try {
    const msg = buildOrderMessage({
      name: submission.full_name,
      phone: submission.phone,
      product: `${productLabelOf(submission)} (FPX)`,
      amount: via === 'chip' ? `RM${amount} (FPX Online Banking)` : `RM${amount} (Bayaran manual — disahkan ${actorName || 'dashboard'})`,
      address: submission.address || '—',
      source: submission.source || 'fsp-checkout',
      paymentType: 'fpx',
    });
    await sendGroupNotification(`${via === 'chip' ? '💳 [BAYARAN FPX BERJAYA]' : '✅ [BAYARAN MANUAL DISAHKAN]'}\n${msg}`);
  } catch (e) {
    console.error('WasapBot Error (non-blocking):', e.message);
  }
}
