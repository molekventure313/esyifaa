-- ============================================================
-- Migration 011: Retroactive Stock Tally untuk Sabun Garam
-- Run sekali dalam Supabase SQL Editor
-- Idempotent — selamat dijalankan berulang kali
-- ============================================================

-- Step 1: Padam semua 'out' movements sedia ada (elak double-count)
DELETE FROM stock_movements WHERE movement_type = 'out';

-- Step 2: Insert 'out' movement untuk setiap order sabun completed
-- Syarat:
--   COD: payment_type='cod' + payment_status='completed'
--   FPX: payment_type='fpx_payment' + payment_status='completed' + source ILIKE '%sabun%'
-- Guna created_at dari submission (tarikh order asal, bukan tarikh sync)

INSERT INTO stock_movements (
  product_id,
  movement_type,
  qty,
  reference_type,
  reference_id,
  notes,
  created_at
)
SELECT
  p.id,
  'out',
  COALESCE(s.qty, 1),
  'order',
  s.id::TEXT,
  'Retroactive sync: ' || COALESCE(s.source, 'unknown') || ' | ' || s.payment_type,
  s.created_at
FROM submissions s
CROSS JOIN products p
WHERE
  p.sku = 'SGH-200G'
  AND p.is_active = TRUE
  AND s.payment_status = 'completed'
  AND (
    s.payment_type = 'cod'
    OR (
      s.payment_type = 'fpx_payment'
      AND s.source ILIKE '%sabun%'
    )
  )
  -- Idempotency guard — skip kalau dah ada
  AND NOT EXISTS (
    SELECT 1
    FROM stock_movements sm
    WHERE sm.reference_id = s.id::TEXT
      AND sm.movement_type = 'out'
  );

-- Step 3: Verify — semak stok semasa selepas sync
SELECT
  p.name,
  p.sku,
  ss.current_stock,
  ss.avg_cost_per_unit,
  ROUND(ss.current_stock * ss.avg_cost_per_unit, 2) AS nilai_stok
FROM stock_summary ss
JOIN products p ON p.id = ss.id;

-- Juga tunjuk berapa order yang di-sync
SELECT COUNT(*) AS total_order_synced
FROM stock_movements
WHERE movement_type = 'out'
  AND notes ILIKE 'Retroactive sync:%';
