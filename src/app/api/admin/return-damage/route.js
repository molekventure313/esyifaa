import { NextResponse } from 'next/server';
import { guard, STAFF, OWNER } from '@/lib/auth';
import { damageState, recordDamage, clearDamage, DAMAGE_REF_TYPE } from '@/lib/stock-damage';
import { fighterDamageState, recordFighterDamage, clearFighterDamage } from '@/lib/fighter/orders';

// Stok rosak dari parcel return — unit yang dipulangkan tapi tak boleh dijual semula.
// Order kekal dikira return; unit rosak ditolak dari stok. Order fighter: fighter tanggung (dicaj semula).
// GET    ?submission_id= | ?fighter_order_id=   → unit dipulangkan / rosak setiap produk (STAFF)
// GET    ?list=1&days=90                         → log stok rosak + nilai kerugian (STAFF)
// POST   { submission_id | fighter_order_id, items: [{product_id, qty}], reason } → rekod rosak (STAFF)
// DELETE { submission_id | fighter_order_id }    → batal semua rekod rosak order itu (super_admin)

const target = o => (o.fighter_order_id ? { fighter: String(o.fighter_order_id) } : o.submission_id ? { hq: String(o.submission_id) } : null);

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const sp = new URL(req.url).searchParams;
    if (sp.get('list')) {
      const days = Math.min(Math.max(parseInt(sp.get('days') || '90', 10) || 90, 1), 730);
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const { data, error } = await g.admin.from('stock_movements')
        .select('id, qty, notes, reference_id, created_at, created_by, products(sku, name, unit, cost_price)')
        .eq('movement_type', 'out').eq('reference_type', DAMAGE_REF_TYPE)
        .gte('created_at', since).order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      const ids = [...new Set((data || []).map(d => d.created_by).filter(Boolean))];
      const { data: people } = ids.length ? await g.admin.from('profiles').select('id, full_name').in('id', ids) : { data: [] };
      const nameOf = Object.fromEntries((people || []).map(p => [p.id, p.full_name]));
      const rows = (data || []).map(d => ({
        id: d.id, created_at: d.created_at, qty: d.qty, notes: d.notes, sku: d.products?.sku, name: d.products?.name, unit: d.products?.unit,
        loss: Math.round(d.qty * Number(d.products?.cost_price || 0) * 100) / 100,
        fighter: String(d.reference_id || '').startsWith('fighter:'), by: nameOf[d.created_by] || null,
      }));
      const bySku = {};
      for (const r of rows) { const b = (bySku[r.sku] ||= { sku: r.sku, name: r.name, units: 0, loss: 0, fighter_units: 0 }); b.units += r.qty; b.loss += r.fighter ? 0 : r.loss; if (r.fighter) b.fighter_units += r.qty; }
      Object.values(bySku).forEach(b => { b.loss = Math.round(b.loss * 100) / 100; });
      return NextResponse.json({ success: true, days, rows, by_sku: Object.values(bySku), total_loss: Math.round(rows.filter(r => !r.fighter).reduce((t, r) => t + r.loss, 0) * 100) / 100 });
    }
    const t = target({ submission_id: sp.get('submission_id'), fighter_order_id: sp.get('fighter_order_id') });
    if (!t) throw new Error('Rujukan order diperlukan.');
    const items = t.fighter ? (await fighterDamageState(g.admin, [t.fighter]))[t.fighter] : (await damageState(g.admin, [t.hq]))[t.hq];
    return NextResponse.json({ success: true, items: items || [] });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const t = target(b);
    if (!t) throw new Error('Rujukan order diperlukan.');
    if (t.fighter) {
      const r = await recordFighterDamage(g.admin, t.fighter, b.items, b.reason, { id: g.user.id });
      return NextResponse.json({ success: true, ...r });
    }
    const { data: sub } = await g.admin.from('submissions').select('id, full_name, returned_at').eq('id', t.hq).maybeSingle();
    if (!sub) throw new Error('Order tidak dijumpai.');
    if (!sub.returned_at) throw new Error('Order ini belum ditanda return.');
    const r = await recordDamage(g.admin, { refId: sub.id, items: b.items, reason: b.reason, label: sub.full_name, actorId: g.user.id });
    return NextResponse.json({ success: true, units: r.units });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const t = target(await req.json());
    if (!t) throw new Error('Rujukan order diperlukan.');
    if (t.fighter) return NextResponse.json({ success: true, ...(await clearFighterDamage(g.admin, t.fighter, { id: g.user.id })) });
    const removed = await clearDamage(g.admin, t.hq);
    return NextResponse.json({ success: true, units: removed.reduce((x, d) => x + d.qty, 0) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
