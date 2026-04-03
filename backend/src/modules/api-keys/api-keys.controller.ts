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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiKeysService, CreateApiKeyDto } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // ============================================
  // CRUD Operations
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created' })
  async createApiKey(
    @Request() req,
    @Body() body: CreateApiKeyDto,
  ) {
    const { apiKey, fullKey } = await this.apiKeysService.createApiKey(
      req.user.sub,
      body,
    );

    return {
      success: true,
      message: 'API key created. Save the key now - it cannot be retrieved again.',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: fullKey,  // Only returned once!
        keyHint: `${apiKey.key_prefix}...${apiKey.key_hint}`,
        scopes: apiKey.scopes,
        rateLimit: apiKey.rate_limit,
        expiresAt: apiKey.expires_at,
        createdAt: apiKey.created_at,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'API keys listed' })
  async listApiKeys(@Request() req) {
    const keys = await this.apiKeysService.listApiKeys(req.user.sub);

    return {
      success: true,
      data: keys.map(key => ({
        id: key.id,
        name: key.name,
        keyHint: `${key.key_prefix}...${key.key_hint}`,
        scopes: key.scopes,
        rateLimit: key.rate_limit,
        lastUsedAt: key.last_used_at,
        usageCount: key.usage_count,
        isActive: key.is_active,
        expiresAt: key.expires_at,
        createdAt: key.created_at,
      })),
    };
  }

  @Get(':keyId')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiResponse({ status: 200, description: 'API key details' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async getApiKey(@Request() req, @Param('keyId') keyId: string) {
    const key = await this.apiKeysService.getApiKey(req.user.sub, keyId);

    if (!key) {
      return {
        success: false,
        message: 'API key not found',
      };
    }

    return {
      success: true,
      data: {
        id: key.id,
        name: key.name,
        keyHint: `${key.key_prefix}...${key.key_hint}`,
        scopes: key.scopes,
        rateLimit: key.rate_limit,
        lastUsedAt: key.last_used_at,
        usageCount: key.usage_count,
        isActive: key.is_active,
        expiresAt: key.expires_at,
        metadata: key.metadata,
        createdAt: key.created_at,
        updatedAt: key.updated_at,
      },
    };
  }

  @Put(':keyId')
  @ApiOperation({ summary: 'Update API key' })
  @ApiResponse({ status: 200, description: 'API key updated' })
  async updateApiKey(
    @Request() req,
    @Param('keyId') keyId: string,
    @Body() body: Partial<CreateApiKeyDto> & { is_active?: boolean },
  ) {
    const updated = await this.apiKeysService.updateApiKey(
      req.user.sub,
      keyId,
      body,
    );

    if (!updated) {
      return {
        success: false,
        message: 'API key not found',
      };
    }

    return {
      success: true,
      message: 'API key updated',
      data: {
        id: updated.id,
        name: updated.name,
        scopes: updated.scopes,
        rateLimit: updated.rate_limit,
        isActive: updated.is_active,
        expiresAt: updated.expires_at,
      },
    };
  }

  @Delete(':keyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete API key' })
  @ApiResponse({ status: 200, description: 'API key deleted' })
  async deleteApiKey(@Request() req, @Param('keyId') keyId: string) {
    const deleted = await this.apiKeysService.deleteApiKey(req.user.sub, keyId);

    return {
      success: deleted,
      message: deleted ? 'API key deleted' : 'API key not found',
    };
  }

  @Post(':keyId/regenerate')
  @ApiOperation({ summary: 'Regenerate API key (creates new key, keeps settings)' })
  @ApiResponse({ status: 200, description: 'API key regenerated' })
  async regenerateApiKey(@Request() req, @Param('keyId') keyId: string) {
    const result = await this.apiKeysService.regenerateApiKey(req.user.sub, keyId);

    if (!result) {
      return {
        success: false,
        message: 'API key not found',
      };
    }

    return {
      success: true,
      message: 'API key regenerated. Save the new key now - it cannot be retrieved again.',
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        key: result.fullKey,  // Only returned once!
        keyHint: `${result.apiKey.key_prefix}...${result.apiKey.key_hint}`,
      },
    };
  }

  // ============================================
  // Usage Statistics
  // ============================================

  @Get(':keyId/usage')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  async getUsageStats(
    @Request() req,
    @Param('keyId') keyId: string,
    @Query('days') days?: string,
  ) {
    const stats = await this.apiKeysService.getUsageStats(
      req.user.sub,
      keyId,
      days ? parseInt(days) : 30,
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get(':keyId/rate-limit')
  @ApiOperation({ summary: 'Check current rate limit status' })
  @ApiResponse({ status: 200, description: 'Rate limit status' })
  async checkRateLimit(@Request() req, @Param('keyId') keyId: string) {
    // Verify ownership first
    const key = await this.apiKeysService.getApiKey(req.user.sub, keyId);
    if (!key) {
      return {
        success: false,
        message: 'API key not found',
      };
    }

    const rateLimit = await this.apiKeysService.checkRateLimit(keyId);

    return {
      success: true,
      data: {
        limit: key.rate_limit,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.reset_at,
      },
    };
  }
}
