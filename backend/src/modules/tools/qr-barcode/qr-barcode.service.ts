import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import { R2Service } from '../../storage/r2.service';
import { generateToolOutputPath } from '../common/utils/file-helper.util';
import {
  QrGenerateDto,
  BarcodeGenerateDto,
  QrGenerateResponseDto,
  QrScanResponseDto,
  BarcodeGenerateResponseDto,
  QrErrorCorrectionLevel,
} from './dto/qr-barcode.dto';

@Injectable()
export class QrBarcodeService {
  private readonly logger = new Logger(QrBarcodeService.name);
  private qrScanner: any = null;

  constructor(private readonly r2Service: R2Service) {}

  async generateQr(dto: QrGenerateDto, userId: string): Promise<QrGenerateResponseDto> {
    const size = dto.size || 300;
    const format = dto.format || 'png';
    const errorCorrectionLevel = dto.errorCorrectionLevel || QrErrorCorrectionLevel.MEDIUM;

    const options: QRCode.QRCodeToDataURLOptions = {
      width: size,
      margin: dto.margin ?? 4,
      errorCorrectionLevel,
      color: {
        dark: dto.darkColor || '#000000',
        light: dto.lightColor || '#FFFFFF',
      },
    };

    let buffer: Buffer;
    let mimeType: string;

    if (format === 'svg') {
      const svg = await QRCode.toString(dto.data, { ...options, type: 'svg' });
      buffer = Buffer.from(svg, 'utf8');
      mimeType = 'image/svg+xml';
    } else {
      const dataUrl = await QRCode.toDataURL(dto.data, options);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      mimeType = 'image/png';
    }

    // Upload to storage
    const path = generateToolOutputPath(userId, 'qr-barcode', 'qr', format);
    const url = await this.uploadToStorage(buffer, path, mimeType);

    return {
      url,
      data: dto.data,
      format,
      size,
      sizeBytes: buffer.length,
    };
  }

  async scanQr(buffer: Buffer): Promise<QrScanResponseDto> {
    try {
      // Initialize scanner lazily
      if (!this.qrScanner) {
        const { Decoder } = await import('@nuintun/qrcode');
        this.qrScanner = new Decoder();
      }

      // Decode QR code from image
      const sharp = require('sharp');
      const { data, info } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Create ImageData-like object
      const result = await this.qrScanner.decode({
        data: new Uint8ClampedArray(data),
        width: info.width,
        height: info.height,
      });

      if (!result) {
        throw new BadRequestException('No QR code found in image');
      }

      return {
        data: result.data,
        type: 'QR_CODE',
        version: result.version,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`QR scan failed: ${error.message}`);
      throw new BadRequestException('Failed to scan QR code from image');
    }
  }

  async generateBarcode(dto: BarcodeGenerateDto, userId: string): Promise<BarcodeGenerateResponseDto> {
    const width = dto.width || 200;
    const height = dto.height || 100;

    try {
      // Create canvas
      const canvas = createCanvas(width, height);

      // Generate barcode
      JsBarcode(canvas, dto.data, {
        format: dto.format,
        width: 2,
        height: height - 30,
        displayValue: dto.displayValue !== false,
        fontSize: dto.fontSize || 20,
        background: dto.background || '#FFFFFF',
        lineColor: dto.lineColor || '#000000',
        margin: 10,
      });

      // Convert to PNG buffer
      const buffer = canvas.toBuffer('image/png');

      // Upload to storage
      const path = generateToolOutputPath(userId, 'qr-barcode', 'barcode', 'png');
      const url = await this.uploadToStorage(buffer, path, 'image/png');

      return {
        url,
        data: dto.data,
        format: dto.format,
        width,
        height,
        sizeBytes: buffer.length,
      };
    } catch (error) {
      this.logger.error(`Barcode generation failed: ${error.message}`);
      throw new BadRequestException(`Failed to generate barcode: ${error.message}`);
    }
  }

  // Generate multiple QR codes (bulk)
  async generateBulkQr(
    dataList: string[],
    options: Partial<QrGenerateDto>,
    userId: string,
  ): Promise<QrGenerateResponseDto[]> {
    const results: QrGenerateResponseDto[] = [];

    for (const data of dataList) {
      const result = await this.generateQr({ ...options, data }, userId);
      results.push(result);
    }

    return results;
  }

  private async uploadToStorage(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string> {
    try {
      const url = await this.r2Service.uploadBuffer(buffer, path, contentType, {
        isPublic: true,
        metadata: { tool: 'qr-barcode' },
      });
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload generated file');
    }
  }
}
