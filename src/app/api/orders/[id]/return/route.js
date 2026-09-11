import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { returnStock } from '@/lib/stock';

/**
 * POST /api/orders/[id]/return
 * Admin processes a COD return — re-adds stock and marks submission as returned.
 */
export async function POST(req, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Order ID diperlukan' }, { status: 400 });

    const result = await returnStock({ submissionId: id, adminUserId: user.id });

    return NextResponse.json({
      success: true,
      message: `Return berjaya. ${result.qtyReturned} unit dikembalikan ke stok.`,
      qty_returned: result.qtyReturned,
    });
  } catch (err) {
    console.error('[Return Order] Error:', err.message);
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
