// PDF waybill NinjaVan (digabung jika lebih dari satu) — dikongsi oleh Pengurusan Order HQ, Packing Fighter & Portal Fighter.
import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getWaybill, isActiveShipment } from './shipments';

export const WAYBILL_MAX = 30;

/**
 * shipments: baris ninjavan_shipments (urutan cetakan). markUserId → tanda "dah print" (sql/036); null = lihat sahaja.
 */
export async function waybillPdfResponse(db, shipments, { markUserId = null } = {}) {
  const ready = (shipments || []).filter(isActiveShipment).slice(0, WAYBILL_MAX);
  if (!ready.length) return NextResponse.json({ success: false, error: 'Tiada parcel NinjaVan untuk order ini.' }, { status: 404 });

  const pdfs = [];
  const errors = [];
  const printed = [];
  // Selari (5 serentak) supaya 30 waybill muat dalam had masa server; urutan cetakan dikekalkan
  const got = new Array(ready.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(5, ready.length) }, async () => {
    while (next < ready.length) {
      const i = next++;
      try { got[i] = { pdf: await getWaybill(db, ready[i]) }; }
      catch (e) { got[i] = { error: `${ready[i].tracking_number}: ${e.message}` }; }
    }
  }));
  got.forEach((r, i) => { if (r.pdf) { pdfs.push(r.pdf); printed.push(ready[i]); } else errors.push(r.error); });
  if (!pdfs.length) return NextResponse.json({ success: false, error: errors.join(' · ') }, { status: 502 });

  if (markUserId) {
    // Tanda "dah print" — gagal tanda tidak menghalang PDF
    const now = new Date().toISOString();
    await Promise.all(printed.map(s => db.from('ninjavan_shipments')
      .update({ waybill_printed_at: now, waybill_printed_by: markUserId, waybill_print_count: (s.waybill_print_count || 0) + 1 })
      .eq('id', s.id).then(({ error }) => { if (error) console.error('[ninjavan] tanda print gagal:', error.message); })));
  }

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

  const name = printed.length === 1 ? printed[0].tracking_number : `waybill_${new Date().toISOString().slice(0, 10)}_${pdfs.length}`;
  return new NextResponse(out, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}.pdf"`,
      ...(errors.length ? { 'X-Waybill-Errors': encodeURIComponent(errors.join(' · ')) } : {}),
    },
  });
}
