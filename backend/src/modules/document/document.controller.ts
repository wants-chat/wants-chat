import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Request,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentService, GenerationOptions } from './document.service';
import {
  GeneratePdfDto,
  GenerateDocxDto,
  GeneratePptxDto,
  GenerateMarkdownDto,
  ConvertFormatDto,
  GenerateFromTemplateDto,
  DocumentGenerationResult,
  AvailableTemplatesResponse,
  BatchGenerateDto,
  BatchGenerationResult,
  DocumentFormat,
} from './dto/document.dto';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Generate PDF document
   */
  @Post('pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate PDF from markdown or HTML content' })
  @ApiResponse({ status: 201, description: 'PDF generated successfully' })
  @ApiQuery({ name: 'upload', required: false, type: Boolean, description: 'Upload to storage' })
  @ApiQuery({ name: 'download', required: false, type: Boolean, description: 'Return as download' })
  async generatePdf(
    @Request() req: any,
    @Body() dto: GeneratePdfDto,
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/pdf',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.generatePdf(
      dto.content,
      dto.options || {},
      dto.contentType || 'markdown',
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename || 'document'}.pdf"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Generate Word document
   */
  @Post('docx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Word document from markdown content' })
  @ApiResponse({ status: 201, description: 'DOCX generated successfully' })
  @ApiQuery({ name: 'upload', required: false, type: Boolean, description: 'Upload to storage' })
  @ApiQuery({ name: 'download', required: false, type: Boolean, description: 'Return as download' })
  async generateDocx(
    @Request() req: any,
    @Body() dto: GenerateDocxDto,
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/docx',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.generateDocx(
      dto.content,
      dto.options || {},
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename || 'document'}.docx"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Generate PowerPoint presentation
   */
  @Post('pptx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate PowerPoint presentation from slides' })
  @ApiResponse({ status: 201, description: 'PPTX generated successfully' })
  @ApiQuery({ name: 'upload', required: false, type: Boolean, description: 'Upload to storage' })
  @ApiQuery({ name: 'download', required: false, type: Boolean, description: 'Return as download' })
  async generatePptx(
    @Request() req: any,
    @Body() dto: GeneratePptxDto,
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/pptx',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.generatePptx(
      dto.slides,
      dto.options || {},
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename || 'presentation'}.pptx"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Generate PowerPoint from markdown
   */
  @Post('pptx/from-markdown')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate PowerPoint presentation from markdown (use --- as slide separator)' })
  @ApiResponse({ status: 201, description: 'PPTX generated successfully' })
  async generatePptxFromMarkdown(
    @Request() req: any,
    @Body() body: { content: string; options?: any; filename?: string },
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/pptx',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.generatePptxFromMarkdown(
      body.content,
      body.options || {},
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${body.filename || 'presentation'}.pptx"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Generate Markdown document
   */
  @Post('markdown')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Format content as Markdown' })
  @ApiResponse({ status: 201, description: 'Markdown generated successfully' })
  async generateMarkdown(
    @Request() req: any,
    @Body() dto: GenerateMarkdownDto,
    @Query('upload') upload?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/markdown',
      isPublic: false,
      userId,
      returnBase64: true,
    };

    const result = await this.documentService.generateMarkdown(
      dto.content,
      dto.contentType || 'text',
      dto.options || {},
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Convert between formats
   */
  @Post('convert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Convert between document formats' })
  @ApiResponse({ status: 201, description: 'Document converted successfully' })
  async convertFormat(
    @Request() req: any,
    @Body() dto: ConvertFormatDto,
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/converted',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.convertFormat(
      dto.source,
      dto.fromFormat,
      dto.toFormat,
      dto.options || {},
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename || 'converted'}.${dto.toFormat}"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Generate from template
   */
  @Post('template')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate document from template' })
  @ApiResponse({ status: 201, description: 'Document generated from template' })
  async generateFromTemplate(
    @Request() req: any,
    @Body() dto: GenerateFromTemplateDto,
    @Query('upload') upload?: string,
    @Query('download') download?: string,
    @Res() res?: Response,
  ): Promise<DocumentGenerationResult | void> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';
    const shouldDownload = download === 'true';

    // Convert variables array to object
    const variablesObj: Record<string, any> = {};
    for (const variable of dto.variables) {
      variablesObj[variable.name] = variable.value;
    }

    const options: GenerationOptions = {
      uploadToStorage: shouldUpload,
      storagePath: 'documents/templates',
      isPublic: false,
      userId,
      returnBase64: !shouldUpload && !shouldDownload,
    };

    const result = await this.documentService.generateFromTemplate(
      dto.templateName,
      variablesObj,
      dto.outputFormat,
      options,
    );

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    if (shouldDownload && result.base64 && res) {
      const buffer = Buffer.from(result.base64, 'base64');
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');

      const extension = this.getExtension(dto.outputFormat);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${dto.filename || dto.templateName}.${extension}"`,
      );
      res.setHeader('Content-Length', buffer.length);
      res.status(HttpStatus.OK).send(buffer);
      return;
    }

    res?.status(HttpStatus.CREATED).json(result);
  }

  /**
   * Batch generate documents
   */
  @Post('batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate multiple documents in batch' })
  @ApiResponse({ status: 201, description: 'Batch generation completed' })
  async batchGenerate(
    @Request() req: any,
    @Body() dto: BatchGenerateDto,
    @Query('upload') upload?: string,
  ): Promise<BatchGenerationResult> {
    const userId = req.user?.sub || req.user?.userId;
    const shouldUpload = upload === 'true';

    const results: DocumentGenerationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const docRequest of dto.documents) {
      const options: GenerationOptions = {
        uploadToStorage: shouldUpload,
        storagePath: `documents/batch/${docRequest.format}`,
        isPublic: false,
        userId,
        returnBase64: !shouldUpload,
      };

      let result: DocumentGenerationResult;

      try {
        switch (docRequest.format) {
          case DocumentFormat.PDF:
            result = await this.documentService.generatePdf(
              docRequest.content,
              docRequest.options || {},
              'markdown',
              options,
            );
            break;

          case DocumentFormat.DOCX:
            result = await this.documentService.generateDocx(
              docRequest.content,
              docRequest.options || {},
              options,
            );
            break;

          case DocumentFormat.PPTX:
            result = await this.documentService.generatePptxFromMarkdown(
              docRequest.content,
              docRequest.options || {},
              options,
            );
            break;

          case DocumentFormat.MARKDOWN:
            result = await this.documentService.generateMarkdown(
              docRequest.content,
              'text',
              docRequest.options || {},
              options,
            );
            break;

          default:
            result = {
              success: false,
              error: `Unsupported format: ${docRequest.format}`,
            };
        }
      } catch (error) {
        result = {
          success: false,
          error: error.message || 'Generation failed',
        };
      }

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      results.push(result);
    }

    return {
      total: dto.documents.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Get available templates
   */
  @Get('templates')
  @ApiOperation({ summary: 'Get list of available document templates' })
  @ApiResponse({ status: 200, description: 'List of available templates' })
  getTemplates(): AvailableTemplatesResponse {
    return this.documentService.getAvailableTemplates();
  }

  /**
   * Get supported formats
   */
  @Get('formats')
  @ApiOperation({ summary: 'Get supported document formats and conversions' })
  @ApiResponse({ status: 200, description: 'Supported formats information' })
  getSupportedFormats(): object {
    return {
      formats: Object.values(DocumentFormat),
      generation: {
        pdf: {
          description: 'Generate PDF from markdown or HTML',
          inputTypes: ['markdown', 'html'],
        },
        docx: {
          description: 'Generate Word document from markdown',
          inputTypes: ['markdown'],
        },
        pptx: {
          description: 'Generate PowerPoint presentation',
          inputTypes: ['slides', 'markdown'],
        },
        markdown: {
          description: 'Generate/format markdown',
          inputTypes: ['html', 'text', 'json'],
        },
      },
      conversions: [
        { from: 'markdown', to: ['pdf', 'docx', 'pptx', 'html'] },
        { from: 'html', to: ['pdf', 'markdown'] },
      ],
    };
  }

  /**
   * Get file extension for format
   */
  private getExtension(format: DocumentFormat): string {
    const extensions: Record<DocumentFormat, string> = {
      [DocumentFormat.PDF]: 'pdf',
      [DocumentFormat.DOCX]: 'docx',
      [DocumentFormat.PPTX]: 'pptx',
      [DocumentFormat.MARKDOWN]: 'md',
      [DocumentFormat.HTML]: 'html',
    };
    return extensions[format] || 'bin';
  }
}
