import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';

// GET: admin (staff) dapat senarai nama sahaja (untuk penapis order) · super_admin dapat penuh.
// PATCH / DELETE: super_admin sahaja. (Dulu GET & PATCH tiada semakan role.)
async function callerRole(adminSupabase, userId) {
  const { data } = await adminSupabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role || null;
}
async function isAdminCaller(adminSupabase, userId) {
  return (await callerRole(adminSupabase, userId)) === 'super_admin';
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    // Use service role client
    const adminSupabase = createAdminClient();
    const role = await callerRole(adminSupabase, user.id);
    if (!['admin', 'super_admin'].includes(role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Staff order: nama & kod sahaja (tiada sales / gaji)
    if (role === 'admin') {
      const { data } = await adminSupabase.from('profiles')
        .select('id, full_name, marketer_code, team_leader_id, is_active').eq('role', 'marketer').order('full_name');
      return NextResponse.json({ success: true, data: (data || []).map(m => ({ ...m, team_size: (data || []).filter(x => x.team_leader_id === m.id).length })) });
    }

    // Fetch marketers
    const { data: marketers, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'marketer')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch submissions
    const { data: submissions } = await adminSupabase
      .from('submissions')
      .select('marketer_id, amount_paid, payment_status')
      .eq('payment_status', 'completed')
      .is('returned_at', null);
      
    // Fetch ads_spend
    const { data: ads_spend } = await adminSupabase
      .from('ads_spend')
      .select('marketer_id, amount');
    
    const formattedMarketers = (marketers || []).map(m => {
      const mSubmissions = (submissions || []).filter(s => s.marketer_id === m.id);
      const total_orders = mSubmissions.length;
      const total_revenue = mSubmissions.reduce((sum, s) => sum + (Number(s.amount_paid) || 0), 0);
      
      const mAdsSpend = (ads_spend || []).filter(a => a.marketer_id === m.id);
      const total_ads_spend = mAdsSpend.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

      return {
        id: m.id,
        full_name: m.full_name || m.name || 'Marketer',
        email: m.email,
        phone: m.phone,
        marketer_whatsapp: m.marketer_whatsapp || null,
        marketer_code: m.marketer_code,
        is_active: m.is_active,
        marketer_basic_salary: m.marketer_basic_salary || 0,
        marketer_commission_pct: m.marketer_commission_pct || 0,
        team_leader_id: m.team_leader_id || null,
        team_leader_name: m.team_leader_id ? ((marketers || []).find(x => x.id === m.team_leader_id)?.full_name || null) : null,
        team_size: (marketers || []).filter(x => x.team_leader_id === m.id).length,
        // No. WhatsApp yang dipapar di SP: teamsale aktif yang dah isi nombor → nombor teamsale, selain itu nombor sendiri
        sp_whatsapp_teamsale: m.team_leader_id ? null
          : ((marketers || []).filter(x => x.team_leader_id === m.id && x.is_active)
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]?.marketer_whatsapp || null),
        total_orders,
        total_revenue,
        total_ads_spend,
        created_at: m.created_at
      };
    });

    return NextResponse.json({ success: true, data: formattedMarketers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, is_active, marketer_basic_salary, marketer_commission_pct, full_name } = body;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = createAdminClient();
    if (!(await isAdminCaller(adminSupabase, user.id))) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    
    const updatePayload = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (marketer_basic_salary !== undefined) updatePayload.marketer_basic_salary = marketer_basic_salary;
    if (marketer_commission_pct !== undefined) updatePayload.marketer_commission_pct = marketer_commission_pct;

    const { error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .eq('role', 'marketer');

    if (error) throw error;
    
    await logActivity(adminSupabase, { 
      userId: user.id, 
      actionType: 'update_user', 
      entityType: 'user', 
      entityId: id, 
      description: `Status / maklumat marketer dikemaskini` 
    });

    return NextResponse.json({ success: true, message: 'Maklumat marketer berjaya dikemaskini!' });
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

    if (callerProfile?.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        error: `Hanya admin boleh memadam akaun.`
      }, { status: 403 });
    }

    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!targetProfile || targetProfile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Bukan akaun marketer' }, { status: 400 });
    }

    // Delete related records
    await adminSupabase.from('marketer_pixels').delete().eq('marketer_id', targetUserId);
    await adminSupabase.from('ads_spend').delete().eq('marketer_id', targetUserId);
    await adminSupabase.from('activity_logs').delete().eq('user_id', targetUserId);

    // FK lain ke profiles (tiada ON DELETE) — lepaskan / padam sebelum padam profil
    const nowIso = new Date().toISOString();
    await adminSupabase.from('cases').update({ assigned_to: null, updated_at: nowIso }).eq('assigned_to', targetUserId);
    await adminSupabase.from('cases').update({ assigned_by: null, updated_at: nowIso }).eq('assigned_by', targetUserId);
    await adminSupabase.from('case_status_history').update({ changed_by: null }).eq('changed_by', targetUserId);
    await adminSupabase.from('case_notes').delete().eq('created_by', targetUserId);
    await adminSupabase.from('follow_ups').delete().eq('practitioner_id', targetUserId);
    await adminSupabase.from('salespage_config').update({ updated_by: null }).eq('updated_by', targetUserId);

    // Now safe to delete profile record
    const { error: profileDeleteErr } = await adminSupabase.from('profiles').delete().eq('id', targetUserId).eq('role', 'marketer');
    if (profileDeleteErr) {
      return NextResponse.json({ success: false, error: `Gagal padam profil: ${profileDeleteErr.message}` }, { status: 500 });
    }

    // Delete from Supabase Auth via direct REST API
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
      return NextResponse.json({ success: false, error: `Gagal padam auth: ${errMsg}` }, { status: 500 });
    }

    // Log activity
    try {
      await logActivity(adminSupabase, {
        userId: user.id,
        actionType: 'delete_user',
        entityType: 'user',
        entityId: targetUserId,
        description: `Admin memadam akaun marketer: ${targetProfile?.full_name || targetProfile?.email || targetUserId}`
      });
    } catch (logErr) {}

    return NextResponse.json({ success: true, message: 'Akaun marketer berjaya dipadam sepenuhnya.' });

  } catch (error) {
    const msg = error?.message || error?.error || 'Ralat tidak dijangka';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
