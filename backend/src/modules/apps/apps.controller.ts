import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppsService, CreateAppDto, UpdateAppDto, UpdateGitHubSyncDto, AppQueryOptions } from './apps.service';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  /**
   * Create a new app
   */
  @Post()
  async createApp(@Req() req: any, @Body() dto: CreateAppDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.createApp(userId, dto);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * List apps with optional filters
   */
  @Get()
  async listApps(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('hasGitHub') hasGitHub?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    const options: AppQueryOptions = {
      status,
      search,
      orderBy,
      order,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    if (isFavorite !== undefined) {
      options.isFavorite = isFavorite === 'true';
    }

    if (hasGitHub !== undefined) {
      options.hasGitHub = hasGitHub === 'true';
    }

    const result = await this.appsService.listApps(userId, options);

    return {
      success: true,
      data: {
        items: result.items.map((app) => this.appsService.transformApp(app)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    };
  }

  /**
   * Get app statistics
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const stats = await this.appsService.getAppStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get app by conversation ID
   */
  @Get('by-conversation/:conversationId')
  async getAppByConversationId(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.getAppByConversationId(userId, conversationId);
    if (!app) {
      return {
        success: false,
        error: 'No app found for this conversation',
      };
    }
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Get a single app by ID
   */
  @Get(':id')
  async getApp(@Req() req: any, @Param('id') appId: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.getApp(userId, appId);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Update an app
   */
  @Put(':id')
  async updateApp(
    @Req() req: any,
    @Param('id') appId: string,
    @Body() dto: UpdateAppDto,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.updateApp(userId, appId, dto);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Partial update an app
   */
  @Patch(':id')
  async patchApp(
    @Req() req: any,
    @Param('id') appId: string,
    @Body() dto: Partial<UpdateAppDto>,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.updateApp(userId, appId, dto);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Toggle favorite status
   */
  @Post(':id/favorite')
  async toggleFavorite(@Req() req: any, @Param('id') appId: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.toggleFavorite(userId, appId);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Update GitHub sync info
   */
  @Put(':id/github')
  async updateGitHubSync(
    @Req() req: any,
    @Param('id') appId: string,
    @Body() dto: UpdateGitHubSyncDto,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.updateGitHubSync(userId, appId, dto);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Clear GitHub sync info
   */
  @Delete(':id/github')
  async clearGitHubSync(@Req() req: any, @Param('id') appId: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const app = await this.appsService.clearGitHubSync(userId, appId);
    return {
      success: true,
      data: this.appsService.transformApp(app),
    };
  }

  /**
   * Delete an app
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteApp(@Req() req: any, @Param('id') appId: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    await this.appsService.deleteApp(userId, appId);
    return {
      success: true,
      message: 'App deleted successfully',
    };
  }
}
