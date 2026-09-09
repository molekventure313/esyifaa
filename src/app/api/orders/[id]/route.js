import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// DELETE /api/orders/[id] — delete single order (submission)
export async function DELETE(req, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = ['admin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });

    // Only allow delete of COD or FPX payment orders (not appointments/leads)
    const { data: submission } = await adminClient
      .from('submissions')
      .select('id, payment_type, full_name')
      .eq('id', id)
      .in('payment_type', ['fpx_payment', 'cod'])
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Order tidak dijumpai atau tidak dibenarkan dipadam.' }, { status: 404 });
    }

    // Delete associated cases first (FK constraint)
    await adminClient.from('cases').delete().eq('submission_id', id);

    // Delete submission
    const { error } = await adminClient.from('submissions').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: `Order ${submission.full_name} berjaya dipadam.` });

  } catch (error) {
    console.error('Delete Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
