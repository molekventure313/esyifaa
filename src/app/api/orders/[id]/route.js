import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteOrders } from '@/lib/orders';
import { logActivity } from '@/lib/utils/logger';

// DELETE /api/orders/[id] — delete single order (submission)
// Admin: mana-mana order. Marketer: order sendiri sahaja (marketer_id = user).
export async function DELETE(req, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles').select('role, full_name').eq('id', user.id).single();
    const isAdmin    = ['admin', 'super_admin'].includes(profile?.role);
    const isMarketer = profile?.role === 'marketer';
    if (!isAdmin && !isMarketer) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });

    // Only allow delete of COD or FPX payment orders (not appointments/leads)
    let query = adminClient
      .from('submissions')
      .select('id, payment_type, payment_status, full_name, phone, source, amount_paid, notes, marketer_id, created_at')
      .eq('id', id)
      .in('payment_type', ['fpx_payment', 'cod']);
    if (!isAdmin) query = query.eq('marketer_id', user.id);

    const { data: submission } = await query.maybeSingle();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Order tidak dijumpai atau tidak dibenarkan dipadam.' }, { status: 404 });
    }

    await deleteOrders(adminClient, [id]);

    // Audit — terutama untuk delete oleh marketer
    await logActivity(adminClient, {
      userId: user.id,
      actionType: isAdmin ? 'order_delete' : 'marketer_order_delete',
      entityType: 'submission',
      entityId: id,
      oldValues: submission,
      description: `Order ${submission.full_name} (${submission.phone}) dipadam oleh ${isAdmin ? 'admin' : 'marketer'} ${profile?.full_name || user.id}`,
    });

    return NextResponse.json({ success: true, message: `Order ${submission.full_name} berjaya dipadam.` });

  } catch (error) {
    console.error('Delete Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
