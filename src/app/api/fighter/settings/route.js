import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { fighterGuard, publicSettings, testChip, testClaude, markupsFor, tableMissing, MIGRATION_MSG } from '@/lib/fighter/server';
import { encryptSecret, decryptSecret, last4 } from '@/lib/fighter/crypto';

// Fighter — tetapan akaun sendiri
// GET  → profil + tetapan (tanpa key rahsia) + harga stok (kos + markup)
// PUT  { chip_brand_id?, chip_api_key?, claude_api_key?, meta_pixel_id?, whatsapp?, sender_name?, sender_phone? }
//      ninjavan_shipper_no? · key kosong = kekal yang lama. Key CHIP / Claude baru diuji dulu sebelum disimpan.
// POST { action: 'test_chip' | 'test_ai' | 'remove_ai' } → uji semula key tersimpan / buang key Claude

const clean = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const phoneOf = v => clean(v, 20).replace(/[^\d]/g, '');

async function load(g) {
  const { data, error } = await g.admin.from('fighter_settings').select('*').eq('fighter_id', g.user.id).maybeSingle();
  if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
  return data;
}

export async function GET() {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const [s, markups, { data: products }] = await Promise.all([
      load(g),
      markupsFor(g.admin, g.user.id),
      g.admin.from('products').select('sku, name, unit, cost_price').eq('is_active', true).order('name'),
    ]);
    const prices = (products || []).map(p => {
      const markup = markups[p.sku] ?? 0;
      return { sku: p.sku, name: p.name, unit: p.unit, price: Number(p.cost_price || 0) + markup };
    });
    return NextResponse.json({
      success: true,
      profile: { full_name: g.profile.full_name, email: g.profile.email, phone: g.profile.phone, code: g.profile.marketer_code },
      settings: publicSettings(s),
      prices,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const s = await load(g);
    const now = new Date().toISOString();
    const row = { fighter_id: g.user.id, updated_at: now };

    if (b.meta_pixel_id !== undefined) {
      const px = clean(b.meta_pixel_id, 30);
      if (px && !/^\d{10,20}$/.test(px)) throw new Error('Pixel ID mesti nombor (10–20 digit).');
      row.meta_pixel_id = px || null;
    }
    if (b.whatsapp !== undefined) {
      const wa = phoneOf(b.whatsapp).replace(/^0/, '60');
      if (wa && !/^60\d{8,11}$/.test(wa)) throw new Error('No. WhatsApp tidak sah (cth 60123456789).');
      row.whatsapp = wa || null;
    }
    if (b.sender_name !== undefined) row.sender_name = clean(b.sender_name, 80) || null;
    if (b.sender_phone !== undefined) row.sender_phone = phoneOf(b.sender_phone) || null;
    if (b.courier !== undefined) {
      if (!['hq', 'own'].includes(b.courier)) throw new Error('Pilihan kurier tidak sah.');
      row.courier = b.courier;
    }
    if (b.ninjavan_shipper_no !== undefined) row.ninjavan_shipper_no = clean(b.ninjavan_shipper_no, 30).replace(/[^\w-]/g, '') || null;

    // CHIP: brand / key berubah → uji dulu
    const brand = b.chip_brand_id !== undefined ? clean(b.chip_brand_id, 80) : s?.chip_brand_id;
    const newKey = clean(b.chip_api_key, 500);
    if (newKey || (b.chip_brand_id !== undefined && brand !== (s?.chip_brand_id || ''))) {
      const apiKey = newKey || (s?.chip_key_enc ? decryptSecret(s.chip_key_enc) : '');
      if (!brand || !apiKey) throw new Error('Isi Brand ID dan API Key CHIP.');
      const t = await testChip(apiKey, brand);
      if (!t.ok) throw new Error(t.message);
      Object.assign(row, {
        chip_brand_id: brand, chip_status: 'ok', chip_message: t.message, chip_checked_at: now,
        ...(t.publicKey ? { chip_public_key: t.publicKey } : {}),
        ...(newKey ? { chip_key_enc: encryptSecret(newKey), chip_key_last4: last4(newKey) } : {}),
      });
    }

    // Claude: key baru → uji dulu
    const aiKey = clean(b.claude_api_key, 300);
    if (aiKey) {
      if (!/^sk-ant-/.test(aiKey)) throw new Error('Claude API Key bermula dengan "sk-ant-".');
      const t = await testClaude(aiKey);
      if (!t.ok) throw new Error(t.message);
      Object.assign(row, { ai_key_enc: encryptSecret(aiKey), ai_key_last4: last4(aiKey), ai_status: 'ok', ai_message: t.message, ai_checked_at: now });
    }

    const { data, error } = await g.admin.from('fighter_settings').upsert(row, { onConflict: 'fighter_id' }).select('*').single();
    if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
    if (row.meta_pixel_id !== undefined) { try { revalidateTag('pixels'); } catch (_) {} }   // pixel SP fighter terus live
    return NextResponse.json({ success: true, settings: publicSettings(data) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function POST(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const { action } = await req.json();
    const s = await load(g);
    const now = new Date().toISOString();
    let row;
    if (action === 'test_chip') {
      if (!s?.chip_key_enc || !s?.chip_brand_id) throw new Error('Simpan Brand ID & API Key CHIP dulu.');
      const t = await testChip(decryptSecret(s.chip_key_enc), s.chip_brand_id);
      row = { chip_status: t.ok ? 'ok' : 'error', chip_message: t.message, chip_checked_at: now, ...(t.publicKey ? { chip_public_key: t.publicKey } : {}) };
    } else if (action === 'test_ai') {
      if (!s?.ai_key_enc) throw new Error('Simpan Claude API Key dulu.');
      const t = await testClaude(decryptSecret(s.ai_key_enc));
      row = { ai_status: t.ok ? 'ok' : 'error', ai_message: t.message, ai_checked_at: now };
    } else if (action === 'remove_ai') {
      row = { ai_key_enc: null, ai_key_last4: null, ai_status: null, ai_message: null, ai_checked_at: null };
    } else {
      throw new Error('Tindakan tidak sah.');
    }
    const { data, error } = await g.admin.from('fighter_settings').update({ ...row, updated_at: now }).eq('fighter_id', g.user.id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, settings: publicSettings(data) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
