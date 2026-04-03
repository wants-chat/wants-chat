import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as multer from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocsService } from './docs.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { FILE_SIZE_LIMITS, ALLOWED_IMAGE_MIMES } from '../common/utils/file-helper.util';
import {
  PdfSplitDto,
  PdfCompressDto,
  ImagesToPdfDto,
  PdfProcessResponseDto,
  PdfInfoResponseDto,
  PdfToDocumentDto,
  PdfToDocumentResponseDto,
  PdfConversionFormat,
} from './dto/docs.dto';

const pdfUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.DOCUMENT },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
};

const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
};

@ApiTags('Tools - Docs')
@Controller('tools/docs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('pdf/info')
  @ApiOperation({ summary: 'Get PDF information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: PdfInfoResponseDto })
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async getPdfInfo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ data: PdfInfoResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.getPdfInfo(file);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-info',
      inputSizeBytes: file.size,
      status: 'completed',
      metadata: result,
    });

    return { data: result };
  }

  @Post('pdf/merge')
  @ApiOperation({ summary: 'Merge multiple PDFs into one' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 200, type: PdfProcessResponseDto })
  @UseInterceptors(FilesInterceptor('files', 20, pdfUploadOptions))
  async mergePdfs(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ): Promise<{ data: PdfProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.mergePdfs(files, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-merge',
      inputSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { fileCount: files.length, pageCount: result.pageCount },
    });

    return { data: result };
  }

  @Post('pdf/split')
  @ApiOperation({ summary: 'Split PDF into multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        pageRanges: { type: 'string', example: '1-3,5,7-9' },
        splitAll: { type: 'boolean' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200 })
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async splitPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PdfSplitDto,
    @Request() req: any,
  ): Promise<{ data: { urls: string[]; pageCount: number; processingTimeMs: number } }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.splitPdf(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-split',
      inputSizeBytes: file.size,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { outputCount: result.pageCount },
    });

    return { data: result };
  }

  @Post('pdf/compress')
  @ApiOperation({ summary: 'Compress PDF file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        quality: { type: 'number', example: 80 },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: PdfProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async compressPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PdfCompressDto,
    @Request() req: any,
  ): Promise<{ data: PdfProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.compressPdf(file, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-compress',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: {
        compressionRatio: ((1 - result.sizeBytes / file.size) * 100).toFixed(1) + '%',
      },
    });

    return { data: result };
  }

  @Post('pdf/from-images')
  @ApiOperation({ summary: 'Create PDF from images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        pageSize: { type: 'string', enum: ['A4', 'LETTER', 'LEGAL'] },
        orientation: { type: 'string', enum: ['portrait', 'landscape'] },
        margin: { type: 'number' },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 200, type: PdfProcessResponseDto })
  @UseInterceptors(FilesInterceptor('files', 50, imageUploadOptions))
  async imagesToPdf(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: ImagesToPdfDto,
    @Request() req: any,
  ): Promise<{ data: PdfProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.imagesToPdf(files, dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'images-to-pdf',
      inputSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { imageCount: files.length, pageCount: result.pageCount },
    });

    return { data: result };
  }

  @Post('pdf/watermark')
  @ApiOperation({ summary: 'Add watermark to PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        text: { type: 'string' },
        fontSize: { type: 'number' },
        opacity: { type: 'number' },
      },
      required: ['file', 'text'],
    },
  })
  @ApiResponse({ status: 200, type: PdfProcessResponseDto })
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async addWatermark(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { text: string; fontSize?: number; opacity?: number },
    @Request() req: any,
  ): Promise<{ data: PdfProcessResponseDto }> {
    const userId = req.user.sub || req.user.userId;
    const result = await this.docsService.addWatermark(
      file,
      body.text,
      { fontSize: body.fontSize, opacity: body.opacity },
      userId,
    );

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-watermark',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: { watermarkText: body.text },
    });

    return { data: result };
  }

  @Post('pdf/convert')
  @ApiOperation({
    summary: 'Convert PDF to Document (DOCX, XLSX, etc.)',
    description:
      'Converts a PDF file to Word, Excel, PowerPoint, Text, or HTML format using LibreOffice.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to convert',
        },
        format: {
          type: 'string',
          enum: ['docx', 'xlsx', 'pptx', 'txt', 'html'],
          description: 'Output format',
          example: 'docx',
        },
        outputName: {
          type: 'string',
          description: 'Custom output filename (optional, without extension)',
        },
      },
      required: ['file', 'format'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PDF converted successfully',
    type: PdfToDocumentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or format',
  })
  @ApiResponse({
    status: 500,
    description: 'LibreOffice not available or conversion failed',
  })
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async convertPdfToDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PdfToDocumentDto,
    @Request() req: any,
  ): Promise<{ data: PdfToDocumentResponseDto }> {
    const userId = req.user.sub || req.user.userId;

    const result = await this.docsService.convertPdfToDocument(
      file,
      dto.format,
      userId,
      dto.outputName,
    );

    // Log tool usage
    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'docs',
      toolName: 'pdf-convert',
      inputSizeBytes: file.size,
      outputSizeBytes: result.sizeBytes,
      outputFileUrl: result.url,
      processingTimeMs: result.processingTimeMs,
      status: 'completed',
      metadata: {
        inputFormat: 'pdf',
        outputFormat: dto.format,
        originalFileName: file.originalname,
        convertedFileName: result.fileName,
      },
    });

    return { data: result };
  }
}
