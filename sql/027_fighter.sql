-- Migration 027: Fighter (Independent) — Fasa 1
-- Fighter = penjual bebas: order, CHIP, NinjaVan & API AI sendiri. Kongsi dengan HQ: STOK sahaja (kos + markup).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

-- 1. Role baru 'independent' (label: Fighter)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'marketer', 'practitioner', 'perawat', 'independent'));

-- 2. Tetapan setiap fighter. Key rahsia disulitkan (AES-256-GCM, kunci env INDIE_SECRET_KEY) — tidak pernah dihantar ke browser
CREATE TABLE IF NOT EXISTS fighter_settings (
  fighter_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- CHIP (FPX) milik fighter
  chip_brand_id     TEXT,
  chip_key_enc      TEXT,
  chip_key_last4    TEXT,
  chip_public_key   TEXT,                 -- untuk sahkan webhook (bukan rahsia)
  chip_status       TEXT CHECK (chip_status IN ('ok', 'error')),
  chip_message      TEXT,
  chip_checked_at   TIMESTAMPTZ,
  -- Claude API (SP Generator)
  ai_key_enc        TEXT,
  ai_key_last4      TEXT,
  ai_status         TEXT CHECK (ai_status IN ('ok', 'error')),
  ai_message        TEXT,
  ai_checked_at     TIMESTAMPTZ,
  -- Lain-lain
  meta_pixel_id     TEXT,
  whatsapp          TEXT,
  sender_name       TEXT,                 -- nama pengirim NinjaVan
  sender_phone      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Markup stok (RM seunit, ditambah atas products.cost_price)
--    scope = 'default' (semua fighter) atau UUID fighter (harga khas)
CREATE TABLE IF NOT EXISTS fighter_markups (
  scope       TEXT NOT NULL,
  sku         TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
  markup      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (markup >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (scope, sku)
);

INSERT INTO fighter_markups (scope, sku, markup)
SELECT 'default', sku, 1.00 FROM products WHERE is_active = true
ON CONFLICT (scope, sku) DO NOTHING;

ALTER TABLE fighter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_markups ENABLE ROW LEVEL SECURITY;
