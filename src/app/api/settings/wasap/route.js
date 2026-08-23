import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

/**
 * GET /api/settings/wasap
 * Admin — returns ALL wasap numbers (including inactive).
 */
export async function GET() {
  try {
    await requireAuth();
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('wasap_numbers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/**
 * POST /api/settings/wasap
 * Admin — tambah nombor WA baru.
 * Body: { name: string, number: string, is_active?: boolean, sort_order?: number }
 */
export async function POST(req) {
  try {
    await requireAuth();
    const body = await req.json();
    const { name, number, is_active = true, sort_order = 0 } = body;

    if (!name?.trim() || !number?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama dan nombor WA diperlukan' }, { status: 400 });
    }

    // Clean number — remove +, spaces, dashes
    const cleanNumber = number.replace(/[\s\-+]/g, '');
    if (!/^\d{10,15}$/.test(cleanNumber)) {
      return NextResponse.json({ success: false, error: 'Format nombor tidak sah. Guna format: 601XXXXXXXX' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('wasap_numbers')
      .insert({ name: name.trim(), number: cleanNumber, is_active, sort_order })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/**
 * PATCH /api/settings/wasap
 * Admin — edit nombor WA yang sedia ada.
 * Body: { id: string, name?: string, number?: string, is_active?: boolean, sort_order?: number }
 */
export async function PATCH(req) {
  try {
    await requireAuth();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
    }

    // Clean number if provided
    if (updates.number) {
      updates.number = updates.number.replace(/[\s\-+]/g, '');
      if (!/^\d{10,15}$/.test(updates.number)) {
        return NextResponse.json({ success: false, error: 'Format nombor tidak sah. Guna format: 601XXXXXXXX' }, { status: 400 });
      }
    }

    if (updates.name) updates.name = updates.name.trim();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('wasap_numbers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

/**
 * DELETE /api/settings/wasap
 * Admin — delete nombor WA.
 * Body: { id: string }
 */
export async function DELETE(req) {
  try {
    await requireAuth();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID diperlukan' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('wasap_numbers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
