/**
 * Research Module Database Entities
 * TypeScript interfaces that map directly to database tables (snake_case)
 * Use these for database operations; use research.interface.ts types for API responses
 */

// ============================================
// research_sessions table
// ============================================

export interface ResearchSessionEntity {
  id: string;
  user_id: string;
  conversation_id?: string;

  // Query info
  query: string;
  domain?: string;
  depth: string; // 'quick' | 'standard' | 'deep' | 'exhaustive'

  // Configuration (JSONB)
  config: Record<string, any>;

  // Status tracking
  status: string;
  progress: Record<string, any>;

  // Results
  plan?: Record<string, any>;
  synthesis?: string;
  fact_check_results?: Record<string, any>;

  // Metrics
  sources_found: number;
  sources_used: number;
  findings_count: number;
  tokens_used: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;

  // Error handling
  error?: Record<string, any>;
  retry_count: number;
  max_retries: number;
}

// ============================================
// research_sources table
// ============================================

export interface ResearchSourceEntity {
  id: string;
  session_id: string;

  // Source info
  url: string;
  title?: string;
  domain?: string;
  source_type: string;

  // Content
  raw_content?: string;
  processed_content?: string;
  content_hash?: string;
  word_count?: number;

  // Metadata (JSONB)
  metadata: Record<string, any>;

  // Scoring
  relevance_score?: number;
  credibility_score?: number;
  freshness_score?: number;

  // Extraction info
  extraction_method?: string;
  extraction_status: string;
  extraction_error?: string;

  // Timestamps
  created_at: string;
  extracted_at?: string;
  indexed_at?: string;
}

// ============================================
// research_findings table
// ============================================

export interface ResearchFindingEntity {
  id: string;
  session_id: string;

  // Finding info
  finding_type: string;
  content: string;
  summary?: string;

  // Confidence & verification
  confidence?: number;
  verified: boolean;
  verification_method?: string;
  verification_notes?: string;

  // Source attribution
  source_ids?: string[];
  citations?: Record<string, any>;

  // Conflicts & context
  contradictions?: Record<string, any>;
  context?: string;
  importance: string;

  // Categorization
  category?: string;
  tags?: string[];

  // Timestamps
  created_at: string;
}

// ============================================
// research_outputs table
// ============================================

export interface ResearchOutputEntity {
  id: string;
  session_id: string;

  // Output info
  output_type: string;
  format: string;
  title?: string;
  description?: string;

  // Content
  content?: string;
  file_path?: string;
  file_size?: number;
  file_hash?: string;

  // Metadata (JSONB)
  metadata: Record<string, any>;

  // Generation info
  template_used?: string;
  generation_time_ms?: number;

  // Timestamps
  created_at: string;
}

// ============================================
// domain_configs table
// ============================================

export interface DomainConfigEntity {
  id: string;
  name: string;
  description?: string;

  // Configuration (JSONB)
  config: Record<string, any>;

  // Status
  enabled: boolean;

  // Usage tracking
  usage_count: number;
  last_used_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// Utility types for database operations
// ============================================

export type InsertResearchSession = Omit<ResearchSessionEntity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateResearchSession = Partial<Omit<ResearchSessionEntity, 'id' | 'created_at'>>;

export type InsertResearchSource = Omit<ResearchSourceEntity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UpdateResearchSource = Partial<Omit<ResearchSourceEntity, 'id' | 'session_id' | 'created_at'>>;

export type InsertResearchFinding = Omit<ResearchFindingEntity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsertResearchOutput = Omit<ResearchOutputEntity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};
