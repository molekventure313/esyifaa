import { NextResponse } from 'next/server';
import { fighterGuard, tableMissing } from '@/lib/fighter/server';
import { ledgerTotals } from '@/lib/fighter/orders';

// Fighter — caj stok HQ & bil
// GET  → lejar terkini, jumlah belum dibil, bil (dengan resit)
// POST multipart { bill_id, file } → upload resit bayaran bil

const BUCKET = 'fighter-files';
const MIGRATION_MSG = 'Jadual bil fighter belum wujud — run migration 028 di Supabase.';

export async function GET() {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const [{ data: ledger, error: le }, { data: unbilled }, { data: bills, error: be }] = await Promise.all([
      g.admin.from('fighter_ledger').select('id, kind, sku, qty, cost_price, markup, amount, notes, bill_id, created_at')
        .eq('fighter_id', g.user.id).order('created_at', { ascending: false }).limit(300),
      g.admin.from('fighter_ledger').select('kind, qty, markup, amount').eq('fighter_id', g.user.id).is('bill_id', null),
      g.admin.from('fighter_bills').select('id, bill_no, period_from, period_to, total, status, receipt_path, paid_at, paid_ref, created_at')
        .eq('fighter_id', g.user.id).order('created_at', { ascending: false }).limit(60),
    ]);
    if (le || be) throw new Error(tableMissing(le || be) ? MIGRATION_MSG : (le || be).message);
    const paths = (bills || []).map(b => b.receipt_path).filter(Boolean);
    const { data: signed } = paths.length ? await g.admin.storage.from(BUCKET).createSignedUrls(paths, 3600) : { data: [] };
    const urlOf = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]));
    const unbilledT = ledgerTotals(unbilled);
    return NextResponse.json({
      success: true,
      unbilled: unbilledT.net,
      outstanding: Math.round((bills || []).filter(b => b.status === 'unpaid').reduce((t, b) => t + Number(b.total), 0) * 100) / 100,
      ledger: (ledger || []).map(r => ({ ...r, amount: Number(r.amount), unit_price: Number(r.cost_price) + Number(r.markup) })),
      bills: (bills || []).map(b => ({ ...b, total: Number(b.total), receipt_url: b.receipt_path ? urlOf[b.receipt_path] || null : null })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const form = await req.formData();
    const billId = form.get('bill_id'), file = form.get('file');
    if (!file || typeof file === 'string') throw new Error('Tiada fail resit.');
    if (!/^(application\/pdf|image\/)/.test(file.type)) throw new Error('Resit mesti PDF atau gambar.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Fail terlalu besar (maks 8MB).');
    const { data: bill } = await g.admin.from('fighter_bills').select('id, status').eq('id', billId).eq('fighter_id', g.user.id).maybeSingle();
    if (!bill) throw new Error('Bil tidak dijumpai.');
    if (bill.status === 'paid') throw new Error('Bil ini dah disahkan bayar.');
    const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg';
    const path = `receipts/${g.user.id}/${bill.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await g.admin.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (upErr) throw new Error(`Gagal upload resit: ${upErr.message}`);
    const { error } = await g.admin.from('fighter_bills').update({ receipt_path: path }).eq('id', bill.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
