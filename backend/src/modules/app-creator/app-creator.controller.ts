import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AppCreatorService } from './app-creator.service';
import { CreateAppDto, AnalyzePromptDto, GeneratedApp, EnhancedAppAnalysis } from './dto/create-app.dto';

@ApiTags('AppCreator')
@Controller('app-creator')
export class AppCreatorController {
  constructor(private readonly appCreatorService: AppCreatorService) {}

  /**
   * POST /app-creator/create
   * Main endpoint to create an app from a prompt
   */
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create an app from a prompt',
    description: 'Analyzes the prompt and generates React frontend + Hono backend code',
  })
  @ApiBody({ type: CreateAppDto })
  @ApiResponse({
    status: 200,
    description: 'App created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '5ea674a0-f893-46a6-980e-83c46004e847' },
            name: { type: 'string', example: 'Task Manager' },
            slug: { type: 'string', example: 'a-todo-app-with-tasks' },
            prompt: { type: 'string' },
            outputPath: { type: 'string', example: '/path/to/generated/app-creator/5ea674a0-f893-46a6-980e-83c46004e847' },
            frontend: {
              type: 'object',
              properties: {
                framework: { type: 'string', example: 'react' },
                path: { type: 'string' },
                fileCount: { type: 'number', example: 15 },
              },
            },
            backend: {
              type: 'object',
              properties: {
                framework: { type: 'string', example: 'hono' },
                path: { type: 'string' },
                fileCount: { type: 'number', example: 10 },
              },
            },
            schema: { type: 'object' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  async createApp(
    @Body() dto: CreateAppDto,
    @Request() req: any,
  ): Promise<{ success: boolean; data: GeneratedApp }> {
    // Auto-populate userId from authenticated user if not provided
    if (!dto.userId && req.user) {
      dto.userId = req.user.userId || req.user.id || req.user.sub;
    }

    const result = await this.appCreatorService.createApp(dto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /app-creator/analyze
   * Analyze a prompt without generating the full app
   * Useful for previewing what will be created
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze a prompt',
    description: 'Analyzes the prompt to extract app type, entities, and features without full generation',
  })
  @ApiBody({ type: AnalyzePromptDto })
  @ApiResponse({
    status: 200,
    description: 'Prompt analyzed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            appType: { type: 'string', example: 'todo' },
            features: { type: 'array', items: { type: 'string' } },
            entities: { type: 'array', items: { type: 'object' } },
            uiComponents: { type: 'array', items: { type: 'string' } },
            apiEndpoints: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  async analyzePrompt(
    @Body() dto: AnalyzePromptDto,
  ): Promise<{ success: boolean; data: EnhancedAppAnalysis }> {
    const analysis = await this.appCreatorService.analyzePrompt(dto.prompt);

    return {
      success: true,
      data: analysis,
    };
  }

  /**
   * GET /app-creator/health
   * Health check endpoint
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'app-creator',
    };
  }
}
