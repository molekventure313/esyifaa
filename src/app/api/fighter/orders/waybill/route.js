import { NextResponse } from 'next/server';
import { fighterGuard } from '@/lib/fighter/server';

// Fighter — waybill NinjaVan (dari akaun NinjaVan fighter) untuk order terpilih
// POST multipart { file (PDF/gambar), ids (JSON), tracking? } → satu fail untuk semua order dipilih → ship_status 'ready'
// GET  ?id=<order>                                          → signed URL waybill (1 jam)

const BUCKET = 'fighter-files';
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const form = await req.formData();
    const file = form.get('file');
    let ids = [];
    try { ids = JSON.parse(form.get('ids') || '[]'); } catch { /* kosong */ }
    const tracking = String(form.get('tracking') || '').trim().slice(0, 40) || null;
    if (!Array.isArray(ids) || !ids.length) throw new Error('Pilih order dahulu.');
    if (!file || typeof file === 'string') throw new Error('Tiada fail waybill.');
    if (!/^(application\/pdf|image\/)/.test(file.type)) throw new Error('Waybill mesti PDF atau gambar.');
    if (file.size > MAX_BYTES) throw new Error('Fail terlalu besar (maks 10MB).');

    const { data: orders } = await g.admin.from('fighter_orders').select('id')
      .eq('fighter_id', g.user.id).in('id', ids.slice(0, 200))
      .eq('payment_status', 'completed').in('ship_status', ['new', 'ready']);
    if (!orders?.length) throw new Error('Tiada order sah (mesti dah bayar / COD & belum dipack).');

    const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg';
    const path = `waybills/${g.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await g.admin.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (upErr) throw new Error(`Gagal upload waybill: ${upErr.message}`);

    const now = new Date().toISOString();
    const { error } = await g.admin.from('fighter_orders')
      .update({ ship_status: 'ready', waybill_path: path, waybill_at: now, updated_at: now, ...(tracking && orders.length === 1 ? { tracking_no: tracking } : {}) })
      .in('id', orders.map(o => o.id));
    if (error) throw error;
    return NextResponse.json({ success: true, count: orders.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function GET(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  const { data: o } = await g.admin.from('fighter_orders').select('waybill_path').eq('id', id).eq('fighter_id', g.user.id).maybeSingle();
  if (!o?.waybill_path) return NextResponse.json({ success: false, error: 'Tiada waybill.' }, { status: 404 });
  const { data } = await g.admin.storage.from(BUCKET).createSignedUrl(o.waybill_path, 3600);
  return NextResponse.json({ success: true, url: data?.signedUrl || null });
}
