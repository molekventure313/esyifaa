import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';

// POST { ids: [shipment_id], undo?: bool } — tanda COD parcel Delivered sudah diterima dari NinjaVan (remittance).
// Parcel fighter (akaun NinjaVan HQ): COD diterima HQ → kredit 'cod' (−) dalam lejar fighter; undo → kredit dibuang
// (jika sudah masuk bil → pelarasan + sebaliknya).
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
    .select('id, fighter_id, fighter_order_id, tracking_number, cod_amount');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const fighterRows = (data || []).filter(s => s.fighter_id);
  const ledgerErrors = [];
  for (const s of fighterRows) {
    const { data: existing } = await g.admin.from('fighter_ledger').select('id, bill_id').eq('shipment_id', s.id).eq('kind', 'cod').maybeSingle();
    if (!undo) {
      if (existing) continue;
      const { error: e } = await g.admin.from('fighter_ledger').insert({
        fighter_id: s.fighter_id, order_id: s.fighter_order_id, shipment_id: s.id, kind: 'cod', sku: null, qty: 0, cost_price: 0, markup: 0,
        amount: -Number(s.cod_amount), notes: `COD diterima HQ — ${s.tracking_number}`, created_by: g.user.id,
      });
      if (e) ledgerErrors.push(`${s.tracking_number}: ${e.message}`);
    } else if (existing) {
      if (!existing.bill_id) {
        await g.admin.from('fighter_ledger').delete().eq('id', existing.id);
      } else {
        const { error: e } = await g.admin.from('fighter_ledger').insert({
          fighter_id: s.fighter_id, order_id: s.fighter_order_id, kind: 'adjust', sku: null, qty: 0, cost_price: 0, markup: 0,
          amount: Number(s.cod_amount), notes: `Batal kredit COD — ${s.tracking_number}`, created_by: g.user.id,
        });
        if (e) ledgerErrors.push(`${s.tracking_number}: ${e.message}`);
      }
    }
  }
  return NextResponse.json({
    success: true, updated: data?.length || 0, fighter_credited: fighterRows.length,
    ...(ledgerErrors.length ? { warning: `Lejar fighter gagal: ${ledgerErrors.join(' · ')}` } : {}),
  });
}
