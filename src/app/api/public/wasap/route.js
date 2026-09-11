import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/public/wasap?group=sabun|pengisian|all
 * Public — returns active WA numbers for the given group.
 * If group provided: return numbers WHERE group = requested OR group = 'all'
 * If no group: return ALL active numbers (legacy behaviour).
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group') || null;

    const adminClient = createAdminClient();
    let query = adminClient
      .from('wasap_numbers')
      .select('id, name, number, sort_order, group')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    // Filter by group: include requested group + universal 'all' numbers
    if (group && group !== 'all') {
      query = query.or(`group.eq.${group},group.eq.all`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('[GET /api/public/wasap]', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
