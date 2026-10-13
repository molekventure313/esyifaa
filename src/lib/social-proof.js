// Social proof (notifikasi "X baru menempah") — kumpulan produk. Selamat untuk client & server.
// Notifikasi produk A HANYA keluar di SP produk A (padanan ikut laluan SP ↔ source order).

export const SP_GROUPS = {
  sabun: {
    label: 'Sabun Garam Himalaya', icon: '🧼', unit: 'Unit',
    paths: ['/sabun-garam'],
    sources: ['sabun-garam'],
  },
  kasturi: {
    label: 'Minyak Kasturi Kijang', icon: '🌿', unit: 'Botol',
    paths: ['/kasturi-kijang'],
    sources: ['kasturi-kijang'],
  },
  garam: {
    label: 'Garam Pengasihan', icon: '🧂', unit: 'Pek',
    paths: ['/garam-pengasihan'],
    sources: ['garam-pengasihan'],
  },
  pengisian: {
    label: "Pengisian E-Syifa'", icon: '💎', unit: 'Item',
    paths: ['/pengisian-esyifa', '/tasbih-esyifa', '/rawat-sendiri'],
    sources: ['pengisian', 'tasbih', 'rawat-sendiri'],
  },
  'ruqyah-harian': {
    label: "Ruqyah Harian E-Syifa'", icon: '🌙', unit: null,
    paths: ['/ruqyah-harian'],
    sources: ['ruqyah-harian'],
  },
  rawatan: {
    label: 'Rawatan Jarak Jauh', icon: '🤲', unit: null,
    paths: ['/fsp', '/sihir', '/saka', '/belum-zuriat', '/gangguan-berulang', '/gangguan-mistik', '/kedai-tutup', '/penyakit-misteri'],
    sources: ['fsp', 'sihir', 'saka', 'belum-zuriat', 'gangguan-berulang', 'gangguan-mistik', 'kedai-tutup', 'penyakit-misteri'],
  },
};

// Produk SP Generator (/s/[slug]) → kumpulan social proof
export const SP_GENERATOR_GROUP = {
  'sabun-garam': 'sabun', 'kasturi-kijang': 'kasturi', 'garam-pengasihan': 'garam',
  'pengisian-esyifa': 'pengisian', 'ruqyah-harian': 'ruqyah-harian', rawatan: 'rawatan',
};

// Laluan → kumpulan (null = jangan papar notifikasi). Link marketer /m/<slug> dikira sama.
export function groupOfPath(pathname) {
  const path = (pathname || '').replace(/^\/m(?=\/)/, '');
  for (const [key, g] of Object.entries(SP_GROUPS)) {
    if (g.paths.some(p => path === p || path.startsWith(`${p}-`) || path.startsWith(`${p}/`))) return key;
  }
  return null;
}

// Masa sebenar order → "x minit / jam / hari lalu"
export function timeAgo(iso, now = Date.now()) {
  const min = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (min < 2) return 'baru sahaja';
  if (min < 60) return `${min} minit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'semalam' : `${d} hari lalu`;
}
