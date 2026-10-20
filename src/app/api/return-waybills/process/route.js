import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { processWaybill } from '@/lib/return-waybills';

// POST { id } — proses SATU gambar waybill dengan AI (dipanggil oleh halaman Return Parcel selepas upload).
// Padanan pasti → order terus ditanda return. Selebihnya → 'review' / 'unmatched'.
export const maxDuration = 26;

export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'id diperlukan.' }, { status: 400 });
    const r = await processWaybill(g.admin, id, g.user.id);
    if (r.error) return NextResponse.json({ success: false, error: r.error }, { status: 502 });
    return NextResponse.json({ success: true, ...r });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
