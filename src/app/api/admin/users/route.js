import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';

// Hanya admin / super_admin boleh guna API ni (dulu GET/POST/PATCH tiada semakan role —
// sesiapa yang login boleh senarai pengguna, cipta admin, atau naikkan role sendiri).
async function isAdminCaller(adminSupabase, userId) {
  const { data } = await adminSupabase.from('profiles').select('role').eq('id', userId).single();
  return ['admin', 'super_admin'].includes(data?.role);
}
const FORBIDDEN = () => NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    // Use service role client if RLS restricts normal profile reads across users
    const adminSupabase = createAdminClient();
    if (!(await isAdminCaller(adminSupabase, user.id))) return FORBIDDEN();

    let query = adminSupabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (roleParam === 'perawat' || roleParam === 'practitioner') {
      query = query.in('role', ['practitioner', 'perawat']);
    } else if (roleParam) {
      query = query.eq('role', roleParam);
    }

    const { data: users, error } = await query;
    if (error) throw error;
    
    // Fetch cases to compute live active & completed metrics for each practitioner
    const { data: cases } = await adminSupabase.from('cases').select('assigned_to, status');
    
    const formattedUsers = (users || []).map(u => {
      const uCases = (cases || []).filter(c => c.assigned_to === u.id);
      const activeCount = uCases.filter(c => ['Sedang Diurus', 'Perlu Follow-up', 'Baru', 'Belum Diambil'].includes(c.status)).length;
      const completedCount = uCases.filter(c => c.status === 'Rawatan Selesai').length;
      return {
        ...u,
        name: u.full_name || u.name || 'Perawat',
        active_cases: activeCount,
        completed_cases: completedCount
      };
    });

    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, full_name, role, max_active_cases, phone } = body;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();
    if (!(await isAdminCaller(adminSupabase, user.id))) return FORBIDDEN();
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: role || 'practitioner' }
    });
    
    if (authError) throw authError;

    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: authData.user.id,
      full_name,
      email,
      role: role || 'practitioner',
      phone: phone || null,
      max_active_cases: max_active_cases || 10,
      is_active: true,
      updated_at: new Date().toISOString()
    });

    if (profileError) throw profileError;

    await logActivity(adminSupabase, { 
      userId: user.id, 
      actionType: 'create_user', 
      entityType: 'user', 
      entityId: authData.user.id,
      description: `Admin cipta perawat baharu: ${full_name}`
    });

    return NextResponse.json({ success: true, data: authData.user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, full_name, role, is_active, is_receiving_cases, max_active_cases } = body;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();
    if (!(await isAdminCaller(adminSupabase, user.id))) return FORBIDDEN();
    
    const updatePayload = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (role !== undefined) updatePayload.role = role;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    // is_receiving_cases: controls case assignment only, independent from is_active
    if (is_receiving_cases !== undefined) updatePayload.is_receiving_cases = is_receiving_cases;
    if (max_active_cases !== undefined) updatePayload.max_active_cases = max_active_cases;

    const { error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
    
    await logActivity(adminSupabase, { 
      userId: user.id, 
      actionType: 'update_user', 
      entityType: 'user', 
      entityId: id, 
      description: `Status perawat dikemaskini: is_active=${is_active}` 
    });

    return NextResponse.json({ success: true, message: 'Status perawat berjaya dikemaskini!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('id');

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'ID pengguna diperlukan' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();

    // Only admin / super_admin can delete
    const { data: callerProfile, error: callerErr } = await adminSupabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (callerErr) {
      return NextResponse.json({ success: false, error: `Gagal semak peranan: ${callerErr.message}` }, { status: 500 });
    }

    if (!['admin', 'super_admin'].includes(callerProfile?.role)) {
      return NextResponse.json({
        success: false,
        error: `Hanya admin boleh memadam akaun. Peranan semasa: ${callerProfile?.role || 'tidak dikenali'}`
      }, { status: 403 });
    }

    // Fetch target profile
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', targetUserId)
      .maybeSingle();

    if (targetProfile?.role === 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akaun super admin tidak boleh dipadam' }, { status: 403 });
    }

    // Unassign ALL cases from deleted perawat — keep original status, admin will manually reassign
    // No status filter — catch every case regardless of current status
    await adminSupabase
      .from('cases')
      .update({ assigned_to: null, updated_at: new Date().toISOString() })
      .eq('assigned_to', targetUserId);

    // Delete all records that have FK references to profiles — must be done before deleting profile
    // 1. activity_logs.user_id → profiles.id
    await adminSupabase.from('activity_logs').delete().eq('user_id', targetUserId);
    // 2. case_notes.created_by → profiles.id
    await adminSupabase.from('case_notes').delete().eq('created_by', targetUserId);
    // 3. case_status_history.changed_by → profiles.id
    await adminSupabase.from('case_status_history').delete().eq('changed_by', targetUserId);

    // Now safe to delete profile record
    const { error: profileDeleteErr } = await adminSupabase.from('profiles').delete().eq('id', targetUserId);
    if (profileDeleteErr) {
      return NextResponse.json({ success: false, error: `Gagal padam profil: ${profileDeleteErr.message}` }, { status: 500 });
    }

    // Delete from Supabase Auth via direct REST API (most reliable with service role key)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvygzimtwhezxulvydrn.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const authDeleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
    });

    if (!authDeleteRes.ok) {
      let errBody = {};
      try { errBody = await authDeleteRes.json(); } catch (_) {}
      const errMsg = errBody?.message || errBody?.error || errBody?.msg || `HTTP ${authDeleteRes.status}`;
      console.error('Auth delete REST failed:', authDeleteRes.status, errBody);
      return NextResponse.json({ success: false, error: `Gagal padam auth: ${errMsg}` }, { status: 500 });
    }

    // Log activity (non-blocking)
    try {
      await logActivity(adminSupabase, {
        userId: user.id,
        actionType: 'delete_user',
        entityType: 'user',
        entityId: targetUserId,
        description: `Admin memadam akaun perawat: ${targetProfile?.full_name || targetProfile?.email || targetUserId}`
      });
    } catch (logErr) {
      console.warn('logActivity failed (non-blocking):', logErr?.message);
    }

    return NextResponse.json({ success: true, message: 'Akaun perawat berjaya dipadam sepenuhnya.' });

  } catch (error) {
    const msg = error?.message || error?.error || (typeof error === 'string' ? error : JSON.stringify(error)) || 'Ralat tidak dijangka';
    console.error('DELETE user error:', msg, error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
