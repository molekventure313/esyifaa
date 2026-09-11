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
 * GET /api/stock/products
 * Returns all products (including inactive) for admin management.
 */
export async function GET() {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

/**
 * POST /api/stock/products
 * Admin creates a new product.
 * Body: { name, sku, unit?, cost_price?, selling_price?, low_stock_threshold? }
 */
export async function POST(req) {
  try {
    const { adminClient } = await requireAdmin();
    const body = await req.json();
    const { name, sku, unit = 'unit', cost_price = 0, selling_price = 0, low_stock_threshold = 10 } = body;

    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Nama produk diperlukan' }, { status: 400 });
    if (!sku?.trim())  return NextResponse.json({ success: false, error: 'SKU diperlukan' }, { status: 400 });

    const { data, error } = await adminClient
      .from('products')
      .insert({
        name: name.trim(), sku: sku.trim().toUpperCase(),
        unit: unit.trim() || 'unit',
        cost_price: parseFloat(cost_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        low_stock_threshold: parseInt(low_stock_threshold) || 10,
      })
      .select().single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: false, error: 'SKU sudah digunakan' }, { status: 400 });
      throw error;
    }
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

/**
 * PATCH /api/stock/products
 * Admin edits a product (name, cost_price, selling_price, threshold, is_active).
 * Body: { id, ...fields }
 */
export async function PATCH(req) {
  try {
    const { adminClient } = await requireAdmin();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ success: false, error: 'id diperlukan' }, { status: 400 });

    // Sanitize
    const allowed = {};
    if (updates.name !== undefined)                allowed.name                = updates.name.trim();
    if (updates.cost_price !== undefined)           allowed.cost_price          = parseFloat(updates.cost_price) || 0;
    if (updates.selling_price !== undefined)        allowed.selling_price       = parseFloat(updates.selling_price) || 0;
    if (updates.low_stock_threshold !== undefined)  allowed.low_stock_threshold = parseInt(updates.low_stock_threshold) || 10;
    if (updates.unit !== undefined)                 allowed.unit                = updates.unit.trim();
    if (updates.is_active !== undefined)            allowed.is_active           = Boolean(updates.is_active);
    allowed.updated_at = new Date().toISOString();

    const { data, error } = await adminClient
      .from('products').update(allowed).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
