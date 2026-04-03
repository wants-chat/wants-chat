-- ============================================
-- Migration: Research & Autonomous Task Execution System
-- Created: 2026-01-10
-- Description: Adds support for:
--   1. Deep research sessions with multi-source synthesis
--   2. Autonomous task execution with DAG-based planning
--   3. Browser automation sessions tracking
--   4. LangGraph checkpoint persistence
-- ============================================

-- ============================================
-- PHASE 1: Research System Tables
-- ============================================

-- Research sessions - Main table for research queries
CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

    -- Query info
    query TEXT NOT NULL,
    domain VARCHAR(50),  -- technology, finance, medical, legal, academic, general
    depth VARCHAR(20) NOT NULL DEFAULT 'standard',  -- quick, standard, deep, exhaustive

    -- Configuration
    config JSONB DEFAULT '{}',  -- { maxSources, dateRange, languages, outputFormats, excludeDomains, etc. }

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, planning, searching, extracting, analyzing, synthesizing, fact_checking, generating, completed, failed, cancelled
    progress JSONB DEFAULT '{}',  -- { phase, step, totalSteps, message, percentage }

    -- Results
    plan JSONB,  -- Generated research plan with sub-queries and strategy
    synthesis TEXT,  -- Final synthesized content (markdown)
    fact_check_results JSONB,  -- { verified: [], unverified: [], conflicts: [] }

    -- Metrics
    sources_found INTEGER DEFAULT 0,
    sources_used INTEGER DEFAULT 0,
    findings_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Error handling
    error JSONB,  -- { code, message, stack, retryable }
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Indexes for research_sessions
CREATE INDEX IF NOT EXISTS idx_research_sessions_user ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_conversation ON research_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);
CREATE INDEX IF NOT EXISTS idx_research_sessions_domain ON research_sessions(domain);
CREATE INDEX IF NOT EXISTS idx_research_sessions_created ON research_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_status ON research_sessions(user_id, status);

-- Research sources - URLs and content sources discovered during research
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,

    -- Source info
    url TEXT NOT NULL,
    title TEXT,
    domain VARCHAR(255),  -- Extracted domain from URL (e.g., 'arxiv.org')
    source_type VARCHAR(20) DEFAULT 'web',  -- web, api, document, database, academic, news

    -- Content
    raw_content TEXT,  -- Original extracted content
    processed_content TEXT,  -- Cleaned and normalized content
    content_hash VARCHAR(64),  -- SHA-256 for deduplication
    word_count INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',  -- { author, publishedDate, language, tags, description }

    -- Scoring (0-1 scale)
    relevance_score FLOAT,  -- How relevant to the query
    credibility_score FLOAT,  -- Source credibility assessment
    freshness_score FLOAT,  -- How recent the content is

    -- Extraction info
    extraction_method VARCHAR(20),  -- jina, firecrawl, stagehand, puppeteer, api
    extraction_status VARCHAR(20) DEFAULT 'pending',  -- pending, extracting, completed, failed, skipped
    extraction_error TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    extracted_at TIMESTAMP WITH TIME ZONE,
    indexed_at TIMESTAMP WITH TIME ZONE  -- When embeddings added to Qdrant
);

-- Indexes for research_sources
CREATE INDEX IF NOT EXISTS idx_research_sources_session ON research_sources(session_id);
CREATE INDEX IF NOT EXISTS idx_research_sources_url ON research_sources(url);
CREATE INDEX IF NOT EXISTS idx_research_sources_domain ON research_sources(domain);
CREATE INDEX IF NOT EXISTS idx_research_sources_status ON research_sources(extraction_status);
CREATE INDEX IF NOT EXISTS idx_research_sources_relevance ON research_sources(relevance_score DESC NULLS LAST);
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_sources_hash ON research_sources(session_id, content_hash) WHERE content_hash IS NOT NULL;

-- Research findings - Extracted facts, claims, statistics from sources
CREATE TABLE IF NOT EXISTS research_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,

    -- Finding info
    finding_type VARCHAR(20) NOT NULL,  -- fact, claim, statistic, quote, definition, comparison, methodology, conclusion
    content TEXT NOT NULL,  -- The actual finding content
    summary TEXT,  -- Brief summary of the finding

    -- Confidence & verification
    confidence FLOAT,  -- 0-1 confidence score
    verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50),  -- cross_reference, expert_source, primary_source, multiple_sources
    verification_notes TEXT,

    -- Source attribution
    source_ids UUID[],  -- Array of research_sources.id
    citations JSONB,  -- [{ sourceId, text, page, paragraph }]

    -- Conflicts & context
    contradictions JSONB,  -- [{ findingId, description, resolution }]
    context TEXT,  -- Additional context for the finding
    importance VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical

    -- Categorization
    category VARCHAR(50),  -- User-defined category
    tags TEXT[],  -- Array of tags

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for research_findings
CREATE INDEX IF NOT EXISTS idx_research_findings_session ON research_findings(session_id);
CREATE INDEX IF NOT EXISTS idx_research_findings_type ON research_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_research_findings_verified ON research_findings(verified);
CREATE INDEX IF NOT EXISTS idx_research_findings_confidence ON research_findings(confidence DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_research_findings_importance ON research_findings(importance);
CREATE INDEX IF NOT EXISTS idx_research_findings_source_ids ON research_findings USING GIN(source_ids);

-- Research outputs - Generated documents and reports
CREATE TABLE IF NOT EXISTS research_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,

    -- Output info
    output_type VARCHAR(20) NOT NULL,  -- summary, report, document, slides, data, brief, analysis
    format VARCHAR(10) NOT NULL,  -- markdown, pdf, docx, pptx, html, json, csv
    title TEXT,
    description TEXT,

    -- Content
    content TEXT,  -- For text formats (markdown, html, json)
    file_path TEXT,  -- S3/R2 path for binary formats
    file_size INTEGER,  -- In bytes
    file_hash VARCHAR(64),  -- For integrity verification

    -- Metadata
    metadata JSONB DEFAULT '{}',  -- { pageCount, wordCount, sections, tableOfContents }

    -- Generation info
    template_used VARCHAR(100),
    generation_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for research_outputs
CREATE INDEX IF NOT EXISTS idx_research_outputs_session ON research_outputs(session_id);
CREATE INDEX IF NOT EXISTS idx_research_outputs_type ON research_outputs(output_type);
CREATE INDEX IF NOT EXISTS idx_research_outputs_format ON research_outputs(format);

-- Domain configurations - Customizable research domain settings
CREATE TABLE IF NOT EXISTS domain_configs (
    id VARCHAR(50) PRIMARY KEY,  -- technology, finance, medical, legal, academic, general
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Configuration (full DomainConfig object)
    config JSONB NOT NULL,  -- { sources, terminology, patterns, prompts, validators, templates }

    -- Status
    enabled BOOLEAN DEFAULT TRUE,

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- PHASE 2: Autonomous Task System Tables
-- ============================================

-- Autonomous tasks - Main table for background task tracking
CREATE TABLE IF NOT EXISTS autonomous_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES autonomous_tasks(id) ON DELETE SET NULL,  -- For subtasks

    -- Task info
    task_type VARCHAR(50) NOT NULL,  -- browser, research, document, data, api, composite, scheduled
    title TEXT NOT NULL,
    description TEXT,

    -- Input & configuration
    input JSONB NOT NULL,  -- Task parameters (varies by task_type)
    config JSONB DEFAULT '{}',  -- Task-specific configuration

    -- Planning
    plan JSONB,  -- { steps: [], dependencies: {}, estimatedDuration, resources }

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, planning, queued, executing, paused, waiting_input, completed, failed, cancelled, timeout
    progress JSONB DEFAULT '{}',  -- { currentStep, totalSteps, phase, message, percentage }

    -- Scheduling
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),  -- 1 (highest) to 10 (lowest)
    scheduled_at TIMESTAMP WITH TIME ZONE,  -- For scheduled tasks
    repeat_config JSONB,  -- { frequency, interval, endDate, lastRun, nextRun }

    -- Results
    result JSONB,  -- Final task result (varies by task_type)

    -- Error handling
    error JSONB,  -- { code, message, stack, retryable, failedStep }
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Timeouts & limits
    timeout_seconds INTEGER DEFAULT 300,
    max_steps INTEGER DEFAULT 100,

    -- Resource tracking
    tokens_used INTEGER DEFAULT 0,
    cost_cents INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE  -- For detecting stale tasks
);

-- Indexes for autonomous_tasks
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_user ON autonomous_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_conversation ON autonomous_tasks(conversation_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_parent ON autonomous_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_status ON autonomous_tasks(status);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_type ON autonomous_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_priority ON autonomous_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_scheduled ON autonomous_tasks(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_created ON autonomous_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_user_status ON autonomous_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_autonomous_tasks_pending ON autonomous_tasks(priority, created_at) WHERE status IN ('pending', 'queued');

-- Task steps - Individual steps within a task
CREATE TABLE IF NOT EXISTS task_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,

    -- Step info
    step_number INTEGER NOT NULL,
    name VARCHAR(100),
    description TEXT,

    -- Execution
    agent_type VARCHAR(50) NOT NULL,  -- browser, llm, document, data, api, custom
    action VARCHAR(100) NOT NULL,  -- navigate, extract, click, type, generate, transform, etc.
    input JSONB NOT NULL,  -- Action-specific input

    -- Dependencies
    dependencies UUID[],  -- IDs of steps that must complete first

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed, skipped, cancelled

    -- Results
    output JSONB,  -- Step output/result
    error JSONB,  -- { code, message, stack }

    -- Retry handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 2,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,

    -- Unique constraint for step ordering
    UNIQUE(task_id, step_number)
);

-- Indexes for task_steps
CREATE INDEX IF NOT EXISTS idx_task_steps_task ON task_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_task_steps_status ON task_steps(status);
CREATE INDEX IF NOT EXISTS idx_task_steps_agent ON task_steps(agent_type);
CREATE INDEX IF NOT EXISTS idx_task_steps_task_status ON task_steps(task_id, status);

-- Task artifacts - Screenshots, files, and outputs generated by tasks
CREATE TABLE IF NOT EXISTS task_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
    step_id UUID REFERENCES task_steps(id) ON DELETE SET NULL,

    -- Artifact info
    artifact_type VARCHAR(20) NOT NULL,  -- screenshot, document, data, file, log, video, audio
    name TEXT,
    description TEXT,

    -- Content
    mime_type VARCHAR(100),
    file_path TEXT,  -- S3/R2 path
    content TEXT,  -- For small text artifacts (< 1MB)
    file_size INTEGER,  -- In bytes
    file_hash VARCHAR(64),  -- For integrity

    -- Preview
    thumbnail_path TEXT,  -- For images/videos
    preview_content TEXT,  -- First N chars for text

    -- Metadata
    metadata JSONB DEFAULT '{}',  -- { width, height, duration, format, etc. }

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for task_artifacts
CREATE INDEX IF NOT EXISTS idx_task_artifacts_task ON task_artifacts(task_id);
CREATE INDEX IF NOT EXISTS idx_task_artifacts_step ON task_artifacts(step_id);
CREATE INDEX IF NOT EXISTS idx_task_artifacts_type ON task_artifacts(artifact_type);

-- ============================================
-- PHASE 3: Browser Automation Tables
-- ============================================

-- Browser sessions - Track browser automation sessions
CREATE TABLE IF NOT EXISTS browser_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES autonomous_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session info
    browser_type VARCHAR(20) DEFAULT 'chromium',  -- chromium, firefox, webkit
    headless BOOLEAN DEFAULT TRUE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'initializing',  -- initializing, active, idle, closed, error

    -- State
    current_url TEXT,
    page_title TEXT,
    viewport JSONB DEFAULT '{"width": 1280, "height": 720}',
    user_agent TEXT,

    -- Session persistence
    cookies JSONB,  -- Encrypted cookie storage
    local_storage JSONB,  -- Encrypted local storage
    session_storage JSONB,  -- Encrypted session storage

    -- Metrics
    pages_visited INTEGER DEFAULT 0,
    actions_performed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,

    -- Resource limits
    max_pages INTEGER DEFAULT 50,
    timeout_seconds INTEGER DEFAULT 300,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for browser_sessions
CREATE INDEX IF NOT EXISTS idx_browser_sessions_task ON browser_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_user ON browser_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_status ON browser_sessions(status);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_active ON browser_sessions(last_activity_at) WHERE status = 'active';

-- Browser actions log - Detailed log of browser actions
CREATE TABLE IF NOT EXISTS browser_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES task_steps(id) ON DELETE SET NULL,

    -- Action info
    action_type VARCHAR(50) NOT NULL,  -- navigate, click, type, scroll, extract, screenshot, wait, observe, act
    instruction TEXT,  -- Natural language instruction (for Stagehand)
    selector TEXT,  -- CSS/XPath selector if applicable

    -- Input/Output
    input JSONB,  -- Action parameters
    output JSONB,  -- Action result

    -- Page context
    url TEXT,
    page_title TEXT,

    -- Screenshot
    screenshot_path TEXT,  -- Before/after screenshots

    -- Status
    success BOOLEAN NOT NULL,
    error_message TEXT,

    -- Timing
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for browser_actions
CREATE INDEX IF NOT EXISTS idx_browser_actions_session ON browser_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_browser_actions_step ON browser_actions(step_id);
CREATE INDEX IF NOT EXISTS idx_browser_actions_type ON browser_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_browser_actions_created ON browser_actions(created_at DESC);

-- ============================================
-- PHASE 4: LangGraph Checkpoints
-- ============================================

-- LangGraph checkpoints - Workflow state persistence for resumability
CREATE TABLE IF NOT EXISTS langgraph_checkpoints (
    thread_id VARCHAR(255) NOT NULL,  -- Unique workflow thread identifier
    checkpoint_id VARCHAR(255) NOT NULL,  -- Unique checkpoint within thread
    parent_checkpoint_id VARCHAR(255),  -- Previous checkpoint for history

    -- State
    channel_values JSONB NOT NULL,  -- Current state of all channels
    channel_versions JSONB NOT NULL,  -- Version numbers for each channel
    versions_seen JSONB NOT NULL,  -- Versions seen by this checkpoint

    -- Node info
    current_node VARCHAR(100),  -- Currently executing node
    next_nodes JSONB,  -- Pending nodes to execute

    -- Metadata
    metadata JSONB DEFAULT '{}',  -- { taskId, sessionId, userId, etc. }

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    PRIMARY KEY (thread_id, checkpoint_id)
);

-- Indexes for langgraph_checkpoints
CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_thread ON langgraph_checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_parent ON langgraph_checkpoints(thread_id, parent_checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_langgraph_checkpoints_created ON langgraph_checkpoints(created_at DESC);

-- LangGraph checkpoint writes - Pending writes for checkpoints
CREATE TABLE IF NOT EXISTS langgraph_checkpoint_writes (
    thread_id VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255) NOT NULL,  -- Task within the checkpoint
    channel VARCHAR(255) NOT NULL,  -- Channel being written

    -- Write data
    value JSONB NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    PRIMARY KEY (thread_id, checkpoint_id, task_id)
);

-- Index for checkpoint writes
CREATE INDEX IF NOT EXISTS idx_langgraph_writes_checkpoint ON langgraph_checkpoint_writes(thread_id, checkpoint_id);

-- ============================================
-- PHASE 5: Intent Patterns & Templates
-- ============================================

-- Intent patterns - For research/task detection from user messages
CREATE TABLE IF NOT EXISTS intent_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Pattern info
    pattern TEXT NOT NULL,  -- Pattern text (can include {placeholders})
    pattern_type VARCHAR(30) NOT NULL,  -- research_request, task_request, domain_hint, depth_hint

    -- Classification
    domain VARCHAR(50),  -- Detected domain if applicable
    depth VARCHAR(20),  -- Detected depth if applicable
    task_type VARCHAR(50),  -- Detected task type if applicable
    action VARCHAR(100),  -- Detected action if applicable

    -- Examples
    examples TEXT[],  -- Example queries that match this pattern

    -- Scoring
    confidence FLOAT DEFAULT 0.8,  -- Default confidence when matched
    priority INTEGER DEFAULT 5,  -- For ordering matches

    -- Status
    enabled BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for intent_patterns
CREATE INDEX IF NOT EXISTS idx_intent_patterns_type ON intent_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_intent_patterns_domain ON intent_patterns(domain);
CREATE INDEX IF NOT EXISTS idx_intent_patterns_task_type ON intent_patterns(task_type);
CREATE INDEX IF NOT EXISTS idx_intent_patterns_enabled ON intent_patterns(enabled) WHERE enabled = TRUE;

-- Task templates - Reusable task definitions
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),

    -- Task configuration
    task_type VARCHAR(50) NOT NULL,
    default_input JSONB DEFAULT '{}',  -- Default input values
    default_config JSONB DEFAULT '{}',  -- Default configuration

    -- Steps template
    steps_template JSONB NOT NULL,  -- Array of step definitions

    -- Requirements
    required_inputs TEXT[],  -- Required input fields
    optional_inputs TEXT[],  -- Optional input fields

    -- Metadata
    estimated_duration INTEGER,  -- In seconds
    complexity VARCHAR(20) DEFAULT 'medium',  -- simple, medium, complex

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_rate FLOAT,  -- 0-1
    avg_duration_ms INTEGER,

    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,  -- System templates can't be deleted

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for task_templates
CREATE INDEX IF NOT EXISTS idx_task_templates_type ON task_templates(task_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_enabled ON task_templates(enabled) WHERE enabled = TRUE;

-- ============================================
-- Add updated_at triggers
-- ============================================

-- Triggers for updated_at timestamp
DROP TRIGGER IF EXISTS update_research_sessions_updated_at ON research_sessions;
CREATE TRIGGER update_research_sessions_updated_at
    BEFORE UPDATE ON research_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_domain_configs_updated_at ON domain_configs;
CREATE TRIGGER update_domain_configs_updated_at
    BEFORE UPDATE ON domain_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_autonomous_tasks_updated_at ON autonomous_tasks;
CREATE TRIGGER update_autonomous_tasks_updated_at
    BEFORE UPDATE ON autonomous_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intent_patterns_updated_at ON intent_patterns;
CREATE TRIGGER update_intent_patterns_updated_at
    BEFORE UPDATE ON intent_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_templates_updated_at ON task_templates;
CREATE TRIGGER update_task_templates_updated_at
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed default domain configurations
-- ============================================

INSERT INTO domain_configs (id, name, description, config, enabled) VALUES
('technology', 'Technology', 'Technology, software, and engineering research domain', '{
    "sources": {
        "preferred": ["github.com", "stackoverflow.com", "arxiv.org", "hacker-news", "dev.to", "medium.com"],
        "academic": ["arxiv.org", "acm.org", "ieee.org"],
        "official": ["docs.*.com", "developer.*.com"]
    },
    "terminology": {
        "patterns": ["API", "SDK", "framework", "library", "algorithm", "architecture"]
    },
    "validators": {
        "requireCodeExamples": false,
        "preferPrimaryDocs": true
    }
}'::jsonb, TRUE),
('finance', 'Finance', 'Financial markets, investing, and economic research domain', '{
    "sources": {
        "preferred": ["sec.gov", "bloomberg.com", "reuters.com", "wsj.com", "ft.com"],
        "official": ["sec.gov", "federalreserve.gov", "treasury.gov"],
        "data": ["fred.stlouisfed.org", "yahoo.finance", "tradingview.com"]
    },
    "terminology": {
        "patterns": ["ROI", "P/E", "market cap", "dividend", "yield", "volatility"]
    },
    "validators": {
        "requireSECFilings": false,
        "checkDataRecency": true
    }
}'::jsonb, TRUE),
('medical', 'Medical', 'Medical, healthcare, and clinical research domain', '{
    "sources": {
        "preferred": ["pubmed.gov", "nejm.org", "thelancet.com", "nature.com/medicine"],
        "clinical": ["clinicaltrials.gov", "cochranelibrary.com"],
        "official": ["cdc.gov", "who.int", "nih.gov", "fda.gov"]
    },
    "terminology": {
        "patterns": ["clinical trial", "efficacy", "adverse event", "dosage", "contraindication"]
    },
    "validators": {
        "requirePeerReview": true,
        "checkRetractionStatus": true
    }
}'::jsonb, TRUE),
('legal', 'Legal', 'Legal research, case law, and regulatory domain', '{
    "sources": {
        "preferred": ["supremecourt.gov", "law.cornell.edu", "westlaw.com", "lexisnexis.com"],
        "official": ["congress.gov", "regulations.gov", "uscode.house.gov"]
    },
    "terminology": {
        "patterns": ["precedent", "statute", "jurisdiction", "plaintiff", "defendant", "motion"]
    },
    "validators": {
        "checkCitationValidity": true,
        "verifyCurrentLaw": true
    }
}'::jsonb, TRUE),
('academic', 'Academic', 'Academic research, scholarly papers, and scientific studies', '{
    "sources": {
        "preferred": ["scholar.google.com", "arxiv.org", "researchgate.net", "jstor.org"],
        "publishers": ["nature.com", "science.org", "springer.com", "wiley.com"]
    },
    "terminology": {
        "patterns": ["methodology", "hypothesis", "peer-reviewed", "meta-analysis", "citation"]
    },
    "validators": {
        "requirePeerReview": true,
        "checkCitationCount": true,
        "verifyAuthorCredentials": false
    }
}'::jsonb, TRUE),
('general', 'General', 'General-purpose research for any topic', '{
    "sources": {
        "preferred": ["wikipedia.org", "britannica.com"],
        "news": ["reuters.com", "apnews.com", "bbc.com"]
    },
    "terminology": {
        "patterns": []
    },
    "validators": {
        "crossReferenceMultipleSources": true
    }
}'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    config = EXCLUDED.config,
    updated_at = NOW();

-- ============================================
-- Migration complete
-- ============================================
