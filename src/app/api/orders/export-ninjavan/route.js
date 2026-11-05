import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productOf, isPhysicalOrder, applyProductFilter, applySpFilter, periodRange } from '@/lib/products';
import { resolveOwner, applyOwner } from '@/lib/team';
import { generateNinjaVanCSV } from '@/lib/ninjavan-csv';

export const dynamic = 'force-dynamic';

// ─── Route Handler ──────────────────────────────────────────────────────────

/**
 * GET /api/orders/export-ninjavan
 *
 * Query params:
 *   ids       — comma-separated UUIDs to export specific orders
 *   status    — payment_status filter (default: all, use 'completed' to filter)
 *   date_from — ISO date string
 *   date_to   — ISO date string
 */
export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = ['admin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const idsParam      = searchParams.get('ids') || '';
    const status        = searchParams.get('status') || '';
    const dateFrom      = searchParams.get('date_from') || '';
    const dateTo        = searchParams.get('date_to') || '';
    const notExported   = searchParams.get('not_exported') === 'true';
    const product       = searchParams.get('product') || 'all';
    const sp            = searchParams.get('sp') || 'all';
    const owner         = searchParams.get('owner') || 'all';
    const channel       = searchParams.get('channel') || 'all';
    const range         = notExported ? null : periodRange(searchParams.get('period') || 'all');   // belum export: semua tarikh

    // ─── Query submissions ───
    let query = adminClient
      .from('submissions')
      .select('id, full_name, phone, address, problem, source, notes, qty, payment_type, payment_status, amount_paid, ninjavan_exported_at, created_at')
      .in('payment_type', ['fpx_payment', 'cod'])
      // WAJIB: hanya order dibayar / COD sah & belum di-return — FPX pending/gagal tak boleh masuk CSV (barang free)
      .eq('payment_status', 'completed')
      .is('returned_at', null);

    // Filter by specific IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) query = query.in('id', ids);
    }

    if (status)       query = query.eq('payment_status', status);
    if (dateFrom)     query = query.gte('created_at', dateFrom);
    if (dateTo)       query = query.lte('created_at', dateTo + 'T23:59:59Z');
    if (notExported)  query = query.is('ninjavan_exported_at', null);   // ← belum diexport
    if (!idsParam) {
      query = applySpFilter(applyProductFilter(query, product), sp);                       // ikut penapis page Pengurusan Order
      query = applyOwner(query, await resolveOwner(adminClient, owner));   // await pada resolveOwner sahaja, BUKAN query
      if (channel === 'whatsapp') query = query.eq('order_channel', 'whatsapp');
      else if (channel === 'web') query = query.neq('order_channel', 'whatsapp');
      if (range) query = query.gte('created_at', range.from).lte('created_at', range.to);
    }

    query = query.order('created_at', { ascending: true });

    const { data: submissions, error } = await query;
    if (error) throw error;

    // Filter to physical products only: COD (all) + FPX sabun / garam / kasturi
    const physicalOrders = (submissions || []).filter(isPhysicalOrder);

    if (physicalOrders.length === 0) {
      return NextResponse.json({ error: 'Tiada order untuk diexport.' }, { status: 404 });
    }

    // ─── Generate CSV ───
    const csv = generateNinjaVanCSV(physicalOrders);

    // ─── Mark as exported (non-blocking) ───
    try {
      const exportedIds = physicalOrders.map(s => s.id);
      await adminClient
        .from('submissions')
        .update({
          ninjavan_exported_at: new Date().toISOString(),
          ninjavan_exported_by: user.id,
        })
        .in('id', exportedIds);
    } catch (e) {
      // Non-blocking — column might not exist yet if migration not run
      console.warn('NinjaVan export mark skipped (migration 008 not run?):', e.message);
    }

    // ─── Return CSV file ───
    const today = new Date().toISOString().slice(0, 10);
    const filename = `ninjavan_orders_${today}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('NinjaVan Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
