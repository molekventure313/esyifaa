import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { isPhysicalOrder } from '@/lib/products';
import { NV_ENV } from '@/lib/ninjavan/api';
import { pushSubmission } from '@/lib/ninjavan/shipments';

// POST { ids: [submission_id] } — hantar order terus ke NinjaVan (ganti upload CSV).
// Berturutan (token sama digunakan semula); klien hantar dalam kumpulan ≤ MAX_PER_CALL.
export const dynamic = 'force-dynamic';
export const maxDuration = 26;
const MAX_PER_CALL = 10;

export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const { ids } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ success: false, error: 'Tiada order dipilih.' }, { status: 400 });
  }
  if (ids.length > MAX_PER_CALL) {
    return NextResponse.json({ success: false, error: `Maksimum ${MAX_PER_CALL} order setiap kali.` }, { status: 400 });
  }

  const { data: orders, error } = await g.admin.from('submissions')
    .select('id, full_name, phone, address, problem, source, notes, qty, payment_type, payment_status, amount_paid, returned_at')
    .in('id', ids);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const results = [];
  for (const id of ids) {
    const o = (orders || []).find(x => x.id === id);
    if (!o) { results.push({ id, ok: false, error: 'Order tidak dijumpai' }); continue; }
    if (!isPhysicalOrder(o)) { results.push({ id, ok: false, error: 'Bukan produk fizikal' }); continue; }
    if (o.payment_status !== 'completed') { results.push({ id, ok: false, error: 'Order belum selesai / dibayar' }); continue; }
    if (o.returned_at) { results.push({ id, ok: false, error: 'Order sudah di-return' }); continue; }
    try {
      const { shipment, created } = await pushSubmission(g.admin, o, g.user.id);
      results.push({ id, ok: true, created, tracking_number: shipment.tracking_number });
    } catch (e) {
      results.push({ id, ok: false, error: e.message });
    }
  }
  const okCount = results.filter(r => r.ok).length;
  return NextResponse.json({ success: okCount > 0, env: NV_ENV, sent: okCount, failed: results.length - okCount, results });
}
