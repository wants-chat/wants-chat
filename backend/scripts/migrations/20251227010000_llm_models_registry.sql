-- LLM Provider & Model Registry
--
-- These tables store the catalog of LLM providers (OpenAI, Anthropic,
-- OpenRouter, etc.) and the models each provider exposes. They are NOT
-- billing tables — they're a model registry the chat uses to know what
-- models exist, their context windows, and their feature flags.
--
-- The original 20251227010000_llm_billing_tables.sql migration also
-- created subscription_plans, user_subscriptions, user_credits,
-- credit_transactions, credit_packages, and llm_usage_logs. Those were
-- removed when the OSS build dropped paid plans. See
-- 20260408000000_drop_billing_tables.sql for the cleanup migration that
-- removes them on existing databases.

-- ============================================
-- LLM Providers
-- ============================================
CREATE TABLE IF NOT EXISTS llm_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    api_key_env VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    rate_limit_rpm INTEGER,
    rate_limit_tpm INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LLM Models
-- ============================================
CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_id VARCHAR(200) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    context_window INTEGER DEFAULT 128000,
    max_output_tokens INTEGER DEFAULT 4096,
    cost_per_1m_input INTEGER NOT NULL DEFAULT 0,
    cost_per_1m_output INTEGER NOT NULL DEFAULT 0,
    supports_vision BOOLEAN DEFAULT false,
    supports_function_calling BOOLEAN DEFAULT false,
    supports_streaming BOOLEAN DEFAULT true,
    supports_json_mode BOOLEAN DEFAULT false,
    category VARCHAR(50) DEFAULT 'chat',
    tier VARCHAR(50) DEFAULT 'standard',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, model_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_llm_models_provider ON llm_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_llm_models_tier ON llm_models(tier);
CREATE INDEX IF NOT EXISTS idx_llm_models_category ON llm_models(category);
