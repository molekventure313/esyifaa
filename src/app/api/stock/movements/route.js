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

const EDITABLE_TYPES = ['in', 'adjustment'];

/**
 * GET /api/stock/movements?product_id=&limit=50&offset=0
 * Returns paginated stock movement history with product name.
 */
export async function GET(req) {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get('product_id') || null;
    const limit      = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset     = parseInt(searchParams.get('offset') || '0');

    let query = adminClient
      .from('stock_movements')
      .select(`
        id, movement_type, qty, cost_per_unit,
        reference_type, reference_id, notes, created_at,
        products ( id, name, sku, unit )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (product_id) query = query.eq('product_id', product_id);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], total: count || 0 });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

/**
 * PATCH /api/stock/movements
 * Edit a manual stock movement (only 'in' and 'adjustment' types).
 * Body: { id, qty?, cost_per_unit?, notes? }
 */
export async function PATCH(req) {
  try {
    const { adminClient } = await requireAdmin();
    const { id, qty, cost_per_unit, notes } = await req.json();

    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });

    // Verify movement exists and is editable type
    const { data: existing, error: fetchErr } = await adminClient
      .from('stock_movements').select('id, movement_type').eq('id', id).single();
    if (fetchErr || !existing) return NextResponse.json({ success: false, error: 'Rekod tidak dijumpai' }, { status: 404 });
    if (!EDITABLE_TYPES.includes(existing.movement_type)) {
      return NextResponse.json({ success: false, error: `Rekod jenis '${existing.movement_type}' tidak boleh diedit — hanya rekod manual (in/adjustment) dibenarkan` }, { status: 403 });
    }

    const updates = {};
    if (qty !== undefined) {
      const q = parseInt(qty);
      if (!q || q <= 0) return NextResponse.json({ success: false, error: 'Kuantiti mesti lebih dari 0' }, { status: 400 });
      updates.qty = q;
    }
    if (cost_per_unit !== undefined) {
      const c = parseFloat(cost_per_unit);
      if (isNaN(c) || c < 0) return NextResponse.json({ success: false, error: 'Kos seunit tidak sah' }, { status: 400 });
      updates.cost_per_unit = c;
    }
    if (notes !== undefined) updates.notes = notes?.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'Tiada perubahan untuk disimpan' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('stock_movements').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

/**
 * DELETE /api/stock/movements
 * Delete a manual stock movement (only 'in' and 'adjustment' types).
 * Body: { id }
 */
export async function DELETE(req) {
  try {
    const { adminClient } = await requireAdmin();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });

    // Verify movement exists and is editable type
    const { data: existing, error: fetchErr } = await adminClient
      .from('stock_movements').select('id, movement_type, qty, notes').eq('id', id).single();
    if (fetchErr || !existing) return NextResponse.json({ success: false, error: 'Rekod tidak dijumpai' }, { status: 404 });
    if (!EDITABLE_TYPES.includes(existing.movement_type)) {
      return NextResponse.json({ success: false, error: `Rekod jenis '${existing.movement_type}' tidak boleh dipadam — hanya rekod manual dibenarkan` }, { status: 403 });
    }

    const { error } = await adminClient.from('stock_movements').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, deleted: { id, qty: existing.qty, notes: existing.notes } });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
