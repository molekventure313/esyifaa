-- 037: Fighter guna akaun NinjaVan HQ (kurier dikongsi, order kekal dalam fighter_orders)
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

-- 1. Parcel NinjaVan milik order fighter (submission_id kosong untuk parcel fighter)
ALTER TABLE ninjavan_shipments
  ADD COLUMN IF NOT EXISTS fighter_order_id UUID REFERENCES fighter_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fighter_id       UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_nv_shipments_fighter_order ON ninjavan_shipments(fighter_order_id);
CREATE INDEX IF NOT EXISTS idx_nv_shipments_fighter ON ninjavan_shipments(fighter_id, created_at DESC);

-- 2. Kurier fighter: 'hq' = akaun NinjaVan HQ (default) · 'own' = akaun NinjaVan sendiri (CSV + upload waybill)
ALTER TABLE fighter_settings ADD COLUMN IF NOT EXISTS courier TEXT NOT NULL DEFAULT 'hq';
ALTER TABLE fighter_settings DROP CONSTRAINT IF EXISTS fighter_settings_courier_check;
ALTER TABLE fighter_settings ADD CONSTRAINT fighter_settings_courier_check CHECK (courier IN ('hq', 'own'));

-- 3. Lejar: 'postage' (+ caj pos bila HQ pack) · 'cod' (− COD pelanggan diterima HQ dari NinjaVan)
ALTER TABLE fighter_ledger DROP CONSTRAINT IF EXISTS fighter_ledger_kind_check;
ALTER TABLE fighter_ledger ADD CONSTRAINT fighter_ledger_kind_check
  CHECK (kind IN ('charge', 'credit', 'adjust', 'postage', 'cod'));
-- satu caj pos & satu kredit COD bagi setiap parcel
ALTER TABLE fighter_ledger ADD COLUMN IF NOT EXISTS shipment_id UUID REFERENCES ninjavan_shipments(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_fighter_ledger_shipment_kind ON fighter_ledger(shipment_id, kind) WHERE shipment_id IS NOT NULL;
