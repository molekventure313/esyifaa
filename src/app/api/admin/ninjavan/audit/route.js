import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { guard, OWNER } from '@/lib/auth';
import { NV_ENV } from '@/lib/ninjavan/api';
import { createShipment, getWaybill } from '@/lib/ninjavan/shipments';

// Audit integrasi NinjaVan (SANDBOX sahaja): cipta 3 order ujian melalui integrasi kita (bukan Postman),
// kemudian jana waybill. Tracking number yang dipulangkan dihantar ke pautan audit dalam e-mel NinjaVan.
// Akses: super_admin, atau header x-cron-secret = env CRON_SECRET (untuk dijalankan dari terminal).
export const dynamic = 'force-dynamic';
export const maxDuration = 26;

// Senario ujian — ikut senario dalam e-mel audit NinjaVan (alamat tepat & lengkap)
const SCENARIOS = [
  {
    key: 'cod',
    name: 'Ujian COD Satu',
    phone: '0123456789',
    address: { address1: 'No 12, Jalan PJU 8/8', area: 'Damansara Perdana', city: 'Petaling Jaya', state: 'Selangor', postcode: '47820' },
    cod: 79,
    itemDescription: 'Sabun Garam Himalaya ESyifaa (200g) · 2 UNIT',
    quantity: 2,
    instructions: 'COD — kutip RM79.00. Hubungi penerima sebelum hantar.',
  },
  {
    key: 'prepaid',
    name: 'Ujian Prabayar Dua',
    phone: '0198765432',
    address: { address1: 'No 5, Jalan Setia 3/1', area: 'Taman Setia Indah', city: 'Johor Bahru', state: 'Johor', postcode: '81100' },
    cod: 0,
    itemDescription: 'Garam Pengasihan Masakan ESyifaa (250g) · 1 PEK',
    quantity: 1,
  },
  {
    key: 'cod-addon',
    name: 'Ujian COD Tiga',
    phone: '0134567890',
    address: { address1: 'Lot 88, Jalan Sultan Yahya Petra', area: 'Kampung Sireh', city: 'Kota Bharu', state: 'Kelantan', postcode: '15200' },
    cod: 99,
    itemDescription: "Sabun Garam Himalaya ESyifaa (200g) · 3 UNIT · + Kasturi Kijang E-Syifa' (FREE GIFT)",
    quantity: 3,
    instructions: 'Tinggal di pondok pengawal jika tiada orang.',
  },
];

async function authorize(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('x-cron-secret') === secret) return { userId: null };
  const g = await guard(OWNER);
  return g.error ? { error: g.error } : { userId: g.user.id };
}

const listTests = db => db.from('ninjavan_shipments')
  .select('requested_tracking_number, tracking_number, status, cod_amount, waybill_path, created_at, response_payload')
  .eq('is_test', true).eq('env', 'sandbox').order('created_at', { ascending: false });

// GET — senarai order ujian & tracking number
export async function GET(req) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { data, error } = await listTests(createAdminClient());
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, env: NV_ENV, orders: data });
}

// POST { action: 'create' | 'waybill' }
export async function POST(req) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  if (NV_ENV !== 'sandbox') {
    return NextResponse.json({ success: false, error: 'Audit hanya untuk sandbox (NINJAVAN_ENV=sandbox).' }, { status: 400 });
  }
  const db = createAdminClient();
  // prepaid: true → semua senario tanpa COD (akaun yang belum diaktifkan COD)
  const { action, prepaid = false } = await req.json().catch(() => ({}));

  if (action === 'create') {
    const run = Date.now().toString(36).toUpperCase().slice(-7);  // tracking unik bagi setiap pusingan audit
    const results = [];
    for (const [i, sc] of SCENARIOS.entries()) {                  // berturutan — token yang sama digunakan semula
      // requested_tracking_number: maks 9 aksara alfanumerik, tanpa prefix
      const input = {
        ...sc,
        ...(prepaid ? { cod: 0, instructions: sc.key === 'cod-addon' ? sc.instructions : 'Hubungi penerima sebelum hantar.' } : {}),
        requestedTrackingNumber: `T${run}${i + 1}`,
        merchantRef: `AUDIT-${run}-${prepaid ? 'prepaid' : sc.key}`,
      };
      try {
        const { shipment } = await createShipment(db, input, { isTest: true, userId: auth.userId });
        results.push({ scenario: sc.key, ok: true, tracking_number: shipment.tracking_number });
      } catch (e) {
        results.push({ scenario: sc.key, ok: false, error: e.message, details: e.body ?? null });
      }
    }
    return NextResponse.json({ success: results.every(r => r.ok), results });
  }

  if (action === 'waybill') {
    // Waybill hanya boleh dijana selepas order diproses (webhook Pending Pickup) — jalankan beberapa minit selepas 'create'
    const { data: rows, error } = await listTests(db).not('tracking_number', 'is', null).is('waybill_path', null).limit(10);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const results = [];
    for (const row of rows) {
      const { data: shipment } = await db.from('ninjavan_shipments').select('*').eq('tracking_number', row.tracking_number).single();
      try {
        const pdf = await getWaybill(db, shipment);
        results.push({ tracking_number: row.tracking_number, ok: true, bytes: pdf.length });
      } catch (e) {
        results.push({ tracking_number: row.tracking_number, ok: false, error: e.message });
      }
    }
    return NextResponse.json({ success: results.every(r => r.ok), results });
  }

  return NextResponse.json({ success: false, error: "action mesti 'create' atau 'waybill'" }, { status: 400 });
}
