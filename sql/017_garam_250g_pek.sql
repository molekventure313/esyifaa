-- Migration 017: Saiz sebenar Garam Pengasihan = 250g sepek
-- Run in Supabase SQL Editor
--
-- Stok & COGS Garam dikira IKUT PEK (1 pek 250g = 1 unit):
--   pakej 6 pek → tolak 6, add-on Garam Masakan → tolak 1.
-- Bila tambah stok di /dashboard/admin/stok: isi bilangan PEK & kos SEPEK.
-- SKU 'GPM-500G' dikekalkan (dirujuk dalam kod) — nama & unit sahaja dibetulkan.

UPDATE products
SET name = 'Garam Pengasihan Masakan ESyifaa (250g)',
    unit = 'pek'
WHERE sku = 'GPM-500G';
