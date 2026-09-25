-- Migration 014: Kos ads ikut produk
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna column `product`
--
-- Produk: 'sabun-garam' | 'garam-pengasihan' | 'kasturi-kijang'
-- Semua rekod sedia ada (HQ + marketer) → 'sabun-garam' (produk lain belum run).

ALTER TABLE ads_spend ADD COLUMN IF NOT EXISTS product TEXT;

UPDATE ads_spend SET product = 'sabun-garam' WHERE product IS NULL;

ALTER TABLE ads_spend ALTER COLUMN product SET DEFAULT 'sabun-garam';
ALTER TABLE ads_spend ALTER COLUMN product SET NOT NULL;

-- Satu rekod per marketer + tarikh + produk (dulu: marketer + tarikh sahaja)
DO $$
BEGIN
    ALTER TABLE ads_spend DROP CONSTRAINT IF EXISTS ads_spend_marketer_id_spend_date_key;
    ALTER TABLE ads_spend DROP CONSTRAINT IF EXISTS ads_spend_marketer_date_product_key;
    ALTER TABLE ads_spend ADD CONSTRAINT ads_spend_marketer_date_product_key UNIQUE (marketer_id, spend_date, product);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_ads_spend_product ON ads_spend(product);
