import { createAdminClient } from '@/lib/supabase/admin';

// ─── Source → Product SKU mapping ────────────────────────────────────────────
export const SOURCE_TO_SKU = {
  'sabun-garam':   'SGH-200G',
  'sabun-garam-1': 'SGH-200G',
  'sabun-garam-2': 'SGH-200G',
  'sabun-garam-3': 'SGH-200G',
  'sabun-garam-4': 'SGH-200G',
  'sabun-garam-5': 'SGH-200G',
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
 * Updates submissions.returned_at + inserts stock movement type='return'.
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

  // 2. Resolve qty — from submissions.qty column (saved on order), fallback parse notes
  let qty = parseInt(submission.qty) || 0;
  if (!qty || qty <= 0) {
    const m = (submission.notes || '').match(/\[QTY:\s*(\d+)\s*unit\]/i);
    qty = m ? parseInt(m[1]) : 1;
  }

  // 3. Get product
  const sku = SOURCE_TO_SKU[submission.source];
  if (sku) {
    const product = await getProductBySku(adminClient, sku);
    if (product) {
      // 4. Insert return movement
      await adminClient.from('stock_movements').insert({
        product_id:     product.id,
        movement_type:  'return',
        qty:            qty,
        reference_type: 'return',
        reference_id:   submissionId,
        notes:          `COD Return — ${submission.full_name}`,
        created_by:     adminUserId,
      });
    }
  }

  // 5. Mark submission as returned
  await adminClient
    .from('submissions')
    .update({ returned_at: new Date().toISOString(), returned_by: adminUserId })
    .eq('id', submissionId);

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
