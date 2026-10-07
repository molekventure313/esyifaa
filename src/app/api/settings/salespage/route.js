import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { guard, OWNER } from '@/lib/auth';

// GET — list all salespages with their tracking_type
export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const g = await guard(OWNER);   // super_admin sahaja (dulu sesiapa yang login — termasuk baca access token pixel)
    if (g.error) return g.error;

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('salespages')
      .select('id, slug, label, url, tracking_type')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — update tracking_type for a salespage by slug
// Body: { slug: 'fsp-checkout', tracking_type: 'purchase' }
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { slug, tracking_type } = body;

    if (!slug || !['lead', 'purchase'].includes(tracking_type)) {
      return NextResponse.json({ success: false, error: 'slug dan tracking_type (lead|purchase) diperlukan' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const g = await guard(OWNER);   // super_admin sahaja (dulu sesiapa yang login — termasuk baca access token pixel)
    if (g.error) return g.error;

    const adminClient = createAdminClient();

    // Check if row exists for this slug
    const { data: existing } = await adminClient
      .from('salespages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      const { error } = await adminClient
        .from('salespages')
        .update({ tracking_type, updated_at: new Date().toISOString() })
        .eq('slug', slug);
      if (error) throw error;
    } else {
      // If row doesn't exist yet, create it with the tracking_type
      const { error } = await adminClient
        .from('salespages')
        .insert({ slug, tracking_type });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, slug, tracking_type });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
