// Klien: cetak waybill tanpa had — ambil PDF dari server dalam kumpulan kecil (setiap panggilan ≤ had masa server),
// gabung dalam pelayar, buka satu PDF untuk dicetak sekali gus.
export const WAYBILL_CHUNK = 25;

/**
 * @param {(ids: string[]) => string} urlFor  bina URL PDF untuk satu kumpulan id
 * @param {string[]} ids
 * @param {{ onProgress?: (done: number, total: number) => void }} [opts]
 * @returns {Promise<{ pages: number, errors: string[] }>}
 */
export async function openMergedWaybills(urlFor, ids, { onProgress } = {}) {
  // Buka tetingkap SEBELUM await — elak disekat penyekat pop-up
  const win = window.open('', '_blank');
  const status = text => { try { win?.document.body && (win.document.body.innerHTML = `<p style="font-family:sans-serif;padding:1rem">${text}</p>`); } catch { /* */ } };
  status(`⏳ Menyediakan waybill 0 / ${ids.length}…`);
  try {
    const { PDFDocument } = await import('pdf-lib');
    const merged = await PDFDocument.create();
    const errors = [];
    for (let i = 0; i < ids.length; i += WAYBILL_CHUNK) {
      const part = ids.slice(i, i + WAYBILL_CHUNK);
      let res;
      for (let attempt = 0; attempt < 2; attempt++) {   // cuba semula sekali jika server tamat masa
        res = await fetch(urlFor(part)).catch(() => null);
        if (res && res.status < 500) break;
      }
      const isPdf = (res?.headers.get('content-type') || '').includes('pdf');
      if (!res?.ok || !isPdf) {
        const j = res ? await res.json().catch(() => ({})) : {};
        errors.push(`Waybill ${i + 1}–${i + part.length}: ${j.error || `ralat (${res?.status ?? 'rangkaian'})`}`);
      } else {
        const hdr = res.headers.get('X-Waybill-Errors');
        if (hdr) errors.push(decodeURIComponent(hdr));
        const doc = await PDFDocument.load(await res.arrayBuffer());
        (await merged.copyPages(doc, doc.getPageIndices())).forEach(p => merged.addPage(p));
      }
      const done = Math.min(i + WAYBILL_CHUNK, ids.length);
      onProgress?.(done, ids.length);
      status(`⏳ Menyediakan waybill ${done} / ${ids.length}…`);
    }
    const pages = merged.getPageCount();
    if (!pages) { win?.close(); return { pages, errors }; }
    const url = URL.createObjectURL(new Blob([await merged.save()], { type: 'application/pdf' }));
    if (win && !win.closed) win.location.href = url; else window.open(url, '_blank');
    return { pages, errors };
  } catch (e) {
    win?.close();
    throw e;
  }
}
