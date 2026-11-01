// Netlify Scheduled Function — setiap jam (minit ke-20) panggil /api/cron/ads-rules:
// nilai peraturan auto Ads Hub + amaran sistem (guna order sebenar).
// Perlu env CRON_SECRET (sama nilai di Netlify untuk site ini).
export default async () => {
  const base = process.env.URL;   // URL utama site (disediakan Netlify)
  if (!base || !process.env.CRON_SECRET) {
    console.warn('[ads-rules-cron] URL / CRON_SECRET tiada — langkau');
    return;
  }
  const res = await fetch(`${base}/api/cron/ads-rules`, { headers: { 'x-cron-secret': process.env.CRON_SECRET } });
  console.log('[ads-rules-cron]', res.status, await res.text());
};

export const config = { schedule: '20 * * * *' };
