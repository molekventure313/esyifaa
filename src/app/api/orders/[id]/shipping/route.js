import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { isPhysicalOrder } from '@/lib/products';
import { editShipping } from '@/lib/ninjavan/edit-shipping';
import { pushSubmission } from '@/lib/ninjavan/shipments';

// PATCH /api/orders/[id]/shipping — betulkan nama / telefon / alamat order HQ (admin + super_admin)
// Body: { full_name, phone, street, poskod, daerah, negeri, cancel_parcel?: bool, push?: bool }
//   cancel_parcel → batal parcel yang masih menunggu pickup dahulu
//   push          → terus hantar semula ke NinjaVan selepas disimpan
export const dynamic = 'force-dynamic';
export const maxDuration = 26;

export async function PATCH(req, { params }) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const { id } = await params;
  try {
    const b = await req.json().catch(() => ({}));
    const { order, warnings, cancelled } = await editShipping(g.admin, {
      table: 'submissions', id, input: b, cancelParcel: !!b.cancel_parcel, actor: { id: g.user.id, name: g.profile?.full_name },
    });
    let push = null;
    if (b.push) {
      if (!isPhysicalOrder(order) || order.payment_status !== 'completed') push = { ok: false, error: 'Order belum dibayar / bukan produk fizikal — tidak dihantar.' };
      else {
        try {
          const { shipment } = await pushSubmission(g.admin, order, g.user.id);
          push = { ok: true, tracking_number: shipment.tracking_number };
        } catch (e) { push = { ok: false, error: e.message }; }
      }
    }
    return NextResponse.json({ success: true, warnings, cancelled, push });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message, needs_cancel: !!e.needsCancel }, { status: 400 });
  }
}
