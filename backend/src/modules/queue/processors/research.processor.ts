import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Worker, Job, ConnectionOptions } from 'bullmq';
import {
  QUEUE_NAMES,
  RESEARCH_JOB_TYPES,
  QUEUE_EVENTS,
  DEFAULT_WORKER_OPTIONS,
  REDIS_CONNECTION_OPTIONS,
  ResearchJobData,
  ResearchJobResult,
} from '../queue.constants';

@Injectable()
export class ResearchProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResearchProcessor.name);
  private worker: Worker;
  private connectionConfig: ConnectionOptions;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn('REDIS_HOST not configured - research processor disabled');
      return;
    }
    this.initializeConnectionConfig();
    // Initialize worker in background to not block app startup
    this.initializeWorker().then(() => {
      this.logger.log('Research processor initialized');
    }).catch(err => {
      this.logger.error('Failed to initialize research processor:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Research worker closed');
    }
  }

  private initializeConnectionConfig(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.connectionConfig = {
      host,
      port,
      password: password || undefined,
      db,
      ...REDIS_CONNECTION_OPTIONS,
    };
  }

  private async initializeWorker(): Promise<void> {
    this.worker = new Worker<ResearchJobData, ResearchJobResult>(
      QUEUE_NAMES.RESEARCH,
      async (job) => this.processJob(job),
      {
        connection: this.connectionConfig,
        concurrency: DEFAULT_WORKER_OPTIONS.concurrency,
        limiter: DEFAULT_WORKER_OPTIONS.limiter,
      },
    );

    this.setupWorkerEvents();
  }

  private setupWorkerEvents(): void {
    this.worker.on('completed', (job, result) => {
      this.logger.log(`Research job ${job.id} completed`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_COMPLETED, {
        queue: QUEUE_NAMES.RESEARCH,
        jobId: job.id,
        result,
      });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Research job ${job?.id} failed: ${error.message}`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_FAILED, {
        queue: QUEUE_NAMES.RESEARCH,
        jobId: job?.id,
        error: error.message,
      });
    });

    this.worker.on('progress', (job, progress) => {
      this.logger.debug(`Research job ${job.id} progress: ${JSON.stringify(progress)}`);
    });

    this.worker.on('error', (error) => {
      this.logger.error(`Research worker error: ${error.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`Research job ${jobId} stalled`);
    });
  }

  private async processJob(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    const startTime = Date.now();
    this.logger.log(
      `Processing research job ${job.id}: ${job.data.type} - "${job.data.query}"`,
    );

    try {
      // Check for cancellation
      const progress = job.progress as any;
      if (progress?.cancelled) {
        return {
          success: false,
          error: 'Job was cancelled',
          duration: Date.now() - startTime,
        };
      }

      await job.updateProgress({ status: 'starting', percentage: 0 });

      let result: ResearchJobResult;

      switch (job.data.type) {
        case RESEARCH_JOB_TYPES.WEB_SEARCH:
          result = await this.handleWebSearch(job);
          break;
        case RESEARCH_JOB_TYPES.CONTENT_EXTRACTION:
          result = await this.handleContentExtraction(job);
          break;
        case RESEARCH_JOB_TYPES.MULTI_SOURCE_RESEARCH:
          result = await this.handleMultiSourceResearch(job);
          break;
        case RESEARCH_JOB_TYPES.FACT_CHECK:
          result = await this.handleFactCheck(job);
          break;
        case RESEARCH_JOB_TYPES.SUMMARIZE:
          result = await this.handleSummarize(job);
          break;
        case RESEARCH_JOB_TYPES.DEEP_RESEARCH:
          result = await this.handleDeepResearch(job);
          break;
        default:
          throw new Error(`Unknown research job type: ${job.data.type}`);
      }

      await job.updateProgress({ status: 'completed', percentage: 100 });

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(
        `Research job ${job.id} error: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // =============================================
  // JOB HANDLERS
  // =============================================

  private async handleWebSearch(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'searching', percentage: 20 });

    const { query, maxResults = 10 } = job.data;

    // TODO: Implement actual web search using configured search API
    // This is a placeholder implementation
    this.logger.debug(`Web search for: "${query}" (max: ${maxResults})`);

    await job.updateProgress({ status: 'processing', percentage: 60 });

    // Simulate search results (replace with actual implementation)
    const sources = [
      {
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        title: `Search results for: ${query}`,
        snippet: `Results related to ${query}...`,
        relevanceScore: 0.95,
      },
    ];

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      sources,
      summary: `Found ${sources.length} results for "${query}"`,
      metadata: {
        query,
        maxResults,
        resultsFound: sources.length,
      },
    };
  }

  private async handleContentExtraction(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'extracting', percentage: 20 });

    const { query: url, sources = [] } = job.data;
    const targetUrls = sources.length > 0 ? sources : [url];

    this.logger.debug(`Content extraction from: ${targetUrls.join(', ')}`);

    await job.updateProgress({ status: 'parsing', percentage: 50 });

    // TODO: Implement actual content extraction
    // Use cheerio, puppeteer, or similar to extract content

    const extractedContent = targetUrls.map((targetUrl) => ({
      url: targetUrl,
      title: `Extracted from ${targetUrl}`,
      snippet: 'Extracted content placeholder...',
      relevanceScore: 1.0,
    }));

    await job.updateProgress({ status: 'finalizing', percentage: 90 });

    return {
      success: true,
      sources: extractedContent,
      data: {
        extractedUrls: targetUrls,
        extractedCount: extractedContent.length,
      },
    };
  }

  private async handleMultiSourceResearch(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'gathering_sources', percentage: 10 });

    const { query, sources = [], depth = 'medium' } = job.data;

    this.logger.debug(
      `Multi-source research: "${query}" (depth: ${depth}, sources: ${sources.length})`,
    );

    await job.updateProgress({ status: 'searching', percentage: 30 });

    // TODO: Implement multi-source research
    // 1. Search multiple sources
    // 2. Cross-reference information
    // 3. Aggregate results

    await job.updateProgress({ status: 'aggregating', percentage: 60 });

    const aggregatedSources = sources.map((source, index) => ({
      url: source,
      title: `Source ${index + 1}`,
      snippet: `Information from ${source}`,
      relevanceScore: 0.8 + Math.random() * 0.2,
    }));

    await job.updateProgress({ status: 'synthesizing', percentage: 80 });

    return {
      success: true,
      sources: aggregatedSources,
      summary: `Research completed across ${aggregatedSources.length} sources for "${query}"`,
      facts: [
        `Finding 1 related to ${query}`,
        `Finding 2 related to ${query}`,
      ],
    };
  }

  private async handleFactCheck(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'analyzing_claim', percentage: 20 });

    const { query: claim } = job.data;

    this.logger.debug(`Fact checking: "${claim}"`);

    await job.updateProgress({ status: 'searching_evidence', percentage: 40 });

    // TODO: Implement fact checking
    // 1. Parse the claim
    // 2. Search for supporting/contradicting evidence
    // 3. Analyze credibility of sources
    // 4. Provide verdict

    await job.updateProgress({ status: 'evaluating', percentage: 70 });

    const sources = [
      {
        url: 'https://factcheck.example.com',
        title: 'Fact Check Result',
        snippet: `Analysis of claim: "${claim}"`,
        relevanceScore: 0.9,
      },
    ];

    return {
      success: true,
      sources,
      summary: `Fact check completed for: "${claim}"`,
      facts: ['Evidence point 1', 'Evidence point 2'],
      data: {
        claim,
        verdict: 'needs_review',
        confidence: 0.75,
      },
    };
  }

  private async handleSummarize(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'reading_content', percentage: 20 });

    const { query: content, outputFormat = 'markdown' } = job.data;

    this.logger.debug(`Summarizing content (format: ${outputFormat})`);

    await job.updateProgress({ status: 'analyzing', percentage: 50 });

    // TODO: Implement summarization using LLM
    // Use the AI service to generate summaries

    await job.updateProgress({ status: 'generating_summary', percentage: 80 });

    const summary =
      content.length > 500
        ? content.substring(0, 500) + '...'
        : content;

    return {
      success: true,
      summary,
      data: {
        originalLength: content.length,
        summaryLength: summary.length,
        outputFormat,
      },
    };
  }

  private async handleDeepResearch(
    job: Job<ResearchJobData>,
  ): Promise<ResearchJobResult> {
    await job.updateProgress({ status: 'initializing', percentage: 5 });

    const { query, depth = 'deep', maxResults = 50 } = job.data;

    this.logger.debug(
      `Deep research: "${query}" (depth: ${depth}, max: ${maxResults})`,
    );

    // Step 1: Initial search
    await job.updateProgress({ status: 'initial_search', percentage: 15 });

    // Step 2: Analyze and expand search
    await job.updateProgress({ status: 'expanding_search', percentage: 30 });

    // Step 3: Deep dive into top sources
    await job.updateProgress({ status: 'deep_analysis', percentage: 50 });

    // Step 4: Cross-reference and validate
    await job.updateProgress({ status: 'validating', percentage: 70 });

    // Step 5: Synthesize findings
    await job.updateProgress({ status: 'synthesizing', percentage: 85 });

    // TODO: Implement deep research pipeline
    // This should be a comprehensive research process

    const sources = [
      {
        url: 'https://source1.example.com',
        title: 'Primary Source',
        snippet: 'Key findings from primary research',
        relevanceScore: 0.95,
      },
      {
        url: 'https://source2.example.com',
        title: 'Secondary Source',
        snippet: 'Supporting evidence',
        relevanceScore: 0.85,
      },
    ];

    return {
      success: true,
      sources,
      summary: `Deep research completed for "${query}". Found ${sources.length} relevant sources.`,
      facts: [
        'Key finding 1',
        'Key finding 2',
        'Key finding 3',
      ],
      data: {
        query,
        depth,
        sourcesAnalyzed: sources.length,
        researchDuration: 'extended',
      },
    };
  }
}
