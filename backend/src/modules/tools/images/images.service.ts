import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { R2Service } from '../../storage/r2.service';
import { SharpProcessorService } from './processors/sharp-processor.service';
import { BackgroundRemoverService } from './processors/background-remover.service';
import {
  validateImageFile,
  generateToolOutputPath,
  getMimeFromExtension,
} from '../common/utils/file-helper.util';
import {
  ImageCompressDto,
  ImageResizeDto,
  ImageCropDto,
  ImageConvertDto,
  ImageToBase64Dto,
  RemoveBackgroundDto,
  ImageProcessResponseDto,
  ImageInfoResponseDto,
  ImageToBase64ResponseDto,
  ImageFormat,
  ImageResizeFromUrlDto,
  RemoveBackgroundFromUrlDto,
  ImageConvertFromUrlDto,
} from './dto/images.dto';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly r2Service: R2Service,
    private readonly sharpProcessor: SharpProcessorService,
    private readonly bgRemover: BackgroundRemoverService,
  ) {}

  async getImageInfo(file: Express.Multer.File): Promise<ImageInfoResponseDto> {
    validateImageFile(file);
    const metadata = await this.sharpProcessor.getMetadata(file.buffer);
    return metadata;
  }

  async compress(
    file: Express.Multer.File,
    dto: ImageCompressDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();
    validateImageFile(file);

    const processedBuffer = await this.sharpProcessor.compress(file.buffer, dto);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    // Upload to storage
    const ext = this.getExtensionFromFormat(metadata.format);
    const path = generateToolOutputPath(userId, 'images', 'compress', ext);
    const url = await this.uploadToStorage(processedBuffer, path, getMimeFromExtension(ext));

    return {
      url,
      fileName: path.split('/').pop() || 'compressed',
      mimeType: getMimeFromExtension(ext),
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async resize(
    file: Express.Multer.File,
    dto: ImageResizeDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();
    validateImageFile(file);

    if (!dto.width && !dto.height) {
      throw new BadRequestException('At least width or height must be specified');
    }

    const processedBuffer = await this.sharpProcessor.resize(file.buffer, dto);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const ext = this.getExtensionFromFormat(metadata.format);
    const path = generateToolOutputPath(userId, 'images', 'resize', ext);
    const url = await this.uploadToStorage(processedBuffer, path, getMimeFromExtension(ext));

    return {
      url,
      fileName: path.split('/').pop() || 'resized',
      mimeType: getMimeFromExtension(ext),
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async crop(
    file: Express.Multer.File,
    dto: ImageCropDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();
    validateImageFile(file);

    // Validate crop dimensions against image size
    const originalMetadata = await this.sharpProcessor.getMetadata(file.buffer);
    if (dto.left + dto.width > originalMetadata.width || dto.top + dto.height > originalMetadata.height) {
      throw new BadRequestException('Crop area exceeds image dimensions');
    }

    const processedBuffer = await this.sharpProcessor.crop(file.buffer, dto);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const ext = this.getExtensionFromFormat(metadata.format);
    const path = generateToolOutputPath(userId, 'images', 'crop', ext);
    const url = await this.uploadToStorage(processedBuffer, path, getMimeFromExtension(ext));

    return {
      url,
      fileName: path.split('/').pop() || 'cropped',
      mimeType: getMimeFromExtension(ext),
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async convert(
    file: Express.Multer.File,
    dto: ImageConvertDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();
    validateImageFile(file);

    const processedBuffer = await this.sharpProcessor.convert(file.buffer, dto);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const ext = dto.format;
    const path = generateToolOutputPath(userId, 'images', 'convert', ext);
    const mimeType = getMimeFromExtension(ext);
    const url = await this.uploadToStorage(processedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || 'converted',
      mimeType,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async toBase64(
    file: Express.Multer.File,
    dto: ImageToBase64Dto,
  ): Promise<ImageToBase64ResponseDto> {
    validateImageFile(file);

    const includePrefix = dto.includePrefix !== false;
    const base64 = await this.sharpProcessor.toBase64(file.buffer, includePrefix);
    const metadata = await this.sharpProcessor.getMetadata(file.buffer);

    return {
      base64,
      mimeType: `image/${metadata.format}`,
      sizeBytes: file.size,
    };
  }

  async removeBackground(
    file: Express.Multer.File,
    dto: RemoveBackgroundDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();
    validateImageFile(file);

    const outputFormat = dto.outputFormat || 'png';
    const processedBuffer = await this.bgRemover.remove(file.buffer, outputFormat);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const path = generateToolOutputPath(userId, 'images', 'bg-remove', outputFormat);
    const mimeType = getMimeFromExtension(outputFormat);
    const url = await this.uploadToStorage(processedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || 'no-background',
      mimeType,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // URL-based processing methods (for prefilled images from chat)
  async downloadImageFromUrl(imageUrl: string): Promise<Buffer> {
    try {
      this.logger.log(`Downloading image from URL: ${imageUrl}`);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new BadRequestException(`Failed to download image: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        throw new BadRequestException('URL does not point to a valid image');
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`Failed to download image from URL: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to download image: ${error.message}`);
    }
  }

  async resizeFromUrl(
    dto: ImageResizeFromUrlDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();

    if (!dto.width && !dto.height) {
      throw new BadRequestException('At least width or height must be specified');
    }

    const imageBuffer = await this.downloadImageFromUrl(dto.imageUrl);
    const processedBuffer = await this.sharpProcessor.resize(imageBuffer, {
      width: dto.width,
      height: dto.height,
      fit: dto.fit,
      background: dto.background,
    });
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const ext = this.getExtensionFromFormat(metadata.format);
    const path = generateToolOutputPath(userId, 'images', 'resize', ext);
    const url = await this.uploadToStorage(processedBuffer, path, getMimeFromExtension(ext));

    return {
      url,
      fileName: path.split('/').pop() || 'resized',
      mimeType: getMimeFromExtension(ext),
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async removeBackgroundFromUrl(
    dto: RemoveBackgroundFromUrlDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();

    const imageBuffer = await this.downloadImageFromUrl(dto.imageUrl);
    const outputFormat = dto.outputFormat || 'png';
    const processedBuffer = await this.bgRemover.remove(imageBuffer, outputFormat);
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const path = generateToolOutputPath(userId, 'images', 'bg-remove', outputFormat);
    const mimeType = getMimeFromExtension(outputFormat);
    const url = await this.uploadToStorage(processedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || 'no-background',
      mimeType,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async convertFromUrl(
    dto: ImageConvertFromUrlDto,
    userId: string,
  ): Promise<ImageProcessResponseDto> {
    const startTime = Date.now();

    const imageBuffer = await this.downloadImageFromUrl(dto.imageUrl);
    const processedBuffer = await this.sharpProcessor.convert(imageBuffer, {
      format: dto.format,
      quality: dto.quality,
    });
    const metadata = await this.sharpProcessor.getMetadata(processedBuffer);

    const ext = dto.format;
    const path = generateToolOutputPath(userId, 'images', 'convert', ext);
    const mimeType = getMimeFromExtension(ext);
    const url = await this.uploadToStorage(processedBuffer, path, mimeType);

    return {
      url,
      fileName: path.split('/').pop() || 'converted',
      mimeType,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: processedBuffer.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private async uploadToStorage(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string> {
    try {
      const url = await this.r2Service.uploadBuffer(buffer, path, contentType, {
        isPublic: true,
        metadata: { tool: 'images' },
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload processed file');
    }
  }

  private getExtensionFromFormat(format: string): string {
    const formatMap: Record<string, string> = {
      jpeg: 'jpg',
      jpg: 'jpg',
      png: 'png',
      webp: 'webp',
      avif: 'avif',
      gif: 'gif',
      tiff: 'tiff',
    };
    return formatMap[format] || 'jpg';
  }
}
