-- Migration 031: API key MCP E-Syifa (Ads Hub).
-- Claude Code/Desktop marketer connect ke /api/mcp dengan key ini untuk BACA data ads & order sendiri (tiada data pelanggan).
-- Key disimpan sebagai hash SHA-256 sahaja; teks penuh hanya ditunjuk sekali semasa dijana.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS mcp_api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,   -- skop data (akaun Ads Hub)
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name          TEXT NOT NULL DEFAULT 'Claude',
  key_hash      TEXT NOT NULL UNIQUE,
  key_last4     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS mcp_api_keys_marketer_idx ON mcp_api_keys (marketer_id);
ALTER TABLE mcp_api_keys ENABLE ROW LEVEL SECURITY;   -- server sahaja (service role)
