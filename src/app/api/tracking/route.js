import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCAPIEvent, sendFpxCAPIEvent } from '@/lib/tracking/capi';
import { logActivity } from '@/lib/utils/logger';

export async function POST(req) {
  try {
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Use FPX CAPI for Purchase events, main CAPI for everything else
    const isFpxEvent = body.event_name === 'Purchase' || body.is_fpx === true;
    const capiSender = isFpxEvent ? sendFpxCAPIEvent : sendCAPIEvent;

    await capiSender({
      eventName: body.event_name,
      eventId: body.event_id,
      sourceUrl: body.url,
      userData: { client_ip_address: ip, client_user_agent: user_agent, ...body.user_data },
      customData: body.custom_data || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('tracking_config')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      data: data || {
        meta_pixel_id: '',
        meta_access_token: '',
        meta_test_event_code: '',
        is_active: false,
        fpx_pixel_id: '',
        fpx_access_token: '',
        fpx_test_event_code: '',
        fpx_is_active: false,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .from('tracking_config')
      .select('id')
      .limit(1)
      .single();

    const updatePayload = {
      // Main pixel
      meta_pixel_id: body.meta_pixel_id,
      meta_access_token: body.meta_access_token,
      meta_test_event_code: body.meta_test_code,
      is_active: body.is_active,
      // FPX pixel
      fpx_pixel_id: body.fpx_pixel_id,
      fpx_access_token: body.fpx_access_token,
      fpx_test_event_code: body.fpx_test_code,
      fpx_is_active: body.fpx_is_active,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await adminClient
        .from('tracking_config')
        .update(updatePayload)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('tracking_config')
        .insert(updatePayload);
      if (error) throw error;
    }

    await logActivity(adminClient, {
      userId: user.id,
      actionType: 'update_tracking_config',
      entityType: 'config',
      entityId: existing?.id || 'tracking_config',
      description: 'Tetapan Meta Pixel & CAPI (Utama + FPX) dikemaskini'
    });

    // Refresh cached HQ pixel dalam root layout
    try { revalidateTag('pixels'); } catch (_) {}

    // Reset both caches so next request fetches fresh from DB
    try {
      const { resetTrackingCache, resetFpxTrackingCache } = await import('@/lib/tracking/capi');
      resetTrackingCache();
      resetFpxTrackingCache();
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'Tetapan berjaya disimpan!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
