// Fighter (role 'independent') — akses, tetapan & markup stok. Server sahaja.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const err = (msg, status) => ({ error: NextResponse.json({ success: false, error: msg }, { status }) });

export const MIGRATION_MSG = 'Jadual Fighter belum wujud — run migration 027 di Supabase.';
export const tableMissing = e => /relation .* does not exist|Could not find the table/i.test(e?.message || '');

// Fighter aktif sahaja
export async function fighterGuard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err('Unauthorized', 401);
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles')
    .select('id, role, full_name, email, phone, marketer_code, is_active').eq('id', user.id).single();
  if (profile?.role !== 'independent') return err('Forbidden', 403);
  if (profile.is_active === false) return err('Akaun fighter belum diluluskan.', 403);
  return { user, profile, admin };
}

// Tetapan untuk paparan — key rahsia TIDAK dipulangkan, hanya 4 aksara akhir & status
export function publicSettings(s) {
  return {
    chip_brand_id: s?.chip_brand_id || '',
    chip_key_last4: s?.chip_key_last4 || null,
    chip_public_key_set: !!s?.chip_public_key,
    chip_status: s?.chip_status || null, chip_message: s?.chip_message || null, chip_checked_at: s?.chip_checked_at || null,
    ai_key_last4: s?.ai_key_last4 || null,
    ai_status: s?.ai_status || null, ai_message: s?.ai_message || null, ai_checked_at: s?.ai_checked_at || null,
    meta_pixel_id: s?.meta_pixel_id || '',
    whatsapp: s?.whatsapp || '',
    sender_name: s?.sender_name || '',
    sender_phone: s?.sender_phone || '',
    ninjavan_shipper_no: s?.ninjavan_shipper_no || '',
    courier: s?.courier || 'hq',
  };
}

// Semak CHIP: key sah + brand wujud. Pulangkan public key (untuk sahkan webhook) bila berjaya.
export async function testChip(apiKey, brandId) {
  const H = { Authorization: `Bearer ${apiKey}` };
  try {
    const pk = await fetch('https://gate.chip-in.asia/api/v1/public_key/', { headers: H });
    if (pk.status === 401 || pk.status === 403) return { ok: false, message: 'API Key CHIP tidak sah.' };
    if (!pk.ok) return { ok: false, message: `CHIP balas ${pk.status} semasa semak key.` };
    const publicKey = await pk.json().catch(() => null);
    const pm = await fetch(`https://gate.chip-in.asia/api/v1/payment_methods/?brand_id=${encodeURIComponent(brandId)}&currency=MYR`, { headers: H });
    if (!pm.ok) return { ok: false, message: 'Brand ID tidak sepadan dengan API Key ini.' };
    return { ok: true, message: 'Sambungan CHIP OK.', publicKey: typeof publicKey === 'string' ? publicKey : null };
  } catch (e) {
    return { ok: false, message: `Gagal hubungi CHIP: ${e.message}` };
  }
}

// Semak Claude API key — senarai model (percuma, tiada token digunakan)
export async function testClaude(apiKey) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/models?limit=1', {
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    });
    if (r.status === 401 || r.status === 403) return { ok: false, message: 'Claude API Key tidak sah.' };
    if (!r.ok) return { ok: false, message: `Anthropic balas ${r.status}.` };
    return { ok: true, message: 'Claude API OK.' };
  } catch (e) {
    return { ok: false, message: `Gagal hubungi Anthropic: ${e.message}` };
  }
}

// Markup seunit untuk fighter: harga khas (scope = id fighter) mengatasi 'default'
export async function markupsFor(admin, fighterId) {
  const { data, error } = await admin.from('fighter_markups').select('scope, sku, markup').in('scope', ['default', fighterId]);
  if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
  const out = {};
  for (const r of data || []) if (r.scope === 'default' && out[r.sku] === undefined) out[r.sku] = Number(r.markup);
  for (const r of data || []) if (r.scope === fighterId) out[r.sku] = Number(r.markup);
  return out;
}
