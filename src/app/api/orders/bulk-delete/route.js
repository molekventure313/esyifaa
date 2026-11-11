import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteOrders } from '@/lib/orders';

// POST /api/orders/bulk-delete — delete multiple orders
// Body: { ids: ['id1', 'id2', ...] }
// Parcel NinjaVan aktif dibatalkan dahulu; order yang parcelnya dah diambil kurier tidak dipadam.
export const maxDuration = 26;
export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = ['admin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Senarai ID diperlukan.' }, { status: 400 });
    }

    if (ids.length > 50) {
      return NextResponse.json({ success: false, error: 'Maksimum 50 order boleh dipadam sekaligus.' }, { status: 400 });
    }

    // Only allow delete of COD/FPX payment orders (not appointments)
    const { data: valid } = await adminClient
      .from('submissions')
      .select('id')
      .in('id', ids)
      .in('payment_type', ['fpx_payment', 'cod']);

    const validIds = (valid || []).map(s => s.id);
    if (validIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Tiada order sah untuk dipadam.' }, { status: 404 });
    }

    // Cases + stock movements (out & return) + submissions
    const { ok, blocked, cancelled } = await deleteOrders(adminClient, validIds);
    const { data: names } = blocked.length
      ? await adminClient.from('submissions').select('id, full_name').in('id', blocked.map(b => b.id))
      : { data: [] };
    const nameOf = Object.fromEntries((names || []).map(n => [n.id, n.full_name]));
    const parts = [];
    if (ok.length) parts.push(`${ok.length} order dipadam${cancelled.length ? ` (${cancelled.length} parcel NinjaVan dibatalkan)` : ''}.`);
    if (blocked.length) parts.push(`${blocked.length} tidak dipadam — ${blocked.slice(0, 3).map(b => `${nameOf[b.id] || b.id}: ${b.reason}`).join(' | ')}`);

    return NextResponse.json({
      success: ok.length > 0,
      deleted: ok.length,
      blocked,
      cancelled,
      message: parts.join(' '),
      ...(ok.length ? {} : { error: parts.join(' ') }),
    });

  } catch (error) {
    console.error('Bulk Delete Orders Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
