// UTM Analytics — logik bersama (admin & marketer)
// Tree: kempen (utm_campaign) → adset (utm_medium) → iklan (utm_content)
// Setiap nod: orders, revenue, avg_order, wa_clicks (klik WhatsApp UNIK).

const MYT_MS = 8 * 3600 * 1000;
const round2 = n => parseFloat(n.toFixed(2));
const avg = (rev, ord) => ord > 0 ? round2(rev / ord) : 0;

export const hasUtm = x => !!(x.utm_source || x.utm_campaign || x.utm_medium || x.utm_content);

// Klik unik = IP sama dalam hari (MYT) yang sama dikira sekali
export const clickUid = c =>
  `${c.ip_address || `id:${c.id}`}|${new Date(new Date(c.created_at).getTime() + MYT_MS).toISOString().slice(0, 10)}`;

export const countUniqueClicks = clicks => new Set(clicks.map(clickUid)).size;

/**
 * @param orders  [{ utm_campaign, utm_medium, utm_content, amount, has_utm }]
 * @param clicks  wa_clicks rows [{ id, created_at, ip_address, utm_* }]
 */
export function buildCampaignTree(orders, clicks = []) {
  const tree = {};
  const node = (bag, key, labelKey) => (bag[key] ??= { [labelKey]: key, orders: 0, revenue: 0, uids: new Set(), children: {} });
  const path = x => [
    x.utm_campaign || '(kempen tidak diketahui)',
    x.utm_medium   || '(adset tidak diketahui)',
    x.utm_content  || '(iklan tidak diketahui)',
  ];

  for (const o of orders) {
    if (!o.has_utm) continue;
    const [c, s, a] = path(o);
    for (const n of [node(tree, c, 'campaign'), node(tree[c].children, s, 'adset'), node(tree[c].children[s].children, a, 'ad')]) {
      n.orders++;
      n.revenue += o.amount;
    }
  }

  for (const k of clicks) {
    if (!hasUtm(k)) continue;
    const [c, s, a] = path(k);
    const uid = clickUid(k);
    for (const n of [node(tree, c, 'campaign'), node(tree[c].children, s, 'adset'), node(tree[c].children[s].children, a, 'ad')]) {
      n.uids.add(uid);
    }
  }

  const out = (n, labelKey) => ({
    [labelKey]: n[labelKey],
    orders: n.orders,
    revenue: round2(n.revenue),
    avg_order: avg(n.revenue, n.orders),
    wa_clicks: n.uids.size,
  });
  const byRank = (a, b) => b.revenue - a.revenue || b.wa_clicks - a.wa_clicks;

  return Object.values(tree).map(c => ({
    ...out(c, 'campaign'),
    adsets: Object.values(c.children).map(s => ({
      ...out(s, 'adset'),
      ads: Object.values(s.children).map(a => out(a, 'ad')).sort(byRank),
    })).sort(byRank),
  })).sort(byRank);
}

// Ringkasan klik WhatsApp untuk kad summary
export function summarizeClicks(clicks) {
  const withUtm = clicks.filter(hasUtm);
  return { wa_clicks: countUniqueClicks(clicks), utm_wa_clicks: countUniqueClicks(withUtm) };
}
