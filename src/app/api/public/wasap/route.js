import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/public/wasap
 * Public endpoint — returns all ACTIVE WA numbers for rotation on /wa page.
 * No authentication required (numbers are visible to users anyway on click).
 */
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('wasap_numbers')
      .select('id, name, number, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('[GET /api/public/wasap]', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
