import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { latestShipmentsFor, cancelShipment } from '@/lib/ninjavan/shipments';

// POST { submission_id } — batal parcel NinjaVan (hanya status Pending Pickup). Order boleh dihantar semula selepas itu.
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const { submission_id } = await req.json().catch(() => ({}));
  if (!submission_id) return NextResponse.json({ success: false, error: 'submission_id diperlukan' }, { status: 400 });

  const shipment = (await latestShipmentsFor(g.admin, [submission_id]))[submission_id];
  if (!shipment?.tracking_number || shipment.status === 'Cancelled') {
    return NextResponse.json({ success: false, error: 'Tiada parcel aktif untuk dibatalkan.' }, { status: 404 });
  }
  try {
    await cancelShipment(g.admin, shipment);
    return NextResponse.json({ success: true, tracking_number: shipment.tracking_number });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: e.status === 400 || e.status === 404 ? 400 : 502 });
  }
}
