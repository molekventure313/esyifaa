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
