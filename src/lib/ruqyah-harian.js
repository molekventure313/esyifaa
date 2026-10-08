// Ruqyah Harian E-Syifa — servis langganan prabayar: perawat bacakan ruqyah jarak jauh
// terus ke atas diri pesakit 2x sehari sepanjang tempoh langganan.
// Selamat untuk client & server (tiada import server).

export const RH_SOURCE = 'ruqyah-harian';
export const RH_NAME = 'Ruqyah Harian E-Syifa';
export const RH_MAX_SLOTS = 100;   // had pendaftaran BARU setiap bulan (kapasiti perawat)

// Susunan FSP: pakej besar dahulu
export const RH_PACKAGES = [
  { months: 3, label: '3 Bulan', price: 300, originalPrice: 450, savings: 150, badge: 'PALING JIMAT', recommended: true, readings: 180 },
  { months: 1, label: '1 Bulan', price: 150, originalPrice: null, savings: 0, badge: null, readings: 60 },
];
export const RH_PRICES = RH_PACKAGES.map(p => p.price);

export const isRuqyahHarian = source => (source || '').startsWith(RH_SOURCE);

// Tempoh (bulan) dari teks order: "Ruqyah Harian E-Syifa (3 Bulan) | ..."
export function rhMonthsOf(submission) {
  const m = `${submission?.problem || ''} ${submission?.notes || ''}`.match(/\((\d+)\s*Bulan\)/i);
  if (m) return parseInt(m[1]);
  const amt = parseFloat(submission?.amount_paid) || 0;
  return RH_PACKAGES.find(p => p.price === amt)?.months || 1;
}

// Awal bulan semasa (MYT) dalam ISO — untuk kiraan slot pendaftaran baru
export function rhMonthStartISO() {
  const myt = new Date(Date.now() + 8 * 3600 * 1000);
  const ym = myt.toISOString().slice(0, 7);
  return new Date(`${ym}-01T00:00:00+08:00`).toISOString();
}
