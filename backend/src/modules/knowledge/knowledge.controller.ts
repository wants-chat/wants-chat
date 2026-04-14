import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentIngestionService, SUPPORTED_TYPES } from './document-ingestion.service';
import { QueryDocumentsDto } from './dto/knowledge.dto';
import * as path from 'path';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@Controller('api/v1/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly documentIngestionService: DocumentIngestionService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = path
          .extname(path.basename(file.originalname || ''))
          .slice(1)
          .toLowerCase();
        if (!SUPPORTED_TYPES.includes(ext)) {
          return cb(
            new BadRequestException(
              `Unsupported file type: .${ext}. Supported: ${SUPPORTED_TYPES.join(', ')}`,
            ),
            false,
          );
        }
        if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return cb(
            new BadRequestException(`Unsupported MIME type: ${file.mimetype}`),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.documentIngestionService.ingestDocument(userId, file);
  }

  @Get()
  async listDocuments(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.documentIngestionService.listDocuments(userId);
  }

  @Delete(':id')
  async deleteDocument(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    await this.documentIngestionService.deleteDocument(userId, id);
    return { deleted: true };
  }

  @Post('query')
  async queryDocuments(
    @Req() req: any,
    @Body() body: QueryDocumentsDto,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    if (!body.query) {
      throw new BadRequestException('Query is required');
    }

    const chunks = await this.documentIngestionService.queryDocuments(
      userId,
      body.query,
      body.topK || 5,
    );

    return { query: body.query, chunks };
  }
}
