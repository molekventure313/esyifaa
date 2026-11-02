import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';

// POST { ids: [shipment_id], undo?: bool } — tanda COD parcel Delivered sudah diterima dari NinjaVan (remittance).
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  const { ids, undo = false } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ success: false, error: 'Tiada parcel dipilih.' }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await g.admin.from('ninjavan_shipments')
    .update({ cod_remitted_at: undo ? null : now, updated_at: now })
    .in('id', ids).eq('status', 'Delivered').gt('cod_amount', 0)
    .select('id');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, updated: data?.length || 0 });
}
