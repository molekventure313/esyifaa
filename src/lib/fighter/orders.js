// Fighter — order pelanggan, bayaran CHIP fighter, caj stok HQ (kos + markup). Server sahaja.
// Order disimpan dalam fighter_orders (BUKAN submissions) → tak bercampur dengan order / laporan HQ.
// Teks problem / notes guna format sama dengan order HQ supaya parser kuantiti, add-on & CSV NinjaVan dikongsi.
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';
import { orderQty, addonQtyOf } from '@/lib/marketer-calc';
import { productOf } from '@/lib/products';
import { SOURCE_TO_SKU, getProductBySku } from '@/lib/stock';
import { decryptSecret } from '@/lib/fighter/crypto';
import { markupsFor, tableMissing } from '@/lib/fighter/server';

export const APP_URL = 'https://e-syifa.com';
const SITE = () => {
  const u = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  return /localhost|:3000/.test(u) ? APP_URL : u;
};

const ITEM_LABEL = { 'SGH-200G': 'Sabun Garam Himalaya', 'GPM-500G': 'Garam Pengasihan Masakan', 'KKE-01': 'Minyak Kasturi Kijang' };

// Unit stok HQ yang diperlukan satu order: produk utama + add-on + hadiah percuma
export function itemsOf(order) {
  const out = {};
  const add = (sku, qty) => { if (sku && qty > 0) out[sku] = (out[sku] || 0) + qty; };
  add(SOURCE_TO_SKU[order.source], orderQty(order));
  const q = addonQtyOf(order);
  add('KKE-01', q.kasturi + q.kasturiGift);
  add('SGH-200G', q.sabun);
  add('GPM-500G', q.garam);
  return Object.entries(out).map(([sku, qty]) => ({ sku, qty, label: ITEM_LABEL[sku] || sku }));
}

// Fighter aktif ikut kod (?f=) + tetapan
export async function resolveFighter(admin, code) {
  const c = String(code || '').toLowerCase().trim();
  if (!/^[a-z0-9-]{2,20}$/.test(c)) return null;
  const { data: profile } = await admin.from('profiles')
    .select('id, full_name, marketer_code, is_active, role').ilike('marketer_code', c).eq('role', 'independent').maybeSingle();
  if (!profile || profile.is_active === false) return null;
  const { data: settings } = await admin.from('fighter_settings').select('*').eq('fighter_id', profile.id).maybeSingle();
  return { profile, settings: settings || {} };
}

// Maklumat awam fighter untuk SP (WhatsApp & pixel sahaja)
export async function publicFighter(admin, code) {
  const f = await resolveFighter(admin, code);
  if (!f) return null;
  return { code: f.profile.marketer_code, name: f.settings.sender_name || f.profile.full_name, whatsapp: f.settings.whatsapp || null, pixel_id: f.settings.meta_pixel_id || null };
}

const bad = (error, status = 400) => NextResponse.json({ success: false, error }, { status });

/**
 * Order dari borang checkout SP (Sabun / Garam / Kasturi) bila URL ada ?f=<kod>.
 * Dipanggil oleh /api/orders/cod (kind 'cod') & /api/payments/chip/create (kind 'fpx') — body sama dengan order HQ.
 */
export async function createFighterOrder(req, body, kind) {
  if (body.honeypot) return NextResponse.json({ success: true, order_id: `MOCK_${Date.now()}`, tq_url: '/f-tq' });
  const admin = createAdminClient();
  const f = await resolveFighter(admin, body.fighter_code);
  if (!f) return bad('Penjual tidak dijumpai atau tidak aktif. Sila hubungi penjual anda.', 404);

  const source = String(body.source || '');
  if (!productOf(source)) return bad('Produk tidak sah.');
  const name = String(body.full_name || '').trim();
  const address = String(body.address || '').trim();
  if (!name || !body.phone || !address) return bad('Sila isi nama, nombor telefon dan alamat penghantaran.');
  const ph = validateMalaysianPhone(body.phone);
  if (!ph.valid) return bad(ph.error || 'Nombor telefon tidak sah.');

  // Teks order — format sama dengan route HQ (COD / FPX)
  let problem, notes, amount, qty = null;
  const addonTags = (body.addon_kasturi ? ' | Add-On: Kasturi Kijang E-Syifa\' +RM20' : '')
    + (body.addon_sabun ? ' | Add-On: Sabun Garam Pengisian +RM25' : '')
    + (body.addon_garam_masakan ? ' | Add-On: Garam Masakan Pengasihan +RM25' : '');
  if (kind === 'cod') {
    amount = parseFloat(body.amount_total) || 0;
    qty = parseInt(body.quantity) || 1;
    const addonTotal = (body.addon_kasturi ? 20 : 0) + (body.addon_sabun ? 25 : 0) + (body.addon_garam_masakan ? 25 : 0);
    const postage = Math.max(0, Math.round((amount - (parseFloat(body.amount_base) || 0) - addonTotal) * 100) / 100);
    const gift = body.free_gift_kasturi ? ' | Free Gift: Minyak Kasturi Kijang' : '';
    problem = `[COD] Produk: ${body.product || source} | Pakej: ${body.units_label} | Harga: RM${body.amount_base} + Postage RM${postage} = RM${amount}${addonTags}${gift} | Alamat: ${address}`;
    notes = `[COD ORDER] [AMOUNT: RM${amount}] [QTY: ${qty} unit]`;
  } else {
    amount = Math.round((parseFloat(body.amount_in_myr) || 0) * 100) / 100;
    problem = `[Bayaran FPX: RM${amount.toFixed(2)}] ${body.problem ? `Simptom: ${body.problem}` : ''}${addonTags}`;
    notes = `[AMOUNT: MYR ${amount.toFixed(2)}]`;
  }
  if (!(amount > 0) || amount > 5000) return bad('Jumlah tidak sah. Sila muat semula halaman.');

  const row = {
    fighter_id: f.profile.id, source, full_name: name, phone: ph.formatted, address, problem, notes, qty,
    amount, payment_type: kind === 'cod' ? 'cod' : 'fpx_payment',
    payment_status: kind === 'cod' ? 'completed' : 'pending',
    landing_page_url: body.landing_page_url || null,
    utm_source: body.utm_source || null, utm_medium: body.utm_medium || null, utm_campaign: body.utm_campaign || null,
    utm_content: body.utm_content || null, utm_term: body.utm_term || null, fbclid: body.fbclid || null,
  };
  row.items = itemsOf(row);
  if (!row.items.length) return bad('Pakej tidak sah.');

  const { data: order, error } = await admin.from('fighter_orders').insert(row).select('id').single();
  if (error) return bad(tableMissing(error) ? 'Sistem order penjual belum sedia.' : 'Gagal simpan order. Sila cuba lagi.', 500);
  const tq = `/f-tq?o=${order.id}`;

  if (kind === 'cod') return NextResponse.json({ success: true, order_id: order.id, tq_url: tq });

  // FPX → bil CHIP milik fighter (duit masuk terus akaun fighter)
  const s = f.settings;
  if (s.chip_status !== 'ok' || !s.chip_key_enc || !s.chip_brand_id) {
    await admin.from('fighter_orders').update({ payment_status: 'cancelled', ship_status: 'cancelled' }).eq('id', order.id);
    return bad('Bayaran FPX belum tersedia untuk penjual ini. Sila pilih COD atau hubungi penjual.', 503);
  }
  const site = SITE();
  const res = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${decryptSecret(s.chip_key_enc)}` },
    body: JSON.stringify({
      brand_id: s.chip_brand_id,
      client: { email: `${ph.formatted}@esyifaa.com`, phone: ph.formatted, full_name: name },
      purchase: { currency: 'MYR', products: [{ name: `${ITEM_LABEL[SOURCE_TO_SKU[source]] || 'Produk'} E-Syifa'`, price: Math.round(amount * 100), quantity: 1 }] },
      reference: order.id,
      success_callback: `${site}/api/fighter/chip/webhook?o=${order.id}`,
      success_redirect: `${site}${tq}`,
      failure_redirect: `${site}${body.source_page || `/f/${source}`}?f=${encodeURIComponent(f.profile.marketer_code)}&status=failed`,
    }),
  });
  if (!res.ok) {
    console.error('[fighter chip] create', res.status, await res.text().catch(() => ''));
    await admin.from('fighter_orders').update({ payment_status: 'failed' }).eq('id', order.id);
    return bad('Gagal membuka bayaran FPX. Sila cuba lagi atau pilih COD.', 502);
  }
  const chip = await res.json();
  await admin.from('fighter_orders').update({ chip_bill_id: chip.id, notes: `${notes} [CHIP_BILL_ID:${chip.id}]` }).eq('id', order.id);
  return NextResponse.json({ success: true, order_id: order.id, checkout_url: chip.checkout_url });
}

// ─── Bayaran FPX ──────────────────────────────────────────────────────────────

export function verifyChipSignature(rawBody, signature, publicKeyPem) {
  if (!signature || !publicKeyPem) return false;
  try {
    const v = crypto.createVerify('SHA256');
    v.update(rawBody);
    const sig = signature.replace(/^sha256=/i, '').trim();
    const buf = /^[0-9a-f]+$/i.test(sig) && sig.length % 2 === 0 ? Buffer.from(sig, 'hex') : Buffer.from(sig, 'base64');
    return v.verify(publicKeyPem.replace(/\\n/g, '\n'), buf);
  } catch { return false; }
}

const PAID = ['paid', 'success', 'completed', 'executed'];
const FAILED = ['failed', 'cancelled', 'canceled', 'expired', 'error'];

// Kemas kini status bayaran ikut status CHIP. Selamat dipanggil berulang (bersyarat pada 'pending').
export async function applyChipStatus(admin, order, chipStatus) {
  const st = String(chipStatus || '').toLowerCase();
  if (order.payment_status !== 'pending') return order.payment_status;
  if (PAID.includes(st)) {
    await admin.from('fighter_orders').update({ payment_status: 'completed', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', order.id).eq('payment_status', 'pending');
    return 'completed';
  }
  if (FAILED.includes(st)) {
    await admin.from('fighter_orders').update({ payment_status: 'failed', updated_at: new Date().toISOString() }).eq('id', order.id).eq('payment_status', 'pending');
    return 'failed';
  }
  return 'pending';
}

// Semak terus dengan CHIP (TQ page — kalau webhook lambat)
export async function refreshChipStatus(admin, order) {
  if (order.payment_status !== 'pending' || !order.chip_bill_id) return order.payment_status;
  const { data: s } = await admin.from('fighter_settings').select('chip_key_enc').eq('fighter_id', order.fighter_id).maybeSingle();
  if (!s?.chip_key_enc) return order.payment_status;
  try {
    const r = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${order.chip_bill_id}/`, { headers: { Authorization: `Bearer ${decryptSecret(s.chip_key_enc)}` } });
    if (!r.ok) return order.payment_status;
    const p = await r.json();
    return applyChipStatus(admin, order, p.status);
  } catch { return order.payment_status; }
}

// ─── Stok HQ: caj bila pack, kredit bila return ───────────────────────────────

const refOf = id => `fighter:${id}`;
const round2 = n => Math.round(n * 100) / 100;

/**
 * HQ tanda order "Dah pack" → tolak stok HQ + caj lejar fighter (kos + markup semasa).
 * Bersyarat pada ship_status 'ready' → klik berganda tak caj dua kali.
 */
export async function packOrder(admin, orderId, actor) {
  const now = new Date().toISOString();
  const { data: claimed } = await admin.from('fighter_orders')
    .update({ ship_status: 'packed', packed_at: now, packed_by: actor.id, updated_at: now })
    .eq('id', orderId).eq('ship_status', 'ready').select('*');
  const order = claimed?.[0];
  if (!order) throw new Error('Order dah dipack / belum sedia (tiada waybill).');

  try {
    const markups = await markupsFor(admin, order.fighter_id);
    const { data: fighter } = await admin.from('profiles').select('full_name').eq('id', order.fighter_id).single();
    const moves = [], ledger = [];
    for (const it of order.items || []) {
      const product = await getProductBySku(admin, it.sku);
      if (!product) throw new Error(`Produk ${it.sku} tiada dalam modul Stok.`);
      const cost = Number(product.cost_price || 0), markup = markups[it.sku] ?? 0;
      moves.push({ product_id: product.id, movement_type: 'out', qty: it.qty, reference_type: 'order', reference_id: refOf(order.id), notes: `Fighter ${fighter?.full_name || ''} — ${order.full_name}`, created_by: actor.id });
      ledger.push({ fighter_id: order.fighter_id, order_id: order.id, kind: 'charge', sku: it.sku, qty: it.qty, cost_price: cost, markup, amount: round2(it.qty * (cost + markup)), notes: `${it.label} x${it.qty} — ${order.full_name}`, created_by: actor.id });
    }
    if (moves.length) {
      const { error: e1 } = await admin.from('stock_movements').insert(moves);
      if (e1) throw e1;
      const { error: e2 } = await admin.from('fighter_ledger').insert(ledger);
      if (e2) {
        await admin.from('stock_movements').delete().eq('reference_id', refOf(order.id)).eq('movement_type', 'out');
        throw e2;
      }
    }
    return { units: ledger.reduce((t, l) => t + l.qty, 0), amount: round2(ledger.reduce((t, l) => t + l.amount, 0)) };
  } catch (e) {
    await admin.from('fighter_orders').update({ ship_status: 'ready', packed_at: null, packed_by: null }).eq('id', order.id);
    throw new Error(`Gagal caj stok: ${e.message}`);
  }
}

/** Parcel dipulangkan ke HQ → stok masuk semula + kredit caj (harga sama seperti dicaj). */
export async function returnOrder(admin, orderId, actor) {
  const now = new Date().toISOString();
  const { data: claimed } = await admin.from('fighter_orders')
    .update({ ship_status: 'returned', returned_at: now, returned_by: actor.id, updated_at: now })
    .eq('id', orderId).eq('ship_status', 'packed').select('*');
  const order = claimed?.[0];
  if (!order) throw new Error('Hanya order yang dah dipack boleh ditanda return.');

  const [{ data: outs }, { data: charges }] = await Promise.all([
    admin.from('stock_movements').select('product_id, qty').eq('movement_type', 'out').eq('reference_id', refOf(order.id)),
    admin.from('fighter_ledger').select('sku, qty, cost_price, markup, amount').eq('order_id', order.id).eq('kind', 'charge'),
  ]);
  if (outs?.length) {
    await admin.from('stock_movements').insert(outs.map(o => ({
      product_id: o.product_id, movement_type: 'return', qty: o.qty, reference_type: 'return', reference_id: refOf(order.id),
      notes: `Fighter return — ${order.full_name}`, created_by: actor.id,
    })));
  }
  if (charges?.length) {
    await admin.from('fighter_ledger').insert(charges.map(c => ({
      fighter_id: order.fighter_id, order_id: order.id, kind: 'credit', sku: c.sku, qty: c.qty, cost_price: c.cost_price, markup: c.markup,
      amount: -Number(c.amount), notes: `Return — ${order.full_name}`, created_by: actor.id,
    })));
  }
  return { credited: round2((charges || []).reduce((t, c) => t + Number(c.amount), 0)) };
}

// Ringkasan lejar: { charges, credits, net, markup, units } (markup bersih = override HQ)
export function ledgerTotals(rows) {
  const t = { charges: 0, credits: 0, net: 0, markup: 0, units: 0 };
  for (const r of rows || []) {
    const amt = Number(r.amount), sign = r.kind === 'credit' ? -1 : 1;
    if (r.kind === 'charge') t.charges += amt; else if (r.kind === 'credit') t.credits += -amt;
    t.net += amt;
    if (r.kind !== 'adjust') { t.markup += sign * Number(r.markup) * r.qty; t.units += sign * r.qty; }
  }
  for (const k of Object.keys(t)) t[k] = round2(t[k]);
  return t;
}
