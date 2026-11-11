import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { tableMissing } from '@/lib/fighter/server';
import { NV_ENV, errorMessageOf } from '@/lib/ninjavan/api';
import { latestShipmentsBy, pushFighterOrder, cancelShipment, isActiveShipment, statusGroupOf, isCancellableShipment } from '@/lib/ninjavan/shipments';
import { logActivity } from '@/lib/utils/logger';
import { checkShipping } from '@/lib/shipping-validate';
import { editShipping } from '@/lib/ninjavan/edit-shipping';

// HQ — Semua Order Fighter (admin + super_admin). Admin urus operasi bagi pihak fighter.
// GET  ?from=YYYY-MM-DD&to=&fighter=&ship=&pay=&product=&q=  → senarai order + ringkasan jualan setiap fighter + order tersangkut
// POST { action: 'push', ids }        → hantar ke NinjaVan HQ bagi pihak fighter (≤ 10 setiap panggilan) → "Tunggu HQ pack"
// POST { action: 'cancel_nv', id }    → batal parcel NinjaVan (belum dipack) → order kembali "Perlu waybill"
// POST { action: 'cancel_order', id } → batal order (belum dipack) — parcel NinjaVan aktif dibatalkan dahulu
// POST { action: 'edit', id, full_name, phone, street, poskod, daerah, negeri, cancel_parcel?, push? } → betulkan maklumat penghantaran
// GET ?ship=problem → order belum dihantar yang gagal push / maklumat penghantaran bermasalah

export const dynamic = 'force-dynamic';
export const maxDuration = 26;
const MAX_PER_CALL = 10;
const MIGRATION_MSG = 'Jadual order fighter belum wujud — run migration 028 di Supabase.';
const STUCK_HOURS = 48;
const COLS = 'id, fighter_id, source, full_name, phone, address, problem, notes, qty, items, amount, payment_type, payment_status, ship_status, tracking_no, waybill_path, waybill_at, packed_at, returned_at, created_at';

const mytDate = (d = new Date()) => new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
const validDate = s => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : null);
/** Jualan sah = dah bayar / COD sah, bukan dibatalkan / dipulangkan */
const isSale = o => o.payment_status === 'completed' && !['cancelled', 'returned'].includes(o.ship_status);

const cancellable = isCancellableShipment;
const MOVING_MSG = sh => `Parcel ${sh.tracking_number} dah diambil kurier (${sh.status}) — tak boleh dibatalkan. Tandakan "Dah pack" di Packing Fighter.`;

const nvInfo = sh => sh && {
  tracking_number: sh.tracking_number, status: sh.status, group: statusGroupOf(sh), active: isActiveShipment(sh), cancellable: cancellable(sh),
  last_event_at: sh.last_event_at || sh.created_at, printed_at: sh.waybill_printed_at || null,
  cod_remitted_at: sh.cod_remitted_at || null,
  error: sh.status === 'Failed' ? errorMessageOf(sh.response_payload, 'Gagal dihantar') : null,
};

async function fighterNames(db, ids) {
  const list = [...new Set(ids.filter(Boolean))];
  if (!list.length) return {};
  const { data } = await db.from('profiles').select('id, full_name, marketer_code').in('id', list);
  return Object.fromEntries((data || []).map(p => [p.id, p]));
}

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const sp = new URL(req.url).searchParams;
    const today = mytDate();
    const from = validDate(sp.get('from')) || `${today.slice(0, 8)}01`;
    const to = validDate(sp.get('to')) || today;
    const fighter = sp.get('fighter') || '';
    const ship = sp.get('ship') || 'all', pay = sp.get('pay') || 'all', product = sp.get('product') || 'all';
    const q = (sp.get('q') || '').replace(/[,()%*\\:]/g, ' ').trim();
    const range = qb => qb.gte('created_at', `${from}T00:00:00+08:00`).lte('created_at', `${to}T23:59:59+08:00`);

    // Senarai (ikut semua tapisan). Carian nama / telefon / tracking mengabaikan julat tarikh.
    let list = g.admin.from('fighter_orders').select(COLS).order('created_at', { ascending: false }).limit(500);
    if (!q && ship !== 'problem') list = range(list);   // Perlu dibetulkan: semua tarikh
    else list = list.or(`full_name.ilike.%${q}%,phone.ilike.%${q.replace(/\D/g, '') || q}%,tracking_no.ilike.%${q}%`);
    if (fighter) list = list.eq('fighter_id', fighter);
    if (ship === 'stuck') list = list.eq('payment_status', 'completed').eq('ship_status', 'new');
    else if (ship === 'problem') list = list.eq('payment_status', 'completed').in('ship_status', ['new', 'ready']);
    else if (ship !== 'all') list = list.eq('ship_status', ship);
    if (pay !== 'all') list = list.eq('payment_status', pay);
    if (product !== 'all') list = list.eq('source', product);

    // Ringkasan jualan (julat tarikh, semua fighter) — dipaging supaya tiada had 1000 baris
    const summaryRows = [];
    for (let off = 0; ; off += 1000) {
      const { data, error } = await range(g.admin.from('fighter_orders')
        .select('fighter_id, source, amount, payment_type, payment_status, ship_status'))
        .order('created_at').range(off, off + 999);
      if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
      summaryRows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    const stuckBefore = new Date(Date.now() - STUCK_HOURS * 3600e3).toISOString();
    const [{ data: rows, error }, { data: stuck }, { data: fighters }] = await Promise.all([
      list,
      g.admin.from('fighter_orders').select('id, fighter_id, created_at')
        .eq('payment_status', 'completed').eq('ship_status', 'new').lt('created_at', stuckBefore).limit(500),
      g.admin.from('profiles').select('id, full_name, marketer_code').eq('role', 'independent').order('full_name'),
    ]);
    if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);

    const people = await fighterNames(g.admin, [...(rows || []).map(r => r.fighter_id), ...summaryRows.map(r => r.fighter_id)]);
    const label = id => (people[id] ? `${people[id].full_name} (${people[id].marketer_code || '—'})` : '—');

    const per = {}, total = { orders: 0, sales: 0, sale_orders: 0, cod: 0, fpx: 0, pending_pay: 0, returned: 0, cancelled: 0 };
    const byProduct = {};
    for (const r of summaryRows) {
      const f = (per[r.fighter_id] ||= { fighter_id: r.fighter_id, name: label(r.fighter_id), orders: 0, sale_orders: 0, sales: 0, cod: 0, fpx: 0, pending_pay: 0, returned: 0, cancelled: 0, waiting: 0, stuck: 0 });
      f.orders++; total.orders++;
      if (r.payment_status === 'pending') { f.pending_pay++; total.pending_pay++; }
      if (r.ship_status === 'returned') { f.returned++; total.returned++; }
      if (r.ship_status === 'cancelled') { f.cancelled++; total.cancelled++; }
      if (isSale(r)) {
        const a = Number(r.amount || 0), cod = r.payment_type === 'cod';
        f.sale_orders++; f.sales += a; f[cod ? 'cod' : 'fpx'] += a;
        total.sale_orders++; total.sales += a; total[cod ? 'cod' : 'fpx'] += a;
        if (r.ship_status === 'new') f.waiting++;
        const p = (byProduct[r.source || 'sabun-garam'] ||= { orders: 0, sales: 0 });
        p.orders++; p.sales += a;
      }
    }
    for (const s of stuck || []) if (per[s.fighter_id]) per[s.fighter_id].stuck++;
    const round = v => Math.round(v * 100) / 100;
    const summary = Object.values(per).map(f => ({ ...f, sales: round(f.sales), cod: round(f.cod), fpx: round(f.fpx) })).sort((a, b) => b.sales - a.sales);
    ['sales', 'cod', 'fpx'].forEach(k => { total[k] = round(total[k]); });
    Object.values(byProduct).forEach(p => { p.sales = round(p.sales); });

    // Parcel NinjaVan HQ terkini + mod kurier setiap fighter
    const nvOf = await latestShipmentsBy(g.admin, 'fighter_order_id', (rows || []).map(r => r.id)).catch(() => ({}));
    const fids = [...new Set((rows || []).map(r => r.fighter_id))];
    const { data: st } = fids.length ? await g.admin.from('fighter_settings').select('fighter_id, courier').in('fighter_id', fids) : { data: [] };
    const courierOf = Object.fromEntries((st || []).map(s => [s.fighter_id, s.courier || 'hq']));

    // Ralat push terakhir (migration 042) + semakan maklumat penghantaran (order belum dihantar / parcel menunggu pickup)
    const errOf = {};
    const ids = (rows || []).map(r => r.id);
    for (let i = 0; i < ids.length; i += 200) {
      const { data: er, error: ee } = await g.admin.from('fighter_orders').select('id, nv_error, nv_error_at').in('id', ids.slice(i, i + 200)).not('nv_error', 'is', null);
      if (ee) break;   // kolum belum wujud
      for (const r of er || []) errOf[r.id] = r;
    }
    const issuesOf = r => {
      const sh = nvOf[r.id];
      const open = r.payment_status === 'completed' && (r.ship_status === 'new' || (r.ship_status === 'ready' && (!isActiveShipment(sh) || isCancellableShipment(sh))));
      if (!open) return null;
      const c = checkShipping(r);
      return c.errors.length || c.warnings.length ? c : null;
    };
    let out = (rows || []).map(r => ({ ...r, nv_error: errOf[r.id]?.nv_error || null, nv_error_at: errOf[r.id]?.nv_error_at || null, ship_check: issuesOf(r) }));
    if (ship === 'problem') out = out.filter(r => r.nv_error || r.ship_check);

    return NextResponse.json({
      success: true, role: g.role, nv_env: NV_ENV, from, to, stuck_hours: STUCK_HOURS,
      total, summary, by_product: byProduct, stuck_count: (stuck || []).length,
      fighters: (fighters || []).map(f => ({ id: f.id, name: `${f.full_name} (${f.marketer_code || '—'})` })),
      data: out.map(r => ({
        ...r, amount: Number(r.amount || 0), fighter_name: label(r.fighter_id), courier: courierOf[r.fighter_id] || 'hq',
        nv: nvInfo(nvOf[r.id]), stuck: r.payment_status === 'completed' && r.ship_status === 'new' && r.created_at < stuckBefore,
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const b = await req.json().catch(() => ({}));
    const actorName = g.profile?.full_name || 'Admin';

    if (b.action === 'edit') {
      const { order, warnings, cancelled } = await editShipping(g.admin, {
        table: 'fighter_orders', id: b.id, input: b, cancelParcel: !!b.cancel_parcel, actor: { id: g.user.id, name: actorName },
      });
      let push = null;
      if (b.push) {
        const { data: prof } = await g.admin.from('profiles').select('id, full_name, phone, marketer_code').eq('id', order.fighter_id).maybeSingle();
        const { data: settings } = await g.admin.from('fighter_settings').select('*').eq('fighter_id', order.fighter_id).maybeSingle();
        if ((settings?.courier || 'hq') === 'own') push = { ok: false, error: 'Fighter guna akaun NinjaVan sendiri — tidak dihantar.' };
        else {
          try {
            const { shipment } = await pushFighterOrder(g.admin, order, { settings: settings || {}, profile: prof || {}, userId: g.user.id });
            push = { ok: true, tracking_number: shipment.tracking_number };
          } catch (e) { push = { ok: false, error: e.message }; }
        }
      }
      return NextResponse.json({ success: true, warnings, cancelled, push });
    }

    if (b.action === 'push') {
      const ids = (Array.isArray(b.ids) ? b.ids : []).filter(Boolean);
      if (!ids.length) throw new Error('Pilih order dahulu.');
      if (ids.length > MAX_PER_CALL) throw new Error(`Maksimum ${MAX_PER_CALL} order setiap kali.`);
      const { data: orders, error } = await g.admin.from('fighter_orders').select('*').in('id', ids);
      if (error) throw error;
      const fids = [...new Set((orders || []).map(o => o.fighter_id))];
      const [{ data: profs }, { data: sets }] = await Promise.all([
        g.admin.from('profiles').select('id, full_name, phone, marketer_code').in('id', fids),
        g.admin.from('fighter_settings').select('*').in('fighter_id', fids),
      ]);
      const profOf = Object.fromEntries((profs || []).map(p => [p.id, p]));
      const setOf = Object.fromEntries((sets || []).map(s => [s.fighter_id, s]));
      const results = [];
      for (const id of ids) {
        const o = (orders || []).find(x => x.id === id);
        if (!o) { results.push({ id, ok: false, error: 'Order tidak dijumpai' }); continue; }
        const settings = setOf[o.fighter_id] || {};
        if ((settings.courier || 'hq') === 'own') { results.push({ id, ok: false, error: 'Fighter guna akaun NinjaVan sendiri (Mod B) — fighter perlu hantar sendiri.' }); continue; }
        try {
          // Pengirim = jenama fighter (sama seperti fighter hantar sendiri); userId = admin yang menekan
          const { shipment, created } = await pushFighterOrder(g.admin, o, { settings, profile: profOf[o.fighter_id] || {}, userId: g.user.id });
          results.push({ id, ok: true, created, tracking_number: shipment.tracking_number });
        } catch (e) {
          results.push({ id, ok: false, error: e.message });
        }
      }
      const sent = results.filter(r => r.ok).length;
      if (sent) await logActivity(g.admin, {
        userId: g.user.id, actionType: 'fighter_order_push', entityType: 'fighter_order', entityId: results.find(r => r.ok)?.id,
        description: `${actorName} hantar ${sent} order fighter ke NinjaVan HQ (${results.filter(r => r.ok).map(r => r.tracking_number).join(', ')})`,
      });
      return NextResponse.json({ success: sent > 0, env: NV_ENV, sent, failed: results.length - sent, results, error: sent ? undefined : results[0]?.error });
    }

    if (b.action === 'cancel_nv' || b.action === 'cancel_order') {
      const { data: o } = await g.admin.from('fighter_orders').select('id, fighter_id, full_name, payment_type, payment_status, ship_status').eq('id', b.id).maybeSingle();
      if (!o) throw new Error('Order tidak dijumpai.');
      const sh = (await latestShipmentsBy(g.admin, 'fighter_order_id', [o.id]))[o.id];

      if (b.action === 'cancel_nv') {
        if (o.ship_status !== 'ready') throw new Error('Hanya parcel yang belum dipack boleh dibatalkan.');
        if (!isActiveShipment(sh)) throw new Error('Tiada parcel NinjaVan aktif untuk order ini.');
        if (!cancellable(sh)) throw new Error(MOVING_MSG(sh));
        await cancelShipment(g.admin, sh);
        await logActivity(g.admin, {
          userId: g.user.id, actionType: 'fighter_parcel_cancel', entityType: 'fighter_order', entityId: o.id,
          description: `${actorName} batal parcel NinjaVan ${sh.tracking_number} (order fighter ${o.full_name})`,
        });
        return NextResponse.json({ success: true, tracking_number: sh.tracking_number });
      }

      if (!['new', 'ready'].includes(o.ship_status)) throw new Error('Order dah dipack — tak boleh dibatalkan (guna Return di Packing Fighter).');
      // Parcel NinjaVan aktif dibatalkan dulu — gagal batal di NinjaVan = order tak dibatalkan
      if (isActiveShipment(sh) && !cancellable(sh)) throw new Error(MOVING_MSG(sh));
      if (isActiveShipment(sh)) await cancelShipment(g.admin, sh);
      // FPX yang dah dibayar kekal 'completed' (rekod bayaran) — refund diurus fighter di CHIP
      const keepPaid = o.payment_type === 'fpx_payment' && o.payment_status === 'completed';
      const { data, error } = await g.admin.from('fighter_orders')
        .update({ ship_status: 'cancelled', ...(keepPaid ? {} : { payment_status: 'cancelled' }), updated_at: new Date().toISOString() })
        .eq('id', o.id).in('ship_status', ['new', 'ready']).select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('Order dah dipack — tak boleh dibatalkan.');
      await logActivity(g.admin, {
        userId: g.user.id, actionType: 'fighter_order_cancel', entityType: 'fighter_order', entityId: o.id,
        description: `${actorName} batal order fighter ${o.full_name}${isActiveShipment(sh) ? ` + parcel ${sh.tracking_number}` : ''}`,
      });
      return NextResponse.json({ success: true, keep_paid: keepPaid });
    }

    throw new Error('Tindakan tidak sah.');
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
