-- LLM Billing & Credits System Tables
-- Migration for multi-provider LLM orchestration with billing

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
-- Subscription Plans
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly INTEGER DEFAULT 0,
    price_yearly INTEGER DEFAULT 0,
    included_credits INTEGER DEFAULT 0,
    max_requests_per_day INTEGER,
    max_tokens_per_request INTEGER,
    allowed_model_tiers TEXT[] DEFAULT ARRAY['free', 'standard'],
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- User Subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(200),
    stripe_customer_id VARCHAR(200),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- User Credits
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    balance INTEGER DEFAULT 0,
    included_balance INTEGER DEFAULT 0,
    purchased_balance INTEGER DEFAULT 0,
    lifetime_usage INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Credit Transactions
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LLM Usage Logs
-- ============================================
CREATE TABLE IF NOT EXISTS llm_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID,
    message_id UUID,
    provider_id VARCHAR(100) NOT NULL,
    model_id VARCHAR(200) NOT NULL,
    model_name VARCHAR(200),
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    input_cost INTEGER DEFAULT 0,
    output_cost INTEGER DEFAULT 0,
    total_cost INTEGER DEFAULT 0,
    latency_ms INTEGER,
    request_type VARCHAR(50) DEFAULT 'chat',
    is_streaming BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Credit Packages (for top-up purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credit_amount INTEGER NOT NULL,
    price INTEGER NOT NULL,
    bonus_amount INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_llm_models_provider ON llm_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_llm_models_tier ON llm_models(tier);
CREATE INDEX IF NOT EXISTS idx_llm_models_category ON llm_models(category);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_user ON llm_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_conversation ON llm_usage_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_model ON llm_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_created ON llm_usage_logs(created_at);

-- ============================================
-- Insert Default Subscription Plans
-- ============================================
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, included_credits, max_requests_per_day, max_tokens_per_request, allowed_model_tiers, features, display_order)
VALUES
    ('Free', 'free', 'Get started with basic AI features', 0, 0, 1000000, 50, 4096, ARRAY['free', 'standard'], '["Access to standard models", "50 messages per day", "Basic features"]'::jsonb, 1),
    ('Pro', 'pro', 'For power users and professionals', 2000, 19200, 20000000, 500, 16384, ARRAY['free', 'standard', 'premium'], '["Access to premium models", "500 messages per day", "Priority support", "API access"]'::jsonb, 2),
    ('Business', 'business', 'For teams and businesses', 5000, 48000, 60000000, NULL, 32768, ARRAY['free', 'standard', 'premium', 'enterprise'], '["Access to all models", "Unlimited messages", "Team collaboration", "Dedicated support"]'::jsonb, 3),
    ('Enterprise', 'enterprise', 'Custom solutions for large organizations', 0, 0, 0, NULL, NULL, ARRAY['free', 'standard', 'premium', 'enterprise'], '["Everything in Business", "Custom model fine-tuning", "SLA guarantee", "Dedicated account manager"]'::jsonb, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Insert Default Credit Packages
-- ============================================
INSERT INTO credit_packages (name, description, credit_amount, price, bonus_amount, is_popular, display_order)
VALUES
    ('$5 Credits', 'Good for light usage', 5000000, 500, 0, false, 1),
    ('$10 Credits', 'Best value for regular users', 10000000, 1000, 500000, true, 2),
    ('$25 Credits', 'For power users', 25000000, 2500, 2000000, false, 3),
    ('$50 Credits', 'Best value package', 50000000, 5000, 5000000, false, 4),
    ('$100 Credits', 'For heavy users', 100000000, 10000, 15000000, false, 5)
ON CONFLICT DO NOTHING;
