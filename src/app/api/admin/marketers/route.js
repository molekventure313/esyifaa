import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/utils/logger';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    // Use service role client
    const adminSupabase = createAdminClient();

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
      .eq('payment_status', 'completed');
      
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

    if (!['admin', 'super_admin'].includes(callerProfile?.role)) {
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
