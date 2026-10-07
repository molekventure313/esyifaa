import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

// GET — fetch treatment_price from tracking_config
export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await adminClient
      .from('tracking_config')
      .select('treatment_price')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, treatment_price: data?.treatment_price || 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — update treatment_price in tracking_config
export async function PATCH(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { treatment_price } = await req.json();
    if (treatment_price === undefined || isNaN(parseFloat(treatment_price))) {
      return NextResponse.json({ success: false, error: 'Harga rawatan tidak sah' }, { status: 400 });
    }

    // Update the first (and only) row in tracking_config
    const { data: existing } = await adminClient.from('tracking_config').select('id').limit(1).maybeSingle();

    let result;
    if (existing?.id) {
      result = await adminClient
        .from('tracking_config')
        .update({ treatment_price: parseFloat(treatment_price), updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await adminClient
        .from('tracking_config')
        .insert({ treatment_price: parseFloat(treatment_price) })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, treatment_price: result.data.treatment_price });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
