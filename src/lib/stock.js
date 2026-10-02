import { createAdminClient } from '@/lib/supabase/admin';

// ─── Source → Product SKU mapping ────────────────────────────────────────────
export const SOURCE_TO_SKU = {
  // Sabun Garam Himalaya
  'sabun-garam':   'SGH-200G',
  'sabun-garam-1': 'SGH-200G',
  'sabun-garam-2': 'SGH-200G',
  'sabun-garam-3': 'SGH-200G',
  'sabun-garam-4': 'SGH-200G',
  'sabun-garam-5': 'SGH-200G',
  // Garam Pengasihan Masakan (produk utama)
  'garam-pengasihan': 'GPM-500G',
  // Minyak Kasturi Kijang (produk utama)
  'kasturi-kijang': 'KKE-01',
  // Add-on: Kasturi Kijang E-Syifa' (apabila ditambah dari borang lain)
  'addon-kasturi': 'KKE-01',
  // Add-on: Garam Pengasihan (apabila ditambah dari borang Kasturi)
  'addon-garam-masakan': 'GPM-500G',
};

// ─── Get product by SKU ───────────────────────────────────────────────────────
export async function getProductBySku(adminClient, sku) {
  const { data, error } = await adminClient
    .from('products')
    .select('id, name, sku, unit, cost_price, is_active')
    .eq('sku', sku)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  return data;
}

// ─── Deduct stock (auto on order) ────────────────────────────────────────────
/**
 * Auto-deduct stock when order is placed.
 * Non-blocking — errors are caught and logged, never thrown.
 *
 * @param {object} opts
 * @param {object} opts.adminClient  — Supabase admin client
 * @param {string} opts.source       — SP source string (e.g. 'sabun-garam-3')
 * @param {number} opts.qty          — Number of units to deduct
 * @param {string} opts.referenceId  — submission UUID
 * @param {string} opts.notes        — e.g. 'COD Order' | 'FPX Order'
 */
export async function deductStock({ adminClient, source, qty, referenceId, notes = '' }) {
  try {
    const sku = SOURCE_TO_SKU[source];
    if (!sku) return; // Not a physical product SP

    const product = await getProductBySku(adminClient, sku);
    if (!product) {
      console.warn(`[Stock] Product not found for SKU: ${sku}`);
      return;
    }

    const qtyInt = parseInt(qty);
    if (!qtyInt || qtyInt <= 0) {
      console.warn(`[Stock] Invalid qty for deduction: ${qty}`);
      return;
    }

    const { error } = await adminClient.from('stock_movements').insert({
      product_id:     product.id,
      movement_type:  'out',
      qty:            qtyInt,
      reference_type: 'order',
      reference_id:   referenceId,
      notes:          notes || 'Order',
    });

    if (error) throw error;
    console.log(`[Stock] Deducted ${qtyInt}x ${sku} — ref: ${referenceId}`);
  } catch (err) {
    // Non-blocking — log but don't crash the order flow
    console.error('[Stock] deductStock error (non-blocking):', err.message);
  }
}

// ─── Return stock (COD return) ────────────────────────────────────────────────
/**
 * Return stock when a COD order is returned.
 * Updates submissions.returned_at + inserts stock movement type='return' (semua item order).
 * Order yang di-return (returned_at) tidak dikira dalam sales / profit / komisen di semua laporan.
 *
 * @param {object} opts
 * @param {string} opts.submissionId  — UUID of the submission to return
 * @param {string} opts.adminUserId   — UUID of the admin processing the return
 * @returns {object} { success, qtyReturned, product }
 */
export async function returnStock({ submissionId, adminUserId }) {
  const adminClient = createAdminClient();

  // 1. Fetch submission
  const { data: submission, error: fetchErr } = await adminClient
    .from('submissions')
    .select('id, source, qty, notes, payment_type, payment_status, returned_at, full_name')
    .eq('id', submissionId)
    .single();

  if (fetchErr || !submission) throw new Error('Order tidak dijumpai.');
  if (submission.payment_type !== 'cod') throw new Error('Hanya COD order boleh di-return.');
  if (submission.payment_status !== 'completed') throw new Error('Order belum selesai.');
  if (submission.returned_at) throw new Error('Order ini sudah di-return sebelum ini.');

  // Tanda returned dulu (bersyarat) — klik berganda tak pulangkan stok dua kali
  const { data: claimed } = await adminClient
    .from('submissions')
    .update({ returned_at: new Date().toISOString(), returned_by: adminUserId })
    .eq('id', submissionId)
    .is('returned_at', null)
    .select('id');
  if (!claimed?.length) throw new Error('Order ini sudah di-return sebelum ini.');

  // 2. Pulangkan SEMUA stok yang ditolak untuk order ini (produk utama + add-on + hadiah percuma)
  //    — cermin setiap movement 'out' yang merujuk order ini
  let qty = 0;
  const { data: outs } = await adminClient
    .from('stock_movements')
    .select('product_id, qty')
    .eq('movement_type', 'out')
    .eq('reference_id', submissionId);

  if (outs?.length) {
    const { error: insErr } = await adminClient.from('stock_movements').insert(outs.map(o => ({
      product_id:     o.product_id,
      movement_type:  'return',
      qty:            o.qty,
      reference_type: 'return',
      reference_id:   submissionId,
      notes:          `COD Return — ${submission.full_name}`,
      created_by:     adminUserId,
    })));
    if (insErr) {
      await adminClient.from('submissions').update({ returned_at: null, returned_by: null }).eq('id', submissionId);
      throw new Error(`Gagal pulangkan stok: ${insErr.message}`);
    }
    qty = outs.reduce((t, o) => t + (parseInt(o.qty) || 0), 0);
  } else {
    // Order lama tanpa rekod movement — fallback produk utama ikut qty
    qty = parseInt(submission.qty) || 0;
    if (!qty || qty <= 0) {
      const m = (submission.notes || '').match(/\[QTY:\s*(\d+)\s*unit\]/i);
      qty = m ? parseInt(m[1]) : 1;
    }
    const sku = SOURCE_TO_SKU[submission.source];
    const product = sku ? await getProductBySku(adminClient, sku) : null;
    if (product) {
      await adminClient.from('stock_movements').insert({
        product_id:     product.id,
        movement_type:  'return',
        qty,
        reference_type: 'return',
        reference_id:   submissionId,
        notes:          `COD Return — ${submission.full_name}`,
        created_by:     adminUserId,
      });
    } else {
      qty = 0;
    }
  }

  return { success: true, qtyReturned: qty };
}

// ─── Get current stock level for a SKU ───────────────────────────────────────
export async function getStockLevel(adminClient, sku) {
  const { data } = await adminClient
    .from('stock_summary')
    .select('current_stock, avg_cost_per_unit, name')
    .eq('sku', sku)
    .single();
  return data || { current_stock: 0, avg_cost_per_unit: 0 };
}
