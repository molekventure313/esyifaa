import { NextResponse } from 'next/server';
import { fighterGuard } from '@/lib/fighter/server';
import { NV_ENV } from '@/lib/ninjavan/api';
import { latestShipmentsBy, pushFighterOrder, cancelShipment, isActiveShipment } from '@/lib/ninjavan/shipments';
import { buildNvSummary } from '@/lib/ninjavan/summary';
import { waybillPdfResponse, WAYBILL_MAX } from '@/lib/ninjavan/waybill';

// Fighter — guna akaun NinjaVan HQ (kurier dikongsi; order kekal dalam fighter_orders)
// GET  ?period=…              → Pos & COD fighter (parcel sendiri sahaja)
// GET  ?waybill=<id>,<id>     → PDF waybill (lihat / cetak sendiri — tidak menanda "dah print" HQ)
// POST { action: 'push', ids }   → cipta parcel (≤ 10 setiap panggilan) → order jadi "Tunggu HQ pack"
// POST { action: 'cancel', id }  → batal parcel yang belum dipack (Pending Pickup) → order kembali "Perlu waybill"
export const dynamic = 'force-dynamic';
export const maxDuration = 26;
const MAX_PER_CALL = 10;

export async function GET(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  const sp = new URL(req.url).searchParams;
  try {
    const wb = sp.get('waybill');
    if (wb) {
      const ids = wb.split(',').map(s => s.trim()).filter(Boolean).slice(0, WAYBILL_MAX);
      const shipments = await latestShipmentsBy(g.admin, 'fighter_order_id', ids);
      const own = ids.map(id => shipments[id]).filter(s => s?.fighter_id === g.user.id);
      return waybillPdfResponse(g.admin, own);
    }
    const out = await buildNvSummary(g.admin, { period: sp.get('period') || 'month', scope: { fighterId: g.user.id } });
    return NextResponse.json({ success: true, ...out });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const b = await req.json().catch(() => ({}));
    const { data: settings } = await g.admin.from('fighter_settings').select('*').eq('fighter_id', g.user.id).maybeSingle();

    if (b.action === 'push') {
      if ((settings?.courier || 'hq') === 'own') throw new Error('Akaun anda guna NinjaVan sendiri — tukar ke "NinjaVan HQ" di Tetapan Akaun.');
      const ids = (Array.isArray(b.ids) ? b.ids : []).filter(Boolean);
      if (!ids.length) throw new Error('Pilih order dahulu.');
      if (ids.length > MAX_PER_CALL) throw new Error(`Maksimum ${MAX_PER_CALL} order setiap kali.`);
      const { data: orders, error } = await g.admin.from('fighter_orders').select('*').eq('fighter_id', g.user.id).in('id', ids);
      if (error) throw error;
      const results = [];
      for (const id of ids) {
        const o = (orders || []).find(x => x.id === id);
        if (!o) { results.push({ id, ok: false, error: 'Order tidak dijumpai' }); continue; }
        try {
          const { shipment, created } = await pushFighterOrder(g.admin, o, { settings: settings || {}, profile: g.profile, userId: g.user.id });
          results.push({ id, ok: true, created, tracking_number: shipment.tracking_number });
        } catch (e) {
          results.push({ id, ok: false, error: e.message });
        }
      }
      const sent = results.filter(r => r.ok).length;
      return NextResponse.json({ success: sent > 0, env: NV_ENV, sent, failed: results.length - sent, results });
    }

    if (b.action === 'cancel') {
      const { data: o } = await g.admin.from('fighter_orders').select('id, ship_status').eq('id', b.id).eq('fighter_id', g.user.id).maybeSingle();
      if (!o) throw new Error('Order tidak dijumpai.');
      if (o.ship_status !== 'ready') throw new Error('Hanya parcel yang belum dipack HQ boleh dibatalkan.');
      const sh = (await latestShipmentsBy(g.admin, 'fighter_order_id', [o.id]))[o.id];
      if (!isActiveShipment(sh)) throw new Error('Tiada parcel NinjaVan aktif untuk order ini.');
      await cancelShipment(g.admin, sh);
      return NextResponse.json({ success: true, tracking_number: sh.tracking_number });
    }

    throw new Error('Tindakan tidak sah.');
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
