-- Research Sessions Table
-- Stores all research sessions and their results

CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    query TEXT NOT NULL,
    options JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_step TEXT,
    plan JSONB,
    sources JSONB DEFAULT '[]',
    findings JSONB DEFAULT '[]',
    synthesis TEXT,
    fact_check_results JSONB DEFAULT '[]',
    outputs JSONB DEFAULT '[]',
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);
CREATE INDEX IF NOT EXISTS idx_research_sessions_started_at ON research_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_status ON research_sessions(user_id, status);

-- GIN index for JSONB search on findings
CREATE INDEX IF NOT EXISTS idx_research_sessions_findings ON research_sessions USING GIN (findings);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_research_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_research_sessions_updated_at ON research_sessions;
CREATE TRIGGER trigger_research_sessions_updated_at
    BEFORE UPDATE ON research_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_research_sessions_updated_at();

-- Add status check constraint
ALTER TABLE research_sessions DROP CONSTRAINT IF EXISTS check_research_status;
ALTER TABLE research_sessions ADD CONSTRAINT check_research_status
    CHECK (status IN ('pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'));

-- Add progress check constraint
ALTER TABLE research_sessions DROP CONSTRAINT IF EXISTS check_progress_range;
ALTER TABLE research_sessions ADD CONSTRAINT check_progress_range
    CHECK (progress >= 0 AND progress <= 100);

-- Comment on table
COMMENT ON TABLE research_sessions IS 'Stores deep research sessions and their results';
COMMENT ON COLUMN research_sessions.query IS 'The original research query';
COMMENT ON COLUMN research_sessions.options IS 'Research options (depth, domain, max sources, etc.)';
COMMENT ON COLUMN research_sessions.status IS 'Current status of the research';
COMMENT ON COLUMN research_sessions.plan IS 'Research plan with sub-queries and strategy';
COMMENT ON COLUMN research_sessions.sources IS 'Array of extracted sources';
COMMENT ON COLUMN research_sessions.findings IS 'Array of findings extracted from sources';
COMMENT ON COLUMN research_sessions.synthesis IS 'Final synthesized research report (markdown)';
COMMENT ON COLUMN research_sessions.fact_check_results IS 'Results of fact-checking process';
COMMENT ON COLUMN research_sessions.outputs IS 'Generated output files (markdown, PDF, etc.)';
