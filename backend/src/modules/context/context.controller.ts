import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContextService } from './context.service';
import { ChatExtractionService } from './chat-extraction.service';
import {
  SaveUIHistoryDto,
  GetUIHistoryDto,
  SaveChatContextDto,
  GetChatContextQueryDto,
  BulkSaveChatContextDto,
  ValidateChatContextDto,
  GetMergedContextDto,
  EntityType,
  ExtractToolPrefillDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; userId?: string };
}

@Controller('context')
@UseGuards(JwtAuthGuard)
export class ContextController {
  constructor(
    private readonly contextService: ContextService,
    private readonly chatExtractionService: ChatExtractionService,
  ) {}

  // ============================================
  // MERGED CONTEXT (Main Endpoint)
  // ============================================

  @Get('merged')
  async getMergedContext(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetMergedContextDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.getMergedContext(
      userId,
      query.ui_type,
      query.organization_id,
      query.project_id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Context retrieved successfully',
      data: result,
    };
  }

  // ============================================
  // UI HISTORY
  // ============================================

  @Post('ui-history')
  async saveUIHistory(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveUIHistoryDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.saveUIHistory(userId, dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'UI history saved successfully',
      data: result,
    };
  }

  @Get('ui-history')
  async getUIHistory(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetUIHistoryDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.getUIHistory(
      userId,
      query.ui_type,
      query.organization_id,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result ? 'UI history found' : 'No UI history found',
      data: result,
    };
  }

  @Get('ui-histories')
  async getUserUIHistories(
    @Req() req: AuthenticatedRequest,
    @Query('organization_id') organizationId?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.getUserUIHistories(
      userId,
      organizationId,
      limit ? parseInt(limit, 10) : undefined,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'UI histories retrieved',
      data: result,
    };
  }

  @Delete('ui-history')
  async clearUIHistory(
    @Req() req: AuthenticatedRequest,
    @Query('ui_type') uiType?: string,
    @Query('organization_id') organizationId?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const deletedCount = await this.contextService.clearUIHistory(
      userId,
      uiType,
      organizationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Cleared ${deletedCount} UI history entries`,
      data: { deletedCount },
    };
  }

  // ============================================
  // CHAT CONTEXT
  // ============================================

  @Post('chat-context')
  async saveChatContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveChatContextDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.saveChatContext(userId, dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Chat context saved successfully',
      data: result,
    };
  }

  @Post('chat-context/bulk')
  async bulkSaveChatContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkSaveChatContextDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.bulkSaveChatContext(userId, dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: `Saved ${result.length} chat context entities`,
      data: result,
    };
  }

  @Post('chat-context/validate')
  async validateChatContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ValidateChatContextDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.validateChatContext(userId, dto);

    return {
      statusCode: HttpStatus.OK,
      message: result
        ? 'Chat context validated successfully'
        : 'Chat context not found',
      data: result,
    };
  }

  @Get('chat-context')
  async getChatContext(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetChatContextQueryDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.getChatContext(userId, query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Chat context retrieved',
      data: result,
    };
  }

  @Delete('chat-context')
  async clearChatContext(
    @Req() req: AuthenticatedRequest,
    @Query('entity_types') entityTypesParam?: string,
    @Query('project_id') projectId?: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    const entityTypes = entityTypesParam
      ? (entityTypesParam.split(',') as EntityType[])
      : undefined;

    const clearedCount = await this.contextService.clearChatContext(
      userId,
      entityTypes,
      projectId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Cleared ${clearedCount} chat context entities`,
      data: { clearedCount },
    };
  }

  // ============================================
  // TOOL PREFILL EXTRACTION
  // ============================================

  /**
   * Extract form prefill values for a tool using LLM
   * This is the proper way to extract user intent - handles any language/phrasing
   */
  @Post('tool-prefill')
  async extractToolPrefill(@Body() dto: ExtractToolPrefillDto) {
    // Add default form fields if not provided
    if (!dto.form_fields || dto.form_fields.length === 0) {
      dto.form_fields = this.chatExtractionService
        .getToolFieldMappings(dto.tool_id)
        .map((f) => ({
          name: f.name,
          type: f.type as 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date',
          label: f.label,
        }));
    }

    const result = await this.chatExtractionService.extractToolPrefill(dto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Tool prefill extracted',
      data: result,
    };
  }

  // ============================================
  // STATS
  // ============================================

  @Get('stats')
  async getContextStats(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub || req.user.userId;
    const result = await this.contextService.getContextStats(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Context stats retrieved',
      data: result,
    };
  }
}
