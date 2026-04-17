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
  Res,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatFileService } from './chat-file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

class UpdateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;

  @IsOptional()
  @IsBoolean()
  is_pinned?: boolean;

  @IsOptional()
  @IsString()
  model?: string;
}

class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  fileContext?: string;
}

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatFileService: ChatFileService,
  ) {}

  // ============================================
  // Conversations
  // ============================================

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getConversations(
    @Request() req,
    @Query('archived') archived?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getConversations(req.user.sub, {
      archived: archived === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a single conversation' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.getConversation(id, req.user.sub);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createConversation(
    @Request() req,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(req.user.sub, dto);
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    console.log(`📝 [Controller] updateConversation called for ${id}`);
    console.log(`📝 [Controller] DTO received:`, JSON.stringify(dto));
    console.log(`📝 [Controller] DTO keys:`, Object.keys(dto));
    const result = await this.chatService.updateConversation(id, req.user.sub, dto);
    console.log(`📝 [Controller] Result:`, JSON.stringify(result));
    return result;
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 204, description: 'Conversation deleted' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(@Request() req, @Param('id') id: string) {
    await this.chatService.deleteConversation(id, req.user.sub);
  }

  // ============================================
  // Messages
  // ============================================

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getMessages(id, req.user.sub, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message and get AI response' })
  @ApiResponse({ status: 201, description: 'Message sent and response received' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, req.user.sub, dto.content, dto.model, dto.fileContext);
  }

  @Post('conversations/:id/messages/stream')
  @ApiOperation({ summary: 'Send a message and stream AI response' })
  @ApiResponse({ status: 200, description: 'Streaming response' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessageStream(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.chatService.sendMessageStream(
        id,
        req.user.sub,
        dto.content,
        dto.model,
      );

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  // ============================================
  // Quick Actions
  // ============================================

  @Post('quick')
  @ApiOperation({ summary: 'Quick chat - creates conversation and sends message' })
  @ApiResponse({ status: 201, description: 'Conversation created and message sent' })
  async quickChat(@Request() req, @Body() dto: SendMessageDto) {
    return this.chatService.quickChat(req.user.sub, dto.content, dto.model);
  }

  // ============================================
  // File Upload
  // ============================================

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'conversationId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        conversationId: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file for chat context' })
  @ApiResponse({ status: 201, description: 'File uploaded and text extracted' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing conversation ID' })
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('conversationId') conversationId: string,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    // Verify conversation ownership
    await this.chatService.getConversation(conversationId, userId);

    const chatFile = await this.chatFileService.uploadAndExtract(userId, conversationId, file);
    return this.transformFile(chatFile);
  }

  @Get('files/:conversationId')
  @ApiOperation({ summary: 'List files uploaded in a conversation' })
  @ApiResponse({ status: 200, description: 'Files listed' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async listFiles(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    // Verify conversation ownership
    await this.chatService.getConversation(conversationId, userId);

    const files = await this.chatFileService.listFiles(conversationId, userId);
    return files.map((f) => this.transformFile(f));
  }

  private transformFile(file: any) {
    if (!file) return null;
    return {
      id: file.id,
      userId: file.user_id,
      conversationId: file.conversation_id,
      filename: file.filename,
      fileType: file.file_type,
      fileSize: file.file_size,
      extractedText: file.extracted_text,
      storagePath: file.storage_path,
      createdAt: file.created_at,
    };
  }

  // ============================================
  // Backfill Operations
  // ============================================

  @Post('backfill-titles')
  @ApiOperation({ summary: 'Backfill missing titles for conversations' })
  @ApiResponse({ status: 200, description: 'Backfill completed' })
  async backfillTitles(@Request() req) {
    // Only backfill for current user's conversations
    return this.chatService.backfillMissingTitles(req.user.sub);
  }
}
