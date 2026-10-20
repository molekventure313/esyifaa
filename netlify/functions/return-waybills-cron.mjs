// Netlify Scheduled Function — setiap 10 minit panggil /api/cron/return-waybills:
// proses gambar waybill return yang tertinggal + padam gambar yang dah selesai lebih 7 hari.
// Perlu env CRON_SECRET (sama nilai di Netlify untuk site ini).
export default async () => {
  const base = process.env.URL;   // URL utama site (disediakan Netlify)
  if (!base || !process.env.CRON_SECRET) {
    console.warn('[return-waybills-cron] URL / CRON_SECRET tiada — langkau');
    return;
  }
  const res = await fetch(`${base}/api/cron/return-waybills`, { headers: { 'x-cron-secret': process.env.CRON_SECRET } });
  console.log('[return-waybills-cron]', res.status, await res.text());
};

export const config = { schedule: '*/10 * * * *' };
