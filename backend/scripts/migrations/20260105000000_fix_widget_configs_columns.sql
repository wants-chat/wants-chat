-- ============================================
-- Migration: Fix Widget Configs Columns
-- Created: 2026-01-05
-- Description: Adds missing columns to widget_configs table
-- ============================================

-- Add widget_name column (rename from name for clarity)
ALTER TABLE widget_configs ADD COLUMN IF NOT EXISTS widget_name VARCHAR(100);

-- Update widget_name from name if it exists
UPDATE widget_configs SET widget_name = name WHERE widget_name IS NULL AND name IS NOT NULL;

-- Set default for widget_name
ALTER TABLE widget_configs ALTER COLUMN widget_name SET DEFAULT 'Default Widget';

-- Add missing columns
ALTER TABLE widget_configs ADD COLUMN IF NOT EXISTS embed_token VARCHAR(100) UNIQUE;
ALTER TABLE widget_configs ADD COLUMN IF NOT EXISTS show_header BOOLEAN DEFAULT true;
ALTER TABLE widget_configs ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true;

-- Generate embed_token for existing rows that don't have one
UPDATE widget_configs
SET embed_token = 'wgt_' || encode(gen_random_bytes(24), 'base64')
WHERE embed_token IS NULL;

-- Make embed_token NOT NULL after populating
ALTER TABLE widget_configs ALTER COLUMN embed_token SET NOT NULL;

-- Add index for embed_token lookups
CREATE INDEX IF NOT EXISTS idx_widget_configs_embed_token ON widget_configs(embed_token);

-- Fix widget_embed_events table - add referrer_url column
ALTER TABLE widget_embed_events ADD COLUMN IF NOT EXISTS referrer_url TEXT;

-- ============================================
-- Migration complete
-- ============================================
