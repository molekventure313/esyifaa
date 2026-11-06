import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { packOrder, returnOrder, fighterDamageState } from '@/lib/fighter/orders';
import { tableMissing } from '@/lib/fighter/server';
import { latestShipmentsBy, isActiveShipment, statusGroupOf } from '@/lib/ninjavan/shipments';

// HQ — Packing Fighter (staff + super_admin). Maklumat penghantaran sahaja (tiada statistik jualan fighter).
// GET   ?status=ready|packed|returned&q= → order + waybill (signed URL)
// PATCH { ids, action: 'pack' }   → tolak stok HQ + caj lejar fighter (kos + markup)
// PATCH { id, action: 'return', damaged?: [{sku, qty}], reason? } → parcel pulang ke HQ: stok masuk semula + kredit caj;
//        unit rosak ditolak semula dari stok & fighter tanggung (dicaj semula)

const BUCKET = 'fighter-files';
const MIGRATION_MSG = 'Jadual order fighter belum wujud — run migration 028 di Supabase.';

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const sp = new URL(req.url).searchParams;
    const status = ['ready', 'packed', 'returned'].includes(sp.get('status')) ? sp.get('status') : 'ready';
    const q = (sp.get('q') || '').replace(/[,()%*\\:]/g, ' ').trim();
    let query = g.admin.from('fighter_orders')
      .select('id, fighter_id, source, full_name, phone, address, problem, items, payment_type, amount, tracking_no, waybill_path, waybill_at, packed_at, returned_at, created_at')
      .eq('ship_status', status)
      .order(status === 'ready' ? 'waybill_at' : status === 'packed' ? 'packed_at' : 'returned_at', { ascending: status === 'ready' })
      .limit(300);
    if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q.replace(/\D/g, '') || q}%,tracking_no.ilike.%${q}%`);
    const [{ data: rows, error }, { data: counts }] = await Promise.all([
      query,
      g.admin.from('fighter_orders').select('ship_status').eq('ship_status', 'ready'),
    ]);
    if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);

    const fids = [...new Set((rows || []).map(r => r.fighter_id))];
    const { data: people } = fids.length ? await g.admin.from('profiles').select('id, full_name, marketer_code').in('id', fids) : { data: [] };
    const nameOf = Object.fromEntries((people || []).map(p => [p.id, `${p.full_name} (${p.marketer_code})`]));
    const paths = [...new Set((rows || []).map(r => r.waybill_path).filter(Boolean))];
    const { data: signed } = paths.length ? await g.admin.storage.from(BUCKET).createSignedUrls(paths, 3600) : { data: [] };
    const urlOf = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]));

    const dmgOf = status === 'returned' ? await fighterDamageState(g.admin, (rows || []).map(r => r.id)) : {};
    // Parcel NinjaVan HQ (fighter guna akaun HQ) — waybill dari API + tanda dah print
    const nvOf = await latestShipmentsBy(g.admin, 'fighter_order_id', (rows || []).map(r => r.id)).catch(() => ({}));
    const nvInfo = sh => (isActiveShipment(sh) ? {
      tracking_number: sh.tracking_number, status: sh.status, group: statusGroupOf(sh),
      printed_at: sh.waybill_printed_at || null, print_count: sh.waybill_print_count || 0,
    } : null);

    return NextResponse.json({
      success: true,
      role: g.role,
      ready_count: (counts || []).length,
      data: (rows || []).map(r => ({
        ...r, amount: Number(r.amount), fighter_name: nameOf[r.fighter_id] || '—', waybill_url: urlOf[r.waybill_path] || null,
        damage: dmgOf[r.id] || null, nv: nvInfo(nvOf[r.id]),
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const actor = { id: g.user.id };
    if (b.action === 'pack') {
      const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).filter(Boolean).slice(0, 100);
      if (!ids.length) throw new Error('Pilih order dahulu.');
      const results = [];
      for (const id of ids) {
        try { results.push({ id, ok: true, ...(await packOrder(g.admin, id, actor)) }); }
        catch (e) { results.push({ id, ok: false, error: e.message }); }
      }
      const failed = results.filter(r => !r.ok);
      return NextResponse.json({ success: failed.length === 0, results, error: failed.length ? `${failed.length} order gagal: ${failed[0].error}` : undefined });
    }
    if (b.action === 'return') {
      const r = await returnOrder(g.admin, b.id, actor, { damaged: b.damaged, reason: b.reason });
      return NextResponse.json({ success: true, ...r });
    }
    throw new Error('Tindakan tidak sah.');
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
