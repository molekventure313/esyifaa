import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { completeFpxOrder, notifyFpxPaid } from '@/lib/payments';

/**
 * POST /api/orders/[id]/mark-paid
 * Sahkan bayaran order FPX secara manual (pelanggan bayar melalui WhatsApp / transfer / QR).
 * - Marketer: order sendiri sahaja. Admin: mana-mana order.
 * - Hanya FPX berstatus pending / failed (bil CHIP tamat tempoh).
 * - Stok ditolak & sales dikira (status completed) — sama dgn webhook CHIP.
 * - TIADA Pixel/CAPI Purchase (data browser milik marketer, bukan pelanggan).
 *
 * Body: { reference?: string }
 */
export async function POST(req, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role, full_name').eq('id', user.id).single();
    const isAdmin    = ['admin', 'super_admin'].includes(profile?.role);
    const isMarketer = profile?.role === 'marketer';
    if (!isAdmin && !isMarketer) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    let reference = '';
    try { reference = (await req.json())?.reference || ''; } catch (_) {}

    let q = adminClient.from('submissions').select('*').eq('id', id).eq('payment_type', 'fpx_payment');
    if (!isAdmin) q = q.eq('marketer_id', user.id);
    const { data: submission } = await q.maybeSingle();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Order FPX tidak dijumpai atau bukan milik anda.' }, { status: 404 });
    }
    if (submission.payment_status === 'completed') {
      return NextResponse.json({ success: false, error: 'Order ini sudah dibayar.' }, { status: 409 });
    }
    if (!['pending', 'failed'].includes(submission.payment_status)) {
      return NextResponse.json({ success: false, error: `Order berstatus "${submission.payment_status}" tidak boleh ditanda paid.` }, { status: 400 });
    }

    const actor = { id: user.id, name: profile?.full_name || user.email, role: isAdmin ? 'admin' : 'marketer' };
    const { amount, skipped } = await completeFpxOrder({ supabase: adminClient, submission, via: 'manual', actor, reference });
    if (skipped) return NextResponse.json({ success: false, error: 'Order ini sudah dibayar.' }, { status: 409 });
    await notifyFpxPaid(submission, amount, 'manual', actor.name);

    return NextResponse.json({ success: true, message: `Order ${submission.full_name} ditanda PAID (RM${amount}).` });
  } catch (error) {
    console.error('Mark paid error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
