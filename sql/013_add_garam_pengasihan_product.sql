-- Migration 013: Add Garam Pengasihan Masakan product
-- Run in Supabase SQL Editor

INSERT INTO products (name, sku, unit, is_active, low_stock_threshold, cost_price)
VALUES (
  'Garam Pengasihan Masakan ESyifaa (500g)',
  'GPM-500G',
  'bekas',
  true,
  5,
  0  -- Admin boleh isi kos seunit kemudian di /dashboard/admin/stok
)
ON CONFLICT (sku) DO NOTHING;
