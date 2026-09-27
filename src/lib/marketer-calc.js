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
  // Hadiah percuma pakej Garam 6 pek — berasingan dari add-on (pelanggan boleh dapat kedua-duanya)
  kasturiGift: /(Free Gift:\s*(Minyak )?Kasturi Kijang|\[FREE GIFT:\s*Kasturi Kijang)/i,
  sabun:   /(\[ADD-ON:|Add-On:)\s*Sabun Garam/i,
  garam:   /(\[ADD-ON:|Add-On:)\s*Garam (Masakan )?Pengasihan/i,
};
// Kuantiti produk utama satu order.
// Teks dulu — column qty DEFAULT 1 dan order FPX tak isi column tu (FPX 3 unit tersimpan qty=1).
//   COD notes: "[QTY: 3 unit]" · Pakej: "3 Unit" (sabun) / "6 Pek (...)" (garam) / "5 Botol (...)" (kasturi)
export function orderQty(s) {
  const qtyTag = (s.notes || '').match(/\[QTY:\s*(\d+)\s*unit\]/i);
  if (qtyTag) return parseInt(qtyTag[1]);
  const pakej = `${s.problem || ''} ${s.notes || ''}`.match(/Pakej:\s*(\d+)\s*(Unit|Pek|Botol)/i);
  if (pakej) return parseInt(pakej[1]);
  return parseInt(s.qty) || 1;
}

const sumQty = (arr, match) => arr.filter(match).reduce((t, s) => t + orderQty(s), 0);
const countAddon = (arr, re) => arr.filter(s => re.test(addonText(s))).length;

// Add-on dalam SATU order → { sabun, kasturi, garam, kasturiGift } (boolean)
export const addonsOf = s => ({
  sabun:   ADDON.sabun.test(addonText(s)),
  kasturi: ADDON.kasturi.test(addonText(s)),
  garam:   ADDON.garam.test(addonText(s)),
  kasturiGift: ADDON.kasturiGift.test(addonText(s)),
});

// Unit produk (produk utama ikut qty + add-on 1 unit setiap order)
export function productUnits(arr) {
  return {
    sabun:   sumQty(arr, s => (s.source || '').includes('sabun'))            + countAddon(arr, ADDON.sabun),
    kasturi: sumQty(arr, s => (s.source || '').startsWith('kasturi-kijang')) + countAddon(arr, ADDON.kasturi) + countAddon(arr, ADDON.kasturiGift),
    garam:   sumQty(arr, s => (s.source || '').startsWith('garam-pengasihan')) + countAddon(arr, ADDON.garam),
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
