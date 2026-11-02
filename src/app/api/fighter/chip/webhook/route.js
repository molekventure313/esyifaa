import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyChipSignature, applyChipStatus } from '@/lib/fighter/orders';

// Webhook CHIP untuk bil FIGHTER (?o=<order id>). Tandatangan disahkan dengan public key CHIP fighter
// (diambil automatik semasa fighter sambung CHIP). Bil mesti sepadan dengan order.
export async function POST(req) {
  const id = new URL(req.url).searchParams.get('o') || '';
  const raw = await req.text();
  let payload;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Missing order' }, { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin.from('fighter_orders').select('id, fighter_id, chip_bill_id, payment_status').eq('id', id).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const billId = String(payload?.id || '').trim();
  if (!billId || billId !== order.chip_bill_id) return NextResponse.json({ error: 'Bill mismatch' }, { status: 400 });

  const { data: s } = await admin.from('fighter_settings').select('chip_public_key').eq('fighter_id', order.fighter_id).maybeSingle();
  if (!verifyChipSignature(raw, req.headers.get('x-signature'), s?.chip_public_key)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const status = await applyChipStatus(admin, order, payload?.status);
  return NextResponse.json({ success: true, status });
}
