// Slug sales page yang boleh diakses melalui link marketer /m/<slug>
const MARKETER_SLUGS = [
  'sihir', 'saka', 'belum-zuriat', 'gangguan-berulang', 'kedai-tutup',
  'penyakit-misteri', 'fsp', 'e-video', 'pengisian-esyifa', 'rawat-sendiri',
  'tasbih-esyifa', 'sabun-garam', 'sabun-garam-1', 'sabun-garam-2',
  'sabun-garam-3', 'sabun-garam-4', 'sabun-garam-5', 'garam-pengasihan',
  'kasturi-kijang',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Link marketer /m/<slug>?m=CODE → hidang page statik asal (/<slug>).
  // URL di browser kekal /m/... (pixel & checkout detect marketer via pathname/?m=).
  // Sebelum ni route /m/[slug] import semua 19 page → +140KB JS setiap klik.
  async rewrites() {
    return [
      {
        source: `/m/:slug(${MARKETER_SLUGS.join('|')})`,
        destination: '/:slug',
      },
    ];
  },
  async redirects() {
    return [
      {
        // Page Kos Ads digabung ke page Gaji (isi ads terus dalam Pecahan Harian)
        source: '/dashboard/marketer/ads',
        destination: '/dashboard/marketer/gaji',
        permanent: false,
      },
      {
        source: '/tasbih-esyifa',
        destination: '/pengisian-esyifa',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

