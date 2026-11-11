// PDF waybill NinjaVan (digabung jika lebih dari satu) — dikongsi oleh Pengurusan Order HQ, Packing Fighter & Portal Fighter.
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getWaybill, isActiveShipment } from './shipments';

export const WAYBILL_MAX = 30;

/** Teks produk (kolum UNIT export) untuk parcel yang dicipta TANPA delivery_instructions → perlu dicetak sendiri */
function productStampOf(payload) {
  const job = payload?.parcel_job;
  if (!job || job.delivery_instructions) return null;      // NinjaVan dah cetak di ruangan Comments
  const text = job.items?.[0]?.item_description;
  return text ? String(text).split(' · ').map(s => s.trim()).filter(Boolean) : null;
}

/** Tulis produk & kuantiti di ruang kosong bawah ruangan Comments (label 4x6 NinjaVan, 296 x 418 pt) */
async function stampProduct(doc, lines) {
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.getPage(0);
  const { width, height } = page.getSize();
  const left = 14, maxW = width - left * 2;
  // Helvetica standard = WinAnsi sahaja → buang aksara lain (emoji dsb.)
  const clean = t => t.replace(/[‘’]/g, "'").replace(/[^\x20-\x7E -ÿ]/g, '');
  const wrap = (t, size) => {
    const out = []; let cur = '';
    for (const w of clean(t).split(/\s+/)) {
      const next = cur ? `${cur} ${w}` : w;
      if (cur && bold.widthOfTextAtSize(next, size) > maxW) { out.push(cur); cur = w; } else cur = next;
    }
    if (cur) out.push(cur);
    return out;
  };
  let size = 12;
  let rows = lines.flatMap(l => wrap(l, size));
  if (rows.length > 7) { size = 10; rows = lines.flatMap(l => wrap(l, size)); }
  let y = height - 262 - 13;                               // tepat bawah garisan ruangan Comments
  page.drawText('PRODUK:', { x: left, y, size: 9, font: bold, color: rgb(0, 0, 0) });
  y -= size + 4;
  for (const r of rows.slice(0, 10)) { page.drawText(r, { x: left, y, size, font: bold, color: rgb(0, 0, 0) }); y -= size + 3; }
}

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

  // Produk untuk packing — parcel lama tanpa delivery_instructions (PDF simpanan tidak diubah, hanya salinan cetakan)
  const { data: payloads } = await db.from('ninjavan_shipments').select('id, request_payload').in('id', printed.map(s => s.id));
  const stampOf = Object.fromEntries((payloads || []).map(p => [p.id, productStampOf(p.request_payload)]));

  const merged = await PDFDocument.create();
  for (let i = 0; i < pdfs.length; i++) {
    const doc = await PDFDocument.load(pdfs[i]);
    const lines = stampOf[printed[i].id];
    if (lines?.length) {
      try { await stampProduct(doc, lines); }
      catch (e) { console.error('[ninjavan] cetak produk pada waybill gagal:', e.message); }
    }
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  const out = Buffer.from(await merged.save());

  const name = printed.length === 1 ? printed[0].tracking_number : `waybill_${new Date().toISOString().slice(0, 10)}_${pdfs.length}`;
  return new NextResponse(out, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}.pdf"`,
      ...(errors.length ? { 'X-Waybill-Errors': encodeURIComponent(errors.join(' · ')) } : {}),
    },
  });
}
