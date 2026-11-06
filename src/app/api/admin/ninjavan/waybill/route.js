import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { latestShipmentsBy } from '@/lib/ninjavan/shipments';
import { waybillPdfResponse, WAYBILL_MAX } from '@/lib/ninjavan/waybill';

// GET ?ids=<submission_id>,... — PDF waybill (digabung jika lebih dari satu) untuk dicetak + tanda "dah print".
// ?fighter=1 → ids ialah fighter_orders.id (Packing Fighter).
// Waybill dijana sekali dari API kemudian dibaca dari storage (getWaybill).
export const dynamic = 'force-dynamic';
export const maxDuration = 26;

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const sp = new URL(req.url).searchParams;
  const ids = (sp.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, WAYBILL_MAX);
  if (!ids.length) return NextResponse.json({ success: false, error: 'Tiada order dipilih.' }, { status: 400 });

  const shipments = await latestShipmentsBy(g.admin, sp.get('fighter') === '1' ? 'fighter_order_id' : 'submission_id', ids);
  return waybillPdfResponse(g.admin, ids.map(id => shipments[id]), { markUserId: g.user.id });
}
