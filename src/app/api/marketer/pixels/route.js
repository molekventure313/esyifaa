import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    let targetMarketerId = user.id;

    if (profile.role === 'admin' || profile.role === 'super_admin') {
      const marketerIdParam = searchParams.get('marketer_id');
      if (marketerIdParam) {
        targetMarketerId = marketerIdParam;
      }
    } else if (profile.role !== 'marketer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('marketer_pixels')
      .select('*')
      .eq('marketer_id', targetMarketerId);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/marketer/pixels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'marketer' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { salespage_slug, pixel_type = 'lead', meta_pixel_id, meta_access_token, meta_test_event_code } = body;

    const adminClient = createAdminClient();
    
    // Check if it already exists to prevent duplicates for same slug & type
    const { data: existing } = await adminClient
      .from('marketer_pixels')
      .select('id')
      .eq('marketer_id', user.id)
      .eq('salespage_slug', salespage_slug)
      .eq('pixel_type', pixel_type)
      .single();
      
    if (existing) {
        return NextResponse.json({ error: 'Pixel already exists for this salespage' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('marketer_pixels')
      .insert({
        marketer_id: user.id,
        salespage_slug,
        pixel_type,
        meta_pixel_id,
        meta_access_token,
        meta_test_event_code,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('POST /api/marketer/pixels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, meta_pixel_id, meta_access_token, meta_test_event_code, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing pixel ID' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    
    // Make sure the pixel belongs to the logged in user (or allow admin later if needed)
    // For now, strict ownership check:
    const { data: existing } = await adminClient
      .from('marketer_pixels')
      .select('marketer_id')
      .eq('id', id)
      .single();

    if (!existing || existing.marketer_id !== user.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await adminClient
      .from('marketer_pixels')
      .update({
        meta_pixel_id,
        meta_access_token,
        meta_test_event_code,
        is_active
      })
      .eq('id', id)
      .eq('marketer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('PATCH /api/marketer/pixels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing pixel ID' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('marketer_pixels')
      .delete()
      .eq('id', id)
      .eq('marketer_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/marketer/pixels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
