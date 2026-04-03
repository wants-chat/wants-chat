/**
 * Research Module Interfaces
 * Defines types for the deep research system
 */

// ============================================
// Research Session Types
// ============================================

export type ResearchDepth = 'quick' | 'standard' | 'deep' | 'exhaustive';
export type ResearchStatus = 'pending' | 'planning' | 'searching' | 'extracting' | 'analyzing' | 'synthesizing' | 'fact_checking' | 'generating' | 'completed' | 'failed' | 'cancelled';
export type OutputFormat = 'markdown' | 'pdf' | 'docx' | 'pptx' | 'json';

export interface ResearchOptions {
  depth?: ResearchDepth;
  domain?: string;
  maxSources?: number;
  outputFormats?: OutputFormat[];
  includeDomains?: string[];
  excludeDomains?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  language?: string;
  requirePeerReviewed?: boolean;
  maxIterations?: number;
}

export interface ResearchSession {
  id: string;
  userId: string;
  query: string;
  options: ResearchOptions;
  status: ResearchStatus;
  progress: number;
  currentStep: string;
  plan?: ResearchPlan;
  sources: Source[];
  findings: Finding[];
  synthesis?: string;
  factCheckResults: FactCheckResult[];
  outputs: ResearchOutput[];
  error?: string;
  startedAt: string;
  completedAt?: string;
  metadata: Record<string, any>;
}

// ============================================
// Research Planning Types
// ============================================

export interface ResearchPlan {
  domain: string;
  domainConfig: DomainConfig;
  subQueries: SubQuery[];
  searchStrategy: 'broad' | 'deep' | 'comparative';
  estimatedSources: number;
  estimatedTime: number; // in seconds
  outputRecommendation: OutputFormat[];
}

export interface SubQuery {
  id: string;
  query: string;
  purpose: string;
  priority: number; // 1-5, 1 is highest
  keywords: string[];
  expectedSourceType?: string;
}

export interface DomainConfig {
  name: string;
  preferredDomains: string[];
  blockedDomains: string[];
  authoritativeDomains: string[];
  searchModifiers: string[];
  citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee' | 'harvard';
  requiresDisclaimer: boolean;
  disclaimerText?: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchResult {
  id: string;
  url: string;
  title: string;
  snippet: string;
  rawContent?: string;
  publishedDate?: string;
  author?: string;
  score: number;
  source: 'tavily' | 'exa' | 'brave' | 'jina';
  metadata?: Record<string, any>;
}

export interface AggregatedSearchResults {
  results: SearchResult[];
  totalFound: number;
  queriesExecuted: number;
  searchEnginesUsed: string[];
  deduplicated: number;
}

// ============================================
// Content Extraction Types
// ============================================

export interface ExtractedSource {
  id: string;
  url: string;
  title: string;
  content: string;
  markdown?: string;
  textContent: string;
  wordCount: number;
  metadata: SourceMetadata;
  extractionMethod: 'jina' | 'cheerio' | 'puppeteer' | 'firecrawl';
  extractedAt: string;
  chunks?: ContentChunk[];
}

export interface SourceMetadata {
  author?: string;
  publishedDate?: string;
  siteName?: string;
  description?: string;
  image?: string;
  favicon?: string;
  type?: string;
  language?: string;
}

export interface ContentChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  embedding?: number[];
}

// ============================================
// Source and Finding Types
// ============================================

export interface Source {
  id: string;
  url: string;
  title: string;
  content: string;
  textContent: string;
  metadata: SourceMetadata;
  relevanceScore: number;
  credibilityScore: number;
  extractedAt: string;
}

export interface Finding {
  id: string;
  sourceId: string;
  sourceUrl: string;
  type: 'fact' | 'statistic' | 'quote' | 'claim' | 'methodology' | 'conclusion';
  content: string;
  context: string;
  confidence: number;
  supportingSources: string[];
  contradictingSources?: string[];
  tags: string[];
}

// ============================================
// Fact Checking Types
// ============================================

export interface FactCheckResult {
  id: string;
  findingId: string;
  claim: string;
  verified: boolean;
  confidence: number;
  supportingEvidence: string[];
  conflictingEvidence?: string[];
  notes: string;
  checkType: 'statistic' | 'claim' | 'quote' | 'date' | 'source';
}

// ============================================
// Output Types
// ============================================

export interface ResearchOutput {
  id: string;
  format: OutputFormat;
  url?: string;
  content?: string;
  size?: number;
  generatedAt: string;
}

export interface ResearchReport {
  title: string;
  query: string;
  executiveSummary: string;
  keyFindings: KeyFinding[];
  detailedAnalysis: AnalysisSection[];
  dataAndStatistics: DataPoint[];
  limitationsAndCaveats: string[];
  conclusions: string[];
  recommendations?: string[];
  references: Reference[];
  disclaimer?: string;
  generatedAt: string;
  metadata: {
    sourcesAnalyzed: number;
    researchDepth: ResearchDepth;
    processingTime: number;
    domain: string;
  };
}

export interface KeyFinding {
  title: string;
  summary: string;
  evidence: string[];
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
}

export interface AnalysisSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

export interface DataPoint {
  metric: string;
  value: string;
  source: string;
  context?: string;
  verified: boolean;
}

export interface Reference {
  id: string;
  title: string;
  authors?: string[];
  url: string;
  publishedDate?: string;
  accessedDate: string;
  siteName?: string;
  formattedCitation: string;
}

// ============================================
// Progress Event Types
// ============================================

export interface ResearchProgressEvent {
  sessionId: string;
  status: ResearchStatus;
  progress: number; // 0-100
  currentStep: string;
  message: string;
  details?: {
    sourcesFound?: number;
    sourcesProcessed?: number;
    findingsExtracted?: number;
    currentSubQuery?: string;
  };
  timestamp: string;
}

export interface ResearchCompleteEvent {
  sessionId: string;
  status: 'completed' | 'failed';
  result?: ResearchSession;
  error?: string;
  timestamp: string;
}

// ============================================
// LangGraph State Types
// ============================================

export interface ResearchGraphState {
  // Input
  query: string;
  options: ResearchOptions;
  sessionId: string;
  userId: string;

  // Planning
  domain: string | null;
  plan: ResearchPlan | null;
  subQueries: SubQuery[];

  // Search & Extract
  searchResults: SearchResult[];
  sources: Source[];

  // Analysis
  findings: Finding[];
  synthesis: string | null;

  // Verification
  factCheckResults: FactCheckResult[];
  needsRevision: boolean;

  // Output
  report: ResearchReport | null;
  outputs: ResearchOutput[];

  // Control
  iteration: number;
  maxIterations: number;
  currentStep: string;
  error: string | null;
}

// ============================================
// Tool Input/Output Types
// ============================================

export interface SearchToolInput {
  query: string;
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeDomains?: string[];
  excludeDomains?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ExtractorToolInput {
  url: string;
  useJina?: boolean;
  timeout?: number;
}

// ============================================
// Queue Job Types
// ============================================

export interface ResearchJobData {
  sessionId: string;
  userId: string;
  query: string;
  options: ResearchOptions;
}

export interface ResearchJobResult {
  sessionId: string;
  status: ResearchStatus;
  result?: ResearchSession;
  error?: string;
}
