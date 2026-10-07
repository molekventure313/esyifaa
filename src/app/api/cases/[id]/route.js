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

    const adminClient = createAdminClient();
    const { data: caseData, error } = await adminClient
      .from('cases')
      .select(`
        *,
        customers (*),
        submissions (*),
        practitioner:profiles!cases_assigned_to_fkey (id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch notes, status history, follow-ups
    const { data: notes } = await adminClient
      .from('case_notes')
      .select('*, author:profiles!case_notes_created_by_fkey (id, full_name)')
      .eq('case_id', id)
      .order('created_at', { ascending: true });

    const { data: statusHistory } = await adminClient
      .from('case_status_history')
      .select('*, changer:profiles!case_status_history_changed_by_fkey (id, full_name)')
      .eq('case_id', id)
      .order('created_at', { ascending: true });

    const { data: followUps } = await adminClient
      .from('follow_ups')
      .select('*')
      .eq('case_id', id)
      .order('follow_up_date', { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        ...caseData,
        customer_name: caseData.customers?.full_name || 'Pesakit',
        customer_phone: caseData.customers?.phone || '',
        state: caseData.customers?.state || 'N/A',
        problem_description: caseData.customers?.problem || caseData.notes || 'Tiada maklumat',
        practitioner_name: caseData.practitioner?.full_name || 'Belum Diambil',
        case_notes: notes || [],
        case_status_history: statusHistory || [],
        follow_ups: followUps || [],
      },
    });
  } catch (error) {
    console.error('GET case error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const userId = user.id;
    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // ─── REASSIGN PRACTITIONER BY ADMIN ───
    if (action === 'reassign' || body.assigned_to) {
      const targetPractitionerId = body.assigned_to;
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('full_name')
        .eq('id', targetPractitionerId)
        .maybeSingle();

      const { error: updateError } = await adminClient
        .from('cases')
        .update({
          assigned_to: targetPractitionerId,
          status: 'Belum Diambil',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await adminClient.from('case_status_history').insert({
        case_id: id,
        changed_by: userId,
        old_status: 'Baru',
        new_status: 'Belum Diambil',
        notes: `Admin menukar agihan kes kepada perawat ${targetProfile?.full_name || 'Perawat'}`
      });

      return NextResponse.json({ success: true, message: 'Agihan kes berjaya ditukar!' });
    }

    // ─── CLAIM CASE ───
    if (action === 'claim') {
      const { data: existingCase } = await adminClient
        .from('cases')
        .select('assigned_to, status')
        .eq('id', id)
        .single();

      if (existingCase && existingCase.assigned_to && existingCase.assigned_to !== userId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Kes ini telah pun diambil oleh perawat lain.' 
        }, { status: 409 });
      }

      const { error: updateError } = await adminClient
        .from('cases')
        .update({
          assigned_to: userId,
          status: 'Sedang Diurus',
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await adminClient.from('case_status_history').insert({
        case_id: id,
        changed_by: userId,
        old_status: existingCase?.status || 'Baru',
        new_status: 'Sedang Diurus',
        notes: `Kes diambil oleh perawat ${profile?.full_name || 'Perawat'}`
      });

      await logActivity(adminClient, {
        userId,
        actionType: 'claim_case',
        entityType: 'case',
        entityId: id,
        description: `Perawat ${profile?.full_name || 'Perawat'} telah mengambil kes ini`,
      });
      
      return NextResponse.json({ success: true, message: 'Kes berjaya diambil!' });
    }

    // ─── UPDATE STATUS ───
    if (action === 'update_status') {
      const { status, notes } = body;
      
      const { data: currentCase } = await adminClient
        .from('cases')
        .select('status, version')
        .eq('id', id)
        .single();

      if (!currentCase) {
        return NextResponse.json({ success: false, error: 'Kes tidak ditemui' }, { status: 404 });
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (['Rawatan Selesai', 'Telah Dibayar', 'Pelanggan Batal', 'Diarkibkan'].includes(status)) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await adminClient
        .from('cases')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) throw updateError;

      await adminClient.from('case_status_history').insert({
        case_id: id,
        changed_by: userId,
        old_status: currentCase.status,
        new_status: status,
        notes: notes || null,
      });

      await logActivity(adminClient, {
        userId,
        actionType: 'update_status',
        entityType: 'case',
        entityId: id,
        description: `Status kes ditukar dari "${currentCase.status}" ke "${status}"`,
      });

      return NextResponse.json({ success: true });
    }

    // ─── ADD NOTE ───
    if (action === 'add_note') {
      const { content } = body;
      if (!content || !content.trim()) {
        return NextResponse.json({ success: false, error: 'Kandungan nota diperlukan' }, { status: 400 });
      }

      const { error: noteError } = await adminClient
        .from('case_notes')
        .insert({
          case_id: id,
          created_by: userId,
          content: content.trim(),
        });
      
      if (noteError) throw noteError;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Tindakan tidak sah' }, { status: 400 });

  } catch (error) {
    console.error('PATCH case error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();

    // Only admin can delete cases
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Hanya admin boleh memadam kes' }, { status: 403 });
    }

    // Get case info (including customer_id) before deletion
    const { data: caseData } = await adminClient
      .from('cases')
      .select('id, customer_id, customers(full_name)')
      .eq('id', id)
      .maybeSingle();

    const customerId = caseData?.customer_id;

    // Delete related records first
    await adminClient.from('case_notes').delete().eq('case_id', id);
    await adminClient.from('case_status_history').delete().eq('case_id', id);
    await adminClient.from('follow_ups').delete().eq('case_id', id);

    // Delete the case itself
    const { error: deleteError } = await adminClient
      .from('cases')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // ─── Cascade: delete customer jika tiada kes lain ───
    if (customerId) {
      const { data: remainingCases } = await adminClient
        .from('cases')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (!remainingCases || remainingCases.length === 0) {
        // Tiada kes lain — buang submission dan customer sekali
        await adminClient.from('submissions').delete().eq('customer_id', customerId);
        await adminClient.from('customers').delete().eq('id', customerId);
      }
    }

    await logActivity(adminClient, {
      userId: user.id,
      actionType: 'delete_case',
      entityType: 'case',
      entityId: id,
      description: `Admin memadam kes pesakit: ${caseData?.customers?.full_name || 'Tidak dikenali'}`,
    });

    return NextResponse.json({ success: true, message: 'Kes berjaya dipadam.' });

  } catch (error) {
    console.error('DELETE case error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
