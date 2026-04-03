import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { QrBarcodeService } from './qr-barcode.service';
import { ToolLoggerService } from '../common/services/tool-logger.service';
import { FILE_SIZE_LIMITS, ALLOWED_IMAGE_MIMES } from '../common/utils/file-helper.util';
import {
  QrGenerateDto,
  BarcodeGenerateDto,
  QrGenerateResponseDto,
  QrScanResponseDto,
  BarcodeGenerateResponseDto,
} from './dto/qr-barcode.dto';

const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
};

@ApiTags('Tools - QR & Barcode')
@Controller('tools/qr-barcode')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QrBarcodeController {
  constructor(
    private readonly qrBarcodeService: QrBarcodeService,
    private readonly toolLogger: ToolLoggerService,
  ) {}

  @Post('qr/generate')
  @ApiOperation({ summary: 'Generate QR code' })
  @ApiResponse({ status: 200, type: QrGenerateResponseDto })
  async generateQr(
    @Body() dto: QrGenerateDto,
    @Request() req: any,
  ): Promise<{ data: QrGenerateResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = await this.qrBarcodeService.generateQr(dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'qr-barcode',
      toolName: 'qr-generate',
      outputFileUrl: result.url,
      outputSizeBytes: result.sizeBytes,
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: {
        dataLength: dto.data.length,
        size: result.size,
        format: result.format,
      },
    });

    return { data: result };
  }

  @Post('qr/scan')
  @ApiOperation({ summary: 'Scan QR code from image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: QrScanResponseDto })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async scanQr(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ data: QrScanResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = await this.qrBarcodeService.scanQr(file.buffer);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'qr-barcode',
      toolName: 'qr-scan',
      inputSizeBytes: file.size,
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { dataLength: result.data.length },
    });

    return { data: result };
  }

  @Post('qr/bulk')
  @ApiOperation({ summary: 'Generate multiple QR codes' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dataList: { type: 'array', items: { type: 'string' } },
        size: { type: 'number' },
        darkColor: { type: 'string' },
        lightColor: { type: 'string' },
      },
      required: ['dataList'],
    },
  })
  @ApiResponse({ status: 200, type: [QrGenerateResponseDto] })
  async generateBulkQr(
    @Body() body: { dataList: string[]; size?: number; darkColor?: string; lightColor?: string },
    @Request() req: any,
  ): Promise<{ data: QrGenerateResponseDto[] }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    if (!body.dataList || body.dataList.length === 0) {
      throw new Error('dataList is required');
    }
    if (body.dataList.length > 50) {
      throw new Error('Maximum 50 QR codes can be generated at once');
    }

    const result = await this.qrBarcodeService.generateBulkQr(
      body.dataList,
      { size: body.size, darkColor: body.darkColor, lightColor: body.lightColor },
      userId,
    );

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'qr-barcode',
      toolName: 'qr-bulk',
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: { count: result.length },
    });

    return { data: result };
  }

  @Post('barcode/generate')
  @ApiOperation({ summary: 'Generate barcode' })
  @ApiResponse({ status: 200, type: BarcodeGenerateResponseDto })
  async generateBarcode(
    @Body() dto: BarcodeGenerateDto,
    @Request() req: any,
  ): Promise<{ data: BarcodeGenerateResponseDto }> {
    const startTime = Date.now();
    const userId = req.user.sub || req.user.userId;

    const result = await this.qrBarcodeService.generateBarcode(dto, userId);

    await this.toolLogger.logToolUsage({
      userId,
      toolCategory: 'qr-barcode',
      toolName: 'barcode-generate',
      outputFileUrl: result.url,
      outputSizeBytes: result.sizeBytes,
      processingTimeMs: Date.now() - startTime,
      status: 'completed',
      metadata: {
        data: dto.data,
        format: dto.format,
      },
    });

    return { data: result };
  }
}
