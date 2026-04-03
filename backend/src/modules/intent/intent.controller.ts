import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntentService, IntentPattern, UnifiedIntentClassification } from './intent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class DetectIntentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

class ConversationMessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

class ClassifyIntentDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  context?: ConversationMessageDto[];
}

class AddPatternDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  pattern: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsString()
  @IsNotEmpty()
  uiType: string;

  @IsString()
  @IsNotEmpty()
  serviceBackend: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

class AddPatternsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddPatternDto)
  patterns: AddPatternDto[];
}

@ApiTags('Intent')
@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  // ============================================
  // Intent Detection (Public for chat)
  // ============================================

  @Post('detect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detect intent from user message' })
  @ApiResponse({ status: 200, description: 'Intent detected' })
  async detectIntent(@Body() dto: DetectIntentDto) {
    return this.intentService.detectIntent(dto.message);
  }

  // ============================================
  // UNIFIED INTENT CLASSIFICATION (Fast, Public)
  // Single LLM call to classify ALL intent types
  // ============================================

  @Post('classify')
  @ApiOperation({
    summary: 'Unified intent classification',
    description: 'Fast, single LLM call to classify user intent into categories: app_creation, web_action, contextual_ui, workflow, existing_app, file_action, chat'
  })
  @ApiResponse({
    status: 200,
    description: 'Intent classified with extracted data',
    schema: {
      properties: {
        category: { type: 'string', enum: ['app_creation', 'web_action', 'contextual_ui', 'workflow', 'existing_app', 'file_action', 'chat'] },
        confidence: { type: 'number' },
        appDescription: { type: 'string', nullable: true },
        appType: { type: 'string', nullable: true },
        appFeatures: { type: 'array', items: { type: 'string' }, nullable: true },
        appVariant: { type: 'string', nullable: true },
        appColors: { type: 'array', items: { type: 'string' }, nullable: true },
        webAction: { type: 'string', nullable: true },
        url: { type: 'string', nullable: true },
        toolQuery: { type: 'string', nullable: true },
        toolCategory: { type: 'string', nullable: true },
        workflowDescription: { type: 'string', nullable: true },
        workflowSteps: { type: 'array', items: { type: 'string' }, nullable: true },
        existingAppQuery: { type: 'string', nullable: true },
        fileAction: { type: 'string', nullable: true },
        fileType: { type: 'string', nullable: true },
        targetType: { type: 'string', nullable: true },
        reason: { type: 'string', nullable: true },
      }
    }
  })
  async classifyIntent(@Body() dto: ClassifyIntentDto): Promise<UnifiedIntentClassification> {
    return this.intentService.classifyUnifiedIntent(dto.message, dto.context);
  }

  @Get('classify')
  @ApiOperation({ summary: 'Test unified classification with query param' })
  @ApiResponse({ status: 200, description: 'Intent classification test' })
  async testClassifyIntent(@Query('message') message: string): Promise<UnifiedIntentClassification> {
    if (!message) {
      return { category: 'chat', confidence: 0, reason: 'No message provided' };
    }
    return this.intentService.classifyUnifiedIntent(message);
  }

  // ============================================
  // Pattern Management (Admin)
  // ============================================

  @Get('patterns/count')
  @ApiOperation({ summary: 'Get pattern count' })
  @ApiResponse({ status: 200, description: 'Pattern count' })
  async getPatternCount() {
    const count = await this.intentService.getPatternCount();
    return { count };
  }

  @Get('patterns/category/:category')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patterns by category' })
  @ApiResponse({ status: 200, description: 'Patterns retrieved' })
  async getPatternsByCategory(@Param('category') category: string) {
    return this.intentService.getPatternsByCategory(category);
  }

  @Post('patterns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a single pattern' })
  @ApiResponse({ status: 201, description: 'Pattern added' })
  async addPattern(@Body() dto: AddPatternDto) {
    const success = await this.intentService.addPattern(dto as IntentPattern);
    return { success };
  }

  @Post('patterns/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add multiple patterns' })
  @ApiResponse({ status: 201, description: 'Patterns added' })
  async addPatterns(@Body() dto: AddPatternsDto) {
    return this.intentService.addPatterns(dto.patterns as IntentPattern[]);
  }

  @Delete('patterns/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pattern' })
  @ApiResponse({ status: 204, description: 'Pattern deleted' })
  async deletePattern(@Param('id') id: string) {
    await this.intentService.deletePattern(id);
  }

  @Delete('patterns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all patterns' })
  @ApiResponse({ status: 204, description: 'All patterns cleared' })
  async clearAllPatterns() {
    await this.intentService.clearAllPatterns();
  }

  // ============================================
  // Health Check & Debugging
  // ============================================

  @Get('health')
  @ApiOperation({ summary: 'Check intent service health' })
  @ApiResponse({ status: 200, description: 'Health status' })
  async getHealth() {
    return this.intentService.getHealth();
  }

  @Post('reseed-web-actions')
  @ApiOperation({ summary: 'Force reseed web action patterns' })
  @ApiResponse({ status: 200, description: 'Web action patterns reseeded' })
  async reseedWebActions() {
    // Manually trigger reseeding of web action patterns
    await this.intentService.seedWebActionPatterns();
    const count = await this.intentService.getPatternCount();
    const health = await this.intentService.getHealth();
    return {
      message: 'Web action patterns reseeded',
      patternCount: count,
      health,
    };
  }

  @Get('test-detect')
  @ApiOperation({ summary: 'Test intent detection with a message' })
  @ApiResponse({ status: 200, description: 'Intent detection test' })
  async testDetect(@Query('message') message: string) {
    if (!message) {
      return { error: 'Message query parameter required' };
    }
    return this.intentService.detectIntent(message);
  }
}
