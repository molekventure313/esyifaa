-- Migration 012: Add Kasturi Kijang product
-- Run in Supabase SQL Editor

INSERT INTO products (name, sku, unit, is_active, low_stock_threshold, cost_price)
VALUES (
  'Kasturi Kijang E-Syifa''',
  'KKE-01',
  'botol',
  true,
  3,
  0  -- Admin boleh isi kos seunit kemudian di /dashboard/admin/stok
)
ON CONFLICT (sku) DO NOTHING;
