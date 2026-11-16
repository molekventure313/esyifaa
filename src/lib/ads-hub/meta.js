// Ads Hub — klien Meta Marketing API (server sahaja).
export const META_API = 'https://graph.facebook.com/v26.0';

export class MetaError extends Error {
  constructor(info = {}) {
    super(info.error_user_msg || info.message || 'Ralat Meta');
    this.info = info;
    this.code = info.code;
  }
}

// Token tamat / dibatalkan / tiada kebenaran → sambungan perlu dikemas kini oleh marketer
export const isTokenError = e => e instanceof MetaError && [190, 102, 200, 10].includes(e.code);

// Had kadar Meta (app / akaun / Business Use Case). 17 + subcode 2446079 = "Ad Account Has Too Many API Calls".
const RATE_CODES = new Set([4, 17, 32, 613, 80000, 80001, 80002, 80003, 80004, 80005, 80006, 80008, 80009, 80014]);
export const isRateLimit = e => e instanceof MetaError && (RATE_CODES.has(e.code) || e.info?.error_subcode === 2446079);

// Header x-business-use-case-usage: { "<id>": [{ type, call_count, total_cputime, total_time,
//   estimated_time_to_regain_access (minit), ads_api_access_tier }] } → ringkasan untuk mesej ralat.
function usageOf(res) {
  const out = {};
  try {
    const buc = JSON.parse(res.headers.get('x-business-use-case-usage') || '{}');
    for (const rows of Object.values(buc)) for (const r of rows || []) {
      out.wait_min = Math.max(out.wait_min || 0, Number(r.estimated_time_to_regain_access) || 0);
      out.pct = Math.max(out.pct || 0, Number(r.call_count) || 0, Number(r.total_cputime) || 0, Number(r.total_time) || 0);
      if (r.ads_api_access_tier) out.tier = r.ads_api_access_tier;
    }
    const acct = JSON.parse(res.headers.get('x-ad-account-usage') || 'null');
    if (acct) {
      out.pct = Math.max(out.pct || 0, Number(acct.acc_id_util_pct) || 0);
      if (acct.reset_time_duration) out.wait_min = Math.max(out.wait_min || 0, Math.ceil(Number(acct.reset_time_duration) / 60));
      if (acct.ads_api_access_tier) out.tier = acct.ads_api_access_tier;
    }
  } catch { /* header rosak — abaikan */ }
  return out;
}

const encode = params => new URLSearchParams(
  Object.entries(params).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
);

async function parse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const err = new MetaError(json.error || { message: `HTTP ${res.status}` });
    if (isRateLimit(err)) {
      err.usage = usageOf(res);
      // Sekatan had akaun Meta biasanya ±5 minit; jangan cuba semula serta-merta (memanjangkan sekatan).
      err.retryAfterMin = Math.max(5, err.usage.wait_min || 0);
    }
    throw err;
  }
  return json;
}

export async function metaGet(path, params, token) {
  const url = path.startsWith('http') ? path : `${META_API}/${path}?${encode({ ...params, access_token: token })}`;
  return parse(await fetch(url, { cache: 'no-store' }));
}

export async function metaPost(path, params, token) {
  return parse(await fetch(`${META_API}/${path}`, {
    method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encode({ ...params, access_token: token }),
  }));
}

/** Mesej BM untuk ralat had kadar: berapa lama tunggu + tier akses API (development_access = had rendah). */
export function rateLimitHint(e) {
  if (!isRateLimit(e)) return '';
  const u = e.usage || {};
  return ` — HAD KADAR META: tunggu sekurang-kurangnya ${e.retryAfterMin} minit sebelum cuba semula (client_ref sama); `
    + `jangan cuba semula serta-merta.${u.tier ? ` Tier API app: ${u.tier}.` : ''}`;
}

// Ikut paging.next sehingga habis (atau maxPages)
export async function metaGetAll(path, params, token, maxPages = 25) {
  const rows = [];
  let page = await metaGet(path, params, token);
  for (let i = 0; ; i++) {
    rows.push(...(page.data || []));
    if (!page.paging?.next || i + 1 >= maxPages) break;
    page = await metaGet(page.paging.next, null, token);
  }
  return rows;
}

// Semak token: system user, permission & ad account yang boleh diakses
export async function inspectToken(token) {
  const [me, perms, accounts] = await Promise.all([
    metaGet('me', { fields: 'id,name' }, token),
    metaGet('me/permissions', {}, token),
    metaGetAll('me/adaccounts', { fields: 'id,name,currency,account_status,timezone_name', limit: 100 }, token),
  ]);
  const granted = new Set((perms.data || []).filter(p => p.status === 'granted').map(p => p.permission));
  const missing = ['ads_management', 'ads_read', 'business_management'].filter(p => !granted.has(p));
  return {
    system_user: me.name,
    missing_permissions: missing,
    ad_accounts: accounts.map(a => ({
      id: a.id, name: a.name, currency: a.currency, timezone: a.timezone_name, active: a.account_status === 1,
    })),
  };
}
