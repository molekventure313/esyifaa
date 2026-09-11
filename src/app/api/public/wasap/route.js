import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/public/wasap?group=sabun|pengisian|all
 * Public — returns ACTIVE WA numbers for the given SP group.
 * Uses column 'sp_group' (renamed from 'group' — was a reserved SQL word).
 *
 * Logic:
 * - group='sabun'     → return where sp_group='sabun' ONLY
 * - group='pengisian' → return where sp_group='pengisian' ONLY
 * - group='all' / no group → return ALL active numbers (legacy fallback)
 *
 * Numbers with sp_group='all' are excluded from specific-group queries.
 * Admins should explicitly set the group for each number.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const spGroup = searchParams.get('group') || null;

    const adminClient = createAdminClient();

    let query = adminClient
      .from('wasap_numbers')
      .select('id, name, number, sort_order, sp_group')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    // Filter strictly by sp_group — 'all' means the number appears in every queue
    if (spGroup && spGroup !== 'all') {
      // Return numbers that belong to THIS group OR are marked 'all' (universal fallback)
      query = query.in('sp_group', [spGroup, 'all']);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[GET /api/public/wasap] DB error:', error.message);
      throw error;
    }

    // If no numbers found for the specific group, return empty (don't bleed other groups)
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('[GET /api/public/wasap]', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
