import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return { user, adminClient };
}

/**
 * POST /api/stock/add
 * Admin manually adds a stock batch.
 * Body: { product_id, qty, cost_per_unit, notes? }
 */
export async function POST(req) {
  try {
    const { user, adminClient } = await requireAdmin();
    const body = await req.json();
    const { product_id, qty, cost_per_unit, notes } = body;

    if (!product_id) return NextResponse.json({ success: false, error: 'product_id diperlukan' }, { status: 400 });

    const qtyInt = parseInt(qty);
    if (!qtyInt || qtyInt <= 0) return NextResponse.json({ success: false, error: 'Kuantiti mesti lebih dari 0' }, { status: 400 });

    const cost = parseFloat(cost_per_unit);
    if (isNaN(cost) || cost < 0) return NextResponse.json({ success: false, error: 'Kos seunit tidak sah' }, { status: 400 });

    // Verify product exists
    const { data: product, error: pErr } = await adminClient
      .from('products').select('id, name, sku').eq('id', product_id).single();
    if (pErr || !product) return NextResponse.json({ success: false, error: 'Produk tidak dijumpai' }, { status: 404 });

    // Insert stock movement
    const { data: movement, error: mErr } = await adminClient
      .from('stock_movements')
      .insert({
        product_id,
        movement_type:  'in',
        qty:            qtyInt,
        cost_per_unit:  cost,
        reference_type: 'batch',
        notes:          notes?.trim() || `Batch tambahan ${new Date().toLocaleDateString('ms-MY')}`,
        created_by:     user.id,
      })
      .select()
      .single();

    if (mErr) throw mErr;

    // Also update product.cost_price to latest batch cost (for future reference)
    if (cost > 0) {
      await adminClient
        .from('products')
        .update({ cost_price: cost, updated_at: new Date().toISOString() })
        .eq('id', product_id);
    }

    return NextResponse.json({ success: true, data: movement });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
