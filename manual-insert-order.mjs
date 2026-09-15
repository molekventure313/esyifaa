// manual-insert-order.mjs
// Run: node manual-insert-order.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Order Details ────────────────────────────────────────────────────────────
const ORDER = {
  full_name:    'Zurahedah binti Md Taher',
  phone:        '+60194881953',
  address:      'Lot 1113 km 10 jalan kampung padang, bukit lintang, 75460, Melaka, Melaka',
  quantity:     3,
  units_label:  '3 Unit',
  product:      'Sabun Garam Himalaya Pengisian ESyifaa (200g)',
  amount_base:  90,
  amount_total: 95,
  postage:      5,
  source:       'sabun-garam-1',
  created_at:   '2026-09-15T07:47:00+08:00', // original order time
};

async function run() {
  console.log('📦 Inserting manual COD order...\n');

  // ── 1. Upsert Customer ────────────────────────────────────────────────────
  let customerId = null;
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', ORDER.phone)
    .maybeSingle();

  if (existing) {
    customerId = existing.id;
    console.log(`👤 Customer found: ${customerId}`);
  } else {
    const { data: newCust, error: custErr } = await supabase
      .from('customers')
      .insert({
        full_name:            ORDER.full_name,
        phone:                ORDER.phone,
        submission_count:     1,
        is_repeat:            false,
        first_submission_at:  ORDER.created_at,
      })
      .select('id')
      .single();

    if (custErr) console.warn('⚠️  Customer insert skipped:', custErr.message);
    else { customerId = newCust.id; console.log(`👤 Customer created: ${customerId}`); }
  }

  // ── 2. Build problem notes (same format as cod/route.js) ─────────────────
  const problemNotes = `[COD] Produk: ${ORDER.product} | Pakej: ${ORDER.units_label} | Harga: RM${ORDER.amount_base} + Postage RM${ORDER.postage} = RM${ORDER.amount_total} | Alamat: ${ORDER.address}`;
  const notes        = `[COD ORDER] [STATUS: completed] [AMOUNT: RM${ORDER.amount_total}] [QTY: ${ORDER.quantity} unit] [PRODUK: ${ORDER.product}]`;

  // ── 3. Insert Submission ─────────────────────────────────────────────────
  const submissionData = {
    full_name:       ORDER.full_name,
    phone:           ORDER.phone,
    address:         ORDER.address,
    problem:         problemNotes,
    notes,
    source:          ORDER.source,
    payment_type:    'cod',
    payment_status:  'completed',
    amount_paid:     ORDER.amount_total,
    qty:             ORDER.quantity,
    ip_address:      'manual-insert',
    user_agent:      'manual-insert',
    consent_contact: true,
    created_at:      ORDER.created_at,
  };
  if (customerId) submissionData.customer_id = customerId;

  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .insert(submissionData)
    .select()
    .single();

  if (subErr) {
    console.error('❌ Submission insert failed:', subErr.message);
    process.exit(1);
  }

  console.log(`✅ Submission created: ${submission.id}`);
  console.log(`   Nama  : ${ORDER.full_name}`);
  console.log(`   Phone : ${ORDER.phone}`);
  console.log(`   Pakej : ${ORDER.units_label} — RM${ORDER.amount_total} (COD)`);
  console.log(`   Alamat: ${ORDER.address}`);
  console.log(`\n🎉 Order berjaya dimasukkan ke dalam sistem!`);
}

run().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
