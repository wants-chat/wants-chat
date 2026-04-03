import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ToolSearchService } from './tool-search.service';
import { ToolSearchQueryDto, ToolSearchResponse } from './dto/tool-search.dto';

@Controller('tools')
export class ToolSearchController {
  constructor(private readonly toolSearchService: ToolSearchService) {}

  /**
   * Search tools using semantic vector search (public endpoint)
   * GET /api/v1/tools/search?q=poetry&limit=8
   */
  @Get('search')
  async searchTools(@Query() query: ToolSearchQueryDto): Promise<ToolSearchResponse> {
    return this.toolSearchService.searchTools(
      query.q,
      query.limit || 8,
      query.category,
    );
  }

  /**
   * Get tool count in the collection (public endpoint)
   * GET /api/v1/tools/count
   */
  @Get('count')
  async getToolCount(): Promise<{ count: number; isSeeded: boolean }> {
    const count = await this.toolSearchService.getToolCount();
    return {
      count,
      isSeeded: this.toolSearchService.isSeeded(),
    };
  }

  /**
   * Seed tool embeddings (admin only - for now just protected by auth)
   * POST /api/v1/tools/seed
   */
  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async seedTools(
    @Body()
    body: {
      tools: Array<{
        id: string;
        title: string;
        description: string;
        category: string;
        categoryName: string;
        type: string;
        icon: string;
        synonyms?: string[];
        useCases?: string[];
        multilingual?: string[];
      }>;
    },
  ): Promise<{ success: number; failed: number; total: number }> {
    const result = await this.toolSearchService.seedTools(body.tools);
    return {
      ...result,
      total: body.tools.length,
    };
  }

  /**
   * Clear all tool embeddings (admin only)
   * POST /api/v1/tools/clear
   */
  @Post('clear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async clearTools(): Promise<{ success: boolean }> {
    const success = await this.toolSearchService.clearAllTools();
    return { success };
  }
}
