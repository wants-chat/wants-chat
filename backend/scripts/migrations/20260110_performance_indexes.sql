-- Performance Indexes Migration
-- Adds composite indexes for frequently queried columns to improve query performance.
--
-- The original version of this migration also created indexes on the
-- billing tables (user_credits, user_subscriptions, llm_usage_logs,
-- credit_transactions). Those tables are no longer part of the OSS build
-- (see 20260408000000_drop_billing_tables.sql), so the corresponding
-- indexes have been removed.

-- ============================================
-- Research Sessions Table Indexes (if exists)
-- ============================================
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
