-- Migration 008: NinjaVan export tracking + amount_paid column (if not already added)
-- Run in Supabase SQL Editor

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS ninjavan_exported_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ninjavan_exported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for export status filtering
CREATE INDEX IF NOT EXISTS idx_submissions_ninjavan_exported
  ON submissions(ninjavan_exported_at)
  WHERE ninjavan_exported_at IS NOT NULL;

COMMENT ON COLUMN submissions.ninjavan_exported_at IS 'Timestamp bila order diexport ke NinjaVan CSV';
COMMENT ON COLUMN submissions.ninjavan_exported_by IS 'Admin yang buat export';
