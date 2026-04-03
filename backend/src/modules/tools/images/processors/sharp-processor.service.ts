import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import {
  ImageFormat,
  ImageFit,
  ImageCompressDto,
  ImageResizeDto,
  ImageCropDto,
  ImageConvertDto,
} from '../dto/images.dto';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  channels: number;
  hasAlpha: boolean;
  sizeBytes: number;
}

@Injectable()
export class SharpProcessorService {
  private readonly logger = new Logger(SharpProcessorService.name);

  async getMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      channels: metadata.channels || 0,
      hasAlpha: metadata.hasAlpha || false,
      sizeBytes: buffer.length,
    };
  }

  async compress(buffer: Buffer, options: ImageCompressDto): Promise<Buffer> {
    const quality = options.quality || 80;
    let pipeline = sharp(buffer);

    // Resize if max dimensions specified
    if (options.maxWidth || options.maxHeight) {
      pipeline = pipeline.resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Get original format
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format || 'jpeg';

    // Apply compression based on format
    switch (format) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      default:
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    return pipeline.toBuffer();
  }

  async resize(buffer: Buffer, options: ImageResizeDto): Promise<Buffer> {
    const fit = this.mapFit(options.fit || ImageFit.COVER);

    let pipeline = sharp(buffer).resize(options.width, options.height, {
      fit,
      background: options.background
        ? this.parseHexColor(options.background)
        : { r: 255, g: 255, b: 255, alpha: 0 },
    });

    // Maintain format
    const metadata = await sharp(buffer).metadata();
    pipeline = this.applyFormat(pipeline, metadata.format || 'jpeg', 85);

    return pipeline.toBuffer();
  }

  async crop(buffer: Buffer, options: ImageCropDto): Promise<Buffer> {
    let pipeline = sharp(buffer).extract({
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
    });

    // Maintain format
    const metadata = await sharp(buffer).metadata();
    pipeline = this.applyFormat(pipeline, metadata.format || 'jpeg', 90);

    return pipeline.toBuffer();
  }

  async convert(buffer: Buffer, options: ImageConvertDto): Promise<Buffer> {
    const quality = options.quality || 85;
    let pipeline = sharp(buffer);
    pipeline = this.applyFormat(pipeline, options.format, quality);
    return pipeline.toBuffer();
  }

  async toBase64(buffer: Buffer, includePrefix = true): Promise<string> {
    const metadata = await sharp(buffer).metadata();
    const base64 = buffer.toString('base64');

    if (includePrefix) {
      const mimeType = this.formatToMime(metadata.format || 'jpeg');
      return `data:${mimeType};base64,${base64}`;
    }

    return base64;
  }

  async rotate(buffer: Buffer, angle: number): Promise<Buffer> {
    return sharp(buffer).rotate(angle).toBuffer();
  }

  async flip(buffer: Buffer, direction: 'horizontal' | 'vertical'): Promise<Buffer> {
    let pipeline = sharp(buffer);
    if (direction === 'horizontal') {
      pipeline = pipeline.flop();
    } else {
      pipeline = pipeline.flip();
    }
    return pipeline.toBuffer();
  }

  async grayscale(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).grayscale().toBuffer();
  }

  async blur(buffer: Buffer, sigma: number = 5): Promise<Buffer> {
    return sharp(buffer).blur(sigma).toBuffer();
  }

  async sharpen(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).sharpen().toBuffer();
  }

  private applyFormat(
    pipeline: sharp.Sharp,
    format: string,
    quality: number,
  ): sharp.Sharp {
    switch (format) {
      case ImageFormat.JPEG:
      case 'jpeg':
      case 'jpg':
        return pipeline.jpeg({ quality, mozjpeg: true });
      case ImageFormat.PNG:
      case 'png':
        return pipeline.png({ quality });
      case ImageFormat.WEBP:
      case 'webp':
        return pipeline.webp({ quality });
      case ImageFormat.AVIF:
      case 'avif':
        return pipeline.avif({ quality });
      case ImageFormat.GIF:
      case 'gif':
        return pipeline.gif();
      case ImageFormat.TIFF:
      case 'tiff':
        return pipeline.tiff({ quality });
      default:
        return pipeline.jpeg({ quality });
    }
  }

  private mapFit(fit: ImageFit): sharp.FitEnum[keyof sharp.FitEnum] {
    const fitMap: Record<ImageFit, sharp.FitEnum[keyof sharp.FitEnum]> = {
      [ImageFit.COVER]: 'cover',
      [ImageFit.CONTAIN]: 'contain',
      [ImageFit.FILL]: 'fill',
      [ImageFit.INSIDE]: 'inside',
      [ImageFit.OUTSIDE]: 'outside',
    };
    return fitMap[fit];
  }

  private parseHexColor(hex: string): { r: number; g: number; b: number; alpha: number } {
    const cleanHex = hex.replace('#', '');
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
      alpha: 1,
    };
  }

  private formatToMime(format: string): string {
    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      tiff: 'image/tiff',
    };
    return mimeMap[format] || 'image/jpeg';
  }
}
