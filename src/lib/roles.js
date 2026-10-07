// Peranan — selamat untuk client & server (tiada import server).
//  · super_admin = pemilik: akses penuh
//  · admin       = staff order: Pengurusan Order, Order WhatsApp, Stok, Pengisian Stok

export const OWNER = ['super_admin'];
export const STAFF = ['admin', 'super_admin'];

// Laluan dashboard yang dibenarkan untuk role 'admin' (staff)
export const STAFF_PATHS = [
  '/dashboard/admin/pesakit-berbayar',
  '/dashboard/admin/order-wasap',
  '/dashboard/admin/stok',
  '/dashboard/admin/pengisian-stok',
];
export const STAFF_HOME = '/dashboard/admin/pesakit-berbayar';

export const staffCanAccess = path => STAFF_PATHS.some(p => path === p || path.startsWith(`${p}/`));
