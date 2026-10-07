import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { guard, OWNER } from '@/lib/auth';

// GET - read active homepage slug
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'active_homepage_slug')
      .maybeSingle();

    if (error) {
      // Table might not exist yet - return default
      return NextResponse.json({ success: true, slug: null });
    }

    return NextResponse.json({ success: true, slug: data?.value || null });
  } catch (err) {
    console.error('GET /api/settings/homepage error:', err);
    return NextResponse.json({ success: true, slug: null });
  }
}

// POST - update active homepage slug
export async function POST(req) {
  try {
    // Dulu TIADA semakan langsung (laluan /api/settings awam) — sesiapa boleh tukar homepage
    const g = await guard(OWNER);
    if (g.error) return g.error;
    const { slug } = await req.json();

    const supabase = createAdminClient();

    // Upsert the setting
    const { error } = await supabase
      .from('settings')
      .upsert(
        { key: 'active_homepage_slug', value: slug || null },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Upsert settings error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slug: slug || null });
  } catch (err) {
    console.error('POST /api/settings/homepage error:', err);
    return NextResponse.json(
      { success: false, error: 'Ralat semasa kemaskini tetapan.' },
      { status: 500 }
    );
  }
}
