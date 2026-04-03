import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { R2Service } from '../../storage/r2.service';
import { PdfProcessorService } from './processors/pdf-processor.service';
import {
  LibreOfficeConverterService,
  ConversionFormat,
} from './processors/libreoffice-converter.service';
import {
  validatePdfFile,
  validateImageFile,
  generateToolOutputPath,
} from '../common/utils/file-helper.util';
import {
  PdfSplitDto,
  PdfCompressDto,
  ImagesToPdfDto,
  PdfProcessResponseDto,
  PdfInfoResponseDto,
  PdfConversionFormat,
  PdfToDocumentResponseDto,
} from './dto/docs.dto';

@Injectable()
export class DocsService {
  private readonly logger = new Logger(DocsService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly pdfProcessor: PdfProcessorService,
    private readonly libreOfficeConverter: LibreOfficeConverterService,
  ) {}

  async getPdfInfo(file: Express.Multer.File): Promise<PdfInfoResponseDto> {
    validatePdfFile(file);
    const info = await this.pdfProcessor.getInfo(file.buffer);
    return {
      ...info,
      sizeBytes: file.size,
    };
  }

  async mergePdfs(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<PdfProcessResponseDto> {
    const startTime = Date.now();

    if (!files || files.length < 2) {
      throw new BadRequestException('At least 2 PDF files are required for merging');
    }

    for (const file of files) {
      validatePdfFile(file);
    }

    const buffers = files.map((f) => f.buffer);
    const mergedBuffer = await this.pdfProcessor.merge(buffers);
    const info = await this.pdfProcessor.getInfo(mergedBuffer);

    const path = generateToolOutputPath(userId, 'docs', 'merged', 'pdf');
    const url = await this.uploadToStorage(mergedBuffer, path);

    return {
      url,
      fileName: path.split('/').pop() || 'merged.pdf',
      pageCount: info.pageCount,
      sizeBytes: mergedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async splitPdf(
    file: Express.Multer.File,
    dto: PdfSplitDto,
    userId: string,
  ): Promise<{ urls: string[]; pageCount: number; processingTimeMs: number }> {
    const startTime = Date.now();
    validatePdfFile(file);

    const splitBuffers = await this.pdfProcessor.split(
      file.buffer,
      dto.pageRanges,
      dto.splitAll,
    );

    const urls: string[] = [];
    for (let i = 0; i < splitBuffers.length; i++) {
      const path = generateToolOutputPath(userId, 'docs', `split-${i + 1}`, 'pdf');
      const url = await this.uploadToStorage(splitBuffers[i], path);
      urls.push(url);
    }

    return {
      urls,
      pageCount: splitBuffers.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async compressPdf(
    file: Express.Multer.File,
    dto: PdfCompressDto,
    userId: string,
  ): Promise<PdfProcessResponseDto> {
    const startTime = Date.now();
    validatePdfFile(file);

    const compressedBuffer = await this.pdfProcessor.compress(
      file.buffer,
      dto.quality,
    );
    const info = await this.pdfProcessor.getInfo(compressedBuffer);

    const path = generateToolOutputPath(userId, 'docs', 'compressed', 'pdf');
    const url = await this.uploadToStorage(compressedBuffer, path);

    return {
      url,
      fileName: path.split('/').pop() || 'compressed.pdf',
      pageCount: info.pageCount,
      sizeBytes: compressedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async imagesToPdf(
    files: Express.Multer.File[],
    dto: ImagesToPdfDto,
    userId: string,
  ): Promise<PdfProcessResponseDto> {
    const startTime = Date.now();

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    for (const file of files) {
      validateImageFile(file);
    }

    const imageBuffers = files.map((f) => f.buffer);
    const pdfBuffer = await this.pdfProcessor.imagesToPdf(imageBuffers, {
      pageSize: dto.pageSize,
      orientation: dto.orientation,
      margin: dto.margin,
    });
    const info = await this.pdfProcessor.getInfo(pdfBuffer);

    const path = generateToolOutputPath(userId, 'docs', 'from-images', 'pdf');
    const url = await this.uploadToStorage(pdfBuffer, path);

    return {
      url,
      fileName: path.split('/').pop() || 'from-images.pdf',
      pageCount: info.pageCount,
      sizeBytes: pdfBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async addWatermark(
    file: Express.Multer.File,
    text: string,
    options: { fontSize?: number; opacity?: number },
    userId: string,
  ): Promise<PdfProcessResponseDto> {
    const startTime = Date.now();
    validatePdfFile(file);

    const watermarkedBuffer = await this.pdfProcessor.addWatermark(
      file.buffer,
      text,
      options,
    );
    const info = await this.pdfProcessor.getInfo(watermarkedBuffer);

    const path = generateToolOutputPath(userId, 'docs', 'watermarked', 'pdf');
    const url = await this.uploadToStorage(watermarkedBuffer, path);

    return {
      url,
      fileName: path.split('/').pop() || 'watermarked.pdf',
      pageCount: info.pageCount,
      sizeBytes: watermarkedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Convert PDF to Document (DOCX, XLSX, etc.) using LibreOffice
   */
  async convertPdfToDocument(
    file: Express.Multer.File,
    format: PdfConversionFormat,
    userId: string,
    outputName?: string,
  ): Promise<PdfToDocumentResponseDto> {
    const startTime = Date.now();

    // 1. Validate input
    if (!file) {
      throw new BadRequestException('No PDF file provided');
    }
    validatePdfFile(file);

    this.logger.log(`Converting PDF to ${format} for user ${userId}`);

    // 2. Convert using LibreOffice
    const result = await this.libreOfficeConverter.convertPdf(
      file.buffer,
      format as ConversionFormat,
      file.originalname,
    );

    // 3. Determine final filename
    const finalFileName = outputName
      ? `${outputName}.${format}`
      : result.convertedName;

    // 4. Upload to Fluxez storage
    const storagePath = generateToolOutputPath(userId, 'docs', 'converted', format);
    const url = await this.uploadConvertedFile(
      result.buffer,
      storagePath,
      this.getMimeTypeForFormat(format),
    );

    const processingTimeMs = Date.now() - startTime;

    this.logger.log(
      `Conversion complete: ${file.originalname} -> ${finalFileName} in ${processingTimeMs}ms`,
    );

    // 5. Return response
    return {
      url,
      fileName: finalFileName,
      originalFileName: file.originalname,
      format,
      sizeBytes: result.buffer.length,
      processingTimeMs,
    };
  }

  /**
   * Get MIME type for conversion format
   */
  private getMimeTypeForFormat(format: PdfConversionFormat): string {
    const mimeTypes: Record<PdfConversionFormat, string> = {
      [PdfConversionFormat.DOCX]:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      [PdfConversionFormat.XLSX]:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      [PdfConversionFormat.PPTX]:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      [PdfConversionFormat.TXT]: 'text/plain',
      [PdfConversionFormat.HTML]: 'text/html',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  /**
   * Upload converted file to storage
   */
  private async uploadConvertedFile(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string> {
    try {
      const url = await this.r2Service.uploadBuffer(buffer, path, contentType, {
        isPublic: true,
        metadata: { tool: 'docs', type: 'converted' },
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload converted file: ${error.message}`);
      throw new BadRequestException('Failed to upload converted file');
    }
  }

  private async uploadToStorage(buffer: Buffer, path: string): Promise<string> {
    try {
      const url = await this.r2Service.uploadBuffer(buffer, path, 'application/pdf', {
        isPublic: true,
        metadata: { tool: 'docs' },
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload processed file');
    }
  }
}
