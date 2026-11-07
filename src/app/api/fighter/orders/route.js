import { NextResponse } from 'next/server';
import { fighterGuard, tableMissing } from '@/lib/fighter/server';
import { generateNinjaVanCSV } from '@/lib/ninjavan-csv';
import { NV_ENV, errorMessageOf } from '@/lib/ninjavan/api';
import { latestShipmentsBy, statusGroupOf, isActiveShipment, cancelShipment, isCancellableShipment } from '@/lib/ninjavan/shipments';

// Fighter — order sendiri
// GET   ?ship=all|new|ready|packed|returned|cancelled&pay=all|completed|pending&q= → senarai + bilangan
// POST  { action: 'export', ids }  → CSV NinjaVan (akaun fighter) untuk order sah yang belum dipack
// PATCH { id, action: 'cancel' }  → batal order yang belum dipack

const MIGRATION_MSG = 'Jadual order fighter belum wujud — run migration 028 di Supabase.';
const COLS = 'id, source, full_name, phone, address, problem, notes, qty, items, amount, payment_type, payment_status, ship_status, tracking_no, waybill_path, exported_at, waybill_at, packed_at, returned_at, created_at';

export async function GET(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const sp = new URL(req.url).searchParams;
    const ship = sp.get('ship') || 'all', pay = sp.get('pay') || 'all';
    const q = (sp.get('q') || '').replace(/[,()%*\\:]/g, ' ').trim();
    let query = g.admin.from('fighter_orders').select(COLS).eq('fighter_id', g.user.id).order('created_at', { ascending: false }).limit(500);
    if (ship !== 'all') query = query.eq('ship_status', ship);
    if (pay !== 'all') query = query.eq('payment_status', pay);
    if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q.replace(/\D/g, '') || q}%,tracking_no.ilike.%${q}%`);
    const [{ data, error }, { data: all }] = await Promise.all([
      query,
      g.admin.from('fighter_orders').select('ship_status, payment_status').eq('fighter_id', g.user.id),
    ]);
    if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
    // Parcel NinjaVan HQ terkini setiap order (status dari webhook)
    const nv = await latestShipmentsBy(g.admin, 'fighter_order_id', (data || []).map(o => o.id)).catch(() => ({}));
    for (const o of data || []) {
      const sh = nv[o.id];
      if (sh) o.nv = {
        tracking_number: sh.tracking_number, status: sh.status, event: sh.event, group: statusGroupOf(sh), cod_amount: Number(sh.cod_amount || 0),
        last_event_at: sh.last_event_at || sh.created_at, active: isActiveShipment(sh), cod_remitted_at: sh.cod_remitted_at,
        error: sh.status === 'Failed' ? errorMessageOf(sh.response_payload, 'Gagal dihantar') : null,
      };
    }
    const { data: st } = await g.admin.from('fighter_settings').select('courier').eq('fighter_id', g.user.id).maybeSingle();
    const counts = {};
    for (const r of all || []) {
      if (r.payment_status === 'completed' || r.ship_status !== 'new') counts[r.ship_status] = (counts[r.ship_status] || 0) + 1;
      if (r.payment_status === 'pending') counts.pending_pay = (counts.pending_pay || 0) + 1;
    }
    return NextResponse.json({ success: true, data, counts, courier: st?.courier || 'hq', nv_env: NV_ENV });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const { action, ids } = await req.json();
    if (action !== 'export') throw new Error('Tindakan tidak sah.');
    if (!Array.isArray(ids) || !ids.length) throw new Error('Pilih order dahulu.');
    const { data: orders, error } = await g.admin.from('fighter_orders').select(COLS)
      .eq('fighter_id', g.user.id).in('id', ids.slice(0, 500))
      .eq('payment_status', 'completed').in('ship_status', ['new', 'ready'])
      .order('created_at', { ascending: true });
    if (error) throw error;
    if (!orders?.length) throw new Error('Tiada order sah untuk export (mesti dah bayar / COD & belum dipack).');
    const { data: s } = await g.admin.from('fighter_settings').select('ninjavan_shipper_no').eq('fighter_id', g.user.id).maybeSingle();
    const csv = generateNinjaVanCSV(orders.map(o => ({ ...o, amount_paid: o.amount })), s?.ninjavan_shipper_no || '');
    await g.admin.from('fighter_orders').update({ exported_at: new Date().toISOString() }).in('id', orders.map(o => o.id));
    const d = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
    return new NextResponse('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ninjavan-${g.profile.marketer_code || 'fighter'}-${d}.csv"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const { id, action } = await req.json();
    if (action !== 'cancel') throw new Error('Tindakan tidak sah.');
    const { data: o } = await g.admin.from('fighter_orders').select('payment_type, payment_status, ship_status').eq('id', id).eq('fighter_id', g.user.id).maybeSingle();
    if (!o) throw new Error('Order tidak dijumpai.');
    if (!['new', 'ready'].includes(o.ship_status)) throw new Error('Order dah dipack — tak boleh dibatalkan.');
    // Parcel NinjaVan HQ aktif (belum dipack) dibatalkan dulu — gagal batal di NinjaVan = order tak dibatalkan
    const sh = (await latestShipmentsBy(g.admin, 'fighter_order_id', [id]))[id];
    if (isActiveShipment(sh) && !isCancellableShipment(sh)) throw new Error(`Parcel dah diambil kurier (${sh.status}) — tak boleh dibatalkan.`);
    if (isActiveShipment(sh)) await cancelShipment(g.admin, sh);
    // FPX yang dah dibayar kekal 'completed' (rekod bayaran) — refund diurus fighter sendiri di CHIP
    const keepPaid = o.payment_type === 'fpx_payment' && o.payment_status === 'completed';
    const { data, error } = await g.admin.from('fighter_orders')
      .update({ ship_status: 'cancelled', ...(keepPaid ? {} : { payment_status: 'cancelled' }), updated_at: new Date().toISOString() })
      .eq('id', id).eq('fighter_id', g.user.id).in('ship_status', ['new', 'ready']).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('Order dah dipack — tak boleh dibatalkan.');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
