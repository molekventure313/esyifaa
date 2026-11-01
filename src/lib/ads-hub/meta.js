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

const encode = params => new URLSearchParams(
  Object.entries(params).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
);

export async function metaGet(path, params, token) {
  const url = path.startsWith('http') ? path : `${META_API}/${path}?${encode({ ...params, access_token: token })}`;
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new MetaError(json.error || { message: `HTTP ${res.status}` });
  return json;
}

export async function metaPost(path, params, token) {
  const res = await fetch(`${META_API}/${path}`, {
    method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encode({ ...params, access_token: token }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new MetaError(json.error || { message: `HTTP ${res.status}` });
  return json;
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
