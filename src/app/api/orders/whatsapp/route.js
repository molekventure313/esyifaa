import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateMalaysianPhone } from '@/lib/utils/phone';
import { logActivity } from '@/lib/utils/logger';
import { sendGroupNotification, buildOrderMessage } from '@/lib/notifications/wasapbot';
import { priceOrder, addonInfo } from '@/lib/packages';
import { deductOrderStock } from '@/lib/payments';

/**
 * POST /api/orders/whatsapp — Order WhatsApp (dashboard, marketer & admin sahaja)
 * Order terus DILULUSKAN (completed): stok ditolak, sales dikira, masuk Pengurusan Order & export NinjaVan.
 * Marketer → marketer_id = pengguna; admin → HQ (marketer_id NULL).
 * Tiada Pixel/CAPI, tiada kes perawat.
 *
 * Body: {
 *   full_name, phone, street, poskod, daerah, negeri,
 *   product, package_index, addons: { kasturi, sabun, garam },
 *   payment: 'paid' | 'cod', amount_total? (harga dilaraskan), origin: 'fb_ads' | 'repeat', reference?
 * }
 */
const clean = v => String(v ?? '').replace(/[\[\]|]/g, ' ').replace(/\s+/g, ' ').trim();

export async function POST(req) {
  try {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
    const isAdmin    = ['admin', 'super_admin'].includes(profile?.role);
    const isMarketer = profile?.role === 'marketer';
    if (!isAdmin && !isMarketer) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const b = await req.json();
    const bad = msg => NextResponse.json({ success: false, error: msg }, { status: 400 });

    // ── Pelanggan ──
    const fullName = clean(b.full_name);
    if (!fullName) return bad('Sila isi nama pelanggan.');
    const phoneCheck = validateMalaysianPhone(String(b.phone || ''));
    if (!phoneCheck.valid) return bad('No. telefon tidak sah. Contoh: 0123456789');
    const phone = phoneCheck.formatted;
    const [street, poskod, daerah, negeri] = [b.street, b.poskod, b.daerah, b.negeri].map(clean);
    if (!street || !poskod || !daerah || !negeri) return bad('Sila isi alamat penuh (jalan, poskod, daerah, negeri).');
    const address = [street, poskod, daerah, negeri].join(', ');

    // ── Produk & harga ──
    let priced;
    try {
      priced = priceOrder({ product: b.product, packageIndex: Number(b.package_index), addons: b.addons || {}, state: negeri });
    } catch (e) { return bad(e.message); }
    const { def, pkg, addonKeys, postage, total: autoTotal } = priced;

    const payment = b.payment === 'cod' ? 'cod' : b.payment === 'paid' ? 'paid' : null;
    if (!payment) return bad('Sila pilih cara bayaran.');

    const origin = ['fb_ads', 'repeat'].includes(b.origin) ? b.origin : null;
    if (!origin) return bad('Sila pilih sumber pelanggan (FB Ads / Repeat).');

    let total = autoTotal;
    if (b.amount_total !== undefined && b.amount_total !== null && b.amount_total !== '') {
      total = parseFloat(b.amount_total);
      if (!Number.isFinite(total) || total <= 0) return bad('Jumlah tidak sah.');
    }
    total = parseFloat(total.toFixed(2));
    const adjusted = Math.abs(total - autoTotal) >= 0.01;
    const reference = clean(b.reference).slice(0, 120);
    const actorName = clean(profile?.full_name || user.email);

    // ── Nota — format SAMA dgn order web (orderQty / addonsOf / label NinjaVan / formatOrder faham) ──
    const addonProblem = addonKeys.map(k => ` | ${addonInfo(k).problem}`).join('');
    const addonNotes   = addonKeys.map(k => ` ${addonInfo(k).notes}`).join('');
    const giftProblem  = pkg.includesKasturi ? ' | Free Gift: Minyak Kasturi Kijang' : '';
    const giftNotes    = pkg.includesKasturi ? ' [FREE GIFT: Kasturi Kijang]' : '';
    const priceNote    = adjusted ? ` | Harga asal: RM${autoTotal} → dilaraskan RM${total}` : '';

    const problem = `[WHATSAPP] Produk: ${def.name} | Pakej: ${pkg.label} | Harga: RM${pkg.price} + Postage RM${postage} = RM${autoTotal}${addonProblem}${giftProblem}${priceNote} | Alamat: ${address}`;
    const notes = `[WHATSAPP ORDER] [STATUS: completed] [AMOUNT: RM${total}] [QTY: ${pkg.units} unit] [PRODUK: ${def.name}]${addonNotes}${giftNotes}`
      + ` [PAYMENT: ${payment === 'cod' ? 'COD' : 'PAID'}] [ORIGIN: ${origin}] [BY: ${actorName}]`
      + (adjusted ? ` [PRICE_ADJUSTED: RM${autoTotal} → RM${total}]` : '')
      + (reference ? ` [REF: ${reference}]` : '');

    // ── Pelanggan (customers) ──
    let customerId = null;
    try {
      const { data: existing } = await supabase.from('customers').select('id').eq('phone', phone).maybeSingle();
      if (existing) customerId = existing.id;
      else {
        const { data: created } = await supabase.from('customers')
          .insert({ full_name: fullName, phone, problem, submission_count: 1, is_repeat: false, first_submission_at: new Date().toISOString() })
          .select('id').single();
        customerId = created?.id || null;
      }
    } catch (e) { console.warn('Customer upsert skipped:', e.message); }

    // ── Order ──
    const { data: submission, error } = await supabase.from('submissions').insert({
      full_name: fullName,
      phone,
      address,
      problem,
      notes,
      source: b.product,
      payment_type: payment === 'cod' ? 'cod' : 'fpx_payment',   // 'paid' = prabayar (transfer/QR) → NinjaVan tak kutip wang
      payment_status: 'completed',
      amount_paid: total,
      qty: pkg.units,
      marketer_id: isMarketer ? user.id : null,
      order_channel: 'whatsapp',
      order_origin: origin,
      consent_contact: true,
      ...(customerId ? { customer_id: customerId } : {}),
    }).select().single();
    if (error) throw error;

    // Batal order pending lain dari pelanggan sama (cth: order web yang tak siap bayar)
    try {
      await supabase.from('submissions').update({ payment_status: 'cancelled' })
        .eq('phone', phone).eq('payment_status', 'pending').neq('id', submission.id);
    } catch (_) {}

    // Stok (produk utama + add-on + hadiah)
    try { await deductOrderStock(supabase, submission, 'WhatsApp Order'); }
    catch (e) { console.error('Stock deduct WhatsApp order error (non-blocking):', e.message); }

    try {
      await logActivity(supabase, {
        userId: user.id, actionType: 'whatsapp_order_create', entityType: 'submission', entityId: submission.id,
        newValues: { amount: total, auto_amount: autoTotal, payment, origin, product: b.product, units: pkg.units },
        description: `💬 Order WhatsApp oleh ${isAdmin ? 'admin' : 'marketer'} ${actorName} — ${fullName} (${phone}) · ${pkg.label} · RM${total} (${payment === 'cod' ? 'COD' : 'dah bayar'})`,
        ipAddress: 'dashboard',
      });
    } catch (_) {}

    try {
      const msg = buildOrderMessage({
        name: fullName, phone,
        product: `${def.name} — ${pkg.label}${addonKeys.map(k => ` + ${addonInfo(k).label}`).join('')}${pkg.includesKasturi ? ' + Free Kasturi' : ''}`,
        amount: `RM${total} (${payment === 'cod' ? 'COD — Bayar Masa Terima' : 'Dah bayar — transfer/QR'})`,
        address, source: `${b.product} (WhatsApp)`, paymentType: payment === 'cod' ? 'cod' : 'fpx',
      });
      await sendGroupNotification(`💬 [ORDER WHATSAPP — ${actorName}]\n${msg}`);
    } catch (e) { console.error('WasapBot WhatsApp order error (non-blocking):', e.message); }

    return NextResponse.json({ success: true, order_id: submission.id, amount: total, message: `Order ${fullName} disimpan (RM${total}).` });
  } catch (error) {
    console.error('WhatsApp order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
