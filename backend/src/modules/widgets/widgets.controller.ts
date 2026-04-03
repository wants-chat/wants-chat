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
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  WidgetsService,
  CreateWidgetConfigDto,
  UpdateWidgetConfigDto,
} from './widgets.service';
import { ToolDataService } from '../tool-data/tool-data.service';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';

@ApiTags('Widgets')
@Controller('widgets')
export class WidgetsController {
  private readonly logger = new Logger(WidgetsController.name);

  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly toolDataService: ToolDataService,
    private readonly customFieldsService: CustomFieldsService,
  ) {}

  // ============================================
  // Protected Routes (JWT Auth)
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all widget configurations for user' })
  @ApiResponse({ status: 200, description: 'List of widget configs' })
  async getUserWidgets(@Request() req) {
    const userId = req.user.sub || req.user.id;
    const configs = await this.widgetsService.getUserWidgetConfigs(userId);

    return {
      success: true,
      data: configs,
      meta: {
        total: configs.length,
      },
    };
  }

  @Get(':toolId/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get widget configuration for a tool' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Widget configuration' })
  async getWidgetConfig(
    @Request() req,
    @Param('toolId') toolId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const config = await this.widgetsService.getWidgetConfig(userId, toolId);

    if (!config) {
      return {
        success: true,
        data: null,
        message: 'No widget configuration found. Create one to enable embedding.',
      };
    }

    // Generate embed codes
    const baseUrl = process.env.WIDGET_BASE_URL || process.env.BASE_URL || 'https://api.wants.chat';
    const embedCodes = this.widgetsService.generateEmbedCode(config, baseUrl);

    return {
      success: true,
      data: {
        ...config,
        embedCode: embedCodes,
      },
    };
  }

  @Post(':toolId/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create widget configuration for a tool' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 201, description: 'Widget configuration created' })
  async createWidgetConfig(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() dto: CreateWidgetConfigDto,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const config = await this.widgetsService.createWidgetConfig(userId, toolId, dto);
      const baseUrl = process.env.WIDGET_BASE_URL || process.env.BASE_URL || 'https://api.wants.chat';
      const embedCodes = this.widgetsService.generateEmbedCode(config, baseUrl);

      return {
        success: true,
        data: {
          ...config,
          embedCode: embedCodes,
        },
      };
    } catch (error) {
      this.logger.error(`Error creating widget config: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put(':toolId/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update widget configuration' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Widget configuration updated' })
  async updateWidgetConfig(
    @Request() req,
    @Param('toolId') toolId: string,
    @Body() dto: UpdateWidgetConfigDto,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const config = await this.widgetsService.updateWidgetConfig(userId, toolId, dto);

      if (!config) {
        return {
          success: false,
          error: 'Widget configuration not found',
        };
      }

      const baseUrl = process.env.WIDGET_BASE_URL || process.env.BASE_URL || 'https://api.wants.chat';
      const embedCodes = this.widgetsService.generateEmbedCode(config, baseUrl);

      return {
        success: true,
        data: {
          ...config,
          embedCode: embedCodes,
        },
      };
    } catch (error) {
      this.logger.error(`Error updating widget config: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':toolId/regenerate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate widget embed token' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Token regenerated' })
  async regenerateToken(
    @Request() req,
    @Param('toolId') toolId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const newToken = await this.widgetsService.regenerateEmbedToken(userId, toolId);

    if (!newToken) {
      return {
        success: false,
        error: 'Widget configuration not found',
      };
    }

    return {
      success: true,
      data: { embed_token: newToken },
      message: 'Embed token regenerated. Old embed codes will no longer work.',
    };
  }

  @Delete(':toolId/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete widget configuration' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiResponse({ status: 200, description: 'Widget configuration deleted' })
  async deleteWidgetConfig(
    @Request() req,
    @Param('toolId') toolId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const deleted = await this.widgetsService.deleteWidgetConfig(userId, toolId);

    return {
      success: deleted,
      message: deleted ? 'Widget configuration deleted' : 'Widget configuration not found',
    };
  }

  @Get(':toolId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get widget embed statistics' })
  @ApiParam({ name: 'toolId', description: 'The tool identifier' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Widget statistics' })
  async getWidgetStats(
    @Request() req,
    @Param('toolId') toolId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.sub || req.user.id;

    try {
      const stats = await this.widgetsService.getEmbedStats(
        userId,
        toolId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting widget stats: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================
  // Public Routes (Embed Token Auth)
  // ============================================

  @Get('embed/:token')
  @ApiOperation({ summary: 'Get widget data by embed token (public)' })
  @ApiParam({ name: 'token', description: 'The widget embed token' })
  @ApiResponse({ status: 200, description: 'Widget data and config' })
  async getWidgetEmbed(
    @Param('token') token: string,
    @Headers('referer') referer: string,
    @Headers('user-agent') userAgent: string,
    @Request() req,
  ) {
    const config = await this.widgetsService.getWidgetConfigByToken(token);

    if (!config) {
      return {
        success: false,
        error: 'Invalid or inactive widget token',
      };
    }

    // Validate domain
    if (referer) {
      try {
        const url = new URL(referer);
        if (!this.widgetsService.validateDomain(config, url.hostname)) {
          return {
            success: false,
            error: 'Domain not allowed for this widget',
          };
        }
      } catch {
        // Invalid referer, allow for now
      }
    }

    // Log the embed event
    await this.widgetsService.logEmbedEvent(config.id, 'load', {}, {
      referrer_url: referer,
      user_agent: userAgent,
      ip_address: req.ip || req.connection?.remoteAddress,
    });

    // Get tool data
    const toolData = await this.toolDataService.getToolData(config.user_id, config.tool_id);
    const items = toolData?.data?.items || toolData?.data?.data || [];

    // Get custom fields
    const customFields = await this.customFieldsService.getCustomFields(
      config.user_id,
      config.tool_id,
    );

    return {
      success: true,
      data: {
        config: {
          theme: config.theme,
          primary_color: config.primary_color,
          border_radius: config.border_radius,
          show_header: config.show_header,
          show_footer: config.show_footer,
          widget_name: config.widget_name,
          custom_css: config.custom_css,
        },
        items: Array.isArray(items) ? items : [],
        customFields: customFields.map(f => ({
          key: f.field_key,
          name: f.field_name,
          type: f.field_type,
          options: f.field_options,
          required: f.is_required,
        })),
        meta: {
          tool_id: config.tool_id,
          record_count: Array.isArray(items) ? items.length : 0,
        },
      },
    };
  }

  @Post('embed/:token/event')
  @ApiOperation({ summary: 'Log a widget event (public)' })
  @ApiParam({ name: 'token', description: 'The widget embed token' })
  @ApiResponse({ status: 200, description: 'Event logged' })
  async logWidgetEvent(
    @Param('token') token: string,
    @Body() body: { event_type: string; event_data?: Record<string, any> },
    @Headers('referer') referer: string,
    @Headers('user-agent') userAgent: string,
    @Request() req,
  ) {
    const config = await this.widgetsService.getWidgetConfigByToken(token);

    if (!config) {
      return {
        success: false,
        error: 'Invalid or inactive widget token',
      };
    }

    await this.widgetsService.logEmbedEvent(
      config.id,
      body.event_type,
      body.event_data || {},
      {
        referrer_url: referer,
        user_agent: userAgent,
        ip_address: req.ip || req.connection?.remoteAddress,
      },
    );

    return {
      success: true,
      message: 'Event logged',
    };
  }
}
