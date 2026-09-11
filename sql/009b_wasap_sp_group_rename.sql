-- Migration 009b: Rename 'group' column to 'sp_group' (avoid SQL reserved word conflict)
-- Run in Supabase SQL Editor
-- 'group' is a reserved word in PostgreSQL — causes silent filter failures in PostgREST

DO $$
BEGIN
  -- If old 'group' column exists, rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wasap_numbers' AND column_name = 'group'
  ) THEN
    ALTER TABLE wasap_numbers RENAME COLUMN "group" TO sp_group;
    RAISE NOTICE 'Renamed "group" to "sp_group"';

  -- If neither column exists yet (migration 009 was never run), add sp_group fresh
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wasap_numbers' AND column_name = 'sp_group'
  ) THEN
    ALTER TABLE wasap_numbers
      ADD COLUMN sp_group TEXT NOT NULL DEFAULT 'all'
        CHECK (sp_group IN ('sabun', 'pengisian', 'all'));
    RAISE NOTICE 'Added "sp_group" column fresh';
  ELSE
    RAISE NOTICE '"sp_group" already exists — skipping';
  END IF;
END $$;

-- Update CHECK constraint name if needed (PostgreSQL renames automatically on column rename)
-- Ensure constraint still valid
ALTER TABLE wasap_numbers DROP CONSTRAINT IF EXISTS wasap_numbers_group_check;
ALTER TABLE wasap_numbers DROP CONSTRAINT IF EXISTS wasap_numbers_sp_group_check;
ALTER TABLE wasap_numbers
  ADD CONSTRAINT wasap_numbers_sp_group_check
  CHECK (sp_group IN ('sabun', 'pengisian', 'all'));

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'wasap_numbers' AND column_name = 'sp_group';
