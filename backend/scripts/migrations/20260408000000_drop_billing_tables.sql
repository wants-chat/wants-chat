-- Drop billing/subscription/credit tables.
--
-- The OSS build has no pricing — all credit, quota, and usage tracking
-- has been removed (see commit 6a16cf8 for the initial removal and a
-- later cleanup that stubbed out CreditsService / MediaCreditsService
-- as no-ops).
--
-- This migration cleans up databases that were created by the old
-- billing migrations. Fresh installs never create these tables in the
-- first place — the migrations that did create them have been deleted
-- from this directory:
--
--   * 20251227010000_llm_billing_tables.sql       (replaced with
--     20251227010000_llm_models_registry.sql which only creates the
--     legitimate llm_providers / llm_models registry)
--   * 20251227020000_fix_user_credits_columns.sql (orphan)
--   * 20260102010000_add_user_subscriptions_unique.sql (orphan)
--   * 20260108000000_media_usage_logs.sql (created media_usage_logs
--     and media_pricing — both billing-related, both removed)
--
-- The IF EXISTS clauses make this migration a no-op on fresh databases
-- and a cleanup pass on existing ones. llm_providers and llm_models are
-- KEPT (model registry, not billing).

DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS llm_usage_logs CASCADE;
DROP TABLE IF EXISTS media_usage_logs CASCADE;
DROP TABLE IF EXISTS media_pricing CASCADE;
