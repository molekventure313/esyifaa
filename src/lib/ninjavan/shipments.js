// Shipment NinjaVan — bina payload Order Create 4.2, push order, cache waybill, kemas kini status dari webhook V2.
// Setiap parcel = satu baris ninjavan_shipments (sql/029_ninjavan_api.sql).
import { NV_ENV, NinjaVanError, createOrder, cancelOrder, fetchWaybillPdf, errorMessageOf } from './api';
import { addressStringOf, parseAddressParts, formatPhone, unitCellOf } from '@/lib/ninjavan-csv';
import { orderQty, parseAmount } from '@/lib/marketer-calc';

const TZ = 'Asia/Kuala_Lumpur';
const WAYBILL_BUCKET = 'ninjavan-waybills';
// Pickup dijadualkan (pemandu datang ambil di HQ). Set NINJAVAN_PICKUP_REQUIRED=false jika parcel dihantar sendiri ke Ninja Point.
const PICKUP_REQUIRED = process.env.NINJAVAN_PICKUP_REQUIRED !== 'false';

const todayMY = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());   // yyyy-MM-dd

/** E.164 Malaysia: 0123456789 → +60123456789 */
function e164(phone) {
  const local = formatPhone(phone);
  return local.startsWith('0') ? `+60${local.slice(1)}` : local ? `+${local}` : '';
}

/** Maklumat pengirim (HQ) dari env — wajib untuk 'from' */
function senderInfo() {
  const env = process.env;
  const missing = ['NINJAVAN_SENDER_NAME', 'NINJAVAN_SENDER_PHONE', 'NINJAVAN_SENDER_EMAIL', 'NINJAVAN_SENDER_ADDRESS1', 'NINJAVAN_SENDER_POSTCODE']
    .filter(k => !env[k]);
  if (missing.length) throw new NinjaVanError(`Maklumat pengirim belum diset: ${missing.join(', ')}`);
  return {
    name: env.NINJAVAN_SENDER_NAME,
    phone_number: e164(env.NINJAVAN_SENDER_PHONE),
    email: env.NINJAVAN_SENDER_EMAIL,
    address: {
      address1: env.NINJAVAN_SENDER_ADDRESS1,
      address2: env.NINJAVAN_SENDER_ADDRESS2 || '',
      area: env.NINJAVAN_SENDER_AREA || '',
      city: env.NINJAVAN_SENDER_CITY || '',
      state: env.NINJAVAN_SENDER_STATE || '',
      address_type: 'office',
      country: 'MY',
      postcode: env.NINJAVAN_SENDER_POSTCODE,
    },
  };
}

/**
 * Payload Order Create 4.2 (service_type Parcel, Standard).
 * @param o { requestedTrackingNumber, merchantRef, name, phone, email?, address:{address1,address2?,area?,city,state,postcode},
 *            cod, itemDescription, quantity, instructions? }
 */
export function buildOrderPayload(o) {
  const today = todayMY();
  const cod = Math.round((Number(o.cod) || 0) * 100) / 100;
  return {
    service_type: 'Parcel',
    service_level: 'Standard',
    requested_tracking_number: o.requestedTrackingNumber,
    reference: { merchant_order_number: o.merchantRef },
    from: senderInfo(),
    to: {
      name: o.name,
      phone_number: e164(o.phone),
      ...(o.email ? { email: o.email } : {}),
      address: {
        address1: o.address.address1,
        address2: o.address.address2 || '',
        area: o.address.area || '',
        city: o.address.city || '',
        state: o.address.state || '',
        address_type: 'home',
        country: 'MY',
        postcode: o.address.postcode,
      },
    },
    parcel_job: {
      is_pickup_required: PICKUP_REQUIRED,
      ...(PICKUP_REQUIRED ? {
        pickup_service_type: 'Scheduled',
        pickup_service_level: 'Standard',
        pickup_date: today,
        pickup_timeslot: { start_time: '09:00', end_time: '22:00', timezone: TZ },
      } : {}),
      delivery_start_date: today,
      delivery_timeslot: { start_time: '09:00', end_time: '22:00', timezone: TZ },
      ...(o.instructions ? { delivery_instructions: o.instructions } : {}),
      ...(cod > 0 ? { cash_on_delivery: cod, cash_on_delivery_currency: 'MYR' } : {}),
      dimensions: { weight: 1 },
      items: [{ item_description: o.itemDescription.slice(0, 255), quantity: o.quantity || 1, is_dangerous_good: false }],
    },
  };
}

/** Order submissions (COD / FPX fizikal) → input buildOrderPayload */
export function orderInputFromSubmission(s, attempt = 0) {
  const addr = parseAddressParts(addressStringOf(s));
  if (!addr.poskod) throw new NinjaVanError('Alamat tiada poskod 5 digit — betulkan alamat order dulu.');
  // id order kita sebagai tracking diminta → hantar semula tidak cipta order berganda.
  // NinjaVan: 1–9 aksara alfanumerik, TANPA prefix (prefix akaun ditambah oleh NinjaVan).
  // 8 aksara id (sandbox: 'S' + 7) + 1 aksara cubaan (0, 1, 2… selepas parcel dibatalkan & dihantar semula)
  const hex = s.id.replace(/-/g, '').toUpperCase();
  const base = NV_ENV === 'live' ? hex.slice(0, 8) : `S${hex.slice(0, 7)}`;
  return {
    requestedTrackingNumber: `${base}${attempt.toString(36).toUpperCase()}`,
    merchantRef: s.id,
    name: s.full_name,
    phone: s.phone,
    address: { address1: addr.street, city: addr.daerah, state: addr.negeri, postcode: addr.poskod },
    cod: s.payment_type === 'cod' ? parseAmount(s) : 0,
    itemDescription: unitCellOf(s).replace(/\n/g, ' · '),
    quantity: orderQty(s),
  };
}

/**
 * Cipta parcel di NinjaVan & rekod dalam ninjavan_shipments.
 * Tracking yang sudah berjaya dipulangkan semula tanpa panggil API (tiada order berganda).
 */
export async function createShipment(db, input, { submissionId = null, isTest = false, userId = null } = {}) {
  const { data: existing } = await db.from('ninjavan_shipments')
    .select('*').eq('requested_tracking_number', input.requestedTrackingNumber).maybeSingle();
  if (existing?.tracking_number && existing.status !== 'Cancelled') return { shipment: existing, created: false };

  const payload = buildOrderPayload(input);
  const base = {
    env: NV_ENV,
    submission_id: submissionId,
    requested_tracking_number: input.requestedTrackingNumber,
    is_test: isTest,
    cod_amount: payload.parcel_job.cash_on_delivery || 0,
    request_payload: payload,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };

  let response;
  try {
    response = await createOrder(db, payload);
  } catch (e) {
    // simpan kegagalan (4xx) untuk debug — boleh dihantar semula selepas dibetulkan
    await db.from('ninjavan_shipments').upsert(
      { ...base, status: 'Failed', response_payload: e.body ?? { message: e.message } },
      { onConflict: 'requested_tracking_number' });
    throw e;
  }

  const { data: shipment, error } = await db.from('ninjavan_shipments').upsert(
    { ...base, tracking_number: response.tracking_number, status: 'Created', event: null, is_terminal: false,
      cancelled_at: null, response_payload: response },
    { onConflict: 'requested_tracking_number' }).select('*').single();
  if (error) throw new Error(`Order dicipta di NinjaVan (${response.tracking_number}) tetapi gagal disimpan: ${error.message}`);

  if (submissionId && NV_ENV === 'live') {   // ujian sandbox tidak menanda order sebenar sebagai dihantar
    await db.from('submissions').update({ ninjavan_exported_at: new Date().toISOString(), ninjavan_exported_by: userId })
      .eq('id', submissionId);
  }
  return { shipment, created: true };
}

/** Push satu order submissions ke NinjaVan */
export async function pushSubmission(db, submission, userId = null) {
  const { data: prior } = await db.from('ninjavan_shipments')
    .select('status').eq('submission_id', submission.id).eq('env', NV_ENV).not('tracking_number', 'is', null);
  const attempt = (prior || []).filter(p => p.status === 'Cancelled').length;
  return createShipment(db, orderInputFromSubmission(submission, attempt), { submissionId: submission.id, userId });
}

/** Parcel terkini (env semasa) bagi setiap order → { [submission_id]: shipment } */
export async function latestShipmentsFor(db, submissionIds) {
  const map = {};
  for (let i = 0; i < submissionIds.length; i += 200) {
    const { data } = await db.from('ninjavan_shipments')
      .select('id, submission_id, tracking_number, status, event, is_terminal, cod_amount, last_event_at, delivered_at, returned_at, cancelled_at, cod_remitted_at, waybill_path, response_payload, created_at')
      .eq('env', NV_ENV).in('submission_id', submissionIds.slice(i, i + 200))
      .order('created_at', { ascending: true });
    for (const s of data || []) map[s.submission_id] = s;      // yang terakhir menang
  }
  return map;
}

/** Status NinjaVan → kumpulan ringkas untuk paparan & dashboard */
export function statusGroupOf(sh) {
  if (!sh) return 'none';
  if (sh.status === 'Failed') return 'failed';
  if (sh.status === 'Cancelled') return 'cancelled';
  if (sh.status === 'Delivered') return 'delivered';
  if (sh.status === 'Returned to Sender' || sh.event === 'Delivery Exception, Return to Sender Initiated' || sh.status === 'Return to Shipper Exception') return 'returned';
  if (sh.status === 'Delivery Exception' || sh.status === 'Pickup Exception') return 'exception';
  if (['Created', 'Pending Pickup', 'Driver dispatched for Pickup'].includes(sh.status)) return 'pending_pickup';
  return 'in_transit';
}

/**
 * PDF waybill — dijana SEKALI dari API kemudian dibaca dari storage (keperluan NinjaVan: cache waybill).
 * Pulang Buffer PDF.
 */
export async function getWaybill(db, shipment) {
  if (shipment.waybill_path) {
    const { data, error } = await db.storage.from(WAYBILL_BUCKET).download(shipment.waybill_path);
    if (!error && data) return Buffer.from(await data.arrayBuffer());
  }
  if (!shipment.tracking_number) throw new NinjaVanError('Parcel belum ada tracking number.');
  const pdf = await fetchWaybillPdf(db, shipment.tracking_number);
  const path = `${shipment.env}/${shipment.tracking_number}.pdf`;
  const { error: upErr } = await db.storage.from(WAYBILL_BUCKET).upload(path, pdf, { contentType: 'application/pdf', upsert: true });
  if (upErr) console.error('[ninjavan] simpan waybill gagal:', upErr.message);
  else await db.from('ninjavan_shipments').update({ waybill_path: path, updated_at: new Date().toISOString() }).eq('id', shipment.id);
  return pdf;
}

/** Batal parcel (hanya Pending Pickup) */
export async function cancelShipment(db, shipment) {
  await cancelOrder(db, shipment.tracking_number);
  const now = new Date().toISOString();
  await db.from('ninjavan_shipments').update({ status: 'Cancelled', event: 'Cancelled', is_terminal: true, cancelled_at: now, updated_at: now })
    .eq('id', shipment.id);
}

// ─── Webhook V2 ─────────────────────────────────────────────────────────────

const TERMINAL_EVENTS = new Set([
  'Pickup Exception, Max Attempts Reached', 'Returned to Sender', 'Cancelled',
  'International Transit, Returned to Sender at Origin Facility', 'International Transit, Returned to XB Warehouse',
]);
const isTerminal = event => event?.startsWith('Delivered') || TERMINAL_EVENTS.has(event);
// Event maklumat sahaja — dilog tetapi tidak menukar status parcel
const INFO_ONLY_EVENTS = new Set(['Parcel Measurements Update']);

/** "2024-11-21T11:45:40+0800" → Date (zon tanpa ':' dinormalkan) */
function parseNvTime(ts) {
  if (!ts) return new Date();
  const d = new Date(String(ts).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** Simpan event & kemas kini status parcel. Event lebih lama dari status semasa tidak menimpa status. */
export async function applyWebhookEvent(db, payload) {
  const tracking = payload.tracking_id;
  if (!tracking) return { ignored: 'tiada tracking_id' };
  const event = payload.event || payload.status;
  const at = parseNvTime(payload.timestamp);

  const { error: logErr } = await db.from('ninjavan_events').insert({
    tracking_number: tracking, status: payload.status || null, event, event_at: at.toISOString(), payload,
  });
  if (logErr?.code === '23505') return { duplicate: true };          // webhook diulang NinjaVan
  if (logErr) throw new Error(logErr.message);
  if (INFO_ONLY_EVENTS.has(event)) return { logged: true };

  const iso = at.toISOString();
  const patch = {
    status: payload.status || event, event, is_terminal: isTerminal(event), last_event_at: iso, updated_at: new Date().toISOString(),
    ...(event?.startsWith('Delivered') ? { delivered_at: iso } : {}),
    ...(event === 'Returned to Sender' ? { returned_at: iso } : {}),
    ...(event === 'Cancelled' ? { cancelled_at: iso } : {}),
  };
  const { data } = await db.from('ninjavan_shipments').update(patch)
    .eq('tracking_number', tracking)
    .or(`last_event_at.is.null,last_event_at.lte."${iso}"`)
    .select('id');
  return { updated: data?.length || 0 };
}

export { errorMessageOf };
