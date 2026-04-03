import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn, IsBoolean } from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ContentService, CreateContentDto as ServiceCreateContentDto } from './content.service';

// DTOs
class CreateContentDto {
  @IsIn(['image', 'video', 'logo', 'pdf', 'audio', 'text'])
  contentType: 'image' | 'video' | 'logo' | 'pdf' | 'audio' | 'text';

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}

class ContentQueryDto {
  @IsOptional()
  @IsIn(['image', 'video', 'logo', 'pdf', 'audio', 'text'])
  contentType?: string;

  @IsOptional()
  @IsString()
  isFavorite?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}

@ApiTags('Content')
@Controller('content')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  // ============================================
  // CREATE CONTENT
  // ============================================

  @Post()
  @ApiOperation({
    summary: 'Create new content entry',
    description: 'Save a new content item (image, video, logo, etc.) to the user library',
  })
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createContent(@Request() req, @Body() dto: CreateContentDto) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const content = await this.contentService.createContent(userId, dto as ServiceCreateContentDto);

      return {
        success: true,
        data: this.transformContent(content),
      };
    } catch (error) {
      this.logger.error('Create content failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to create content',
      };
    }
  }

  // ============================================
  // LIST CONTENT
  // ============================================

  @Get()
  @ApiOperation({
    summary: 'List user content',
    description: 'Get paginated list of user content with optional filters',
  })
  @ApiQuery({ name: 'contentType', required: false, enum: ['image', 'video', 'logo', 'pdf', 'audio'] })
  @ApiQuery({ name: 'isFavorite', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'Content list retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listContent(@Request() req, @Query() query: ContentQueryDto) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const result = await this.contentService.listContent(userId, {
        contentType: query.contentType,
        isFavorite: query.isFavorite === 'true' ? true : query.isFavorite === 'false' ? false : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
        offset: query.offset ? parseInt(query.offset, 10) : undefined,
        orderBy: query.orderBy,
        order: query.order,
      });

      return {
        success: true,
        data: {
          items: result.items.map(this.transformContent),
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      };
    } catch (error) {
      this.logger.error('List content failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to list content',
      };
    }
  }

  // ============================================
  // GET SINGLE CONTENT
  // ============================================

  @Get('stats')
  @ApiOperation({
    summary: 'Get content statistics',
    description: 'Get statistics about user content (total, by type, favorites, recent)',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Request() req) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const stats = await this.contentService.getContentStats(userId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Get stats failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to get statistics',
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get content by ID',
    description: 'Get a single content item by its ID',
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getContent(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const content = await this.contentService.getContent(userId, id);

      return {
        success: true,
        data: this.transformContent(content),
      };
    } catch (error) {
      this.logger.error('Get content failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to get content',
      };
    }
  }

  // ============================================
  // UPDATE CONTENT
  // ============================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update content',
    description: 'Update content title, favorite status, or metadata',
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiBody({ type: UpdateContentDto })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateContent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const content = await this.contentService.updateContent(userId, id, {
        title: dto.title,
        is_favorite: dto.isFavorite,
        metadata: dto.metadata,
      });

      return {
        success: true,
        data: this.transformContent(content),
      };
    } catch (error) {
      this.logger.error('Update content failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to update content',
      };
    }
  }

  // ============================================
  // TOGGLE FAVORITE
  // ============================================

  @Post(':id/favorite')
  @ApiOperation({
    summary: 'Toggle favorite status',
    description: 'Toggle the favorite status of a content item',
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Favorite toggled successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleFavorite(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const content = await this.contentService.toggleFavorite(userId, id);

      return {
        success: true,
        data: this.transformContent(content),
      };
    } catch (error) {
      this.logger.error('Toggle favorite failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to toggle favorite',
      };
    }
  }

  // ============================================
  // DELETE CONTENT
  // ============================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete content',
    description: 'Delete a content item',
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteContent(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      await this.contentService.deleteContent(userId, id);

      return {
        success: true,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      this.logger.error('Delete content failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to delete content',
      };
    }
  }

  // ============================================
  // GET SIGNED URL
  // ============================================

  @Get(':id/signed-url')
  @ApiOperation({
    summary: 'Get signed URL',
    description: 'Get a time-limited signed URL for private content',
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiQuery({ name: 'expiresIn', required: false, type: Number, description: 'URL expiration time in seconds' })
  @ApiResponse({ status: 200, description: 'Signed URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSignedUrl(
    @Request() req,
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    try {
      const userId = req.user?.sub || req.user?.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }

      const url = await this.contentService.getSignedUrl(
        userId,
        id,
        expiresIn ? parseInt(expiresIn, 10) : undefined,
      );

      return {
        success: true,
        data: { url },
      };
    } catch (error) {
      this.logger.error('Get signed URL failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to get signed URL',
      };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private transformContent(content: any) {
    return {
      id: content.id,
      userId: content.user_id,
      contentType: content.content_type,
      url: content.url,
      thumbnailUrl: content.thumbnail_url,
      filename: content.filename,
      title: content.title,
      prompt: content.prompt,
      model: content.model,
      width: content.width,
      height: content.height,
      duration: content.duration,
      size: content.size,
      metadata: content.metadata,
      isFavorite: content.is_favorite,
      createdAt: content.created_at,
      updatedAt: content.updated_at,
    };
  }
}
