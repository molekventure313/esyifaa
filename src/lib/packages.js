// Pakej, add-on & postage produk fizikal — untuk borang Order WhatsApp (dashboard).
// Harga & peraturan DISALIN dari borang SP (SabunCheckoutForm / GaramCheckoutForm / KasturiCheckoutForm).
// Bila tukar harga di SP, kemas kini di sini juga.

export const EAST_MALAYSIA = ['Sabah', 'Sarawak'];
export const POSTAGE_NORMAL = 5;
export const POSTAGE_EAST   = 10;

// Sama dgn borang SP (nama negeri dipakai dalam alamat & parse alamat NinjaVan)
export const MY_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
  'Perak', 'Perlis', 'Pulau Pinang', 'Selangor', 'Terengganu',
  'Wilayah Persekutuan Kuala Lumpur', 'Wilayah Persekutuan Labuan', 'Wilayah Persekutuan Putrajaya',
  'Sabah', 'Sarawak',
];

// addons: key → { label, price, note (format nota — dikesan addonsOf/labels) }
const ADDONS = {
  kasturi: { label: "Minyak Kasturi Kijang E-Syifa'", price: 20, problem: "Add-On: Kasturi Kijang E-Syifa' +RM20", notes: '[ADD-ON: Kasturi Kijang +RM20]' },
  sabun:   { label: 'Sabun Garam Himalaya (200g)',     price: 25, problem: 'Add-On: Sabun Garam Pengisian +RM25',   notes: '[ADD-ON: Sabun Garam +RM25]' },
  garam:   { label: 'Garam Masakan Pengasihan (250g)', price: 25, problem: 'Add-On: Garam Masakan Pengasihan +RM25', notes: '[ADD-ON: Garam Masakan +RM25]' },
};

export const ORDER_PRODUCTS = {
  'sabun-garam': {
    name: 'Sabun Garam Himalaya Pengisian ESyifaa (200g)',
    packages: [
      { units: 1, label: '1 Unit', price: 39 },
      { units: 2, label: '2 Unit', price: 70 },
      { units: 3, label: '3 Unit', price: 90 },
    ],
    addons: ['kasturi'],
    // Pakej asal: semua pakej + postage (RM5 Semenanjung / RM10 Sabah & Sarawak). Add-on Kasturi: diskaun postage RM5.
    postage: ({ east, pkg, addons }) => (pkg.freePostage ? 0 : Math.max(0, (east ? POSTAGE_EAST : POSTAGE_NORMAL) - (addons.kasturi ? 5 : 0))),
  },
  'garam-pengasihan': {
    name: 'Garam Pengasihan Masakan ESyifaa (250g)',
    packages: [
      { units: 2, label: '2 Pek (250g x 2) — Beli 1 Free 1 Pek', price: 39 },
      { units: 4, label: '4 Pek (250g x 4) — Beli 2 Free 2 Pek', price: 70, freePostage: true },
      { units: 6, label: '6 Pek (250g x 6) — Beli 4 Free 2 Pek', price: 90, freePostage: true, includesKasturi: true },
    ],
    addons: ['kasturi', 'sabun'],
    postage: ({ east, pkg }) => (east ? POSTAGE_EAST : (pkg.freePostage ? 0 : POSTAGE_NORMAL)),
  },
  'kasturi-kijang': {
    name: 'Minyak Kasturi Kijang Ruqyah E-Syifa',
    packages: [
      { units: 1, label: '1 Botol (Pek Percubaan)', price: 20 },
      { units: 3, label: '3 Botol (Pakej Rawatan Lengkap)', price: 30 },
      { units: 5, label: '5 Botol (Pakej Seisi Keluarga)', price: 40 },
    ],
    addons: ['sabun', 'garam'],
    postage: ({ east }) => (east ? POSTAGE_EAST : POSTAGE_NORMAL),
  },
};

export const addonInfo = key => ADDONS[key];

// Unit produk utama (label pakej — mesti padan regex orderQty: "Pakej: 3 Unit|Pek|Botol")
export const UNIT_WORDS = { 'sabun-garam': 'Unit', 'garam-pengasihan': 'Pek', 'kasturi-kijang': 'Botol' };

/**
 * Harga order CUSTOM (Order WhatsApp) — bilangan unit, harga produk, kuantiti add-on, hadiah Kasturi & postage bebas.
 * @param units         bilangan unit produk utama
 * @param productPrice  harga produk utama (RM, jumlah — bukan seunit)
 * @param addonQty      { kasturi, sabun, garam } kuantiti
 * @param addonPrice    { kasturi, sabun, garam } harga SEUNIT (lalai harga add-on biasa)
 * @param giftKasturi   bilangan Kasturi percuma (hadiah)
 * @param postageMode   'auto' (RM5 / RM10 Sabah & Sarawak) | 'free' | 'custom'
 * @param postageCustom RM (untuk 'custom')
 */
export function priceCustom({ product, units, productPrice, addonQty = {}, addonPrice = {}, giftKasturi = 0, postageMode = 'auto', postageCustom = 0, state }) {
  const def = ORDER_PRODUCTS[product];
  if (!def) throw new Error('Produk tidak sah.');
  const u = parseInt(units);
  if (!(u >= 1 && u <= 200)) throw new Error('Bilangan unit tidak sah (1–200).');
  const price = parseFloat(productPrice);
  if (!Number.isFinite(price) || price < 0) throw new Error('Harga produk tidak sah.');

  const addonLines = def.addons
    .map(k => {
      const qty = Math.max(0, Math.min(50, parseInt(addonQty[k]) || 0));
      const each = addonPrice[k] === undefined || addonPrice[k] === '' ? ADDONS[k].price : parseFloat(addonPrice[k]);
      if (!Number.isFinite(each) || each < 0) throw new Error(`Harga add-on ${ADDONS[k].label} tidak sah.`);
      return { key: k, qty, each, total: parseFloat((qty * each).toFixed(2)) };
    })
    .filter(l => l.qty > 0);
  const addonTotal = addonLines.reduce((t, l) => t + l.total, 0);

  const gift = Math.max(0, Math.min(50, parseInt(giftKasturi) || 0));
  const east = EAST_MALAYSIA.includes(state);
  let postage;
  if (postageMode === 'free') postage = 0;
  else if (postageMode === 'custom') {
    postage = parseFloat(postageCustom);
    if (!Number.isFinite(postage) || postage < 0) throw new Error('Postage tidak sah.');
  } else postage = east ? POSTAGE_EAST : POSTAGE_NORMAL;

  const pkg = { units: u, label: `${u} ${UNIT_WORDS[product]} (Custom)`, price };
  const total = parseFloat((price + addonTotal + postage).toFixed(2));
  return { def, pkg, addonLines, addonTotal, gift, postage, total, east };
}

/**
 * Kira harga order. addons: { kasturi, sabun, garam } (boolean).
 * @returns { pkg, addonTotal, postage, total, addonKeys }
 */
export function priceOrder({ product, packageIndex, addons = {}, state }) {
  const def = ORDER_PRODUCTS[product];
  if (!def) throw new Error('Produk tidak sah.');
  const pkg = def.packages[packageIndex];
  if (!pkg) throw new Error('Pakej tidak sah.');
  const addonKeys = def.addons.filter(k => addons[k] && !(pkg.noAddons || []).includes(k));
  const addonTotal = addonKeys.reduce((t, k) => t + ADDONS[k].price, 0);
  const east = EAST_MALAYSIA.includes(state);
  const postage = def.postage({ east, pkg, addons: Object.fromEntries(addonKeys.map(k => [k, true])) });
  return { def, pkg, addonKeys, addonTotal, postage, total: pkg.price + addonTotal + postage, east };
}
