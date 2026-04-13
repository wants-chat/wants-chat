import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginFilterDto } from './dto';

@Controller('api/v1/plugins')
export class PluginsController {
  constructor(private readonly pluginRegistry: PluginRegistryService) {}

  /**
   * POST /api/v1/plugins - Register a plugin (admin only for now, guarded by auth)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerPlugin(
    @Body() body: { manifest: any },
  ) {
    return this.pluginRegistry.registerPlugin(body.manifest);
  }

  /**
   * GET /api/v1/plugins - List available plugins (public)
   */
  @Get()
  async listPlugins(
    @Query('search') search?: string,
    @Query('is_active') isActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: PluginFilterDto = {};
    if (search) filters.search = search;
    if (isActive !== undefined) filters.is_active = isActive === 'true';
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    return this.pluginRegistry.listPlugins(filters);
  }

  /**
   * GET /api/v1/plugins/:id - Plugin details (public)
   */
  @Get(':id')
  async getPlugin(@Param('id') id: string) {
    return this.pluginRegistry.getPlugin(id);
  }

  /**
   * POST /api/v1/plugins/:id/enable - Enable a plugin for the authenticated user
   */
  @Post(':id/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enablePlugin(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.pluginRegistry.enablePlugin(id, userId);
  }

  /**
   * POST /api/v1/plugins/:id/disable - Disable a plugin for the authenticated user
   */
  @Post(':id/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disablePlugin(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    await this.pluginRegistry.disablePlugin(id, userId);
    return { success: true };
  }

  /**
   * POST /api/v1/plugins/:id/tools/:toolName/execute - Execute a plugin tool
   */
  @Post(':id/tools/:toolName/execute')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async executePluginTool(
    @Param('id') id: string,
    @Param('toolName') toolName: string,
    @Body() input: Record<string, any>,
    @Req() req: any,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.pluginRegistry.executePluginTool(id, toolName, input, userId);
  }
}
