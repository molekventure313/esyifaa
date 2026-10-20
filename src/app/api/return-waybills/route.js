import { NextResponse } from 'next/server';
import { guard, STAFF, OWNER } from '@/lib/auth';
import { returnStock } from '@/lib/stock';
import { BUCKET } from '@/lib/return-waybills';

// Return Parcel — staff upload gambar waybill parcel yang dipulangkan; gambar dibaca & dipadankan dengan order.
// GET    ?status=pending|review|processed|unmatched|all → senarai + signed URL gambar + order dipadankan (STAFF)
//        (proses automatik AI: POST /api/return-waybills/process — lib/return-waybills.js)
// POST   multipart {file, notes?}                → upload satu gambar (STAFF)
// PATCH  { id, action: 'process', submission_id } → sahkan return (cth dari 'review') + gambar 'processed' (STAFF)
//        { id, action: 'unmatched', note }        → gambar tak dapat dibaca / dipadan (STAFF)
//        { id, action: 'reset' }                  → kembali 'pending' — TIDAK batalkan return order (super_admin)
// DELETE ?id=                                     → padam (super_admin, atau pengupload selagi belum diproses)

const MAX_BYTES = 5 * 1024 * 1024;   // gambar dimampatkan di browser dulu (~300KB)
const TABLE_MISSING = 'Jadual return parcel belum wujud — run migration 023.';

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const status = new URL(req.url).searchParams.get('status') || 'pending';

    let q = g.admin.from('return_waybills')
      .select('id, image_path, notes, status, submission_id, process_note, uploaded_by, processed_by, processed_at, created_at, extracted, candidates, image_deleted_at')
      .order('created_at', { ascending: false })
      .limit(300);
    if (status === 'pending') q = q.in('status', ['pending', 'processing']);
    else if (status !== 'all') q = q.eq('status', status);

    const [{ data: rows, error }, { data: countRows }] = await Promise.all([
      q,
      g.admin.from('return_waybills').select('status'),
    ]);
    if (error) throw new Error(`${TABLE_MISSING} (${error.message})`);

    // Nama pengupload / pemproses
    const ids = [...new Set((rows || []).flatMap(r => [r.uploaded_by, r.processed_by]).filter(Boolean))];
    const { data: people } = ids.length ? await g.admin.from('profiles').select('id, full_name').in('id', ids) : { data: [] };
    const nameOf = Object.fromEntries((people || []).map(p => [p.id, p.full_name]));

    // Order yang dipadankan
    const subIds = [...new Set((rows || []).map(r => r.submission_id).filter(Boolean))];
    const { data: subs } = subIds.length
      ? await g.admin.from('submissions').select('id, full_name, phone, created_at, amount_paid, problem, returned_at').in('id', subIds)
      : { data: [] };
    const subOf = Object.fromEntries((subs || []).map(s => [s.id, s]));

    // Signed URL (1 jam) untuk gambar persendirian
    const paths = (rows || []).filter(r => !r.image_deleted_at).map(r => r.image_path);
    const { data: signed } = paths.length ? await g.admin.storage.from(BUCKET).createSignedUrls(paths, 3600) : { data: [] };
    const urlOf = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]));

    const counts = { pending: 0, review: 0, processed: 0, unmatched: 0 };
    for (const r of countRows || []) { const k = r.status === 'processing' ? 'pending' : r.status; counts[k] = (counts[k] || 0) + 1; }

    return NextResponse.json({
      success: true,
      role: g.role, me: g.user.id, counts,
      data: (rows || []).map(r => {
        const s = subOf[r.submission_id];
        return {
          ...r,
          url: r.image_deleted_at ? null : (urlOf[r.image_path] || null),
          uploaded_by_name: nameOf[r.uploaded_by] || null,
          processed_by_name: nameOf[r.processed_by] || null,
          order: s ? {
            id: s.id, full_name: s.full_name, phone: s.phone, created_at: s.created_at,
            amount: s.amount_paid, returned_at: s.returned_at,
            pakej: (s.problem || '').match(/Pakej:\s*([^|]+)/i)?.[1]?.trim() || null,
          } : null,
        };
      }),
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
    const notes = String(form.get('notes') || '').trim().slice(0, 300) || null;

    if (!file || typeof file === 'string') return NextResponse.json({ success: false, error: 'Tiada gambar.' }, { status: 400 });
    if (!/^image\//.test(file.type)) return NextResponse.json({ success: false, error: 'Fail mesti gambar.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ success: false, error: 'Gambar terlalu besar (maks 5MB).' }, { status: 400 });

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await g.admin.storage.from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (upErr) throw new Error(`Gagal upload gambar: ${upErr.message}`);

    const { data, error } = await g.admin.from('return_waybills')
      .insert({ image_path: path, notes, uploaded_by: g.user.id })
      .select('id').single();
    if (error) {
      await g.admin.storage.from(BUCKET).remove([path]).catch(() => {});
      throw new Error(`${TABLE_MISSING} (${error.message})`);
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const { id, action, submission_id, note } = await req.json();
    const { data: row } = await g.admin.from('return_waybills').select('id, status, submission_id').eq('id', id).maybeSingle();
    if (!row) return NextResponse.json({ success: false, error: 'Gambar tidak dijumpai.' }, { status: 404 });
    const now = new Date().toISOString();

    if (action === 'process') {
      if (row.status === 'processed') return NextResponse.json({ success: false, error: 'Gambar ini dah diproses.' }, { status: 409 });
      if (row.status === 'processing') return NextResponse.json({ success: false, error: 'Gambar ini sedang dibaca AI — cuba sebentar lagi.' }, { status: 409 });
      if (!submission_id) return NextResponse.json({ success: false, error: 'Pilih order.' }, { status: 400 });

      // Tanda order return — pulangkan stok & keluarkan dari sales. Order dah di-return → pautkan sahaja (stok tak dipulangkan dua kali).
      let processNote = null, qtyReturned = 0;
      try {
        const r = await returnStock({ submissionId: submission_id, adminUserId: g.user.id });
        qtyReturned = r.qtyReturned;
      } catch (e) {
        if (!/sudah di-return/i.test(e.message)) return NextResponse.json({ success: false, error: e.message }, { status: 400 });
        processNote = 'Order dah ditanda return sebelum ini — stok tidak dipulangkan lagi.';
      }

      const { error } = await g.admin.from('return_waybills').update({
        status: 'processed', submission_id, process_note: processNote, processed_by: g.user.id, processed_at: now,
      }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, qty_returned: qtyReturned, note: processNote });
    }

    if (action === 'unmatched') {
      const { error } = await g.admin.from('return_waybills').update({
        status: 'unmatched', submission_id: null, process_note: String(note || '').trim().slice(0, 300) || null,
        processed_by: g.user.id, processed_at: now,
      }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'reset') {
      if (!OWNER.includes(g.role)) return NextResponse.json({ success: false, error: 'Hanya pemilik boleh set semula.' }, { status: 403 });
      const { error } = await g.admin.from('return_waybills').update({
        status: 'pending', submission_id: null, process_note: null, processed_by: null, processed_at: null,
      }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Tindakan tidak sah.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    const { data: row } = await g.admin.from('return_waybills').select('id, image_path, uploaded_by, status').eq('id', id).maybeSingle();
    if (!row) return NextResponse.json({ success: false, error: 'Tidak dijumpai.' }, { status: 404 });
    const canDelete = g.role === 'super_admin' || (row.uploaded_by === g.user.id && row.status === 'pending');
    if (!canDelete) return NextResponse.json({ success: false, error: 'Hanya boleh padam gambar sendiri yang belum diproses.' }, { status: 403 });

    await g.admin.storage.from(BUCKET).remove([row.image_path]).catch(() => {});
    const { error } = await g.admin.from('return_waybills').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
