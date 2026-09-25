// Kiraan bersama untuk marketer — stats (dashboard), gaji, orders.
// Satu sumber supaya angka sales/COGS sama di semua page.

// COD orders kadang simpan amount dalam notes: [AMOUNT: MYR 95.00]
export function parseAmount(s) {
  if (s.amount_paid && parseFloat(s.amount_paid) > 0) return parseFloat(s.amount_paid);
  const m = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9.]+)\]/i);
  return m ? parseFloat(m[1]) : 0;
}

const isPhysical = s => ['sabun', 'garam-pengasihan', 'kasturi-kijang'].some(p => (s.source || '').includes(p));

// COGS — sabun + kasturi + garam + postage (FPX RM4, COD RM6)
export function calcCOGS(arr, { sabunCost = 0, kasturiCost = 0, garamCost = 0 } = {}) {
  const sabunUnits = arr.filter(s => (s.source || '').includes('sabun')).reduce((t, s) => t + (parseInt(s.qty) || 0), 0);
  const kasturiN   = arr.filter(s => /\[ADD-ON: Kasturi Kijang/i.test(s.notes || '') || /Add-On:\s*Kasturi Kijang/i.test(s.problem || '')).length;
  const garamUnits = arr.filter(s => s.source === 'garam-pengasihan').reduce((t, s) => t + (parseInt(s.qty) || 1), 0);
  const garamAddon = arr.filter(s => /\[ADD-ON: Garam Pengasihan/i.test(s.notes || '') || /Add-On:\s*Garam Pengasihan/i.test(s.problem || '')).length;
  const fpxPhys    = arr.filter(s => isPhysical(s) && s.payment_type === 'fpx_payment').length;
  const codPhys    = arr.filter(s => isPhysical(s) && s.payment_type === 'cod').length;
  return parseFloat((
    sabunUnits * sabunCost +
    kasturiN   * kasturiCost +
    (garamUnits + garamAddon) * garamCost +
    fpxPhys * 4 + codPhys * 6
  ).toFixed(2));
}
