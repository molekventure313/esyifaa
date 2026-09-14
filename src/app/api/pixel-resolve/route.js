import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const marketerCode = searchParams.get('m');

    const headers = {
      'Cache-Control': 'public, max-age=60'
    };

    if (!slug) {
      return NextResponse.json({ pixel_id: null, is_marketer: false, error: 'Missing slug' }, { status: 400, headers });
    }

    if (!marketerCode) {
      return NextResponse.json({ pixel_id: null, is_marketer: false }, { headers });
    }

    const adminClient = createAdminClient();
    
    // Join marketer_pixels with profiles to resolve the marketerCode to a marketer_id
    // Supabase JS allows querying joined tables if foreign keys are set up.
    // Assuming profiles table has marketer_code and marketer_pixels has marketer_id (FK to profiles.id)
    const { data, error } = await adminClient
      .from('marketer_pixels')
      .select(`
        id,
        meta_pixel_id,
        is_active,
        salespage_slug,
        profiles!inner (
          marketer_code
        )
      `)
      .eq('profiles.marketer_code', marketerCode)
      .eq('salespage_slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Not found or error (e.g. no pixel configured or not active)
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
