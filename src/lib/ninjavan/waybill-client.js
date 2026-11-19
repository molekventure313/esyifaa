// Klien: cetak waybill tanpa had — ambil PDF dari server dalam kumpulan kecil (setiap panggilan ≤ had masa server),
// gabung dalam pelayar.
//  · ≤ WAYBILL_FILE_MAX waybill → satu PDF dibuka dalam tab baharu (macam biasa)
//  · lebih dari itu → dimuat turun sebagai beberapa fail PDF (≤ WAYBILL_FILE_MAX setiap satu).
//    Setiap waybill NinjaVan ±190KB; satu PDF 300+ waybill (≈ 56MB) menyebabkan tab pelayar BLANK (insiden 19/11).
export const WAYBILL_CHUNK = 25;
export const WAYBILL_FILE_MAX = 50;

const pad = n => String(n).padStart(3, '0');

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * @param {(ids: string[]) => string} urlFor  bina URL PDF untuk satu kumpulan id
 * @param {string[]} ids
 * @param {{ onProgress?: (done: number, total: number) => void }} [opts]
 * @returns {Promise<{ pages: number, errors: string[], files: number }>}  files > 0 = dimuat turun (bukan dibuka dalam tab)
 */
export async function openMergedWaybills(urlFor, ids, { onProgress } = {}) {
  const many = ids.length > WAYBILL_FILE_MAX;
  // Buka tetingkap SEBELUM await — elak disekat penyekat pop-up (hanya bila satu PDF)
  const win = many ? null : window.open('', '_blank');
  const status = text => { try { win?.document.body && (win.document.body.innerHTML = `<p style="font-family:sans-serif;padding:1rem">${text}</p>`); } catch { /* */ } };
  status(`⏳ Menyediakan waybill 0 / ${ids.length}…`);
  try {
    const { PDFDocument } = await import('pdf-lib');
    let merged = await PDFDocument.create();
    const errors = [];
    const stamp = new Date().toISOString().slice(0, 10);
    let pages = 0, files = 0, fileStart = 1;

    const flushFile = async () => {
      const n = merged.getPageCount();
      if (!n) return;
      downloadBlob(new Blob([await merged.save()], { type: 'application/pdf' }), `waybill_${stamp}_${pad(fileStart)}-${pad(fileStart + n - 1)}.pdf`);
      pages += n; files++; fileStart += n;
      merged = await PDFDocument.create();
    };

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
      if (many && merged.getPageCount() >= WAYBILL_FILE_MAX) await flushFile();
      const done = Math.min(i + WAYBILL_CHUNK, ids.length);
      onProgress?.(done, ids.length);
      status(`⏳ Menyediakan waybill ${done} / ${ids.length}…`);
    }

    if (many) {
      await flushFile();
      return { pages, errors, files };
    }
    pages = merged.getPageCount();
    if (!pages) { win?.close(); return { pages, errors, files: 0 }; }
    const url = URL.createObjectURL(new Blob([await merged.save()], { type: 'application/pdf' }));
    if (win && !win.closed) win.location.href = url; else window.open(url, '_blank');
    return { pages, errors, files: 0 };
  } catch (e) {
    win?.close();
    throw e;
  }
}
