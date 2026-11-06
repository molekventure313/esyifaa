// Ads Hub untuk FIGHTER (role 'independent') — server sahaja.
// Fighter guna modul Ads Hub yang sama dengan marketer, tetapi:
//   · order = fighter_orders (bukan submissions HQ)
//   · kos produk = harga stok HQ kepada fighter (kos + markup), bukan kos HQ
//   · ads spend TIDAK ditulis ke ads_spend HQ
//   · AI (chat, laporan pagi, tag angle) guna Claude API key fighter sendiri
//   · link ad autopilot dipaksa ke SP fighter (/f/<slug>?f=<kod> atau SP Generator milik fighter)
import { decryptSecret } from '@/lib/fighter/crypto';
import { markupsFor } from '@/lib/fighter/server';

const FIGHTER_SLUGS = [
  'sabun-garam', 'sabun-garam-1', 'sabun-garam-2', 'sabun-garam-3', 'sabun-garam-4', 'sabun-garam-5',
  'garam-pengasihan', 'kasturi-kijang',
  'kasturi-kijang-1', 'kasturi-kijang-2', 'kasturi-kijang-3', 'kasturi-kijang-4', 'kasturi-kijang-5',
];
const fail = msg => Object.assign(new Error(msg), { toolError: true, status: 400 });

/** Profil ringkas pemilik akaun Ads Hub (cache setiap panggilan tidak perlu — query kecil). */
export async function ownerProfile(admin, marketerId) {
  const { data } = await admin.from('profiles').select('id, role, marketer_code, full_name').eq('id', marketerId).maybeSingle();
  return data || null;
}
export const isFighterProfile = p => p?.role === 'independent';

/**
 * Order fighter dalam julat MYT [from, to] → bentuk sama dengan baris submissions yang dipakai laporan Ads Hub.
 * Dikira: bayaran selesai (COD / FPX berbayar), bukan dibatalkan / dipulangkan.
 */
export async function fighterOrderRows(admin, fighterId, { from, to, adId } = {}) {
  const rows = [];
  for (let off = 0; ; off += 1000) {
    let q = admin.from('fighter_orders')
      .select('id, amount, notes, problem, source, qty, created_at, utm_content, payment_type, ship_status')
      .eq('fighter_id', fighterId)
      .eq('payment_status', 'completed')
      .not('ship_status', 'in', '(returned,cancelled)')
      .gte('created_at', `${from}T00:00:00+08:00`)
      .lte('created_at', `${to}T23:59:59+08:00`)
      .order('created_at')
      .range(off, off + 999);
    if (adId) q = q.eq('utm_content', adId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return rows.map(o => ({ ...o, amount_paid: o.amount }));
}

/** Kos seunit untuk fighter = cost_price HQ + markup fighter (format sama dengan fetchProductCosts). */
export async function fighterCosts(admin, fighterId) {
  const [{ data: products }, markups] = await Promise.all([
    admin.from('products').select('sku, cost_price').in('sku', ['SGH-200G', 'KKE-01', 'GPM-500G']),
    markupsFor(admin, fighterId).catch(() => ({})),
  ]);
  const price = sku => {
    const p = (products || []).find(x => x.sku === sku);
    return Number(p?.cost_price || 0) + Number(markups[sku] ?? 0);
  };
  return { sabunCost: price('SGH-200G'), kasturiCost: price('KKE-01'), garamCost: price('GPM-500G') };
}

/**
 * Claude API key untuk panggilan AI Ads Hub. Marketer / HQ → null (guna ANTHROPIC_API_KEY server).
 * Fighter → key sendiri dari Tetapan Akaun (wajib).
 */
export async function aiKeyFor(admin, marketerId) {
  const p = await ownerProfile(admin, marketerId);
  if (!isFighterProfile(p)) return null;
  const { data: s } = await admin.from('fighter_settings').select('ai_key_enc').eq('fighter_id', marketerId).maybeSingle();
  let key = null;
  try { key = s?.ai_key_enc ? decryptSecret(s.ai_key_enc) : null; } catch { /* kunci env bertukar */ }
  if (!key) throw Object.assign(new Error('Sambung Claude API Key anda di Tetapan Akaun (Portal Fighter) untuk guna AI Ads Hub.'), { status: 400 });
  return key;
}

/**
 * Link ad milik fighter MESTI ke SP fighter supaya order & bayaran masuk ke akaun fighter:
 *   https://e-syifa.com/f/<slug>?f=<kod>  (kod dipaksa) · atau /s/<slug> SP Generator milik fighter sendiri.
 * Link /<slug> biasa (HQ) ditukar automatik ke /f/<slug>?f=<kod>.
 */
export async function fighterAdLink(admin, profile, link) {
  const u = new URL(link);
  const code = profile.marketer_code;
  if (!code) throw fail('Kod fighter tiada — hubungi HQ.');
  const parts = u.pathname.split('/').filter(Boolean);
  u.searchParams.delete('m');
  if (parts[0] === 's' && parts[1]) {
    const { data: sp } = await admin.from('ai_salespages').select('owner_id').eq('slug', parts[1]).maybeSingle();
    if (sp?.owner_id !== profile.id) throw fail('SP Generator ini bukan milik anda — guna SP anda sendiri atau /f/<slug>.');
    u.searchParams.set('f', code);
    return u.toString();
  }
  const slug = parts[0] === 'f' ? parts[1] : parts[0];
  if (!FIGHTER_SLUGS.includes(slug) || parts.length > (parts[0] === 'f' ? 2 : 1)) {
    throw fail(`Link mesti SP fighter: https://e-syifa.com/f/<slug>?f=${code} (slug: ${FIGHTER_SLUGS.join(', ')}) atau SP Generator anda.`);
  }
  u.pathname = `/f/${slug}`;
  u.searchParams.set('f', code);
  return u.toString();
}

export { FIGHTER_SLUGS };
