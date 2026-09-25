import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET — fetch marketer's pixel config from profiles
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('meta_pixel_id, meta_access_token')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: {
        meta_pixel_id: profile?.meta_pixel_id || '',
        meta_access_token: profile?.meta_access_token || ''
      }
    });
  } catch (error) {
    console.error('GET /api/marketer/pixels error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update marketer's pixel config in profiles
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meta_pixel_id, meta_access_token } = body;

    const adminClient = createAdminClient();

    // Verify user is a marketer
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'marketer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await adminClient
      .from('profiles')
      .update({
        meta_pixel_id: meta_pixel_id || null,
        meta_access_token: meta_access_token || null
      })
      .eq('id', user.id);

    if (error) throw error;

    // Refresh cached marketer pixel map dalam root layout
    try { revalidateTag('pixels'); } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/marketer/pixels error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
