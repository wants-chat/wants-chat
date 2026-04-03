-- ============================================
-- Migration: API Keys, Custom Fields & Widget Embed System
-- Created: 2026-01-04
-- Description: Adds support for:
--   1. API keys for external integrations
--   2. Custom fields for tool data customization
--   3. Widget embed configuration for external sites
-- ============================================

-- ============================================
-- PHASE 1: API Keys System
-- ============================================

-- API Keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Default API Key',
    key_prefix VARCHAR(20) NOT NULL,  -- First 8 chars for identification (e.g., "sk_live_")
    key_hash VARCHAR(255) NOT NULL,   -- Hashed key for security
    key_hint VARCHAR(20) NOT NULL,    -- Last 4 chars for display (e.g., "...x7Yz")
    scopes JSONB DEFAULT '["read", "write"]',  -- Permissions: read, write, delete, admin
    rate_limit INTEGER DEFAULT 1000,  -- Requests per hour
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,  -- NULL means never expires
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- API key usage logs for analytics
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_body_size INTEGER,
    response_body_size INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for usage logs (partition by date in production)
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_id ON api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created ON api_key_usage_logs(created_at DESC);

-- ============================================
-- PHASE 2: Custom Fields System
-- ============================================

-- Custom field definitions per tool per user
CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,  -- Machine-readable key (e.g., "custom_priority")
    field_type VARCHAR(50) NOT NULL,  -- text, number, date, datetime, select, multiselect, checkbox, textarea, currency, email, phone, url
    field_options JSONB DEFAULT '{}', -- For select/multiselect: { options: [{value, label}] }, for number: { min, max, step }, etc.
    default_value JSONB,              -- Default value for the field
    is_required BOOLEAN DEFAULT false,
    is_searchable BOOLEAN DEFAULT true,
    is_sortable BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    placeholder VARCHAR(255),
    help_text TEXT,
    validation_rules JSONB DEFAULT '{}',  -- { pattern: "regex", minLength: 1, maxLength: 100, etc. }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique field key per tool per user
    UNIQUE(user_id, tool_id, field_key)
);

-- Indexes for custom fields
CREATE INDEX IF NOT EXISTS idx_custom_fields_user_tool ON custom_field_definitions(user_id, tool_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_active ON custom_field_definitions(is_active) WHERE is_active = true;

-- ============================================
-- PHASE 3: Widget Embed System
-- ============================================

-- Widget configurations for embeddable tools
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Default Widget',

    -- Appearance settings
    theme VARCHAR(20) DEFAULT 'auto',  -- light, dark, auto
    primary_color VARCHAR(20) DEFAULT '#0D9488',
    secondary_color VARCHAR(20),
    border_radius INTEGER DEFAULT 12,
    font_family VARCHAR(100),

    -- Size settings
    width VARCHAR(50) DEFAULT '100%',
    height VARCHAR(50) DEFAULT '600px',
    max_width VARCHAR(50) DEFAULT '800px',

    -- Behavior settings
    allow_export BOOLEAN DEFAULT true,
    allow_import BOOLEAN DEFAULT false,
    allow_print BOOLEAN DEFAULT true,
    show_branding BOOLEAN DEFAULT true,
    read_only BOOLEAN DEFAULT false,

    -- Access control
    allowed_domains JSONB DEFAULT '[]',  -- Empty = allow all, or ["example.com", "*.example.com"]
    require_auth BOOLEAN DEFAULT false,  -- Require user auth to use widget

    -- Custom CSS/JS
    custom_css TEXT,
    custom_js TEXT,

    -- Stats
    embed_count INTEGER DEFAULT 0,
    last_embedded_at TIMESTAMP WITH TIME ZONE,

    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, tool_id)
);

-- Indexes for widget configs
CREATE INDEX IF NOT EXISTS idx_widget_configs_user ON widget_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_tool ON widget_configs(tool_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_active ON widget_configs(is_active) WHERE is_active = true;

-- Widget embed analytics
CREATE TABLE IF NOT EXISTS widget_embed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_config_id UUID NOT NULL REFERENCES widget_configs(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- load, interaction, export, error
    event_data JSONB DEFAULT '{}',
    referrer_domain VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for widget events
CREATE INDEX IF NOT EXISTS idx_widget_events_config ON widget_embed_events(widget_config_id);
CREATE INDEX IF NOT EXISTS idx_widget_events_created ON widget_embed_events(created_at DESC);

-- ============================================
-- Add updated_at triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_fields_updated_at ON custom_field_definitions;
CREATE TRIGGER update_custom_fields_updated_at
    BEFORE UPDATE ON custom_field_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_widget_configs_updated_at ON widget_configs;
CREATE TRIGGER update_widget_configs_updated_at
    BEFORE UPDATE ON widget_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration complete
-- ============================================
