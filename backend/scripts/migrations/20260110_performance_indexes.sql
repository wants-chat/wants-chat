-- Performance Indexes Migration
-- Adds composite indexes for frequently queried columns to improve query performance

-- ============================================
-- User Credits Table Indexes
-- ============================================
-- The user_credits table is queried frequently with FOR UPDATE lock
-- Ensure user_id lookup is fast
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- ============================================
-- User Subscriptions Table Indexes
-- ============================================
-- Composite index for user's active subscription lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_status
    ON user_subscriptions(user_id, status);

-- Index for Stripe subscription lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_stripe_customer
    ON user_subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================
-- LLM Usage Logs Table Indexes
-- ============================================
-- Composite index for user's daily usage aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_llm_usage_user_date_status
    ON llm_usage_logs(user_id, created_at, status);

-- Index for conversation history lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_llm_usage_conversation_created
    ON llm_usage_logs(conversation_id, created_at) WHERE conversation_id IS NOT NULL;

-- Partial index for successful requests (most common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_llm_usage_success
    ON llm_usage_logs(user_id, created_at) WHERE status = 'success';

-- ============================================
-- Credit Transactions Table Indexes
-- ============================================
-- Composite index for user's transaction history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_user_created
    ON credit_transactions(user_id, created_at DESC);

-- ============================================
-- Research Sessions Table Indexes (if exists)
-- ============================================
-- These are created only if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_sessions') THEN
        -- Composite index for user's research history
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_sessions_user_created
            ON research_sessions(user_id, created_at DESC)';

        -- Partial index for active research sessions
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_sessions_active
            ON research_sessions(user_id, status)
            WHERE status IN (''pending'', ''planning'', ''searching'', ''extracting'', ''analyzing'', ''synthesizing'')';
    END IF;
END
$$;

-- ============================================
-- Autonomous Tasks Table Indexes (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'autonomous_tasks') THEN
        -- Composite index for user's task history
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_autonomous_tasks_user_created
            ON autonomous_tasks(user_id, created_at DESC)';

        -- Partial index for running tasks
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_autonomous_tasks_running
            ON autonomous_tasks(user_id, status)
            WHERE status IN (''pending'', ''running'', ''paused'')';
    END IF;
END
$$;

-- ============================================
-- Media Usage Logs Table Indexes (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media_usage_logs') THEN
        -- Composite index for user's media usage aggregation
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_usage_user_date_status
            ON media_usage_logs(user_id, created_at, status)';

        -- Partial index for successful operations
        EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_usage_success
            ON media_usage_logs(user_id, created_at) WHERE status = ''success''';
    END IF;
END
$$;

-- ============================================
-- Table Statistics Update
-- ============================================
-- Update statistics for better query planning
ANALYZE user_credits;
ANALYZE user_subscriptions;
ANALYZE llm_usage_logs;
ANALYZE credit_transactions;
