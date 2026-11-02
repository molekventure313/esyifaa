import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { guard, STAFF } from '@/lib/auth';
import { latestShipmentsFor, getWaybill } from '@/lib/ninjavan/shipments';

// GET ?ids=<submission_id>,<submission_id> — PDF waybill (digabung jika lebih dari satu) untuk dicetak.
// Waybill dijana sekali dari API kemudian dibaca dari storage (getWaybill).
export const dynamic = 'force-dynamic';
export const maxDuration = 26;
const MAX = 30;

export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  const ids = (new URL(req.url).searchParams.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX);
  if (!ids.length) return NextResponse.json({ success: false, error: 'Tiada order dipilih.' }, { status: 400 });

  const shipments = await latestShipmentsFor(g.admin, ids);
  const ready = ids.map(id => shipments[id]).filter(s => s?.tracking_number && s.status !== 'Cancelled');
  if (!ready.length) return NextResponse.json({ success: false, error: 'Tiada parcel NinjaVan untuk order ini.' }, { status: 404 });

  const pdfs = [];
  const errors = [];
  for (const s of ready) {
    try { pdfs.push(await getWaybill(g.admin, s)); }
    catch (e) { errors.push(`${s.tracking_number}: ${e.message}`); }
  }
  if (!pdfs.length) return NextResponse.json({ success: false, error: errors.join(' · ') }, { status: 502 });

  let out = pdfs[0];
  if (pdfs.length > 1) {
    const merged = await PDFDocument.create();
    for (const buf of pdfs) {
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    out = Buffer.from(await merged.save());
  }

  const name = ready.length === 1 ? ready[0].tracking_number : `waybill_${new Date().toISOString().slice(0, 10)}_${pdfs.length}`;
  return new NextResponse(out, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}.pdf"`,
      ...(errors.length ? { 'X-Waybill-Errors': encodeURIComponent(errors.join(' · ')) } : {}),
    },
  });
}
