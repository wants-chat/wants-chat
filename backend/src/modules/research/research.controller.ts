import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  StartResearchDto,
  CancelResearchDto,
  ListResearchSessionsDto,
  StartResearchResponseDto,
  CancelResearchResponseDto,
  ResearchSessionResponseDto,
  ResearchProgressDto,
  ResearchReportDto,
  PaginatedResearchSessionsDto,
} from './dto/research.dto';
import { ResearchStatus } from './interfaces/research.interface';

// ============================================
// Request Interface with User
// ============================================

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
    role?: string;
  };
}

// ============================================
// Research Controller
// ============================================

@ApiTags('Research')
@Controller('research')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResearchController {
  private readonly logger = new Logger(ResearchController.name);

  constructor(private readonly researchService: ResearchService) {}

  // ============================================
  // Start Research
  // ============================================

  @Post('start')
  @ApiOperation({
    summary: 'Start a new research session',
    description: 'Initiates a deep research workflow based on the provided query and options.',
  })
  @ApiResponse({
    status: 201,
    description: 'Research session started successfully',
    type: StartResearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async startResearch(
    @Body() dto: StartResearchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<StartResearchResponseDto> {
    const userId = req.user.userId;

    this.logger.log(`User ${userId} starting research: "${dto.query.slice(0, 50)}..."`);

    try {
      const result = await this.researchService.startResearch(dto, userId);

      return {
        success: true,
        sessionId: result.sessionId,
        message: result.message,
        estimatedTime: result.estimatedTime,
      };
    } catch (error: any) {
      this.logger.error(`Failed to start research: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to start research',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============================================
  // Get Research Status
  // ============================================

  @Get(':sessionId')
  @ApiOperation({
    summary: 'Get research session status',
    description: 'Retrieves the current status and progress of a research session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Research session ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Research session details',
    type: ResearchSessionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Research session not found',
  })
  async getResearchStatus(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResearchSessionResponseDto> {
    const userId = req.user.userId;

    try {
      const session = await this.researchService.getResearchStatus(sessionId, userId);

      return {
        id: session.id,
        query: session.query,
        status: session.status,
        progress: session.progress,
        currentStep: session.currentStep,
        sources: session.sources.map((s) => ({
          id: s.id,
          url: s.url,
          title: s.title,
          relevanceScore: s.relevanceScore,
          credibilityScore: s.credibilityScore,
          metadata: s.metadata,
        })),
        findings: session.findings.map((f) => ({
          id: f.id,
          sourceId: f.sourceId,
          sourceUrl: f.sourceUrl,
          type: f.type,
          content: f.content,
          confidence: f.confidence,
          tags: f.tags,
        })),
        synthesis: session.synthesis,
        outputs: session.outputs.map((o) => ({
          id: o.id,
          format: o.format,
          url: o.url,
          content: o.content,
          generatedAt: o.generatedAt,
        })),
        error: session.error,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw error;
      }
      this.logger.error(`Failed to get research status: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get research status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // Get Research Progress
  // ============================================

  @Get(':sessionId/progress')
  @ApiOperation({
    summary: 'Get research progress',
    description: 'Retrieves the current progress of a research session (lightweight endpoint).',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Research session ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Research progress',
    type: ResearchProgressDto,
  })
  async getResearchProgress(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResearchProgressDto> {
    const userId = req.user.userId;

    const session = await this.researchService.getResearchStatus(sessionId, userId);

    return {
      sessionId: session.id,
      status: session.status,
      progress: session.progress,
      currentStep: session.currentStep,
      message: this.getProgressMessage(session.status, session.progress),
      details: {
        sourcesFound: session.sources.length,
        sourcesProcessed: session.sources.length,
        findingsExtracted: session.findings.length,
      },
    };
  }

  // ============================================
  // Cancel Research
  // ============================================

  @Delete(':sessionId')
  @ApiOperation({
    summary: 'Cancel a research session',
    description: 'Cancels an in-progress research session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Research session ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Research session cancelled',
    type: CancelResearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel research (already completed/failed)',
  })
  @ApiResponse({
    status: 404,
    description: 'Research session not found',
  })
  async cancelResearch(
    @Param('sessionId') sessionId: string,
    @Body() dto: { reason?: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<CancelResearchResponseDto> {
    const userId = req.user.userId;

    this.logger.log(`User ${userId} cancelling research session: ${sessionId}`);

    try {
      await this.researchService.cancelResearch(sessionId, userId, dto.reason);

      return {
        success: true,
        message: 'Research session cancelled successfully',
      };
    } catch (error: any) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to cancel research',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // List Research Sessions
  // ============================================

  @Get()
  @ApiOperation({
    summary: 'List research sessions',
    description: 'Retrieves a paginated list of research sessions for the current user.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'planning', 'searching', 'extracting', 'analyzing', 'synthesizing', 'fact_checking', 'generating', 'completed', 'failed', 'cancelled'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page (default: 20, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of research sessions',
    type: PaginatedResearchSessionsDto,
  })
  async listResearchSessions(
    @Query() query: ListResearchSessionsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedResearchSessionsDto> {
    const userId = req.user.userId;

    const result = await this.researchService.listResearchSessions(userId, {
      status: query.status,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map((session) => ({
        id: session.id,
        query: session.query,
        status: session.status,
        progress: session.progress,
        currentStep: session.currentStep,
        sources: session.sources.map((s) => ({
          id: s.id,
          url: s.url,
          title: s.title,
          relevanceScore: s.relevanceScore,
          credibilityScore: s.credibilityScore,
          metadata: s.metadata,
        })),
        findings: session.findings.map((f) => ({
          id: f.id,
          sourceId: f.sourceId,
          sourceUrl: f.sourceUrl,
          type: f.type,
          content: f.content,
          confidence: f.confidence,
          tags: f.tags,
        })),
        synthesis: session.synthesis,
        outputs: session.outputs.map((o) => ({
          id: o.id,
          format: o.format,
          url: o.url,
          content: o.content,
          generatedAt: o.generatedAt,
        })),
        error: session.error,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ============================================
  // Get Research Report
  // ============================================

  @Get(':sessionId/report')
  @ApiOperation({
    summary: 'Get research report',
    description: 'Retrieves the generated report for a completed research session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Research session ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['markdown', 'json'],
    description: 'Report format (default: markdown)',
  })
  @ApiResponse({
    status: 200,
    description: 'Research report',
  })
  @ApiResponse({
    status: 400,
    description: 'Research not yet complete',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async getResearchReport(
    @Param('sessionId') sessionId: string,
    @Query('format') format: 'markdown' | 'json' = 'markdown',
    @Request() req: AuthenticatedRequest,
  ): Promise<{ content: string; format: string }> {
    const userId = req.user.userId;

    return this.researchService.getResearchReport(sessionId, userId, format);
  }

  // ============================================
  // Search Past Research
  // ============================================

  @Get('search/:query')
  @ApiOperation({
    summary: 'Search past research',
    description: 'Searches through past research sessions using semantic search.',
  })
  @ApiParam({
    name: 'query',
    description: 'Search query',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum results (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching research sessions',
  })
  async searchPastResearch(
    @Param('query') query: string,
    @Query('limit') limit: number = 10,
    @Request() req: AuthenticatedRequest,
  ): Promise<ResearchSessionResponseDto[]> {
    const userId = req.user.userId;

    const sessions = await this.researchService.searchPastResearch(userId, query, limit);

    return sessions.map((session) => ({
      id: session.id,
      query: session.query,
      status: session.status,
      progress: session.progress,
      currentStep: session.currentStep,
      sources: session.sources.map((s) => ({
        id: s.id,
        url: s.url,
        title: s.title,
        relevanceScore: s.relevanceScore,
        credibilityScore: s.credibilityScore,
        metadata: s.metadata,
      })),
      findings: session.findings.map((f) => ({
        id: f.id,
        sourceId: f.sourceId,
        sourceUrl: f.sourceUrl,
        type: f.type,
        content: f.content,
        confidence: f.confidence,
        tags: f.tags,
      })),
      synthesis: session.synthesis,
      outputs: session.outputs.map((o) => ({
        id: o.id,
        format: o.format,
        url: o.url,
        content: o.content,
        generatedAt: o.generatedAt,
      })),
      error: session.error,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    }));
  }

  // ============================================
  // Get Available Domains
  // ============================================

  @Get('config/domains')
  @ApiOperation({
    summary: 'Get available research domains',
    description: 'Returns the list of available research domains/topics for specialized handling.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available domains',
  })
  async getAvailableDomains(): Promise<{ domains: string[] }> {
    return {
      domains: ['general', 'medical', 'technology', 'finance', 'legal'],
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getProgressMessage(status: ResearchStatus, progress: number): string {
    const messages: Record<ResearchStatus, string> = {
      pending: 'Research is queued...',
      planning: 'Analyzing query and creating research plan...',
      searching: 'Searching for relevant sources...',
      extracting: 'Extracting content from sources...',
      analyzing: 'Analyzing findings...',
      synthesizing: 'Synthesizing research findings...',
      fact_checking: 'Verifying facts and sources...',
      generating: 'Generating final report...',
      completed: 'Research complete!',
      failed: 'Research failed',
      cancelled: 'Research was cancelled',
    };

    return messages[status] || `Progress: ${progress}%`;
  }
}
