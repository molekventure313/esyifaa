// Return Parcel automatik — server sahaja.
// 1. AI (Claude vision) baca waybill NinjaVan: nama, 4 digit telefon, poskod, jumlah COD, unit, tracking.
// 2. Padankan dengan order COD. Padanan PASTI → terus tanda return (stok dipulangkan, keluar dari sales/komisen).
//    Tak pasti → 'review' (order cadangan, sahkan satu klik). Tak dapat baca / tiada order → 'unmatched'.
// 3. Gambar dipadam 7 hari selepas 'processed' (maklumat yang dibaca kekal).
import { callClaude, AI_MODEL_MAIN } from '@/lib/sp-generator/server';
import { returnStock } from '@/lib/stock';
import { orderQty } from '@/lib/marketer-calc';

export const BUCKET = 'return-waybills';
const KEEP_DAYS = 7;
const STUCK_MIN = 10;

const SYSTEM = `Anda membaca label waybill NinjaVan (Malaysia) dari gambar parcel yang dipulangkan (return).
Salin maklumat TEPAT seperti yang tertulis — jangan teka. Kalau sesuatu medan tak jelas, isi null.
Gambar mungkin terbalik, berkedut atau condong — baca dengan teliti.`;

const SCHEMA = {
  type: 'object',
  properties: {
    readable:    { type: 'boolean', description: 'true jika label waybill dapat dibaca (sekurang-kurangnya nama atau telefon)' },
    name:        { type: ['string', 'null'], description: 'Nama penerima (TO / ADDRESSEE)' },
    phone_last4: { type: ['string', 'null'], description: '4 digit terakhir telefon penerima (contoh "****3626" → "3626")' },
    postcode:    { type: ['string', 'null'], description: 'Poskod 5 digit penerima' },
    cod_amount:  { type: ['number', 'null'], description: 'Jumlah COD dalam MYR (contoh 44.00 → 44)' },
    units:       { type: ['integer', 'null'], description: 'Bilangan unit produk utama dalam Comments (contoh "3 UNIT" → 3)' },
    tracking:    { type: ['string', 'null'], description: 'Nombor tracking penuh (contoh NVMYMOVEN230926037)' },
    comments:    { type: ['string', 'null'], description: 'Teks Comments penuh (produk & add-on)' },
    problem:     { type: ['string', 'null'], description: 'Jika tak dapat dibaca: sebabnya (kabur, terpotong, bukan waybill, dll)' },
  },
  required: ['readable', 'name', 'phone_last4', 'postcode', 'cod_amount', 'units', 'tracking', 'comments', 'problem'],
};

const NAME_STOP = new Set(['bin', 'binti', 'bte', 'bt', 'bn', 'hj', 'hjh', 'haji', 'hajah', 'mohd', 'muhammad', 'md', 'nur', 'siti', 'abd', 'abdul']);
const nameTokens = s => String(s || '').toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2 && !NAME_STOP.has(w));
const nameMatch = (a, b) => {
  const ta = nameTokens(a), tb = nameTokens(b);
  if (!ta.length || !tb.length) return String(a || '').toLowerCase().replace(/\s/g, '') === String(b || '').toLowerCase().replace(/\s/g, '');
  return ta.some(t => tb.some(u => u === t || (t.length >= 5 && u.length >= 5 && (u.startsWith(t.slice(0, 5)) || t.startsWith(u.slice(0, 5))))));
};
const ymd = d => new Date(d).toISOString().slice(0, 10);   // tarikh UTC (sama dgn tarikh dalam tracking — server export guna UTC)

// Tarikh export dalam tracking: NVMYMOVEN + DDMMYY + nombor
function trackingDate(tracking) {
  const m = String(tracking || '').toUpperCase().replace(/\s/g, '').match(/MOVEN(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, dd, mm, yy] = m;
  const d = new Date(`20${yy}-${mm}-${dd}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ─── 1. Baca waybill ─────────────────────────────────────────────────────────
export async function extractWaybill(admin, row) {
  const { data: blob, error } = await admin.storage.from(BUCKET).download(row.image_path);
  if (error || !blob) throw new Error(`Gambar tak dapat dimuat: ${error?.message || 'tiada'}`);
  const buf = Buffer.from(await blob.arrayBuffer());
  const mediaType = /\.png$/i.test(row.image_path) ? 'image/png' : /\.webp$/i.test(row.image_path) ? 'image/webp' : 'image/jpeg';
  const res = await callClaude({
    model: AI_MODEL_MAIN,
    system: SYSTEM,
    prompt: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: buf.toString('base64') } },
      { type: 'text', text: 'Baca label waybill dalam gambar ini dan hantar maklumat melalui tool.' },
    ],
    toolName: 'baca_waybill', schema: SCHEMA, maxTokens: 1000,
  });
  const d = res.data || {};
  return {
    readable: !!d.readable,
    name: d.name || null,
    phone_last4: String(d.phone_last4 || '').replace(/\D/g, '').slice(-4) || null,
    postcode: String(d.postcode || '').replace(/\D/g, '').slice(0, 5) || null,
    cod_amount: Number.isFinite(+d.cod_amount) && d.cod_amount !== null ? +d.cod_amount : null,
    units: Number.isInteger(+d.units) && d.units !== null ? +d.units : null,
    tracking: d.tracking || null,
    comments: d.comments || null,
    problem: d.problem || null,
  };
}

// ─── 2. Padankan order ───────────────────────────────────────────────────────
export async function matchOrders(admin, ex) {
  if (!ex.phone_last4) return { kind: 'none', candidates: [] };
  const { data } = await admin.from('submissions')
    .select('id, full_name, phone, address, problem, notes, qty, amount_paid, created_at, ninjavan_exported_at, returned_at, source')
    .eq('payment_type', 'cod').eq('payment_status', 'completed')
    .like('phone', `%${ex.phone_last4}`)
    .order('created_at', { ascending: false }).limit(20);

  const tDate = trackingDate(ex.tracking);
  const scored = (data || []).map(o => {
    const name = nameMatch(ex.name, o.full_name);
    const postcode = !!ex.postcode && (o.address || o.problem || '').includes(ex.postcode);
    const amount = ex.cod_amount !== null && Math.round(parseFloat(o.amount_paid) || 0) === Math.round(ex.cod_amount);
    const units = ex.units === null || orderQty(o) === ex.units;
    // Tarikh tracking antara tarikh order & tarikh export (+1 hari) — order yang di-export semula ada tarikh export lebih lewat
    const dateOk = !tDate || (ymd(o.created_at) <= ymd(tDate) && (!o.ninjavan_exported_at || ymd(tDate) <= ymd(new Date(new Date(o.ninjavan_exported_at).getTime() + 864e5))));
    const score = [name, postcode, amount, units].filter(Boolean).length;
    return { o, name, postcode, amount, units, dateOk, score, full: name && postcode && amount && units };
  }).sort((a, b) => b.score - a.score || (b.dateOk - a.dateOk));

  const summary = s => ({
    id: s.o.id, full_name: s.o.full_name, created_at: s.o.created_at, amount: s.o.amount_paid, qty: orderQty(s.o),
    returned: !!s.o.returned_at, score: s.score, date_ok: s.dateOk,
    pakej: (s.o.problem || '').match(/Pakej:\s*([^|]+)/i)?.[1]?.trim() || null,
  });

  const open = scored.filter(s => s.full && !s.o.returned_at);
  let pick = open.length === 1 ? open[0] : null;
  if (!pick && open.length > 1) {
    const byDate = open.filter(s => s.dateOk);
    if (byDate.length === 1) pick = byDate[0];
  }
  if (pick) return { kind: 'certain', order: pick.o, candidates: [summary(pick)] };

  // Semua padanan penuh dah di-return → pautkan sahaja
  const doneFull = scored.filter(s => s.full && s.o.returned_at);
  if (!open.length && doneFull.length === 1) return { kind: 'already', order: doneFull[0].o, candidates: [summary(doneFull[0])] };

  const top = scored.filter(s => s.score >= 2).slice(0, 4).map(summary);
  return { kind: top.length ? 'review' : 'none', candidates: top };
}

// ─── 3. Proses satu gambar ───────────────────────────────────────────────────
export async function processWaybill(admin, id, actorId = null) {
  // Tuntut gambar (pending → processing) — elak diproses dua kali serentak
  const { data: claimed } = await admin.from('return_waybills')
    .update({ status: 'processing', processing_started_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'pending').select('id, image_path, uploaded_by');
  const row = claimed?.[0];
  if (!row) return { skipped: true };

  const done = async patch => {
    await admin.from('return_waybills').update({
      processing_started_at: null, processed_by: actorId || row.uploaded_by || null, processed_at: new Date().toISOString(), ...patch,
    }).eq('id', id);
    return patch;
  };

  let ex;
  try {
    ex = await extractWaybill(admin, row);
  } catch (e) {
    // Gagal AI / rangkaian → kembali 'pending' untuk dicuba semula oleh tugas berjadual
    await admin.from('return_waybills').update({ status: 'pending', processing_started_at: null, process_note: `Cuba semula: ${e.message}`.slice(0, 300) }).eq('id', id);
    return { error: e.message };
  }

  if (!ex.readable || !ex.phone_last4) {
    return done({ status: 'unmatched', extracted: ex, candidates: null, process_note: `Tak dapat dibaca${ex.problem ? ` — ${ex.problem}` : ''}. Sila snap semula dengan lebih jelas.` });
  }

  const m = await matchOrders(admin, ex);
  if (m.kind === 'certain') {
    try {
      const r = await returnStock({ submissionId: m.order.id, adminUserId: actorId || row.uploaded_by || null });
      return done({ status: 'processed', submission_id: m.order.id, extracted: ex, candidates: m.candidates, process_note: `Auto: return ditanda (${r.qtyReturned} unit dipulangkan ke stok).` });
    } catch (e) {
      if (/sudah di-return/i.test(e.message)) {
        return done({ status: 'processed', submission_id: m.order.id, extracted: ex, candidates: m.candidates, process_note: 'Order dah ditanda return sebelum ini — stok tidak dipulangkan lagi.' });
      }
      return done({ status: 'review', extracted: ex, candidates: m.candidates, process_note: `Gagal tanda return automatik: ${e.message}` });
    }
  }
  if (m.kind === 'already') {
    return done({ status: 'processed', submission_id: m.order.id, extracted: ex, candidates: m.candidates, process_note: 'Order dah ditanda return sebelum ini — stok tidak dipulangkan lagi.' });
  }
  if (m.kind === 'review') {
    return done({ status: 'review', extracted: ex, candidates: m.candidates, process_note: m.candidates.length > 1 ? 'Lebih dari satu order mungkin — pilih yang betul.' : 'Padanan tidak lengkap — sila sahkan.' });
  }
  return done({ status: 'unmatched', extracted: ex, candidates: null, process_note: 'Tiada order COD sepadan dengan telefon/nama pada waybill.' });
}

// ─── 4. Tugas berjadual: proses yang tertinggal + padam gambar lama ──────────
export async function runMaintenance(admin, { maxProcess = 1 } = {}) {
  const out = { processed: 0, reset: 0, deleted: 0 };

  // Tersangkut 'processing' > 10 min → pending
  const stuckBefore = new Date(Date.now() - STUCK_MIN * 60000).toISOString();
  const { data: stuck } = await admin.from('return_waybills')
    .update({ status: 'pending', processing_started_at: null })
    .eq('status', 'processing').lt('processing_started_at', stuckBefore).select('id');
  out.reset = stuck?.length || 0;

  // Padam gambar 'processed' lebih 7 hari (maklumat kekal)
  const oldBefore = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString();
  const { data: old } = await admin.from('return_waybills')
    .select('id, image_path').eq('status', 'processed').is('image_deleted_at', null).lt('processed_at', oldBefore).limit(200);
  if (old?.length) {
    await admin.storage.from(BUCKET).remove(old.map(r => r.image_path)).catch(() => {});
    await admin.from('return_waybills').update({ image_deleted_at: new Date().toISOString() }).in('id', old.map(r => r.id));
    out.deleted = old.length;
  }

  // Proses gambar pending (paling lama dahulu) — sedikit setiap kali (had masa function)
  const { data: pending } = await admin.from('return_waybills')
    .select('id').eq('status', 'pending').order('created_at', { ascending: true }).limit(maxProcess);
  for (const p of pending || []) {
    const r = await processWaybill(admin, p.id, null);
    if (!r.skipped && !r.error) out.processed++;
  }
  return out;
}
