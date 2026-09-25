// Kiraan bersama untuk marketer — stats (dashboard), gaji, orders.
// Satu sumber supaya angka sales/COGS sama di semua page.

// COD orders kadang simpan amount dalam notes: [AMOUNT: MYR 95.00]
export function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
}

const isPhysical = s => ['sabun', 'garam-pengasihan', 'kasturi-kijang'].some(p => (s.source || '').includes(p));

// Add-on disimpan sama ada dalam notes "[ADD-ON: X ...]" atau problem "Add-On: X ..."
const addonText = s => `${s.notes || ''} ${s.problem || ''}`;
const ADDON = {
  kasturi: /(\[ADD-ON:|Add-On:)\s*Kasturi Kijang/i,
  sabun:   /(\[ADD-ON:|Add-On:)\s*Sabun Garam/i,
  garam:   /(\[ADD-ON:|Add-On:)\s*Garam (Masakan )?Pengasihan/i,
};
const sumQty = (arr, match, fallback) => arr.filter(match).reduce((t, s) => t + (parseInt(s.qty) || fallback), 0);
const countAddon = (arr, re) => arr.filter(s => re.test(addonText(s))).length;

// Unit produk (produk utama ikut qty + add-on 1 unit setiap order)
export function productUnits(arr) {
  return {
    sabun:   sumQty(arr, s => (s.source || '').includes('sabun'), 0)            + countAddon(arr, ADDON.sabun),
    kasturi: sumQty(arr, s => (s.source || '').startsWith('kasturi-kijang'), 1) + countAddon(arr, ADDON.kasturi),
    garam:   sumQty(arr, s => (s.source || '').startsWith('garam-pengasihan'), 1) + countAddon(arr, ADDON.garam),
  };
}

// Kos produk sahaja (tanpa postage)
export function calcProductCOGS(arr, { sabunCost = 0, kasturiCost = 0, garamCost = 0 } = {}) {
  const u = productUnits(arr);
  return parseFloat((u.sabun * sabunCost + u.kasturi * kasturiCost + u.garam * garamCost).toFixed(2));
}

// Postage sahaja — FPX RM4, COD RM6 untuk order produk fizikal
export function calcPostage(arr) {
  const fpx = arr.filter(s => isPhysical(s) && s.payment_type === 'fpx_payment').length;
  const cod = arr.filter(s => isPhysical(s) && s.payment_type === 'cod').length;
  return fpx * 4 + cod * 6;
}

// COGS — kos produk (sabun + kasturi + garam, termasuk add-on) + postage
export function calcCOGS(arr, costs = {}) {
  return parseFloat((calcProductCOGS(arr, costs) + calcPostage(arr)).toFixed(2));
}
