-- Migration 028: Fighter — Fasa 2–4: order, packing HQ, lejar stok & bil
-- Order fighter TERASING dari submissions (order HQ). Satu-satunya sambungan dengan HQ: stok (kos + markup).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

-- 1. Order pelanggan fighter (dari SP /f/<slug>?f=<kod> & SP Generator fighter)
--    problem / notes guna format teks SAMA dengan submissions → parser kuantiti, add-on & CSV NinjaVan dikongsi
CREATE TABLE IF NOT EXISTS fighter_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source            TEXT NOT NULL,                       -- sabun-garam / garam-pengasihan / kasturi-kijang (SP asal)
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  address           TEXT,
  problem           TEXT,                                -- ringkasan pakej, add-on, hadiah (format sama dgn HQ)
  notes             TEXT,
  qty               INTEGER,
  items             JSONB NOT NULL DEFAULT '[]',         -- [{ sku, qty, label }] — unit stok yang akan diambil dari HQ
  amount            NUMERIC(10,2) NOT NULL DEFAULT 0,    -- jumlah dibayar pelanggan (masuk akaun fighter)
  payment_type      TEXT NOT NULL CHECK (payment_type IN ('cod', 'fpx_payment')),
  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  chip_bill_id      TEXT,
  paid_at           TIMESTAMPTZ,
  -- Aliran penghantaran: new → ready (waybill dimuat naik) → packed (HQ pack, stok ditolak & dicaj) → returned
  ship_status       TEXT NOT NULL DEFAULT 'new' CHECK (ship_status IN ('new', 'ready', 'packed', 'returned', 'cancelled')),
  waybill_path      TEXT,                                -- PDF waybill NinjaVan fighter (storage fighter-files)
  tracking_no       TEXT,
  exported_at       TIMESTAMPTZ,
  waybill_at        TIMESTAMPTZ,
  packed_at         TIMESTAMPTZ,
  packed_by         UUID REFERENCES profiles(id),
  returned_at       TIMESTAMPTZ,
  returned_by       UUID REFERENCES profiles(id),
  landing_page_url  TEXT,
  utm_source        TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
  fbclid            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fighter_orders_fighter ON fighter_orders(fighter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fighter_orders_ship ON fighter_orders(ship_status);
CREATE INDEX IF NOT EXISTS idx_fighter_orders_bill ON fighter_orders(chip_bill_id);

-- 2. Bil stok (HQ jana berkala — mingguan / bulanan)
CREATE TABLE IF NOT EXISTS fighter_bills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_no       TEXT NOT NULL UNIQUE,
  period_from   TIMESTAMPTZ,
  period_to     TIMESTAMPTZ NOT NULL,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  markup_total  NUMERIC(12,2) NOT NULL DEFAULT 0,       -- override HQ dalam bil ini
  status        TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  receipt_path  TEXT,                                   -- resit bayaran dimuat naik fighter
  paid_at       TIMESTAMPTZ,
  paid_ref      TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fighter_bills_fighter ON fighter_bills(fighter_id, created_at DESC);

-- 3. Lejar caj stok: charge (+) bila HQ pack, credit (−) bila return
CREATE TABLE IF NOT EXISTS fighter_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES fighter_orders(id) ON DELETE SET NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('charge', 'credit', 'adjust')),
  sku         TEXT,
  qty         INTEGER NOT NULL DEFAULT 0,
  cost_price  NUMERIC(10,2) NOT NULL DEFAULT 0,          -- kos HQ seunit (masa caj)
  markup      NUMERIC(10,2) NOT NULL DEFAULT 0,          -- markup seunit (masa caj) = override HQ
  amount      NUMERIC(12,2) NOT NULL,                    -- + caj / − kredit
  bill_id     UUID REFERENCES fighter_bills(id) ON DELETE SET NULL,
  notes       TEXT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fighter_ledger_fighter ON fighter_ledger(fighter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fighter_ledger_unbilled ON fighter_ledger(fighter_id) WHERE bill_id IS NULL;

-- 4. Tetapan tambahan fighter
ALTER TABLE fighter_settings ADD COLUMN IF NOT EXISTS ninjavan_shipper_no TEXT;   -- Shipper Order No akaun NinjaVan fighter

-- 5. Storan persendirian: waybill PDF & resit bil
INSERT INTO storage.buckets (id, name, public)
VALUES ('fighter-files', 'fighter-files', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE fighter_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_ledger ENABLE ROW LEVEL SECURITY;
