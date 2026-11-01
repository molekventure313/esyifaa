// Netlify Scheduled Function — setiap jam (minit ke-5) panggil /api/cron/ads-sync:
// sync data Meta Ads Hub untuk semua marketer yang dah sambung akaun.
// Perlu env CRON_SECRET (sama nilai di Netlify untuk site ini).
export default async () => {
  const base = process.env.URL;   // URL utama site (disediakan Netlify)
  if (!base || !process.env.CRON_SECRET) {
    console.warn('[ads-sync-cron] URL / CRON_SECRET tiada — langkau');
    return;
  }
  const res = await fetch(`${base}/api/cron/ads-sync`, { headers: { 'x-cron-secret': process.env.CRON_SECRET } });
  console.log('[ads-sync-cron]', res.status, await res.text());
};

export const config = { schedule: '5 * * * *' };
