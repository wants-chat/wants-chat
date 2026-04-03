/**
 * Tools API Controller
 * Serves tools data from the single source of truth
 */
import { Controller, Get, Param, Query, SetMetadata } from '@nestjs/common';
import {
  allTools,
  toolCategories,
  getToolsByCategory,
  getToolById,
  searchTools,
  getTotalToolsCount,
  toolExists,
  categoryNames,
  ToolData,
  ToolCategory,
} from '../../data/tools-registry';

// Public decorator to bypass API key auth
const Public = () => SetMetadata('isPublic', true);

@Controller('tools-registry')
export class ToolsApiController {
  /**
   * GET /api/v1/tools
   * Get all tools or filter by category
   */
  @Get()
  @Public()
  getAllTools(@Query('category') category?: string): ToolData[] {
    if (category) {
      return getToolsByCategory(category);
    }
    return allTools;
  }

  /**
   * GET /api/v1/tools/categories
   * Get all tool categories
   */
  @Get('categories')
  @Public()
  getCategories(): ToolCategory[] {
    return toolCategories;
  }

  /**
   * GET /api/v1/tools/search
   * Search tools by query
   */
  @Get('search')
  @Public()
  search(@Query('q') query: string): ToolData[] {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return searchTools(query);
  }

  /**
   * GET /api/v1/tools/stats
   * Get tools statistics
   */
  @Get('stats')
  @Public()
  getStats(): { total: number; categories: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    toolCategories.forEach(cat => {
      byCategory[cat.id] = getToolsByCategory(cat.id).length;
    });

    return {
      total: getTotalToolsCount(),
      categories: toolCategories.length,
      byCategory,
    };
  }

  /**
   * GET /api/v1/tools/exists/:id
   * Check if a tool exists
   */
  @Get('exists/:id')
  @Public()
  checkExists(@Param('id') id: string): { exists: boolean; tool?: ToolData } {
    const exists = toolExists(id);
    return {
      exists,
      tool: exists ? getToolById(id) : undefined,
    };
  }

  /**
   * GET /api/v1/tools/:id
   * Get a specific tool by ID
   */
  @Get(':id')
  @Public()
  getToolByIdEndpoint(@Param('id') id: string): ToolData | { error: string } {
    const tool = getToolById(id);
    if (!tool) {
      return { error: `Tool '${id}' not found` };
    }
    return tool;
  }
}
