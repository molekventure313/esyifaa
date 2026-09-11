-- ============================================================
-- Migration 010: Stock Management System
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Products catalog
CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  sku                  TEXT UNIQUE NOT NULL,
  unit                 TEXT NOT NULL DEFAULT 'unit',
  cost_price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price        DECIMAL(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold  INTEGER NOT NULL DEFAULT 10,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Stock movements (single source of truth for all stock changes)
CREATE TABLE IF NOT EXISTS stock_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type   TEXT NOT NULL
    CHECK (movement_type IN ('in', 'out', 'return', 'adjustment')),
  qty             INTEGER NOT NULL CHECK (qty > 0),
  cost_per_unit   DECIMAL(10,2),
  reference_type  TEXT CHECK (reference_type IN ('order','batch','return','manual','adjustment')),
  reference_id    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id ON stock_movements(reference_id);

-- 4. Add qty + return columns to submissions
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS qty          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS returned_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS returned_by  UUID REFERENCES auth.users(id);

-- 5. View: current stock summary per product
CREATE OR REPLACE VIEW stock_summary AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.unit,
  p.cost_price,
  p.selling_price,
  p.low_stock_threshold,
  p.is_active,
  p.created_at,
  p.updated_at,
  COALESCE(
    SUM(
      CASE
        WHEN m.movement_type IN ('in', 'return') THEN m.qty
        WHEN m.movement_type = 'out'             THEN -m.qty
        WHEN m.movement_type = 'adjustment'      THEN 0  -- handled per sign in notes
        ELSE 0
      END
    ), 0
  )::INTEGER AS current_stock,
  COALESCE(
    ROUND(
      SUM(CASE WHEN m.movement_type = 'in'
          THEN m.qty * COALESCE(m.cost_per_unit, p.cost_price, 0)
          ELSE 0 END)
      / NULLIF(SUM(CASE WHEN m.movement_type = 'in' THEN m.qty ELSE 0 END), 0)
    , 2)
  , p.cost_price) AS avg_cost_per_unit
FROM products p
LEFT JOIN stock_movements m ON m.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.unit, p.cost_price, p.selling_price,
         p.low_stock_threshold, p.is_active, p.created_at, p.updated_at;

-- 6. Seed: Sabun Garam Himalaya (kos seunit admin isi kemudian)
INSERT INTO products (name, sku, unit, cost_price, selling_price, low_stock_threshold)
VALUES ('Sabun Garam Himalaya ESyifaa 200g', 'SGH-200G', 'unit', 0.00, 39.00, 10)
ON CONFLICT (sku) DO NOTHING;

-- 7. Seed: Stok awal 40 unit
INSERT INTO stock_movements (product_id, movement_type, qty, reference_type, notes)
SELECT id, 'in', 40, 'manual', 'Stok awal sistem — 40 unit'
FROM products
WHERE sku = 'SGH-200G'
  AND NOT EXISTS (
    SELECT 1 FROM stock_movements
    WHERE product_id = products.id
      AND notes = 'Stok awal sistem — 40 unit'
  );
