import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { refreshChipStatus } from '@/lib/fighter/orders';

// TQ page order fighter — status bayaran (semak terus CHIP fighter kalau webhook belum sampai),
// no. WhatsApp & pixel fighter. Tiada data peribadi selain nama pertama.
export async function GET(req) {
  const id = new URL(req.url).searchParams.get('o') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ success: false }, { status: 400 });
  try {
    const admin = createAdminClient();
    const { data: order } = await admin.from('fighter_orders')
      .select('id, fighter_id, full_name, amount, payment_type, payment_status, chip_bill_id, source, created_at').eq('id', id).maybeSingle();
    if (!order) return NextResponse.json({ success: false }, { status: 404 });
    const status = await refreshChipStatus(admin, order);
    const [{ data: s }, { data: p }] = await Promise.all([
      admin.from('fighter_settings').select('whatsapp, meta_pixel_id, sender_name').eq('fighter_id', order.fighter_id).maybeSingle(),
      admin.from('profiles').select('full_name, marketer_code').eq('id', order.fighter_id).maybeSingle(),
    ]);
    return NextResponse.json({
      success: true,
      order_ref: order.id.slice(0, 8).toUpperCase(),
      first_name: (order.full_name || '').split(' ')[0],
      amount: Number(order.amount),
      payment_type: order.payment_type,
      payment_status: status,
      source: order.source,
      seller: s?.sender_name || p?.full_name || '',
      code: p?.marketer_code || '',
      whatsapp: s?.whatsapp || null,
      pixel_id: s?.meta_pixel_id || null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
