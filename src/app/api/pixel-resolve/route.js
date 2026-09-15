import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const marketerCode = searchParams.get('m');

    const headers = { 'Cache-Control': 'public, max-age=60' };

    if (!marketerCode) {
      return NextResponse.json({ pixel_id: null, is_marketer: false }, { headers });
    }

    const adminClient = createAdminClient();
    
    // Simple: 1 global pixel per marketer, stored directly in profiles
    const { data, error } = await adminClient
      .from('profiles')
      .select('meta_pixel_id')
      .ilike('marketer_code', marketerCode.toLowerCase().trim())
      .eq('role', 'marketer')
      .maybeSingle();

    if (error || !data?.meta_pixel_id) {
      return NextResponse.json({ pixel_id: null, is_marketer: false }, { headers });
    }

    return NextResponse.json({ 
      pixel_id: data.meta_pixel_id, 
      is_marketer: true 
    }, { headers });

  } catch (error) {
    console.error('GET /api/pixel-resolve error:', error);
    return NextResponse.json({ pixel_id: null, is_marketer: false }, { 
      status: 500,
      headers: { 'Cache-Control': 'public, max-age=60' }
    });
  }
}
