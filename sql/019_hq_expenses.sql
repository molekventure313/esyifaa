-- Migration 019: Perbelanjaan HQ (komitmen tetap bulanan + belanja sekali) untuk tab Report HQ
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini
--
-- type 'fixed'   : komitmen bulanan (sewa, bil, langganan, gaji) — dikira setiap bulan dari start_month
--                  hingga end_month (NULL = tiada had) selagi is_active
-- type 'one_off' : belanja sekali — hanya untuk bulan `month`

CREATE TABLE IF NOT EXISTS hq_expenses (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT,                         -- 'sewa' | 'bil' | 'langganan' | 'gaji' | 'lain'
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  type         TEXT NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed', 'one_off')),
  month        TEXT,                         -- 'YYYY-MM' (one_off)
  start_month  TEXT,                         -- 'YYYY-MM' (fixed) — NULL = semua bulan
  end_month    TEXT,                         -- 'YYYY-MM' (fixed) — NULL = berterusan
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  notes        TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hq_expenses_type_month ON hq_expenses(type, month);

-- Hanya server (service role) baca/tulis
ALTER TABLE hq_expenses ENABLE ROW LEVEL SECURITY;

-- Komitmen tetap sedia ada
INSERT INTO hq_expenses (name, category, amount, type)
SELECT * FROM (VALUES
  ('Sewa Ofis',     'sewa',      1000.00, 'fixed'),
  ('Unifi',         'bil',        150.00, 'fixed'),
  ('Bil Elektrik',  'bil',        350.00, 'fixed'),
  ('AdsPower',      'langganan',  350.00, 'fixed'),
  ('ChatGPT',       'langganan',   85.00, 'fixed'),
  ('Claude',        'langganan',   85.00, 'fixed'),
  ('Gaji Bos',      'gaji',      7000.00, 'fixed')
) AS v(name, category, amount, type)
WHERE NOT EXISTS (SELECT 1 FROM hq_expenses);

-- Gaji asas marketer RM1,700 (yang belum diisi)
UPDATE profiles SET marketer_basic_salary = 1700
WHERE role = 'marketer' AND COALESCE(marketer_basic_salary, 0) = 0;
