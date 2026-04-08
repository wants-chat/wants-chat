-- Drop billing/subscription/credit tables. The OSS build has no pricing.
-- These tables were created by 20251227010000_llm_billing_tables.sql but are no longer used.
-- llm_providers and llm_models are KEPT (model registry, not billing).

DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS llm_usage_logs CASCADE;
