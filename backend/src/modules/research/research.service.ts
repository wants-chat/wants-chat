import { Injectable, Logger, Inject, forwardRef, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  ResearchSession,
  ResearchStatus,
  ResearchOptions,
  ResearchProgressEvent,
  ResearchCompleteEvent,
  ResearchGraphState,
  ResearchDepth,
} from './interfaces/research.interface';
import { ResearchGraph } from './workflow/research-graph';
import { ResearchGateway } from './research.gateway';
import { StartResearchDto } from './dto/research.dto';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { CreditsService } from '../ai/llm/credits.service';
import { DynamicLLMConfigService, formatCredits } from '../ai/llm/dynamic-config';

// ============================================
// In-Memory Session Store (for demo)
// In production, use PostgreSQL + Redis
// ============================================

interface SessionStore {
  sessions: Map<string, ResearchSession>;
  activeJobs: Map<string, AbortController>;
}

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);
  private readonly store: SessionStore = {
    sessions: new Map(),
    activeJobs: new Map(),
  };

  // Qdrant collection for research embeddings
  private readonly RESEARCH_COLLECTION = 'research_findings';
  private readonly VECTOR_SIZE = 1536;

  constructor(
    private configService: ConfigService,
    private researchGraph: ResearchGraph,
    @Inject(forwardRef(() => ResearchGateway))
    private researchGateway: ResearchGateway,
    private databaseService: DatabaseService,
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
    private qdrantService: QdrantService,
    @Inject(forwardRef(() => CreditsService))
    private creditsService: CreditsService,
    @Inject(forwardRef(() => DynamicLLMConfigService))
    private dynamicConfig: DynamicLLMConfigService,
  ) {
    this.initializeQdrantCollection();
  }

  private async initializeQdrantCollection(): Promise<void> {
    try {
      if (this.qdrantService.isConfigured()) {
        await this.qdrantService.createCollection(
          this.RESEARCH_COLLECTION,
          this.VECTOR_SIZE,
          'Cosine',
        );
        this.logger.log('Qdrant research collection initialized');
      }
    } catch (error: any) {
      this.logger.warn(`Failed to initialize Qdrant collection: ${error.message}`);
    }
  }

  // ============================================
  // Start Research
  // ============================================

  async startResearch(
    dto: StartResearchDto,
    userId: string,
  ): Promise<{
    sessionId: string;
    estimatedTime: number;
    estimatedCost: number;
    message: string;
  }> {
    // Check user quota before starting research
    const estimatedCost = this.estimateResearchCost(dto.depth || 'standard', dto.maxSources || 20);
    const defaultModel = this.dynamicConfig.getDefaultModel();

    const quotaCheck = await this.creditsService.checkQuota(
      userId,
      defaultModel.id,
      estimatedCost,
    );

    if (!quotaCheck.allowed) {
      throw new ForbiddenException(
        quotaCheck.reason ||
        `Insufficient credits for research. Estimated cost: ${formatCredits(estimatedCost)}. Please add credits to continue.`
      );
    }

    this.logger.log(`Quota check passed for user ${userId}. Estimated research cost: ${formatCredits(estimatedCost)}`);

    const sessionId = uuidv4();
    const startTime = new Date();

    this.logger.log(`Starting research session ${sessionId} for user ${userId}: "${dto.query}"`);

    // Create initial session
    const session: ResearchSession = {
      id: sessionId,
      userId,
      query: dto.query,
      options: {
        depth: dto.depth || 'standard',
        domain: dto.domain,
        maxSources: dto.maxSources || 20,
        outputFormats: dto.outputFormats || ['markdown'],
        includeDomains: dto.includeDomains,
        excludeDomains: dto.excludeDomains,
        dateRange: dto.dateRange,
        language: dto.language || 'en',
        requirePeerReviewed: dto.requirePeerReviewed || false,
        maxIterations: dto.maxIterations || 3,
      },
      status: 'pending',
      progress: 0,
      currentStep: 'initializing',
      sources: [],
      findings: [],
      factCheckResults: [],
      outputs: [],
      startedAt: startTime.toISOString(),
      metadata: {},
    };

    // Store session
    this.store.sessions.set(sessionId, session);

    // Save to database
    await this.saveSessionToDatabase(session);

    // Create abort controller for cancellation
    const abortController = new AbortController();
    this.store.activeJobs.set(sessionId, abortController);

    // Start research asynchronously
    this.executeResearch(sessionId, userId, dto, abortController.signal)
      .catch((error) => {
        this.logger.error(`Research execution failed for session ${sessionId}: ${error.message}`);
      });

    // Calculate estimated time based on depth
    const estimatedTime = this.getEstimatedTime(dto.depth || 'standard');

    return {
      sessionId,
      estimatedTime,
      estimatedCost,
      message: `Research started. Estimated completion time: ${Math.ceil(estimatedTime / 60)} minutes. Estimated cost: ${formatCredits(estimatedCost)}.`,
    };
  }

  // ============================================
  // Execute Research (async)
  // ============================================

  private async executeResearch(
    sessionId: string,
    userId: string,
    dto: StartResearchDto,
    signal: AbortSignal,
  ): Promise<void> {
    const session = this.store.sessions.get(sessionId);
    if (!session) {
      this.logger.error(`Session ${sessionId} not found`);
      return;
    }

    try {
      // Update status to planning
      await this.updateSession(sessionId, {
        status: 'planning',
        currentStep: 'Analyzing research query',
      });

      // Define progress callback
      const progressCallback = (
        step: string,
        progress: number,
        message: string,
        details?: any,
      ) => {
        // Check for cancellation
        if (signal.aborted) {
          throw new Error('Research cancelled');
        }

        // Emit progress event
        const progressEvent: ResearchProgressEvent = {
          sessionId,
          status: this.stepToStatus(step),
          progress,
          currentStep: step,
          message,
          details,
          timestamp: new Date().toISOString(),
        };

        this.researchGateway.emitProgress(userId, progressEvent);

        // Update session
        this.updateSession(sessionId, {
          status: this.stepToStatus(step),
          progress,
          currentStep: message,
        });
      };

      // Execute the research graph
      const result = await this.researchGraph.execute(
        dto.query,
        sessionId,
        userId,
        {
          depth: dto.depth,
          domain: dto.domain,
          maxSources: dto.maxSources,
          maxIterations: dto.maxIterations,
          includeDomains: dto.includeDomains,
          excludeDomains: dto.excludeDomains,
          dateRange: dto.dateRange,
          outputFormats: dto.outputFormats,
        },
        progressCallback,
      );

      // Handle result
      if (result.error) {
        await this.failSession(sessionId, userId, result.error);
        return;
      }

      // Update session with results
      const updatedSession: Partial<ResearchSession> = {
        status: 'completed',
        progress: 100,
        currentStep: 'Research complete',
        plan: result.plan || undefined,
        sources: result.sources.map((s) => ({
          id: s.id,
          url: s.url,
          title: s.title,
          content: s.textContent.slice(0, 1000), // Truncate for storage
          textContent: s.textContent,
          metadata: s.metadata,
          relevanceScore: s.relevanceScore,
          credibilityScore: s.credibilityScore,
          extractedAt: s.extractedAt,
        })),
        findings: result.findings,
        synthesis: result.synthesis || undefined,
        factCheckResults: result.factCheckResults,
        outputs: result.outputs,
        completedAt: new Date().toISOString(),
      };

      await this.updateSession(sessionId, updatedSession);

      // Store findings in Qdrant for future semantic search
      await this.storeResearchEmbeddings(sessionId, userId, result);

      // Emit completion event
      const finalSession = this.store.sessions.get(sessionId);
      const completeEvent: ResearchCompleteEvent = {
        sessionId,
        status: 'completed',
        result: finalSession,
        timestamp: new Date().toISOString(),
      };

      this.researchGateway.emitComplete(userId, completeEvent);

      this.logger.log(`Research session ${sessionId} completed successfully`);
    } catch (error: any) {
      if (error.message === 'Research cancelled') {
        await this.updateSession(sessionId, {
          status: 'cancelled',
          currentStep: 'Research was cancelled',
          completedAt: new Date().toISOString(),
        });

        this.researchGateway.emitComplete(userId, {
          sessionId,
          status: 'failed',
          error: 'Research was cancelled by user',
          timestamp: new Date().toISOString(),
        });
      } else {
        await this.failSession(sessionId, userId, error.message);
      }
    } finally {
      // Clean up abort controller
      this.store.activeJobs.delete(sessionId);
    }
  }

  // ============================================
  // Get Research Status
  // ============================================

  async getResearchStatus(sessionId: string, userId: string): Promise<ResearchSession> {
    // Try in-memory first
    let session = this.store.sessions.get(sessionId);

    if (!session) {
      // Try database
      session = await this.loadSessionFromDatabase(sessionId);

      if (!session) {
        throw new NotFoundException(`Research session ${sessionId} not found`);
      }

      // Verify ownership
      if (session.userId !== userId) {
        throw new NotFoundException(`Research session ${sessionId} not found`);
      }

      // Cache it
      this.store.sessions.set(sessionId, session);
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new NotFoundException(`Research session ${sessionId} not found`);
    }

    return session;
  }

  // ============================================
  // Cancel Research
  // ============================================

  async cancelResearch(sessionId: string, userId: string, reason?: string): Promise<boolean> {
    const session = await this.getResearchStatus(sessionId, userId);

    if (['completed', 'failed', 'cancelled'].includes(session.status)) {
      throw new BadRequestException(`Cannot cancel research session with status: ${session.status}`);
    }

    // Trigger abort
    const abortController = this.store.activeJobs.get(sessionId);
    if (abortController) {
      abortController.abort();
    }

    // Update session
    await this.updateSession(sessionId, {
      status: 'cancelled',
      currentStep: reason || 'Cancelled by user',
      completedAt: new Date().toISOString(),
    });

    this.logger.log(`Research session ${sessionId} cancelled: ${reason || 'No reason provided'}`);

    return true;
  }

  // ============================================
  // List Research Sessions
  // ============================================

  async listResearchSessions(
    userId: string,
    options?: {
      status?: ResearchStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    data: ResearchSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    try {
      // Query database
      let query = `
        SELECT * FROM research_sessions
        WHERE user_id = $1
      `;
      const params: any[] = [userId];

      if (options?.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(options.status);
      }

      query += ` ORDER BY started_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await this.databaseService.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM research_sessions WHERE user_id = $1`;
      const countParams: any[] = [userId];

      if (options?.status) {
        countQuery += ` AND status = $2`;
        countParams.push(options.status);
      }

      const countResult = await this.databaseService.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0]?.count || '0', 10);

      const sessions = result.rows.map((row: any) => this.rowToSession(row));

      return {
        data: sessions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Failed to list research sessions: ${error.message}`);

      // Fallback to in-memory
      const allSessions = Array.from(this.store.sessions.values())
        .filter((s) => s.userId === userId)
        .filter((s) => !options?.status || s.status === options.status)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      const total = allSessions.length;
      const data = allSessions.slice(offset, offset + limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  // ============================================
  // Get Research Report
  // ============================================

  async getResearchReport(
    sessionId: string,
    userId: string,
    format: 'markdown' | 'json' = 'markdown',
  ): Promise<{ content: string; format: string }> {
    const session = await this.getResearchStatus(sessionId, userId);

    if (session.status !== 'completed') {
      throw new BadRequestException('Research is not yet complete');
    }

    const output = session.outputs.find((o) => o.format === format);

    if (!output || !output.content) {
      throw new NotFoundException(`Report in ${format} format not available`);
    }

    return {
      content: output.content,
      format,
    };
  }

  // ============================================
  // Search Past Research
  // ============================================

  async searchPastResearch(
    userId: string,
    query: string,
    limit: number = 10,
  ): Promise<ResearchSession[]> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      // Fallback to simple text search
      return this.textSearchResearch(userId, query, limit);
    }

    try {
      // Generate embedding for query
      const embedding = await this.aiService.generateEmbedding(query);

      // Search Qdrant
      const results = await this.qdrantService.searchVectors(
        this.RESEARCH_COLLECTION,
        embedding,
        limit,
        0.7,
        { userId },
      );

      // Get unique session IDs
      const sessionIds = [...new Set(results.map((r) => r.payload?.sessionId as string))];

      // Load sessions
      const sessions: ResearchSession[] = [];
      for (const sessionId of sessionIds) {
        try {
          const session = await this.getResearchStatus(sessionId, userId);
          sessions.push(session);
        } catch {
          // Session not found, skip
        }
      }

      return sessions;
    } catch (error: any) {
      this.logger.error(`Semantic search failed: ${error.message}`);
      return this.textSearchResearch(userId, query, limit);
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async updateSession(
    sessionId: string,
    updates: Partial<ResearchSession>,
  ): Promise<void> {
    const session = this.store.sessions.get(sessionId);
    if (!session) return;

    const updated = { ...session, ...updates };
    this.store.sessions.set(sessionId, updated);

    // Save to database
    await this.saveSessionToDatabase(updated);
  }

  private async failSession(sessionId: string, userId: string, error: string): Promise<void> {
    await this.updateSession(sessionId, {
      status: 'failed',
      error,
      currentStep: 'Research failed',
      completedAt: new Date().toISOString(),
    });

    this.researchGateway.emitComplete(userId, {
      sessionId,
      status: 'failed',
      error,
      timestamp: new Date().toISOString(),
    });

    this.logger.error(`Research session ${sessionId} failed: ${error}`);
  }

  private stepToStatus(step: string): ResearchStatus {
    const statusMap: Record<string, ResearchStatus> = {
      initializing: 'pending',
      analyzing: 'planning',
      planning: 'planning',
      searching: 'searching',
      extracting: 'extracting',
      analyzing_findings: 'analyzing',
      refining: 'analyzing',
      synthesizing: 'synthesizing',
      fact_checking: 'fact_checking',
      revising: 'synthesizing',
      generating: 'generating',
      completed: 'completed',
      failed: 'failed',
    };

    return statusMap[step] || 'analyzing';
  }

  private getEstimatedTime(depth: ResearchDepth): number {
    const times: Record<ResearchDepth, number> = {
      quick: 60,
      standard: 180,
      deep: 420,
      exhaustive: 900,
    };
    return times[depth];
  }

  /**
   * Estimate the credit cost for a research session based on depth and sources
   * Calculation based on estimated LLM calls:
   * - Query analysis: ~500 tokens
   * - Planning: ~1500 tokens
   * - Per source analysis: ~2000 tokens
   * - Query refinement (per iteration): ~500 tokens
   * - Synthesis: ~4000 tokens
   * - Per fact check: ~500 tokens
   * - Executive summary: ~300 tokens
   *
   * Returns cost in microcents
   */
  private estimateResearchCost(depth: ResearchDepth, maxSources: number): number {
    const defaultModel = this.dynamicConfig.getDefaultModel();

    // Base token estimates by depth
    const depthMultipliers: Record<ResearchDepth, number> = {
      quick: 1,
      standard: 1.5,
      deep: 2.5,
      exhaustive: 4,
    };

    const multiplier = depthMultipliers[depth];

    // Estimated tokens per research phase
    const baseTokens = {
      queryAnalysis: 500,
      planning: 1500,
      perSource: 2000,
      refinement: 500, // per iteration
      synthesis: 4000,
      perFactCheck: 500,
      summary: 300,
    };

    // Number of iterations based on depth
    const iterations: Record<ResearchDepth, number> = {
      quick: 1,
      standard: 2,
      deep: 3,
      exhaustive: 4,
    };

    // Number of fact checks (roughly 30% of sources)
    const factChecks = Math.ceil(maxSources * 0.3);

    // Total estimated tokens
    const totalInputTokens = Math.ceil(
      (
        baseTokens.queryAnalysis +
        baseTokens.planning +
        (baseTokens.perSource * maxSources) +
        (baseTokens.refinement * iterations[depth]) +
        baseTokens.synthesis +
        (baseTokens.perFactCheck * factChecks) +
        baseTokens.summary
      ) * multiplier
    );

    // Estimate output tokens (roughly 40% of input for research tasks)
    const totalOutputTokens = Math.ceil(totalInputTokens * 0.4);

    // Calculate cost using the dynamic config
    const cost = this.dynamicConfig.calculateCost(
      defaultModel.id,
      totalInputTokens,
      totalOutputTokens,
    );

    this.logger.debug(
      `Research cost estimate - Depth: ${depth}, Sources: ${maxSources}, ` +
      `Input: ${totalInputTokens}, Output: ${totalOutputTokens}, ` +
      `Cost: ${formatCredits(cost.totalCost)}`
    );

    return cost.totalCost;
  }

  private async saveSessionToDatabase(session: ResearchSession): Promise<void> {
    try {
      await this.databaseService.query(
        `
        INSERT INTO research_sessions (
          id, user_id, query, options, status, progress, current_step,
          plan, sources, findings, synthesis, fact_check_results, outputs,
          error, started_at, completed_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          progress = EXCLUDED.progress,
          current_step = EXCLUDED.current_step,
          plan = EXCLUDED.plan,
          sources = EXCLUDED.sources,
          findings = EXCLUDED.findings,
          synthesis = EXCLUDED.synthesis,
          fact_check_results = EXCLUDED.fact_check_results,
          outputs = EXCLUDED.outputs,
          error = EXCLUDED.error,
          completed_at = EXCLUDED.completed_at,
          metadata = EXCLUDED.metadata
      `,
        [
          session.id,
          session.userId,
          session.query,
          JSON.stringify(session.options),
          session.status,
          session.progress,
          session.currentStep,
          JSON.stringify(session.plan || null),
          JSON.stringify(session.sources),
          JSON.stringify(session.findings),
          session.synthesis || null,
          JSON.stringify(session.factCheckResults),
          JSON.stringify(session.outputs),
          session.error || null,
          session.startedAt,
          session.completedAt || null,
          JSON.stringify(session.metadata),
        ],
      );
    } catch (error: any) {
      // Log but don't fail - we have in-memory backup
      this.logger.warn(`Failed to save session to database: ${error.message}`);
    }
  }

  private async loadSessionFromDatabase(sessionId: string): Promise<ResearchSession | null> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM research_sessions WHERE id = $1',
        [sessionId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.rowToSession(result.rows[0]);
    } catch (error: any) {
      this.logger.warn(`Failed to load session from database: ${error.message}`);
      return null;
    }
  }

  private rowToSession(row: any): ResearchSession {
    return {
      id: row.id,
      userId: row.user_id,
      query: row.query,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      status: row.status,
      progress: row.progress,
      currentStep: row.current_step,
      plan: row.plan ? (typeof row.plan === 'string' ? JSON.parse(row.plan) : row.plan) : undefined,
      sources: typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources || [],
      findings: typeof row.findings === 'string' ? JSON.parse(row.findings) : row.findings || [],
      synthesis: row.synthesis,
      factCheckResults: typeof row.fact_check_results === 'string'
        ? JSON.parse(row.fact_check_results)
        : row.fact_check_results || [],
      outputs: typeof row.outputs === 'string' ? JSON.parse(row.outputs) : row.outputs || [],
      error: row.error,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
    };
  }

  private async storeResearchEmbeddings(
    sessionId: string,
    userId: string,
    result: ResearchGraphState,
  ): Promise<void> {
    if (!this.qdrantService.isConfigured() || !this.aiService.isConfigured()) {
      return;
    }

    try {
      // Generate embeddings for key findings and synthesis
      const textsToEmbed: { id: string; text: string; type: string }[] = [];

      // Add synthesis
      if (result.synthesis) {
        textsToEmbed.push({
          id: `${sessionId}-synthesis`,
          text: result.synthesis.slice(0, 5000),
          type: 'synthesis',
        });
      }

      // Add key findings
      for (const finding of result.findings.slice(0, 20)) {
        textsToEmbed.push({
          id: `${sessionId}-${finding.id}`,
          text: `${finding.type}: ${finding.content}`,
          type: 'finding',
        });
      }

      if (textsToEmbed.length === 0) return;

      // Generate embeddings
      const embeddings = await this.aiService.generateEmbeddings(
        textsToEmbed.map((t) => t.text),
      );

      // Store in Qdrant
      const documents = textsToEmbed.map((item, index) => ({
        id: item.id,
        vector: embeddings[index],
        payload: {
          sessionId,
          userId,
          type: item.type,
          text: item.text.slice(0, 1000),
          query: result.query,
          createdAt: new Date().toISOString(),
        },
      }));

      await this.qdrantService.upsertVectors(this.RESEARCH_COLLECTION, documents);

      this.logger.debug(`Stored ${documents.length} embeddings for session ${sessionId}`);
    } catch (error: any) {
      this.logger.warn(`Failed to store research embeddings: ${error.message}`);
    }
  }

  private async textSearchResearch(
    userId: string,
    query: string,
    limit: number,
  ): Promise<ResearchSession[]> {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.store.sessions.values())
      .filter((s) => s.userId === userId)
      .filter((s) => s.status === 'completed')
      .filter(
        (s) =>
          s.query.toLowerCase().includes(lowerQuery) ||
          s.synthesis?.toLowerCase().includes(lowerQuery),
      )
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }
}
