-- Migration 045: Bajet test autopilot (SOP v3, 20/11/2026).
-- Ad autopilot baru dilaunch dengan bajet test (cth RM25). Reset bajet ikut jam (cth "Reset RM60 23:30"):
--   - test yang hari ini dapat ≥1 order DAN ROAS ≥2.0 → lulus (budget_passed_at diisi) → reset ke bajet biasa (RM60);
--   - test yang belum lulus → reset ke bajet test.
-- Test = launch yang daily_budget ≤ autopilot_test_budget dan budget_passed_at NULL (launch lama RM60 tidak terjejas).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini.

ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS autopilot_test_budget NUMERIC;   -- NULL = ciri dimatikan (launch guna autopilot_adset_budget)

ALTER TABLE autopilot_launches
  ADD COLUMN IF NOT EXISTS budget_passed_at TIMESTAMPTZ;    -- NULL = belum lulus fasa bajet test

-- Akaun Phoenix (HQ) & Miya (ai-01): bajet test RM25
UPDATE meta_connections SET autopilot_test_budget = 25
WHERE marketer_id IN (
  SELECT id FROM profiles WHERE role = 'super_admin' AND id = '0cb291fb-b016-4e75-ba47-09e2ede3c3f7'
  UNION SELECT id FROM profiles WHERE marketer_code = 'ai-01'
);
