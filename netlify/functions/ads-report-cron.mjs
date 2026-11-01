// Netlify Scheduled Function — setiap 15 minit panggil /api/cron/ads-report:
// jana laporan pagi Ads Hub (dari 9 pagi MYT) bagi marketer yang belum ada laporan hari ini.
// Perlu env CRON_SECRET (sama nilai di Netlify untuk site ini).
export default async () => {
  const base = process.env.URL;   // URL utama site (disediakan Netlify)
  if (!base || !process.env.CRON_SECRET) {
    console.warn('[ads-report-cron] URL / CRON_SECRET tiada — langkau');
    return;
  }
  const res = await fetch(`${base}/api/cron/ads-report`, { headers: { 'x-cron-secret': process.env.CRON_SECRET } });
  console.log('[ads-report-cron]', res.status, await res.text());
};

export const config = { schedule: '*/15 * * * *' };
