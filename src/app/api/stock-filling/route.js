import { NextResponse } from 'next/server';
import { guard, STAFF, OWNER } from '@/lib/auth';
import { PRODUCT_KEYS } from '@/lib/products';

// Pengisian Stok — staff upload gambar stok; pemilik buat bacaan ruqyah jarak jauh & tanda selesai.
// GET    ?product=&status=        → senarai + signed URL gambar (STAFF)
// POST   multipart {file, product, qty?, notes?} → upload satu gambar (STAFF)
// PATCH  { id, status: 'done'|'pending' } → tanda selesai / belum (super_admin)
// DELETE ?id=                      → padam (super_admin, atau pengupload selagi belum selesai)

const BUCKET = 'stock-filling';
const MAX_BYTES = 5 * 1024 * 1024;   // gambar dimampatkan di browser dulu (~300KB)
const PRODUCTS = [...PRODUCT_KEYS, 'lain'];

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const { searchParams } = new URL(req.url);
    const product = searchParams.get('product');
    const status  = searchParams.get('status');

    let q = g.admin.from('stock_filling_photos')
      .select('id, product, image_path, qty, notes, status, uploaded_by, done_by, done_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (product && product !== 'all') q = q.eq('product', product);
    if (status && status !== 'all') q = q.eq('status', status);

    const [{ data: rows, error }, { data: countRows }] = await Promise.all([
      q,
      g.admin.from('stock_filling_photos').select('product, status'),
    ]);
    if (error) throw new Error(`Jadual pengisian stok belum wujud — run migration 021. (${error.message})`);

    // Nama pengupload / penanda
    const ids = [...new Set((rows || []).flatMap(r => [r.uploaded_by, r.done_by]).filter(Boolean))];
    const { data: people } = ids.length ? await g.admin.from('profiles').select('id, full_name').in('id', ids) : { data: [] };
    const nameOf = Object.fromEntries((people || []).map(p => [p.id, p.full_name]));

    // Signed URL (1 jam) untuk gambar persendirian
    const paths = (rows || []).map(r => r.image_path);
    const { data: signed } = paths.length ? await g.admin.storage.from(BUCKET).createSignedUrls(paths, 3600) : { data: [] };
    const urlOf = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]));

    // Bilangan belum selesai setiap produk (untuk badge tab)
    const pending = {};
    for (const r of countRows || []) if (r.status === 'pending') pending[r.product] = (pending[r.product] || 0) + 1;

    return NextResponse.json({
      success: true,
      role: g.role, me: g.user.id,
      pending, pending_total: Object.values(pending).reduce((a, b) => a + b, 0),
      data: (rows || []).map(r => ({
        ...r,
        url: urlOf[r.image_path] || null,
        uploaded_by_name: nameOf[r.uploaded_by] || null,
        done_by_name: nameOf[r.done_by] || null,
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
    const form = await req.formData();
    const file = form.get('file');
    const product = PRODUCTS.includes(form.get('product')) ? form.get('product') : 'lain';
    const qty = parseInt(form.get('qty')) || null;
    const notes = String(form.get('notes') || '').trim().slice(0, 300) || null;

    if (!file || typeof file === 'string') return NextResponse.json({ success: false, error: 'Tiada gambar.' }, { status: 400 });
    if (!/^image\//.test(file.type)) return NextResponse.json({ success: false, error: 'Fail mesti gambar.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ success: false, error: 'Gambar terlalu besar (maks 5MB).' }, { status: 400 });

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${product}/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await g.admin.storage.from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (upErr) throw new Error(`Gagal upload gambar: ${upErr.message}`);

    const { data, error } = await g.admin.from('stock_filling_photos')
      .insert({ product, image_path: path, qty, notes, uploaded_by: g.user.id })
      .select('id').single();
    if (error) {
      await g.admin.storage.from(BUCKET).remove([path]).catch(() => {});
      throw error;
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const { id, status } = await req.json();
    if (!['done', 'pending'].includes(status)) return NextResponse.json({ success: false, error: 'Status tidak sah.' }, { status: 400 });
    const done = status === 'done';
    const { error } = await g.admin.from('stock_filling_photos')
      .update({ status, done_by: done ? g.user.id : null, done_at: done ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    const { data: row } = await g.admin.from('stock_filling_photos').select('id, image_path, uploaded_by, status').eq('id', id).maybeSingle();
    if (!row) return NextResponse.json({ success: false, error: 'Tidak dijumpai.' }, { status: 404 });
    const canDelete = g.role === 'super_admin' || (row.uploaded_by === g.user.id && row.status === 'pending');
    if (!canDelete) return NextResponse.json({ success: false, error: 'Hanya boleh padam gambar sendiri yang belum selesai.' }, { status: 403 });

    await g.admin.storage.from(BUCKET).remove([row.image_path]).catch(() => {});
    const { error } = await g.admin.from('stock_filling_photos').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
