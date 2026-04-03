-- Migration: data_analysis_tables
-- Created at: 2025-01-10
-- Purpose: Tables for data analysis feature (Priority 4)

-- User datasets (track uploaded files in R2)
CREATE TABLE IF NOT EXISTS user_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  original_filename VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,  -- 'csv', 'xlsx', 'xls', 'json'
  file_size BIGINT NOT NULL,
  r2_key VARCHAR(1000) NOT NULL,   -- R2 storage key
  row_count INTEGER,
  column_count INTEGER,
  columns JSONB,                    -- Column definitions with types
  sample_data JSONB,               -- First 10 rows for preview
  data_profile JSONB,              -- Statistical profile from analyzer
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'processing', 'ready', 'error'
  error_message TEXT,
  is_favorite BOOLEAN DEFAULT false,
  tags VARCHAR(100)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_datasets
CREATE INDEX IF NOT EXISTS idx_user_datasets_user_id ON user_datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_datasets_status ON user_datasets(status);
CREATE INDEX IF NOT EXISTS idx_user_datasets_created_at ON user_datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_datasets_tags ON user_datasets USING GIN(tags);

-- Analysis results cache
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100) NOT NULL,  -- 'profiling', 'statistics', 'correlation', 'anomaly', 'insight'
  analysis_hash VARCHAR(64),            -- Hash of parameters for cache lookup
  parameters JSONB,                     -- Analysis parameters used
  results JSONB NOT NULL,               -- Analysis output
  summary TEXT,                         -- AI-generated summary
  insights JSONB,                       -- Array of discovered insights
  execution_time_ms INTEGER,
  rows_processed INTEGER,
  is_cached BOOLEAN DEFAULT true,
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analysis_results
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_dataset_id ON analysis_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_results_hash ON analysis_results(analysis_hash);

-- Unique constraint for caching
CREATE UNIQUE INDEX IF NOT EXISTS idx_analysis_results_cache_key
  ON analysis_results(dataset_id, analysis_type, analysis_hash);

-- Saved charts
CREATE TABLE IF NOT EXISTS saved_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  chart_type VARCHAR(50) NOT NULL,  -- 'line', 'bar', 'pie', 'scatter', 'heatmap', etc.
  config JSONB NOT NULL,            -- Full chart configuration
  query_sql TEXT,                   -- SQL query if data comes from query
  data_snapshot JSONB,              -- Optional: frozen data for the chart
  thumbnail_url VARCHAR(1000),      -- Preview image in R2
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  is_favorite BOOLEAN DEFAULT false,
  tags VARCHAR(100)[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for saved_charts
CREATE INDEX IF NOT EXISTS idx_saved_charts_user_id ON saved_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_dataset_id ON saved_charts(dataset_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_type ON saved_charts(chart_type);
CREATE INDEX IF NOT EXISTS idx_saved_charts_public ON saved_charts(public_slug) WHERE is_public = true;

-- Dashboards
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,            -- Grid layout configuration
  chart_ids UUID[],                 -- Array of chart IDs
  global_filters JSONB,             -- Filters that apply to all charts
  theme VARCHAR(50) DEFAULT 'light',
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE,
  refresh_enabled BOOLEAN DEFAULT false,
  refresh_interval_seconds INTEGER,
  is_favorite BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dashboards
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_public ON dashboards(public_slug) WHERE is_public = true;

-- Query history
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE SET NULL,
  natural_language_query TEXT NOT NULL,
  generated_sql TEXT,
  query_hash VARCHAR(64),
  execution_status VARCHAR(50) NOT NULL,  -- 'success', 'error', 'timeout'
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  error_message TEXT,
  result_summary JSONB,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  was_modified BOOLEAN DEFAULT false,
  modified_sql TEXT,
  conversation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Indexes for query_history
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_dataset_id ON query_history(dataset_id);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON query_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_history_status ON query_history(execution_status);

-- Saved queries (favorites)
CREATE TABLE IF NOT EXISTS saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query_history_id UUID REFERENCES query_history(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  natural_language_query TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  tags VARCHAR(100)[],
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for saved_queries
CREATE INDEX IF NOT EXISTS idx_saved_queries_user_id ON saved_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_scheduled ON saved_queries(next_run_at) WHERE is_scheduled = true;

-- Financial analysis results (specialized for finance)
CREATE TABLE IF NOT EXISTS financial_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dataset_id UUID REFERENCES user_datasets(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100) NOT NULL,  -- 'pnl', 'balance_sheet', 'cash_flow', 'ratios', 'forecast'
  period_start DATE,
  period_end DATE,
  results JSONB NOT NULL,
  ratios JSONB,                     -- Financial ratios calculated
  trends JSONB,                     -- Trend analysis
  alerts JSONB,                     -- Warnings and recommendations
  forecast JSONB,                   -- Forecast data if applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for financial_analyses
CREATE INDEX IF NOT EXISTS idx_financial_analyses_user_id ON financial_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_dataset_id ON financial_analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_type ON financial_analyses(analysis_type);
