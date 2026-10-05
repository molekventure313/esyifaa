-- Migration 020: Teamsale bawah marketer
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna column ini
--
-- Teamsale = akaun marketer (role 'marketer') yang ada ketua (team_leader_id).
--   · Tiada gaji asas (marketer_basic_salary = 0)
--   · Komisen 30% dari profit selepas ads; ketua dapat override 10%
--   · Kos ads teamsale diisi oleh ketua (ads_spend.marketer_id = teamsale)
-- Ketua dipadam → teamsale jadi marketer biasa (team_leader_id NULL)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS team_leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_team_leader_id ON profiles(team_leader_id);
