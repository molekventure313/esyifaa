-- Migration 035: Sambungan Meta tanpa token (marketer guna MCP Meta Ads rasmi dalam Claude sendiri).
-- source 'token' = E-Syifa sync sendiri guna token (HQ) · 'mcp' = Claude marketer hantar data melalui alat MCP sync_meta_data.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE meta_connections ALTER COLUMN token_encrypted DROP NOT NULL;
ALTER TABLE meta_connections ALTER COLUMN token_last4 DROP NOT NULL;
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'token';
ALTER TABLE meta_connections DROP CONSTRAINT IF EXISTS meta_connections_source_check;
ALTER TABLE meta_connections ADD CONSTRAINT meta_connections_source_check CHECK (source IN ('token', 'mcp'));
