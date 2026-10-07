import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        submissions (*),
        cases (*, case_status_history(*), case_notes(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { data: oldData } = await supabase.from('customers').select('*').eq('id', id).single();
    const { error } = await supabase.from('customers').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;

    await logActivity({ action_type: 'update_customer', entity_type: 'customer', entity_id: id, user_id: user.id, details: { old: oldData, new: body } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile.role !== 'super_admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const adminSupabase = createAdminClient();

    // ─── Cascade Delete: history → notes → cases → submissions → customer ───

    // 1. Get all case IDs for this customer
    const { data: customerCases } = await adminSupabase
      .from('cases')
      .select('id')
      .eq('customer_id', id);

    const caseIds = (customerCases || []).map(c => c.id);

    // 2. Delete case_status_history
    if (caseIds.length > 0) {
      await adminSupabase.from('case_status_history').delete().in('case_id', caseIds);
      await adminSupabase.from('case_notes').delete().in('case_id', caseIds);
      await adminSupabase.from('follow_ups').delete().in('case_id', caseIds);
    }

    // 3. Delete cases
    await adminSupabase.from('cases').delete().eq('customer_id', id);

    // 4. Delete submissions
    await adminSupabase.from('submissions').delete().eq('customer_id', id);

    // 5. Delete customer
    const { error } = await adminSupabase.from('customers').delete().eq('id', id);
    if (error) throw error;

    await logActivity({ action_type: 'delete_customer', entity_type: 'customer', entity_id: id, user_id: user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
