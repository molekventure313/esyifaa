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
 * GET /api/stock/summary
 * Returns all active products with current stock, value, and alert status.
 */
export async function GET() {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('stock_summary')
      .select('*')
      .order('name');

    if (error) throw error;

    // Calculate stock value per product
    const products = (data || []).map(p => ({
      ...p,
      stock_value:   parseFloat(((p.current_stock || 0) * (p.avg_cost_per_unit || p.cost_price || 0)).toFixed(2)),
      is_low_stock:  (p.current_stock || 0) <= (p.low_stock_threshold || 10),
      is_out_of_stock: (p.current_stock || 0) <= 0,
    }));

    const total_value = products.reduce((sum, p) => sum + (p.stock_value || 0), 0);

    return NextResponse.json({ success: true, data: { products, total_value: parseFloat(total_value.toFixed(2)) } });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
