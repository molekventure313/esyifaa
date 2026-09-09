import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SHIPPER_ORDER_NO = '10198183';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse combined address string → { street, poskod, daerah, negeri }
 *  Format from SabunCheckoutForm: "No. 12, Jln Setia 3, 81300, Skudai, Johor"
 */
function parseAddressParts(combined) {
  if (!combined) return { street: '', poskod: '', daerah: '', negeri: '' };

  const parts = combined.split(',').map(p => p.trim()).filter(Boolean);

  // Find poskod — 5-digit number
  const poskodIdx = parts.findIndex(p => /^\d{5}$/.test(p));

  if (poskodIdx === -1) {
    // Old single-field format — put everything in street
    return { street: combined, poskod: '', daerah: '', negeri: '' };
  }

  return {
    street:  parts.slice(0, poskodIdx).join(', '),
    poskod:  parts[poskodIdx],
    daerah:  parts[poskodIdx + 1] || '',
    negeri:  parts[poskodIdx + 2] || '',
  };
}

/** Format phone to Malaysian format: 0123456789 (strip +60) */
function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60')) return '0' + digits.slice(2);
  if (digits.startsWith('0')) return digits;
  return digits;
}

/** Parse order quantity from notes/problem fields */
function parseQuantity(s) {
  // COD notes: "[QTY: 3 unit]"
  const codQty = (s.notes || '').match(/\[QTY:\s*(\d+)\s*unit\]/i);
  if (codQty) return parseInt(codQty[1]);

  // FPX problem field: "Pakej: 3 Unit"
  const fpxQty = (s.problem || '').match(/Pakej:\s*(\d+)\s*[Uu]nit/);
  if (fpxQty) return parseInt(fpxQty[1]);

  // Try produk_label from notes: "3 Unit"
  const unitMatch = (s.notes || s.problem || '').match(/\b(\d+)\s*[Uu]nit\b/);
  if (unitMatch) return parseInt(unitMatch[1]);

  return 1; // fallback
}

/** Check if order is a physical product (COD or FPX sabun) */
function isPhysicalOrder(s) {
  if (s.payment_type === 'cod') return true;
  if (s.payment_type === 'fpx_payment') {
    return (s.source || '').toLowerCase().includes('sabun');
  }
  return false;
}

/** Generate NinjaVan CSV string from array of submission records */
function generateNinjaVanCSV(orders) {
  const headers = [
    'REQUESTED TRACKING NUMBER', 'NAME', 'CONTACT', 'ADDRESS',
    'STATE', 'CITY', 'POSTCODE', 'WEIGHT(KG)', 'SHIPPER ORDER NO',
    'PAYMENT METHOD', 'UNIT', '', 'CASH ON DELIVERY',
  ];

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yy = String(today.getFullYear()).slice(-2);

  const rows = orders.map((s, index) => {
    // A: Tracking number — DDMMYYXX
    const tracking = `${dd}${mm}${yy}${String(index % 100).padStart(2, '0')}`;

    // Address parts
    const addr = parseAddressParts(s.address || '');

    // C: Phone
    const phone = formatPhone(s.phone);

    // K: UNIT cell — product name + qty
    const qty = parseQuantity(s);
    const unitCell = `Sabun Garam Himalaya ESyifaa (200g)\n${qty} UNIT`;

    // J: Payment method
    const paymentMethod = s.payment_type === 'cod'
      ? 'COD - Barang Sampai Baru Bayar'
      : 'FPX - Pembayaran Online';

    // M: Cash on delivery
    let codAmount = '0';
    if (s.payment_type === 'cod') {
      // Parse amount from amount_paid column or notes
      const amtParsed = s.amount_paid
        ? parseFloat(s.amount_paid)
        : (() => {
          const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
          return m ? parseFloat(m[1]) : 0;
        })();
      codAmount = amtParsed.toFixed(2);
    }

    return [
      tracking,          // A
      s.full_name || '', // B
      phone,             // C
      addr.street,       // D — jalan/rumah
      addr.daerah,       // E — header says STATE but actually bandar/daerah
      addr.negeri,       // F — header says CITY but actually negeri
      addr.poskod,       // G
      '1',               // H — weight (kg), tetap 1
      SHIPPER_ORDER_NO,  // I
      paymentMethod,     // J
      unitCell,          // K
      '',                // L — kosong
      codAmount,         // M
    ];
  });

  const allRows = [headers, ...rows];

  // Wrap every cell in double-quotes; escape internal double-quotes as ""
  return allRows
    .map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\r\n');
}

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
    const idsParam   = searchParams.get('ids') || '';
    const status     = searchParams.get('status') || '';
    const dateFrom   = searchParams.get('date_from') || '';
    const dateTo     = searchParams.get('date_to') || '';

    // ─── Query submissions ───
    let query = adminClient
      .from('submissions')
      .select('id, full_name, phone, address, problem, source, notes, payment_type, payment_status, amount_paid, ninjavan_exported_at, created_at')
      .in('payment_type', ['fpx_payment', 'cod']);

    // Filter by specific IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) query = query.in('id', ids);
    }

    if (status)   query = query.eq('payment_status', status);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59Z');

    query = query.order('created_at', { ascending: true });

    const { data: submissions, error } = await query;
    if (error) throw error;

    // Filter to physical products only: COD (all) + FPX sabun only
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
