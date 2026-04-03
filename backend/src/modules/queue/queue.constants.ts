/**
 * Queue Constants
 * Defines queue names, job types, and configuration constants for BullMQ
 */

// Queue Names
export const QUEUE_NAMES = {
  RESEARCH: 'research',
  BROWSER_TASKS: 'browser-tasks',
  DOCUMENT_GENERATION: 'document-generation',
  DATA_ANALYSIS: 'data-analysis',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Research Job Types
export const RESEARCH_JOB_TYPES = {
  WEB_SEARCH: 'web-search',
  CONTENT_EXTRACTION: 'content-extraction',
  MULTI_SOURCE_RESEARCH: 'multi-source-research',
  FACT_CHECK: 'fact-check',
  SUMMARIZE: 'summarize',
  DEEP_RESEARCH: 'deep-research',
} as const;

export type ResearchJobType =
  (typeof RESEARCH_JOB_TYPES)[keyof typeof RESEARCH_JOB_TYPES];

// Browser Task Job Types
export const BROWSER_JOB_TYPES = {
  SCREENSHOT: 'screenshot',
  PDF_GENERATION: 'pdf-generation',
  FORM_FILL: 'form-fill',
  SCRAPE_PAGE: 'scrape-page',
  MONITOR_PAGE: 'monitor-page',
  AUTOMATION_SCRIPT: 'automation-script',
} as const;

export type BrowserJobType =
  (typeof BROWSER_JOB_TYPES)[keyof typeof BROWSER_JOB_TYPES];

// Document Generation Job Types
export const DOCUMENT_JOB_TYPES = {
  GENERATE_PDF: 'generate-pdf',
  GENERATE_DOCX: 'generate-docx',
  GENERATE_XLSX: 'generate-xlsx',
  GENERATE_PPTX: 'generate-pptx',
  MERGE_DOCUMENTS: 'merge-documents',
  CONVERT_FORMAT: 'convert-format',
  TEMPLATE_RENDER: 'template-render',
} as const;

export type DocumentJobType =
  (typeof DOCUMENT_JOB_TYPES)[keyof typeof DOCUMENT_JOB_TYPES];

// Data Analysis Job Types
export const DATA_ANALYSIS_JOB_TYPES = {
  CSV_ANALYSIS: 'csv-analysis',
  JSON_TRANSFORM: 'json-transform',
  STATISTICAL_ANALYSIS: 'statistical-analysis',
  DATA_VISUALIZATION: 'data-visualization',
  DATA_CLEANING: 'data-cleaning',
  AGGREGATION: 'aggregation',
  // Agent-based analysis types
  NL_TO_SQL: 'nl-to-sql',
  CHART_BUILDER: 'chart-builder',
  FINANCIAL_ANALYSIS: 'financial-analysis',
  DATA_SUMMARY: 'data-summary',
} as const;

export type DataAnalysisJobType =
  (typeof DATA_ANALYSIS_JOB_TYPES)[keyof typeof DATA_ANALYSIS_JOB_TYPES];

// Job Status
export const JOB_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  PAUSED: 'paused',
  STUCK: 'stuck',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

// Job Priority Levels
export const JOB_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5,
} as const;

export type JobPriority = (typeof JOB_PRIORITY)[keyof typeof JOB_PRIORITY];

// Default Job Options
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // Keep completed jobs for 1 hour
    count: 1000, // Keep at most 1000 completed jobs
  },
  removeOnFail: {
    age: 86400, // Keep failed jobs for 24 hours
    count: 5000, // Keep at most 5000 failed jobs
  },
} as const;

// Worker Options
export const DEFAULT_WORKER_OPTIONS = {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000, // 10 jobs per second
  },
} as const;

// Redis Connection Options for BullMQ (with reconnection)
export const REDIS_CONNECTION_OPTIONS = {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false, // Faster connection
  retryStrategy: (times: number) => {
    // Reconnect after delay (max 30 seconds)
    const delay = Math.min(times * 1000, 30000);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    // Reconnect on connection reset errors
    const targetErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT'];
    return targetErrors.some(e => err.message.includes(e));
  },
  keepAlive: 30000, // Send keepalive every 30 seconds
  connectTimeout: 10000, // 10 second connection timeout
} as const;

// Queue Events
export const QUEUE_EVENTS = {
  JOB_ADDED: 'job:added',
  JOB_PROGRESS: 'job:progress',
  JOB_COMPLETED: 'job:completed',
  JOB_FAILED: 'job:failed',
  JOB_STALLED: 'job:stalled',
  JOB_DELAYED: 'job:delayed',
  JOB_REMOVED: 'job:removed',
  QUEUE_ERROR: 'queue:error',
  QUEUE_READY: 'queue:ready',
} as const;

export type QueueEvent = (typeof QUEUE_EVENTS)[keyof typeof QUEUE_EVENTS];

// Job Data Interfaces
export interface BaseJobData {
  userId: string;
  organizationId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface ResearchJobData extends BaseJobData {
  type: ResearchJobType;
  query: string;
  sources?: string[];
  maxResults?: number;
  depth?: 'shallow' | 'medium' | 'deep';
  outputFormat?: 'json' | 'markdown' | 'html';
}

export interface BrowserJobData extends BaseJobData {
  type: BrowserJobType;
  url: string;
  selector?: string;
  waitFor?: number;
  viewport?: { width: number; height: number };
  script?: string;
  options?: Record<string, any>;
}

export interface DocumentJobData extends BaseJobData {
  type: DocumentJobType;
  template?: string;
  data?: Record<string, any>;
  outputPath?: string;
  format?: string;
  options?: {
    pageSize?: string;
    orientation?: 'portrait' | 'landscape';
    margins?: { top: number; right: number; bottom: number; left: number };
    headerTemplate?: string;
    footerTemplate?: string;
  };
}

export interface DataAnalysisJobData extends BaseJobData {
  type: DataAnalysisJobType;
  inputData?: any;
  inputPath?: string;
  operations?: Array<{
    type: string;
    params?: Record<string, any>;
  }>;
  outputFormat?: 'json' | 'csv' | 'xlsx';
  // Agent-specific options
  query?: string; // For NL-to-SQL
  schema?: Array<{ name: string; type: string }>; // Dataset schema for queries
  tableName?: string; // Table name for SQL generation
  chartConfig?: {
    chartType?: string;
    xAxis?: string;
    yAxis?: string;
    series?: string;
    groupBy?: string;
  };
  financialOptions?: {
    period?: string;
    includeForecasting?: boolean;
    includeRatios?: boolean;
  };
}

// Job Result Interfaces
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ResearchJobResult extends JobResult {
  sources?: Array<{
    url: string;
    title: string;
    snippet: string;
    relevanceScore?: number;
  }>;
  summary?: string;
  facts?: string[];
}

export interface BrowserJobResult extends JobResult {
  screenshot?: string;
  pdf?: string;
  html?: string;
  extractedData?: any;
}

export interface DocumentJobResult extends JobResult {
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface DataAnalysisJobResult extends JobResult {
  output?: any;
  statistics?: Record<string, number>;
  visualizations?: string[];
}
