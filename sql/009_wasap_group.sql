-- Migration 009: Tambah column 'group' pada wasap_numbers
-- Run in Supabase SQL Editor

ALTER TABLE wasap_numbers
  ADD COLUMN IF NOT EXISTS "group" TEXT NOT NULL DEFAULT 'all'
    CHECK ("group" IN ('sabun', 'pengisian', 'all'));

-- Nombor sedia ada kekal 'all' (default) — backwards compatible

COMMENT ON COLUMN wasap_numbers."group" IS 'Kumpulan SP: sabun | pengisian | all (muncul dalam semua SP)';
