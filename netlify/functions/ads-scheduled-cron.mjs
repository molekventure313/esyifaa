// Netlify Scheduled Function — setiap 10 minit panggil /api/cron/ads-scheduled:
// laksana tindakan Ads Hub berjadual yang dah sampai masa + peraturan auto ikut jam.
// Perlu env CRON_SECRET (sama nilai di Netlify untuk site ini).
export default async () => {
  const base = process.env.URL;   // URL utama site (disediakan Netlify)
  if (!base || !process.env.CRON_SECRET) {
    console.warn('[ads-scheduled-cron] URL / CRON_SECRET tiada — langkau');
    return;
  }
  const res = await fetch(`${base}/api/cron/ads-scheduled`, { headers: { 'x-cron-secret': process.env.CRON_SECRET } });
  console.log('[ads-scheduled-cron]', res.status, await res.text());
};

export const config = { schedule: '*/10 * * * *' };
