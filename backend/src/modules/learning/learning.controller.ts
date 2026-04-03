import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LearningService } from './learning.service';
import {
  TutoringRequestDto,
  TutoringResponseDto,
  SummarizeRequestDto,
  SummaryResponseDto,
  PlanRequestDto,
  PlanResponseDto,
  WritingRequestDto,
  WritingResponseDto,
  LearningResponseDto,
} from './dto/learning.dto';

@ApiTags('Learning & Productivity')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // ============================================
  // Tutoring Endpoints
  // ============================================

  @Post('tutor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tutoring explanation',
    description: 'Explain a concept with adaptive difficulty and optional quiz questions',
  })
  @ApiResponse({
    status: 200,
    description: 'Tutoring response with explanation and optional quiz',
    type: TutoringResponseDto,
  })
  async tutor(
    @Request() req,
    @Body() dto: TutoringRequestDto,
  ): Promise<TutoringResponseDto> {
    return this.learningService.tutor({
      ...dto,
      userId: req.user?.userId || req.user?.id || req.user?.sub,
    });
  }

  // ============================================
  // Summarization Endpoints
  // ============================================

  @Post('summarize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Summarize content',
    description: 'Summarize text, URL, or file content with key points extraction',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary with key points and themes',
    type: SummaryResponseDto,
  })
  async summarize(
    @Request() req,
    @Body() dto: SummarizeRequestDto,
  ): Promise<SummaryResponseDto> {
    return this.learningService.summarize({
      ...dto,
      userId: req.user?.userId || req.user?.id || req.user?.sub,
    });
  }

  // ============================================
  // Planning Endpoints
  // ============================================

  @Post('plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a plan',
    description: 'Create schedules, goal plans, project plans, or study plans',
  })
  @ApiResponse({
    status: 200,
    description: 'Generated plan with milestones and actions',
    type: PlanResponseDto,
  })
  async plan(
    @Request() req,
    @Body() dto: PlanRequestDto,
  ): Promise<PlanResponseDto> {
    return this.learningService.plan({
      ...dto,
      userId: req.user?.userId || req.user?.id || req.user?.sub,
    });
  }

  // ============================================
  // Writing Endpoints
  // ============================================

  @Post('write')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Writing assistance',
    description: 'Compose emails, essays, reports, proofread, or adjust tone',
  })
  @ApiResponse({
    status: 200,
    description: 'Written content with analysis',
    type: WritingResponseDto,
  })
  async write(
    @Request() req,
    @Body() dto: WritingRequestDto,
  ): Promise<WritingResponseDto> {
    return this.learningService.write({
      ...dto,
      userId: req.user?.userId || req.user?.id || req.user?.sub,
    });
  }

  // ============================================
  // Generic Learning Endpoint
  // ============================================

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process learning request',
    description: 'Generic endpoint for processing any learning/productivity request',
  })
  @ApiResponse({
    status: 200,
    description: 'Learning response',
    type: LearningResponseDto,
  })
  async process(
    @Request() req,
    @Body() body: { type: string; query: string; metadata?: Record<string, any> },
  ): Promise<LearningResponseDto> {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;

    return this.learningService.processLearningRequest({
      type: body.type as any,
      query: body.query,
      userId,
      metadata: body.metadata,
    });
  }
}
