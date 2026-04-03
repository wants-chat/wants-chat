import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Response,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { ToolDataService } from '../tool-data/tool-data.service';
import { ApiKeyAuthGuard, RequireScopes } from '../api-keys/api-key-auth.guard';
import { ApiKeysService } from '../api-keys/api-keys.service';

@ApiTags('API v1 - Tools')
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key for authentication',
  required: true,
})
@UseGuards(ApiKeyAuthGuard)
@Controller('tools')
export class V1ToolDataController {
  private readonly logger = new Logger(V1ToolDataController.name);

  constructor(
    private readonly toolDataService: ToolDataService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  // ============================================
  // List Tools
  // ============================================

  @Get()
  @RequireScopes('read')
  @ApiOperation({ summary: 'List all tools with saved data' })
  @ApiResponse({ status: 200, description: 'List of tools with data' })
  async listTools(@Request() req) {
    const startTime = Date.now();

    try {
      const summary = await this.toolDataService.getToolDataSummary(req.user.sub);

      await this.logRequest(req, 200, Date.now() - startTime);

      return {
        success: true,
        data: summary.map(s => ({
          toolId: s.tool_id,
          recordCount: s.record_count,
          lastUpdated: s.last_updated,
        })),
        meta: {
          total: summary.length,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  // ============================================
  // Get Tool Data
  // ============================================

  @Get(':toolId')
  @RequireScopes('read')
  @ApiOperation({ summary: 'Get all data for a specific tool' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier (e.g., "insurance-quote")' })
  @ApiResponse({ status: 200, description: 'Tool data retrieved' })
  @ApiResponse({ status: 404, description: 'No data found' })
  async getToolData(@Request() req, @Param('toolId') toolId: string) {
    const startTime = Date.now();

    try {
      const data = await this.toolDataService.getToolData(req.user.sub, toolId);

      await this.logRequest(req, data ? 200 : 404, Date.now() - startTime);

      if (!data) {
        return {
          success: true,
          data: { items: [] },
          meta: {
            toolId,
            recordCount: 0,
          },
        };
      }

      // Extract items array from data
      const items = data.data?.items || data.data?.data || [];

      return {
        success: true,
        data: {
          items: Array.isArray(items) ? items : [],
          ...data.data,
        },
        meta: {
          toolId,
          version: data.version,
          recordCount: Array.isArray(items) ? items.length : 0,
          updatedAt: data.updated_at,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  @Get(':toolId/:itemId')
  @RequireScopes('read')
  @ApiOperation({ summary: 'Get a specific item from tool data' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'itemId', description: 'The item ID within the tool data' })
  @ApiResponse({ status: 200, description: 'Item found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getToolDataItem(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('itemId') itemId: string,
  ) {
    const startTime = Date.now();

    try {
      const data = await this.toolDataService.getToolData(req.user.sub, toolId);

      if (!data) {
        await this.logRequest(req, 404, Date.now() - startTime);
        return {
          success: false,
          error: 'Tool data not found',
        };
      }

      const items = data.data?.items || data.data?.data || [];
      const item = Array.isArray(items)
        ? items.find((i: any) => i.id === itemId || i.id === parseInt(itemId))
        : null;

      await this.logRequest(req, item ? 200 : 404, Date.now() - startTime);

      if (!item) {
        return {
          success: false,
          error: 'Item not found',
        };
      }

      return {
        success: true,
        data: item,
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  // ============================================
  // Create/Update Tool Data
  // ============================================

  @Post(':toolId')
  @RequireScopes('write')
  @ApiOperation({ summary: 'Add a new item to tool data' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 201, description: 'Item created' })
  async createToolDataItem(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: Record<string, any>,
  ) {
    const startTime = Date.now();

    try {
      // Get existing data
      const existing = await this.toolDataService.getToolData(req.user.sub, toolId);
      const items = existing?.data?.items || existing?.data?.data || [];

      // Generate ID if not provided
      const newItem = {
        id: body.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add new item
      const updatedItems = [...(Array.isArray(items) ? items : []), newItem];

      // Save
      const result = await this.toolDataService.saveToolData(req.user.sub, toolId, {
        ...existing?.data,
        items: updatedItems,
      });

      await this.logRequest(req, 201, Date.now() - startTime);

      return {
        success: true,
        data: newItem,
        meta: {
          version: result.version,
          totalItems: updatedItems.length,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  @Put(':toolId')
  @RequireScopes('write')
  @ApiOperation({ summary: 'Replace all tool data' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Data replaced' })
  async replaceToolData(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { items?: any[]; data?: any },
  ) {
    const startTime = Date.now();

    try {
      const result = await this.toolDataService.saveToolData(
        req.user.sub,
        toolId,
        body,
      );

      await this.logRequest(req, 200, Date.now() - startTime);

      const items = body.items || body.data || [];

      return {
        success: true,
        message: 'Data saved successfully',
        meta: {
          version: result.version,
          recordCount: Array.isArray(items) ? items.length : 0,
          updatedAt: result.updated_at,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  @Put(':toolId/:itemId')
  @RequireScopes('write')
  @ApiOperation({ summary: 'Update a specific item' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'itemId', description: 'The item ID to update' })
  @ApiResponse({ status: 200, description: 'Item updated' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async updateToolDataItem(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('itemId') itemId: string,
    @Body() updates: Record<string, any>,
  ) {
    const startTime = Date.now();

    try {
      const existing = await this.toolDataService.getToolData(req.user.sub, toolId);

      if (!existing) {
        await this.logRequest(req, 404, Date.now() - startTime);
        return {
          success: false,
          error: 'Tool data not found',
        };
      }

      const items = existing.data?.items || existing.data?.data || [];
      const itemIndex = Array.isArray(items)
        ? items.findIndex((i: any) => i.id === itemId || i.id === parseInt(itemId))
        : -1;

      if (itemIndex === -1) {
        await this.logRequest(req, 404, Date.now() - startTime);
        return {
          success: false,
          error: 'Item not found',
        };
      }

      // Update item
      const updatedItem = {
        ...items[itemIndex],
        ...updates,
        id: items[itemIndex].id, // Preserve original ID
        updatedAt: new Date().toISOString(),
      };

      items[itemIndex] = updatedItem;

      // Save
      const result = await this.toolDataService.saveToolData(req.user.sub, toolId, {
        ...existing.data,
        items,
      });

      await this.logRequest(req, 200, Date.now() - startTime);

      return {
        success: true,
        data: updatedItem,
        meta: {
          version: result.version,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  // ============================================
  // Delete Operations
  // ============================================

  @Delete(':toolId')
  @RequireScopes('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all data for a tool' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Data deleted' })
  async deleteToolData(@Request() req, @Param('toolId') toolId: string) {
    const startTime = Date.now();

    try {
      const deleted = await this.toolDataService.deleteToolData(req.user.sub, toolId);

      await this.logRequest(req, deleted ? 200 : 404, Date.now() - startTime);

      return {
        success: deleted,
        message: deleted ? 'Tool data deleted' : 'No data found to delete',
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  @Delete(':toolId/:itemId')
  @RequireScopes('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specific item' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiParam({ name: 'itemId', description: 'The item ID to delete' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async deleteToolDataItem(
    @Request() req,
    @Param('toolId') toolId: string,
    @Param('itemId') itemId: string,
  ) {
    const startTime = Date.now();

    try {
      const existing = await this.toolDataService.getToolData(req.user.sub, toolId);

      if (!existing) {
        await this.logRequest(req, 404, Date.now() - startTime);
        return {
          success: false,
          error: 'Tool data not found',
        };
      }

      const items = existing.data?.items || existing.data?.data || [];
      const itemIndex = Array.isArray(items)
        ? items.findIndex((i: any) => i.id === itemId || i.id === parseInt(itemId))
        : -1;

      if (itemIndex === -1) {
        await this.logRequest(req, 404, Date.now() - startTime);
        return {
          success: false,
          error: 'Item not found',
        };
      }

      // Remove item
      items.splice(itemIndex, 1);

      // Save
      const result = await this.toolDataService.saveToolData(req.user.sub, toolId, {
        ...existing.data,
        items,
      });

      await this.logRequest(req, 200, Date.now() - startTime);

      return {
        success: true,
        message: 'Item deleted',
        meta: {
          version: result.version,
          remainingItems: items.length,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  // ============================================
  // Bulk Operations
  // ============================================

  @Post(':toolId/bulk')
  @RequireScopes('write')
  @ApiOperation({ summary: 'Bulk create/update items' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiQuery({ name: 'mode', enum: ['append', 'replace'], description: 'Bulk mode (default: append)' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  async bulkCreateItems(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() body: { items: any[] },
    @Query('mode') mode: string = 'append',
  ) {
    const startTime = Date.now();

    try {
      if (!Array.isArray(body.items)) {
        return {
          success: false,
          error: 'items must be an array',
        };
      }

      const existing = await this.toolDataService.getToolData(req.user.sub, toolId);
      let items: any[] = [];

      if (mode === 'append') {
        items = existing?.data?.items || existing?.data?.data || [];
      }

      // Process new items
      const newItems = body.items.map(item => ({
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      items = [...items, ...newItems];

      // Save
      const result = await this.toolDataService.saveToolData(req.user.sub, toolId, {
        ...existing?.data,
        items,
      });

      await this.logRequest(req, 200, Date.now() - startTime);

      return {
        success: true,
        message: `${newItems.length} items processed`,
        meta: {
          version: result.version,
          processedCount: newItems.length,
          totalItems: items.length,
        },
      };
    } catch (error) {
      await this.logRequest(req, 500, Date.now() - startTime, error.message);
      throw error;
    }
  }

  // ============================================
  // Private Helpers
  // ============================================

  private async logRequest(
    req: any,
    statusCode: number,
    responseTimeMs: number,
    errorMessage?: string,
  ): Promise<void> {
    if (req.apiKeyId) {
      await this.apiKeysService.logUsage({
        api_key_id: req.apiKeyId,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers?.['user-agent'] || '',
        request_body_size: JSON.stringify(req.body || {}).length,
        response_body_size: 0,
        error_message: errorMessage || null,
      });
    }
  }
}
